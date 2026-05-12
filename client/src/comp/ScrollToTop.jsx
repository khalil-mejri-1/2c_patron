import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll immediately on route change
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Scroll again after short delay to handle fast data loads
        const t1 = setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 300);

        // Scroll again after longer delay to handle slow data loads
        const t2 = setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 800);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [pathname]);

    return null;
}
