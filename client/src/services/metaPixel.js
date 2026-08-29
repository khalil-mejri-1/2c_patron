/**
 * Reusable Meta Pixel (Facebook Pixel) Analytics Service.
 * Provides initialization and tracking helpers using:
 *  1. Browser-side: Official Facebook Pixel JavaScript SDK (fbq)
 *  2. Server-side: Meta Conversions API via /api/meta/event route (Dual Tracking)
 *
 * Both channels share the same event_id for deduplication on Facebook's side.
 */

// Global variable declarations to prevent ESLint errors
/* global fbq */

// Resolve server base URL (same logic as apiConfig.js)
const SERVER_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://cpatron-api.cpatron.com';

let isInitialized = false;
let activePixels = [];

/**
 * Generates a unique event ID for deduplication between browser pixel and CAPI.
 * @returns {string}
 */
const generateEventId = () => {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Reads a cookie by name safely.
 * @param {string} name - Cookie name
 * @returns {string|undefined}
 */
const getCookie = (name) => {
  if (typeof document === 'undefined') return undefined;
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    if (!match || !match[2]) return undefined;
    return decodeURIComponent(match[2]).trim();
  } catch (e) {
    return undefined;
  }
};

/**
 * Sets a first-party cookie safely with 90-day expiry.
 * @param {string} name
 * @param {string} value
 * @param {number} days
 */
