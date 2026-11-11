/**
 * Meta Conversions API (CAPI) Service - Server Side
 * Sends events directly from server to Facebook Graph API.
 * Works alongside the Browser Pixel (client-side) for dual tracking.
 * Deduplication is handled via shared event_id between browser and server.
 */

const https = require('https');
const crypto = require('crypto');

const GRAPH_API_VERSION = 'v22.0';

// Dynamic getters to ensure environment variables loaded via dotenv are always fresh
const getMetaAccessToken = () => process.env.META_ACCESS_TOKEN;
const getMetaPixelIds = () => (process.env.META_PIXEL_IDS || '').split(',').map(id => id.trim()).filter(Boolean);

/**
 * Hashes a value using SHA-256 (required by Meta for PII data).
 * @param {string} value
 * @returns {string} hashed value
 */
const hashValue = (value) => {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
};

/**
 * Robust price sanitizer: Extracts the exact numeric value from numbers, strings, or bilingual objects.
 * Handles formats like: 45, "45", "45.00 DT", "45,500", "45 DT", etc.
 * @param {number|string|Object} val
 * @returns {number} clean float rounded to 2 decimals
 */
const sanitizePrice = (val) => {
  if (typeof val === 'number') {
    return (!isNaN(val) && val >= 0) ? Math.round(val * 100) / 100 : 0;
  }
  if (!val && val !== 0) return 0;
  if (typeof val === 'object') {
    const candidate = val.fr || val.ar || val.en || Object.values(val)[0];
    return sanitizePrice(candidate);
  }
  const cleanStr = String(val).replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleanStr);
  return (!isNaN(parsed) && parsed >= 0) ? Math.round(parsed * 100) / 100 : 0;
};

/**
 * Robust quantity sanitizer
 * @param {number|string} qty
 * @returns {number}
 */
const sanitizeQuantity = (qty) => {
  const num = parseInt(qty, 10);
  return (!isNaN(num) && num > 0) ? num : 1;
};

/**
 * Normalizes a phone number for Meta CAPI (E.164 without +, digits only).
 * Automatically prepends Tunisian country code (216) for 8-digit numbers.
 * @param {string|number} phone
 * @returns {string|undefined}
 */
const normalizePhone = (phone) => {
  if (!phone) return undefined;
  let clean = String(phone).replace(/[^0-9]/g, '');
  if (!clean) return undefined;
  if (clean.startsWith('00')) clean = clean.substring(2);
  if (clean.length === 8) {
    clean = '216' + clean;
  }
  return clean;
};

/**
 * Normalizes email address.
 * @param {string} email
 * @returns {string|undefined}
 */
const normalizeEmail = (email) => {
  if (!email) return undefined;
  const clean = String(email).trim().toLowerCase();
  return clean.includes('@') ? clean : undefined;
};

/**
 * Validates and safely formats the Facebook Click ID (_fbc).
 * Strictly preserves exact case sensitivity of the original fbclid.
 * Format: fb.1.<creation_time_ms>.<exact_case_sensitive_fbclid>
 * @param {string} rawFbc
 * @returns {string|undefined}
 */
const validateAndFormatFbc = (rawFbc) => {
  if (!rawFbc || typeof rawFbc !== 'string') return undefined;
  const trimmed = rawFbc.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return undefined;

  // Already in valid fb.1.<timestamp>.<fbclid> format (case preserved!)
  if (/^fb\.[0-9]+\.[0-9]+\.[a-zA-Z0-9_\-]+$/.test(trimmed)) {
    return trimmed;
  }

  // If passed raw fbclid (e.g. starting with IwAR... or 15+ char token), wrap in standard format
  if (/^[a-zA-Z0-9_\-]{15,}$/.test(trimmed) && !trimmed.startsWith('fb.')) {
    return `fb.1.${Date.now()}.${trimmed}`;
  }

  return undefined;
};

/**
 * Validates and formats the Facebook Browser ID (_fbp).
 * Format: fb.1.<creation_time_ms>.<random_digits>
 * @param {string} rawFbp
 * @returns {string|undefined}
 */
const validateAndFormatFbp = (rawFbp) => {
  if (!rawFbp || typeof rawFbp !== 'string') return undefined;
  const trimmed = rawFbp.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return undefined;

  if (/^fb\.[0-9]+\.[0-9]+\.[0-9]+$/.test(trimmed)) {
    return trimmed;
  }
  return undefined;
};

/**
 * Sanitizes IP address by stripping IPv6-mapped IPv4 prefix and removing loopback in live mode.
 * @param {string} ip
 * @returns {string|undefined}
 */
const sanitizeIp = (ip) => {
  if (!ip || typeof ip !== 'string') return undefined;
  let clean = ip.trim();
  if (clean.startsWith('::ffff:')) {
    clean = clean.replace('::ffff:', '');
  }
  if (clean === '::1' || clean === '127.0.0.1' || clean === 'localhost') {
    return undefined;
  }
  return clean;
};

/**
 * Builds the user_data object with properly hashed PII fields.
 * Validates fbc, fbp, client_user_agent, and client_ip_address without hashing them.
 * @param {Object} userData - Raw user data from client
 * @returns {Object} - Clean, hashed user data for CAPI
 */
