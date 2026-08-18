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
 * Reads the _fbc and _fbp cookies set by the Meta Pixel SDK.
 * @param {string} name - Cookie name
 * @returns {string|undefined}
 */
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : undefined;
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
 */
const sendToServerCAPI = (eventName, eventId, customData = {}) => {
  const userEmail =
    localStorage.getItem('loggedInUserEmail') ||
    localStorage.getItem('currentUserEmail') ||
    undefined;

  const testEventCode = customData.test_event_code || getActiveTestEventCode();

  const payload = {
    event_name: eventName,
    event_id: eventId,
    event_source_url: window.location.href,
    test_event_code: testEventCode,
    user_data: {
      em: userEmail,
      fbc: getCookie('_fbc'),
      fbp: getCookie('_fbp'),
    },
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
 */
export const trackEvent = (eventName, params = {}) => {
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
  sendToServerCAPI(eventName, eventId, { ...customData, test_event_code: testCode });
};

/**
 * Tracks a custom Facebook Pixel event.
 * Sends to BOTH browser pixel AND server-side Conversions API.
 * @param {string} eventName - Custom event name
 * @param {Object} [params] - Custom parameters
 */
export const trackCustomEvent = (eventName, params = {}) => {
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
  sendToServerCAPI(eventName, eventId, { ...customData, test_event_code: testCode });
};

// --- Reusable Event Tracking Helpers ---

/**
 * Tracks a PageView event.
 */
export const trackPageView = () => {
  trackEvent('PageView');
};

/**
 * Tracks a ViewContent event (Meta Catalog compliant).
 * @param {Object} params
 */
export const trackViewContent = ({ name, category, ids, value, currency = 'TND', contents }) => {
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
  });
};

/**
 * Tracks a Search event.
 */
export const trackSearch = (searchString, value, currency = 'TND') => {
  const cleanVal = sanitizePrice(value);
  trackEvent('Search', {
    search_string: searchString,
    value: cleanVal,
    currency: normalizeCurrency(currency),
  });
};

/**
 * Tracks a Lead event.
 */
export const trackLead = ({ name, category, value, currency = 'TND' }) => {
  const cleanVal = sanitizePrice(value);
  trackEvent('Lead', {
    content_name: typeof name === 'object' ? (name.fr || name.ar || '') : (name || ''),
    content_category: typeof category === 'object' ? (category.fr || category.ar || '') : (category || ''),
    value: cleanVal,
    currency: normalizeCurrency(currency),
  });
};

/**
 * Tracks a CompleteRegistration event.
 */
export const trackCompleteRegistration = (status, value, currency = 'TND') => {
  const cleanVal = sanitizePrice(value);
  trackEvent('CompleteRegistration', {
    status: status,
    value: cleanVal,
    currency: normalizeCurrency(currency),
  });
};

/**
 * Tracks an AddToCart event (Meta Catalog compliant).
 */
export const trackAddToCart = ({ name, category, ids, value, quantity = 1, currency = 'TND', contents }) => {
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
  });
};

/**
 * Tracks an InitiateCheckout event (Meta Catalog compliant).
 */
export const trackInitiateCheckout = ({ name, category, ids, numItems, value, currency = 'TND', contents }) => {
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
  });
};

/**
 * Tracks a Purchase event (Meta Catalog compliant).
 * Guarantees that real product prices, individual items, and total basket amounts are precisely sent.
 */
export const trackPurchase = ({ value, ids, name, currency = 'TND', numItems, contents }) => {
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

  trackEvent('Purchase', {
    content_name: typeof name === 'object' ? (name.fr || name.ar || '') : (name || (formattedContents.length === 1 ? 'Product' : 'Order')),
    content_type: 'product',
    content_ids: contentIds,
    contents: formattedContents,
    num_items: totalNumItems > 0 ? totalNumItems : 1,
    value: totalVal,
    currency: normalizeCurrency(currency),
  });
};
