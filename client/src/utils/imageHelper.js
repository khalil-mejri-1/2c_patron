import BASE_URL from '../apiConfig';

/**
 * Resolves a product image URL to ensure it loads directly from the database server.
 */
export const resolveImageUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;

    const isLocal = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    );

    // If running on localhost and URL points to production API cpatron-api.cpatron.com,
    // route it to local backend (http://localhost:3000) which serves directly from MongoDB
    if (isLocal && url.includes('cpatron-api.cpatron.com')) {
        return url.replace('https://cpatron-api.cpatron.com', 'http://localhost:3000');
    }

    // If it's a relative path starting with /uploads/, attach BASE_URL
    if (url.startsWith('/uploads/')) {
        return `${BASE_URL}${url}`;
    }

    return url;
};

/**
 * Handles image onError gracefully:
 * 1. Retries with current BASE_URL endpoint
 * 2. If all fails, displays clean brand placeholder SVG
 */
export const handleImageError = (e, originalUrl) => {
    const target = e.currentTarget;
    const currentSrc = target.src || originalUrl || '';

    if (currentSrc.includes('/uploads/images/') && !target.dataset.triedBaseUrl) {
        target.dataset.triedBaseUrl = 'true';
        const filename = currentSrc.split('/uploads/images/')[1].split('?')[0];
        target.src = `${BASE_URL}/uploads/images/${filename}`;
        return;
    }

    // Final fallback: Luxury brand placeholder SVG
    target.onerror = null;
    target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='100%' height='100%'><rect width='400' height='400' fill='%23f8fafc'/><text x='200' y='210' font-family='sans-serif' font-size='22' font-weight='600' fill='%2394a3b8' text-anchor='middle'>2C PATRON</text></svg>";
};