const setCookie = (name, value, days = 90) => {
  if (typeof document === 'undefined' || !name || !value) return;
  try {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (e) {
    // Ignore cookie write errors
  }
};

/**
 * Generates or retrieves a valid Meta Browser ID (_fbp).
 * Format: fb.1.<creation_time_ms>.<random_10_digits>
 * @returns {string}
 */
export const getOrCreateFbp = () => {
  if (typeof window === 'undefined') return undefined;

  // 1. Check existing _fbp cookie
  const cookieFbp = getCookie('_fbp');
  if (cookieFbp && /^fb\.[0-9]+\.[0-9]+\.[0-9]+$/.test(cookieFbp)) {
    try {
      localStorage.setItem('_fbp', cookieFbp);
    } catch (e) {}
    return cookieFbp;
  }

  // 2. Check localStorage fallback
  try {
    const savedFbp = localStorage.getItem('_fbp');
    if (savedFbp && /^fb\.[0-9]+\.[0-9]+\.[0-9]+$/.test(savedFbp)) {
      setCookie('_fbp', savedFbp, 90);
      return savedFbp;
    }
  } catch (e) {}

  // 3. Generate a compliant _fbp value
  const newFbp = `fb.1.${Date.now()}.${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  setCookie('_fbp', newFbp, 90);
  try {
    localStorage.setItem('_fbp', newFbp);
  } catch (e) {}

  return newFbp;
};

/**
 * Captures, formats and stores the Facebook Click ID (_fbc).
 * Strictly preserves exact case sensitivity of the original fbclid.
 * Format: fb.1.<creation_time_ms>.<exact_case_sensitive_fbclid>
 * @returns {string|undefined}
 */
export const getOrCreateFbc = () => {
  if (typeof window === 'undefined') return undefined;

  try {
    // 1. Check current URL for ?fbclid=
    const urlParams = new URLSearchParams(window.location.search);
    const rawFbclid = urlParams.get('fbclid');
    if (rawFbclid && rawFbclid.trim()) {
      const cleanFbclid = rawFbclid.trim();
      const newFbc = `fb.1.${Date.now()}.${cleanFbclid}`;
      setCookie('_fbc', newFbc, 90);
      try {
        localStorage.setItem('_fbc', newFbc);
        sessionStorage.setItem('fbclid', cleanFbclid);
      } catch (e) {}
      return newFbc;
    }
  } catch (e) {}

  // 2. Check existing _fbc cookie
  const cookieFbc = getCookie('_fbc');
  if (cookieFbc && /^fb\.[0-9]+\.[0-9]+\.[a-zA-Z0-9_\-]+$/.test(cookieFbc)) {
    return cookieFbc;
  }

  // 3. Check localStorage / sessionStorage for saved _fbc or fbclid
  try {
    const savedFbc = localStorage.getItem('_fbc');
    if (savedFbc && /^fb\.[0-9]+\.[0-9]+\.[a-zA-Z0-9_\-]+$/.test(savedFbc)) {
      setCookie('_fbc', savedFbc, 90);
      return savedFbc;
    }

    const savedFbclid = sessionStorage.getItem('fbclid') || localStorage.getItem('fbclid');
    if (savedFbclid && savedFbclid.trim()) {
      const cleanFbclid = savedFbclid.trim();
      const generatedFbc = `fb.1.${Date.now()}.${cleanFbclid}`;
      setCookie('_fbc', generatedFbc, 90);
      return generatedFbc;
    }
  } catch (e) {}

  return undefined;
};

/**
 * Aggregates complete user_data object with client_user_agent, cookies, and matching keys.
 * @param {Object} [customUserData]
 * @returns {Object}
 */
export const getUserData = (customUserData = {}) => {
  const fbp = getOrCreateFbp();
  const fbc = getOrCreateFbc();

  let userEmail = customUserData.em;
  let userPhone = customUserData.ph;
  let userName = customUserData.fn;

  if (typeof window !== 'undefined') {
    try {
      if (!userEmail) {
        userEmail =
          localStorage.getItem('loggedInUserEmail') ||
          localStorage.getItem('currentUserEmail') ||
          undefined;
      }
      if (!userPhone) {
        userPhone =
          localStorage.getItem('userPhone') ||
          localStorage.getItem('user_phone') ||
          undefined;
      }
      if (!userName) {
        userName =
          localStorage.getItem('userName') ||
          localStorage.getItem('user_name') ||
          undefined;
      }
    } catch (e) {}
  }

  const clientUserAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;

  const result = {
    client_user_agent: clientUserAgent,
    fbp: fbp || undefined,
    fbc: fbc || undefined,
    em: userEmail || undefined,
    ph: userPhone || undefined,
    fn: userName || undefined,
    ...customUserData,
  };

  // Clean empty/null/undefined keys
  Object.keys(result).forEach((k) => {
    if (result[k] === undefined || result[k] === null || result[k] === '') {
      delete result[k];
    }
  });

  return result;
};

/**
 * Robust price sanitizer: Extracts the exact numeric value from numbers, strings, or bilingual objects.
 * Handles formats like: 45, "45", "45.00 DT", "45,500", "45 DT", { fr: 45 }, etc.
 * @param {number|string|Object} val
 * @returns {number} clean float rounded to 2 decimals
 */
export const sanitizePrice = (val) => {
  if (typeof val === 'number') {
    return (!isNaN(val) && val >= 0) ? Math.round(val * 100) / 100 : 0;
  }
  if (!val && val !== 0) return 0;
  if (typeof val === 'object') {
    const candidate = val.fr || val.ar || val.en || Object.values(val)[0];
    return sanitizePrice(candidate);
  }
  // Convert string: replace commas with periods, keep only digits and decimal dot
  const cleanStr = String(val).replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleanStr);
  return (!isNaN(parsed) && parsed >= 0) ? Math.round(parsed * 100) / 100 : 0;
};

/**
 * Robust quantity sanitizer: ensures integer quantity >= 1
 * @param {number|string} qty
 * @returns {number}
 */
export const sanitizeQuantity = (qty) => {
  const num = parseInt(qty, 10);
  return (!isNaN(num) && num > 0) ? num : 1;
};

/**
 * Normalizes currency strings to standard ISO 3-letter codes
 * @param {string} cur
 * @returns {string} 'TND'
 */
const normalizeCurrency = (cur) => {
  if (!cur || cur === 'DT' || cur === 'dt' || cur === 'TND' || cur === 'TD') {
    return 'TND';
  }
  return String(cur).trim().toUpperCase();
};

/**
 * Formats contents array to match Meta Catalog & Conversions API specifications.
 * Each item contains: { id: string, quantity: number, item_price: number }
 * @param {Array} contents
 * @param {Array|string} fallbackIds
 * @param {number} fallbackPrice
 * @param {number} fallbackQty
 * @returns {Array<{ id: string, quantity: number, item_price: number }>}
 */
export const formatMetaContents = (contents, fallbackIds, fallbackPrice = 0, fallbackQty = 1) => {
  if (Array.isArray(contents) && contents.length > 0) {
    return contents.map((item) => {
      const rawId = item.id || item.productId || item._id || 'product';
      const cleanPrice = sanitizePrice(
        item.item_price !== undefined ? item.item_price : (item.price !== undefined ? item.price : fallbackPrice)
      );
      const cleanQty = sanitizeQuantity(item.quantity || fallbackQty);
      return {
        id: String(rawId),
        quantity: cleanQty,
        item_price: cleanPrice,
      };
    });
  }

  const ids = Array.isArray(fallbackIds)
    ? fallbackIds.map((id) => String(id)).filter(Boolean)
    : (fallbackIds ? [String(fallbackIds)] : []);

  const cleanSinglePrice = sanitizePrice(fallbackPrice);
  const cleanSingleQty = sanitizeQuantity(fallbackQty);

  if (ids.length > 0) {
    return ids.map((id) => ({
      id: id,
      quantity: cleanSingleQty,
      item_price: cleanSinglePrice,
    }));
  }

  return cleanSinglePrice > 0
    ? [{ id: 'product', quantity: cleanSingleQty, item_price: cleanSinglePrice }]
    : [];
};

/**
 * Resolves the active test event code from:
 * 1. URL search params (?test_event_code=TEST12345 or ?test_code=TEST12345)
 * 2. SessionStorage cache
 * 3. Vite environment variable (VITE_META_PIXEL_TEST_CODE)
 * @returns {string|undefined}
 */
export const getActiveTestEventCode = () => {
  if (typeof window === 'undefined') return undefined;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCode = urlParams.get('test_event_code') || urlParams.get('test_code');
    if (urlCode && urlCode.trim()) {
      sessionStorage.setItem('fb_test_event_code', urlCode.trim());
      return urlCode.trim();
    }

    const savedCode = sessionStorage.getItem('fb_test_event_code');
    if (savedCode && savedCode.trim()) {
      return savedCode.trim();
    }
  } catch (e) {
    // Ignore storage errors
  }

  const rawEnv = import.meta.env.VITE_META_PIXEL_TEST_CODE;
  if (rawEnv && String(rawEnv).trim()) {
    return String(rawEnv).split(',')[0].trim();
  }

  return undefined;
};

/**
 * Sends event data to the server-side Conversions API endpoint.
 * Fire-and-forget: errors are logged but do not block the browser pixel.
 * @param {string} eventName
 * @param {string} eventId
 * @param {Object} customData
 * @param {Object} [customUserData]
 */
const sendToServerCAPI = (eventName, eventId, customData = {}, customUserData = {}) => {
  const userData = getUserData(customUserData);
  const testEventCode = customData.test_event_code || getActiveTestEventCode();

  const payload = {
    event_name: eventName,
    event_id: eventId,
    event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
    test_event_code: testEventCode,
    user_data: userData,
    custom_data: customData,
  };

  fetch(`${SERVER_BASE_URL}/api/meta/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        console.log(`[CAPI] ✅ Event "${eventName}" sent successfully via server.`, data);
      } else {
        console.warn(`[CAPI] ⚠️ Server warning for "${eventName}":`, data.message);
      }
    })
    .catch((err) => {
      console.warn('[CAPI] Failed to send server-side event:', err.message);
    });
};

