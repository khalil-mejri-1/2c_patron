// client/src/utils/authSession.js

/**
 * 🔒 Centralized Cookie & Auth Session Management
 * Tailored for iOS Safari & All Mobile / Desktop Browsers.
 * Fixes Safari iOS localStorage clearing when browser tabs are closed.
 */

const COOKIE_KEYS = {
    LOGIN: '_session_login',
    EMAIL: '_session_email',
    ROLE: '_session_role',
    IS_ADMIN: '_session_is_admin',
    DEVICE_KEY: '_device_session_key'
};

const LOCAL_STORAGE_KEYS = [
    'login',
    'currentUserEmail',
    'loggedInUserEmail',
    'userRole',
    'isAdmin',
    'isAdminLoggedIn',
    'role'
];

/**
 * Cookie Helper: Write with 365-day persistence & iOS Safari compatibility
 */
export const setCookie = (name, value, days = 365) => {
    try {
        let expires = "";
        let maxAge = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
            maxAge = "; max-age=" + (days * 24 * 60 * 60);
        }
        const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
        // Set root path and Lax SameSite policy for Safari iOS mobile persistence
        document.cookie = `${name}=${encodeURIComponent(value || '')}${expires}${maxAge}; path=/; SameSite=Lax${secureFlag}`;
    } catch (e) {
        console.error("Error setting cookie:", e);
    }
};

/**
 * Cookie Helper: Read decoded cookie
 */
export const getCookie = (name) => {
    try {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
    } catch (e) {
        console.error("Error getting cookie:", e);
    }
    return null;
};

/**
 * Cookie Helper: Erase cookie immediately
 */
export const eraseCookie = (name) => {
    try {
        const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/; SameSite=Lax${secureFlag}`;
    } catch (e) {
        console.error("Error erasing cookie:", e);
    }
};

/**
 * Restores session from Cookies to LocalStorage (or vice-versa).
 * iOS Safari clears localStorage when browser tabs/apps are closed, but retains persistent Cookies.
 */
export const syncAuthSession = () => {
    try {
        const loginCookie = getCookie(COOKIE_KEYS.LOGIN);
        const emailCookie = getCookie(COOKIE_KEYS.EMAIL);
        const roleCookie = getCookie(COOKIE_KEYS.ROLE);
        const isAdminCookie = getCookie(COOKIE_KEYS.IS_ADMIN);

        const lsLogin = localStorage.getItem('login') === 'true';
        const lsEmail = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');

        // 1. If Cookie has valid session (Primary Source of Truth for iOS Safari)
        if (loginCookie === 'true' && emailCookie) {
            try {
                localStorage.setItem('login', 'true');
                localStorage.setItem('currentUserEmail', emailCookie);
                localStorage.setItem('loggedInUserEmail', emailCookie);
                if (roleCookie) localStorage.setItem('userRole', roleCookie);
                if (isAdminCookie === 'true') {
                    localStorage.setItem('isAdmin', 'true');
                    localStorage.setItem('isAdminLoggedIn', 'true');
                }
            } catch (e) { }

            return {
                isLoggedIn: true,
                email: emailCookie,
                role: roleCookie || 'client',
                isAdmin: isAdminCookie === 'true'
            };
        }

        // 2. If LocalStorage has valid session but Cookie was missing, re-populate Cookies
        if (lsLogin && lsEmail) {
            const lsRole = localStorage.getItem('userRole') || 'client';
            const lsIsAdmin = localStorage.getItem('isAdmin') === 'true';

            setCookie(COOKIE_KEYS.LOGIN, 'true', 365);
            setCookie(COOKIE_KEYS.EMAIL, lsEmail, 365);
            setCookie(COOKIE_KEYS.ROLE, lsRole, 365);
            if (lsIsAdmin) setCookie(COOKIE_KEYS.IS_ADMIN, 'true', 365);

            return {
                isLoggedIn: true,
                email: lsEmail,
                role: lsRole,
                isAdmin: lsIsAdmin
            };
        }
    } catch (e) {
        console.error("Error syncing auth session:", e);
    }

    return { isLoggedIn: false, email: null, role: null, isAdmin: false };
};


/**
 * Save login session to BOTH Cookies and LocalStorage
 */
export const setAuthSession = ({ email, role = 'client', isAdmin = false, fingerprint = null }) => {
    if (!email) return;

    // Save in Cookies (Primary source of truth for iOS Safari)
    setCookie(COOKIE_KEYS.LOGIN, 'true', 365);
    setCookie(COOKIE_KEYS.EMAIL, email, 365);
    setCookie(COOKIE_KEYS.ROLE, role, 365);
    if (isAdmin) {
        setCookie(COOKIE_KEYS.IS_ADMIN, 'true', 365);
    } else {
        eraseCookie(COOKIE_KEYS.IS_ADMIN);
    }

    if (fingerprint) {
        setCookie(COOKIE_KEYS.DEVICE_KEY, fingerprint, 365);
    }

    // Sync LocalStorage
    try {
        localStorage.setItem('login', 'true');
        localStorage.setItem('currentUserEmail', email);
        localStorage.setItem('loggedInUserEmail', email);
        localStorage.setItem('userRole', role);
        if (isAdmin) {
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('isAdminLoggedIn', 'true');
        }
    } catch (e) { }
};

/**
 * Completely clear login session from Cookies & LocalStorage
 */
export const clearAuthSession = () => {
    // Clear Cookies
    eraseCookie(COOKIE_KEYS.LOGIN);
    eraseCookie(COOKIE_KEYS.EMAIL);
    eraseCookie(COOKIE_KEYS.ROLE);
    eraseCookie(COOKIE_KEYS.IS_ADMIN);
    eraseCookie(COOKIE_KEYS.DEVICE_KEY);

    // Clear LocalStorage
    LOCAL_STORAGE_KEYS.forEach(key => {
        try { localStorage.removeItem(key); } catch (e) { }
    });
};

/**
 * Get current Auth status
 */
export const getAuthSession = () => {
    return syncAuthSession();
};