const buildUserData = (userData = {}) => {
  const result = {};

  // Fields that must be hashed (PII)
  const normEmail = normalizeEmail(userData.em);
  if (normEmail) result.em = hashValue(normEmail);

  const normPhone = normalizePhone(userData.ph);
  if (normPhone) result.ph = hashValue(normPhone);

  if (userData.fn) result.fn = hashValue(String(userData.fn));
  if (userData.ln) result.ln = hashValue(String(userData.ln));
  if (userData.ct) result.ct = hashValue(String(userData.ct));
  if (userData.st) result.st = hashValue(String(userData.st));
  if (userData.zp) result.zp = hashValue(String(userData.zp));
  if (userData.country) result.country = hashValue(String(userData.country));

  // Non-hashed matching fields (Strictly validated)
  const cleanIp = sanitizeIp(userData.client_ip_address);
  if (cleanIp) result.client_ip_address = cleanIp;

  if (userData.client_user_agent && typeof userData.client_user_agent === 'string' && userData.client_user_agent.trim().length > 5) {
    result.client_user_agent = userData.client_user_agent.trim();
  }

  const validFbc = validateAndFormatFbc(userData.fbc);
  if (validFbc) result.fbc = validFbc;

  const validFbp = validateAndFormatFbp(userData.fbp);
  if (validFbp) result.fbp = validFbp;

  if (userData.external_id) {
    result.external_id = hashValue(String(userData.external_id));
  }

  return result;
};

/**
 * Sends a single event to a single Pixel via Conversions API.
 * @param {string} pixelId - The Facebook Pixel ID
 * @param {Object} eventData - The event payload
 * @returns {Promise<Object>} - Facebook API response
 */
const sendEventToPixel = (pixelId, eventData, testEventCode) => {
  return new Promise((resolve, reject) => {
    const token = getMetaAccessToken();
    const payload = { data: [eventData] };
    if (testEventCode) {
      payload.test_event_code = testEventCode;
    }

    const body = JSON.stringify(payload);
    const path = `/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${token}`;

    const options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`CAPI Error for Pixel ${pixelId}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse CAPI response: ${data}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(body);
    req.end();
  });
};

/**
 * Sends an event to ALL configured Pixel IDs via Conversions API.
 * @param {Object} options - Event options
 * @param {string} options.event_name - Standard or Custom event name (e.g. 'PageView', 'Purchase')
 * @param {string} options.event_id - Unique ID for deduplication with browser pixel
 * @param {string} [options.event_source_url] - URL where the event occurred
 * @param {Object} [options.user_data] - User data (IP, user agent, email, etc.)
 * @param {Object} [options.custom_data] - Additional event data (value, currency, etc.)
 * @param {number} [options.event_time] - Unix timestamp (defaults to now)
 * @returns {Promise<Array>} - Array of results for each pixel
 */
const sendToConversionsAPI = async ({
  event_name,
  event_id,
  event_source_url,
  user_data = {},
  custom_data = {},
  event_time = Math.floor(Date.now() / 1000),
}) => {
  const token = getMetaAccessToken();
  const pixelIds = getMetaPixelIds();

  if (!token) {
    console.error('[CAPI] META_ACCESS_TOKEN is not set in process.env. Cannot send event.');
    return [];
  }

  if (pixelIds.length === 0) {
    console.error('[CAPI] No META_PIXEL_IDS configured in process.env. Cannot send event.');
    return [];
  }

  const rawTestCode = custom_data.test_event_code || process.env.META_TEST_EVENT_CODE;
  console.log('rawTestCode', rawTestCode);
  const testEventCode = rawTestCode ? String(rawTestCode).split(',')[0].trim() : undefined;

  // Clone custom_data to avoid side-effects
  const cleanCustomData = { ...custom_data };

  // Remove test_event_code from custom_data if present to avoid payload pollution
  if (cleanCustomData.test_event_code) {
    delete cleanCustomData.test_event_code;
  }

  // Normalize currency
  if (!cleanCustomData.currency || cleanCustomData.currency === 'DT' || cleanCustomData.currency === 'dt') {
    cleanCustomData.currency = 'TND';
  } else {
    cleanCustomData.currency = String(cleanCustomData.currency).trim().toUpperCase();
  }

  // Sanitize contents array
  if (Array.isArray(cleanCustomData.contents) && cleanCustomData.contents.length > 0) {
    cleanCustomData.contents = cleanCustomData.contents.map((item) => {
      const rawPrice = item.item_price !== undefined ? item.item_price : (item.price !== undefined ? item.price : 0);
      return {
        id: String(item.id || item.productId || item._id || 'product'),
        quantity: sanitizeQuantity(item.quantity),
        item_price: sanitizePrice(rawPrice),
      };
    });
  }

  // Sanitize and calculate total value
  if (cleanCustomData.value !== undefined) {
    cleanCustomData.value = sanitizePrice(cleanCustomData.value);
  }

  // If value is 0 or missing, derive from contents
  if ((!cleanCustomData.value || cleanCustomData.value <= 0) && Array.isArray(cleanCustomData.contents) && cleanCustomData.contents.length > 0) {
    const sum = cleanCustomData.contents.reduce((acc, item) => acc + (item.item_price * item.quantity), 0);
    cleanCustomData.value = Math.round(sum * 100) / 100;
  }

  const eventData = {
    event_name,
    event_time,
    event_source_url,
    event_id,
    action_source: 'website',
    user_data: buildUserData(user_data),
    custom_data: cleanCustomData,
  };

  // Remove undefined or null fields
  Object.keys(eventData).forEach((key) => {
    if (eventData[key] === undefined || eventData[key] === null || eventData[key] === '') {
      delete eventData[key];
    }
  });

  const results = await Promise.allSettled(
    pixelIds.map((pixelId) => sendEventToPixel(pixelId, eventData, testEventCode))
  );

  results.forEach((result, index) => {
    const pixelId = pixelIds[index];
    if (result.status === 'fulfilled') {
      console.log(`[CAPI] ✅ Event "${event_name}" sent to Pixel ${pixelId}:`, result.value);
    } else {
      console.error(`[CAPI] ❌ Failed to send event "${event_name}" to Pixel ${pixelId}:`, result.reason?.message);
    }
  });

  return results;
};

module.exports = { sendToConversionsAPI, hashValue };
