/**
 * Deep Browser Video Downloader & IDM (Internet Download Manager) Detector Service.
 * Performs deep DOM inspection, text node scanning, video overlay detection,
 * global object probing, startup dummy video trap, and real-time DOM mutation watching.
 */

// Known Extension IDs in Chrome / Edge Web Store
const KNOWN_EXTENSION_IDS = [
  { name: 'Internet Download Manager (IDM)', id: 'ngpampbgflapdalpjfjbingfbmmoeeed' },
  { name: 'Internet Download Manager (IDM Alt)', id: 'kgggkbbkmjhflbbjidkgmoioedjhnnfj' },
  { name: 'Video DownloadHelper', id: 'lmjnegcaflebdoplkejijenmogfljdfa' },
  { name: 'Video Downloader Professional', id: 'dlmbbnckgjlgjedgdgdfbjeeinoipcaa' },
  { name: 'CocoCut Video Downloader', id: 'gbdkoigflimegbllehfljjblgahbggji' },
  { name: 'Video Downloader Plus', id: 'fhbhjhfljlggTableCell' },
  { name: 'SaveFrom.net helper', id: 'jffbojlgk' },
];

/**
 * 🪤 Startup Dummy Video Trap
 * IDM Integration Module automatically scans for <video> tags in DOM on site startup
 * and injects its overlay panel. This trap triggers IDM immediately when the site opens.
 */
let trapInitialized = false;
export const initDummyVideoTrap = () => {
  if (trapInitialized || typeof document === 'undefined') return;
  trapInitialized = true;

  const createTrap = () => {
    if (document.getElementById('idm-dummy-trap-container')) return;
    const container = document.createElement('div');
    container.id = 'idm-dummy-trap-container';
    container.style.cssText = 'position:fixed; top:-9999px; left:-9999px; width:100px; height:100px; opacity:0.01; pointer-events:none; z-index:-9999;';

    const video = document.createElement('video');
    video.id = 'idm-dummy-trap-video';
    video.autoplay = false;
    video.muted = true;
    video.playsInline = true;
    video.controls = true;
    video.style.cssText = 'width:100px; height:100px;';
    video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAAAAAABgaCgAgA=';

    container.appendChild(video);
    (document.body || document.documentElement).appendChild(container);
  };

  if (document.body) {
    createTrap();
  } else {
    document.addEventListener('DOMContentLoaded', createTrap);
  }
};

// Initialize trap immediately on script import
initDummyVideoTrap();

/**
 * Checks DOM Attributes injected into <html> or <body> by IDM & extensions
 */
const checkDOMAttributes = () => {
  const html = document.documentElement;
  const body = document.body;

  if (!html && !body) return null;

  const attrsToScan = [
    'idm-extension-active',
    'idm_extension',
    'idm-injected',
    'idmmzcc',
    'data-vget',
    'data-cococut',
    'data-downloader',
    'data-video-downloader',
    'data-download-helper',
  ];

  for (const attr of attrsToScan) {
    if ((html && html.hasAttribute(attr)) || (body && body.hasAttribute(attr))) {
      return `مُلحق متصفح (${attr})`;
    }
  }

  return null;
};

/**
 * Deeply scans all DOM elements for IDM injected panels, classes, IDs, titles, or text nodes
 */
const checkDeepDOMTextAndElements = () => {
  if (typeof document === 'undefined') return null;

  const allElements = document.querySelectorAll('*');
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];

    // Ignore our own blocker UI elements and dummy trap
    if (el.closest && (el.closest('#extension-blocker-root') || el.closest('#idm-dummy-trap-container'))) continue;

    const id = el.id ? String(el.id).toLowerCase() : '';
    const className = el.className && typeof el.className === 'string' ? el.className.toLowerCase() : '';
    const title = el.getAttribute('title') ? el.getAttribute('title').toLowerCase() : '';
    const ariaLabel = el.getAttribute('aria-label') ? el.getAttribute('aria-label').toLowerCase() : '';

    // IDM specific class / ID / title signatures
    if (
      id.includes('idm_') || id.includes('idm-') || id.includes('idmmzcc') ||
      className.includes('idm_') || className.includes('idm-') || className.includes('idmmzcc') || className.includes('idm_btn') ||
      title.includes('download this video') || title.includes('internet download manager') || title.includes('télécharger cette vidéo') || title.includes('télécharger cette video') ||
      ariaLabel.includes('download this video') || ariaLabel.includes('télécharger cette vidéo')
    ) {
      return `زر IDM المحقون (${id || className || title || 'IDM Button'})`;
    }

    // Direct text node scanning for IDM button phrases ("Download this video", "Télécharger cette vidéo")
    if (el.children.length <= 4 && el.textContent) {
      const text = el.textContent.trim().toLowerCase();
      if (
        text.includes('download this video') ||
        text.includes('télécharger cette vidéo') ||
        text.includes('télécharger cette video') ||
        text.includes('download video with idm')
      ) {
        return `زر IDM المحقون بالنص (${text})`;
      }
    }
  }

  return null;
};