/**
 * Initializes the Meta Pixel asynchronously.
 * Prevents duplicate initialization.
 * @param {string|string[]} pixelId - The Facebook Pixel ID or an array/comma-separated list of IDs.
 */
export const initPixel = (pixelId) => {
  if (isInitialized) {
    console.warn("Meta Pixel is already initialized.");
    return;
  }

  if (!pixelId) {
    console.error("Meta Pixel ID is missing. Cannot initialize Pixel.");
    return;
  }

  // Pre-seed _fbp and _fbc cookies on initialization
  getOrCreateFbp();
  getOrCreateFbc();

  // Parse pixelId into an array of IDs
  let ids = [];
  if (Array.isArray(pixelId)) {
    ids = pixelId;
  } else if (typeof pixelId === 'string') {
    ids = pixelId.split(',').map((id) => id.trim()).filter(Boolean);
  }

  if (ids.length === 0) {
    console.error("No valid Meta Pixel IDs found.");
    return;
  }

  // Official Facebook Pixel Integration Snippet (Asynchronous)
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  const testCode = getActiveTestEventCode();

  // Initialize and register all Pixel IDs
  ids.forEach((id) => {
    window.fbq('init', id);
    activePixels.push({ id, testCode });
    console.log(`Meta Pixel (${id}) initialized successfully with test code: ${testCode || 'none'}.`);
  });

  isInitialized = true;
};

/**
 * Helper to check if Facebook Pixel is loaded on the page.
 * @returns {boolean}
 */
const isLoaded = () => {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
};

/**
 * Tracks a standard Facebook Pixel event.
 * Sends to BOTH browser pixel (fbq) AND server-side Conversions API.
 * Uses shared event_id for deduplication.
 * @param {string} eventName - Standard event name (e.g. PageView, ViewContent, Purchase)
 * @param {Object} [params] - Optional parameters for the event
 * @param {Object} [userData] - Optional user matching parameters (em, ph, fn, etc.)
 */
export const trackEvent = (eventName, params = {}, userData = {}) => {
  const eventId = generateEventId();
  const testCode = params.test_event_code || getActiveTestEventCode();

  // 1. Send to Browser Pixel (client-side) safely
  if (isLoaded()) {
    try {
      activePixels.forEach(({ id }) => {
        const eventParams = { ...params, eventID: eventId };
        if (testCode) {
          eventParams.test_event_code = testCode;
        }
        try {
          window.fbq('trackSingle', id, eventName, eventParams);
        } catch (err) {
          // Ignore individual pixel errors
        }
      });
    } catch (e) {
      // Global fbq call safety guard
    }
  } else {
    console.warn(`Meta Pixel not loaded. Failed to track browser event: ${eventName}`);
  }

  // 2. Send to Server-Side Conversions API (fire-and-forget)
  const { test_event_code, eventID, ...customData } = params;
  sendToServerCAPI(eventName, eventId, { ...customData, test_event_code: testCode }, userData);
};

/**
 * Tracks a custom Facebook Pixel event.
 * Sends to BOTH browser pixel AND server-side Conversions API.
 * @param {string} eventName - Custom event name
 * @param {Object} [params] - Custom parameters
 * @param {Object} [userData] - Optional user matching parameters
 */
export const trackCustomEvent = (eventName, params = {}, userData = {}) => {
  const eventId = generateEventId();
  const testCode = params.test_event_code || getActiveTestEventCode();

  // 1. Send to Browser Pixel (client-side) safely
  if (isLoaded()) {
    try {
      activePixels.forEach(({ id }) => {
        const eventParams = { ...params, eventID: eventId };
        if (testCode) {
          eventParams.test_event_code = testCode;
        }
        try {
          window.fbq('trackSingleCustom', id, eventName, eventParams);
        } catch (err) {
          // Ignore individual pixel errors
        }
      });
    } catch (e) {
      // Global fbq call safety guard
    }
  } else {
    console.warn(`Meta Pixel not loaded. Failed to track browser custom event: ${eventName}`);
  }

  // 2. Send to Server-Side Conversions API (fire-and-forget)
  const { test_event_code, eventID, ...customData } = params;
  sendToServerCAPI(eventName, eventId, { ...customData, test_event_code: testCode }, userData);
};

// --- Reusable Event Tracking Helpers ---

/**
 * Tracks a PageView event.
 * @param {Object} [userData]
 */
export const trackPageView = (userData = {}) => {
  trackEvent('PageView', {}, userData);
};

/**
 * Tracks a ViewContent event (Meta Catalog compliant).
 * @param {Object} params
 * @param {Object} [userData]
 */
export const trackViewContent = ({ name, category, ids, value, currency = 'TND', contents }, userData = {}) => {
  const singlePrice = sanitizePrice(value);
  const formattedContents = formatMetaContents(contents, ids, singlePrice, 1);
  const contentIds = formattedContents.map((item) => item.id);
  const finalValue = singlePrice > 0
    ? singlePrice
    : (formattedContents.length > 0 ? formattedContents[0].item_price : 0);

  trackEvent('ViewContent', {
    content_name: typeof name === 'object' ? (name.fr || name.ar || '') : (name || ''),
    content_category: typeof category === 'object' ? (category.fr || category.ar || '') : (category || ''),
    content_ids: contentIds,
    contents: formattedContents,
    content_type: 'product',
    value: finalValue,
    currency: normalizeCurrency(currency),
  }, userData);
};

/**
 * Tracks a Search event.
 * @param {string} searchString
 * @param {number|string} value
 * @param {string} currency
 * @param {Object} [userData]
 */
export const trackSearch = (searchString, value, currency = 'TND', userData = {}) => {
  const cleanVal = sanitizePrice(value);
  trackEvent('Search', {
    search_string: searchString,
    value: cleanVal,
    currency: normalizeCurrency(currency),
  }, userData);
};

/**
 * Tracks a Lead event.
 * @param {Object} params
 * @param {Object} [userData]
 */
export const trackLead = ({ name, category, value, currency = 'TND' }, userData = {}) => {
  const cleanVal = sanitizePrice(value);
  trackEvent('Lead', {
    content_name: typeof name === 'object' ? (name.fr || name.ar || '') : (name || ''),
    content_category: typeof category === 'object' ? (category.fr || category.ar || '') : (category || ''),
    value: cleanVal,
    currency: normalizeCurrency(currency),
  }, userData);
};