/**
 * Detects floating overlay buttons placed over <video> elements by IDM or Video Downloaders
 */
const checkVideoOverlays = () => {
  if (typeof document === 'undefined') return null;

  const videos = document.querySelectorAll('video');
  if (!videos || videos.length === 0) return null;

  for (let v = 0; v < videos.length; v++) {
    const video = videos[v];
    const rect = video.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    // Check point near top-right corner of video where IDM floating button appears
    const checkX = rect.right - 50;
    const checkY = rect.top + 25;

    if (checkX > 0 && checkY > 0 && checkX < window.innerWidth && checkY < window.innerHeight) {
      try {
        const elementsAtPoint = document.elementsFromPoint(checkX, checkY);
        for (const el of elementsAtPoint) {
          if (el.closest && (el.closest('#extension-blocker-root') || el.closest('#idm-dummy-trap-container'))) continue;
          if (el === video || el.tagName.toLowerCase() === 'video') continue;

          const text = (el.textContent || '').toLowerCase();
          const idClass = (el.id + ' ' + (typeof el.className === 'string' ? el.className : '')).toLowerCase();

          if (
            text.includes('download') || text.includes('télécharger') ||
            idClass.includes('idm') || idClass.includes('download') || idClass.includes('cococut')
          ) {
            return `تراكب تحميل فوق الفيديو (${text || idClass})`;
          }
        }
      } catch (e) {
        // Ignore point checking errors
      }
    }
  }

  return null;
};

/**
 * Checks window global variables created by IDM or Downloader extensions
 */
const checkGlobalObjects = () => {
  if (typeof window === 'undefined') return null;

  const globalVars = [
    'idm',
    'IDM',
    '__IDM__',
    'IDM_VERSION',
    '__idm_extension__',
    'VideoDownloader',
    'cocoCut',
    '__vget__',
    '__savefrom',
  ];

  for (const varName of globalVars) {
    if (window[varName] !== undefined) {
      return `متغير متصفح محقون (window.${varName})`;
    }
  }

  return null;
};

/**
 * Probes Web Accessible Resources (WAR) of known extension IDs
 */
const probeExtensionResources = async () => {
  if (typeof fetch === 'undefined') return null;

  const probeTasks = KNOWN_EXTENSION_IDS.map(async (ext) => {
    try {
      const res = await fetch(`chrome-extension://${ext.id}/icon16.png`, { method: 'HEAD', mode: 'no-cors' });
      if (res && (res.type === 'opaque' || res.ok)) {
        return ext.name;
      }
    } catch (err) {
      // Chrome blocks cross-extension fetch unless extension web_accessible_resources matches
    }
    return null;
  });

  const results = await Promise.all(probeTasks);
  return results.find(Boolean) || null;
};

/**
 * Main Detection Function
 * Runs all deep checks and returns detection details if found, or null if clean.
 */
export const detectVideoDownloaderExtensions = async () => {
  // 1. Deep DOM Text & Element Scan (IDM Specific)
  const textElDetected = checkDeepDOMTextAndElements();
  if (textElDetected) return { detected: true, name: 'Internet Download Manager (IDM)', detail: textElDetected };

  // 2. Check Floating Overlays on Video Elements
  const overlayDetected = checkVideoOverlays();
  if (overlayDetected) return { detected: true, name: 'Internet Download Manager (IDM)', detail: overlayDetected };

  // 3. Check DOM Attributes
  const attrDetected = checkDOMAttributes();
  if (attrDetected) return { detected: true, name: 'Internet Download Manager (IDM)', detail: attrDetected };

  // 4. Check Global Variables
  const globalDetected = checkGlobalObjects();
  if (globalDetected) return { detected: true, name: 'Internet Download Manager (IDM)', detail: globalDetected };

  // 5. Probe Extension Web Accessible Resources
  const probedExtName = await probeExtensionResources();
  if (probedExtName) return { detected: true, name: probedExtName, detail: 'Chrome Extension Probed' };

  return { detected: false };
};

/**
 * Creates a MutationObserver to listen for extension-injected elements continuously
 */
export const startExtensionObserver = (onDetected) => {
  if (typeof document === 'undefined') return () => {};

  const checkAll = () => {
    const textElDetected = checkDeepDOMTextAndElements();
    const overlayDetected = checkVideoOverlays();
    const attrDetected = checkDOMAttributes();
    const globalDetected = checkGlobalObjects();

    if (textElDetected || overlayDetected || attrDetected || globalDetected) {
      onDetected({
        detected: true,
        name: 'Internet Download Manager (IDM)',
        detail: textElDetected || overlayDetected || attrDetected || globalDetected,
      });
    }
  };

  const observer = new MutationObserver(checkAll);

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });

  return () => observer.disconnect();
};