/**
 * Tracks a CompleteRegistration event.
 * @param {string} status
 * @param {number|string} value
 * @param {string} currency
 * @param {Object} [userData]
 */
export const trackCompleteRegistration = (status, value, currency = 'TND', userData = {}) => {
  const cleanVal = sanitizePrice(value);
  trackEvent('CompleteRegistration', {
    status: status,
    value: cleanVal,
    currency: normalizeCurrency(currency),
  }, userData);
};

/**
 * Tracks an AddToCart event (Meta Catalog compliant).
 * @param {Object} params
 * @param {Object} [userData]
 */
export const trackAddToCart = ({ name, category, ids, value, quantity = 1, currency = 'TND', contents }, userData = {}) => {
  const numQty = sanitizeQuantity(quantity);
  const singlePrice = sanitizePrice(value);
  const formattedContents = formatMetaContents(contents, ids, singlePrice, numQty);
  const contentIds = formattedContents.map((item) => item.id);

  let totalVal = Math.round(singlePrice * numQty * 100) / 100;
  if (totalVal <= 0 && formattedContents.length > 0) {
    totalVal = formattedContents.reduce((acc, item) => acc + (item.item_price * item.quantity), 0);
    totalVal = Math.round(totalVal * 100) / 100;
  }

  trackEvent('AddToCart', {
    content_name: typeof name === 'object' ? (name.fr || name.ar || '') : (name || ''),
    content_category: typeof category === 'object' ? (category.fr || category.ar || '') : (category || ''),
    content_ids: contentIds,
    contents: formattedContents,
    content_type: 'product',
    value: totalVal,
    currency: normalizeCurrency(currency),
  }, userData);
};

/**
 * Tracks an InitiateCheckout event (Meta Catalog compliant).
 * @param {Object} params
 * @param {Object} [userData]
 */
export const trackInitiateCheckout = ({ name, category, ids, numItems, value, currency = 'TND', contents }, userData = {}) => {
  const cleanPrice = sanitizePrice(value);
  const formattedContents = formatMetaContents(contents, ids, cleanPrice, 1);
  const contentIds = formattedContents.map((item) => item.id);

  let totalVal = cleanPrice;
  if (totalVal <= 0 && formattedContents.length > 0) {
    totalVal = formattedContents.reduce((acc, item) => acc + (item.item_price * item.quantity), 0);
    totalVal = Math.round(totalVal * 100) / 100;
  }

  const totalNumItems = numItems !== undefined && Number(numItems) > 0
    ? Number(numItems)
    : formattedContents.reduce((acc, item) => acc + item.quantity, 0);

  trackEvent('InitiateCheckout', {
    content_name: typeof name === 'object' ? (name.fr || name.ar || '') : (name || ''),
    content_category: typeof category === 'object' ? (category.fr || category.ar || '') : (category || ''),
    content_ids: contentIds,
    contents: formattedContents,
    content_type: 'product',
    num_items: totalNumItems > 0 ? totalNumItems : 1,
    value: totalVal,
    currency: normalizeCurrency(currency),
  }, userData);
};

/**
 * Tracks a Purchase event (Meta Catalog compliant).
 * Guarantees that real product prices, individual items, total basket amounts, and customer matching keys are sent.
 * @param {Object} params
 * @param {Object} [userData]
 */
export const trackPurchase = ({ value, ids, name, currency = 'TND', numItems, contents, userData }, extraUserData = {}) => {
  const cleanPrice = sanitizePrice(value);
  const formattedContents = formatMetaContents(contents, ids, cleanPrice, 1);
  const contentIds = formattedContents.map((item) => item.id);

  let totalVal = cleanPrice;
  if (totalVal <= 0 && formattedContents.length > 0) {
    totalVal = formattedContents.reduce((acc, item) => acc + (item.item_price * item.quantity), 0);
    totalVal = Math.round(totalVal * 100) / 100;
  }

  const totalNumItems = numItems !== undefined && Number(numItems) > 0
    ? Number(numItems)
    : formattedContents.reduce((acc, item) => acc + item.quantity, 0);

  const finalUserData = { ...userData, ...extraUserData };

  trackEvent('Purchase', {
    content_name: typeof name === 'object' ? (name.fr || name.ar || '') : (name || (formattedContents.length === 1 ? 'Product' : 'Order')),
    content_type: 'product',
    content_ids: contentIds,
    contents: formattedContents,
    num_items: totalNumItems > 0 ? totalNumItems : 1,
    value: totalVal,
    currency: normalizeCurrency(currency),
  }, finalUserData);
};
