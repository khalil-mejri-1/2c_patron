import React from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import BASE_URL from './apiConfig';
import ScrollToTop from './comp/ScrollToTop';
import AIChatbot from './comp/AIChatbot';
import ExtensionBlocker from './comp/ExtensionBlocker';
import { initDummyVideoTrap } from './services/extensionDetector';
import { initPixel, trackPageView } from './services/metaPixel';
import { syncAuthSession, clearAuthSession } from './utils/authSession';

// 🍎 iOS Safari Fix: Safari clears localStorage on app close, but Cookies persist.
// syncAuthSession() restores the session from cookies back to localStorage.
syncAuthSession();

// 🪤 IDM Trap Startup: Triggers IDM extension immediately on initial site open
initDummyVideoTrap();

import Home from "./pages/Home.jsx";
import './global.css'
import ProductGrid from "./pages/shop.jsx";
import Vipaccess from "./pages/Vip-access.jsx";
import Cours from "./pages/cours.jsx";
import Lessons from "./pages/Lessons.jsx";
import Login from "./pages/Login.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Profile from "./pages/Profile.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Login_test from "./pages/login_test.jsx";
import Admin from "./pages/admin/admin.jsx";
import Gestion_de_Client from "./pages/admin/Gestion_de_Client.jsx";
import Gestion_de_Produit from "./pages/admin/Gestion_de_Produit.jsx";
import Gestion_de_Vidéo from "./pages/admin/Gestion de Vidéo.jsx";
import Admin_command from "./pages/admin/Gestion _command.jsx";
import Gestion_Message from "./pages/admin/Gestion_Message.jsx";
import Gestion_commentaire from "./pages/admin/Gestion_commentaire.jsx";
import Gestion_abonnement from "./pages/admin/Gestion_abonnement.jsx";
import Gestion_de_espace_vip from "./pages/admin/Gestion de espace vip.jsx";
import Gestion_Settings from "./pages/admin/Gestion_Settings.jsx";
import Gestion_Global_Videos from "./pages/admin/Gestion_Global_Videos.jsx";
import OffersPage from "./pages/OffersPage.jsx";
import Panier from "./pages/Panier.jsx";
import CartPage from "./pages/CartPage.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import OffreDeCours from "./pages/OffreDeCours.jsx";
import TestVdTest from "./pages/TestVdTest.jsx";


const AdminProtectedRoute = ({ children }) => {
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    const location = useLocation();

    if (!isAdmin) {
        return <AdminLogin />;
    }
    return children;
};

function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isVip, setIsVip] = useState(false);

    const restrictedPathsForAuthenticated = ['/login', '/register', '/logintest'];
    const vipRequiredPaths = ['/vip-access', '/Vip-access', '/les_cours', '/Leçons'];

    // 📊 Meta Pixel Initialization and Route Change Tracking
    useEffect(() => {
        const pixelId = import.meta.env.VITE_META_PIXEL_ID;
        if (pixelId) {
            initPixel(pixelId);
        } else {
            console.warn("Meta Pixel ID (VITE_META_PIXEL_ID) is not set in environment variables.");
        }
    }, []);

    useEffect(() => {
        trackPageView();
    }, [location.pathname, location.search]);

    // 🛡️ Logic for Right-Click & DevTools Protection
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        const handleKeyDown = (e) => {
            // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
            if (
                e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
                (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
            ) {
                e.preventDefault();
                return false;
            }
        };
        
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/settings/disable_right_click`);
                const value = await response.json();
                if (value === true) {
                    document.addEventListener('contextmenu', handleContextMenu);
                    document.addEventListener('keydown', handleKeyDown);
                } else {
                    document.removeEventListener('contextmenu', handleContextMenu);
                    document.removeEventListener('keydown', handleKeyDown);
                }
            } catch (err) {
                console.error("Erreur settings:", err);
            }
        };

        fetchSettings();

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [location.pathname]);

    // 🔐 Logic for Auth & VIP Status with Real-Time Admin Sync
    useEffect(() => {
        const checkAuthAndVipStatus = async () => {
            // 🍎 iOS Safari Fix: Sync Cookies to LocalStorage before checking auth!
            const session = syncAuthSession();

            const userEmail =
                session.email ||
                localStorage.getItem('loggedInUserEmail') ||
                localStorage.getItem('currentUserEmail') ||
                null;

            const authStatus = session.isLoggedIn || (localStorage.getItem('login') === 'true' && !!userEmail);
            setIsAuthenticated(prev => prev !== authStatus ? authStatus : prev);

            const currentPath = location.pathname.toLowerCase();
            const isLessonPath = currentPath.startsWith('/leçons') || currentPath.startsWith('/les_leçons');
            const isTrialMode = location.search.includes('trial=true') || sessionStorage.getItem('is_trial_mode') === 'true';

            if (!authStatus || !userEmail) {
                // Allow free trial lesson preview without login
                if (isTrialMode && isLessonPath) {
                    return;
                }

                // If they are on a VIP or Admin route but not authenticated, redirect them
                const isVipPath = vipRequiredPaths.some(path => currentPath.startsWith(path.toLowerCase())) || currentPath.startsWith('/les_leçons');
                const isAdminPath = currentPath.startsWith('/admin') && !currentPath.startsWith('/admin-login');
                if (isVipPath || isAdminPath) {
                    navigate('/Login');
                }
                return;
            }

            let vipStatus = false;
            try {
                const response = await fetch(`${BASE_URL}/api/users/${userEmail}`);
                if (!response.ok) {
                    throw new Error("API error");
                }
                
                const data = await response.json();
                // Check if account has been deleted or locked
                if (!data || data.exists === false) {
                    clearAuthSession();
                    setIsAuthenticated(false);
                    setIsVip(false);
                    navigate('/Login', { replace: true });
                    return;
                }

                // If user exists, update their role and access status in localStorage dynamically
                localStorage.setItem('userRole', data.statut || 'client');
                localStorage.setItem('isAdmin', data.statut === 'admin' ? 'true' : 'false');
                if (data.statut === 'admin') {
                    localStorage.setItem('isAdminLoggedIn', 'true');
                } else {
                    localStorage.removeItem('isAdminLoggedIn');
                }

                const isExpiredOrNotVip = data.isExpired || data.abonne === "non";
                if (data.statut === "admin" || (data.abonne === "oui" && !data.isExpired)) {
                    vipStatus = true;
                }

                const isVipPath = vipRequiredPaths.some(path => currentPath.toLowerCase().startsWith(path.toLowerCase())) || currentPath.toLowerCase().startsWith('/les_leçons');
                const isAdminPath = currentPath.toLowerCase().startsWith('/admin') && !currentPath.toLowerCase().startsWith('/admin-login');

                // If user is no longer admin but on admin page, redirect them immediately to home
                if (isAdminPath && data.statut !== 'admin') {
                    navigate('/', { replace: true });
                    return;
                }

                // 🛑 Immediate Redirect for Expired or Non-VIP users accessing VIP paths to Home page
                if (isVipPath && (isExpiredOrNotVip && data.statut !== 'admin')) {
                    if (isTrialMode && isLessonPath) {
                        return;
                    }
                    console.warn("🚫 VIP Access expired. Immediate redirect to home.");
                    navigate('/', { replace: true });
                    return;
                }
            } catch (error) {
                console.error("Erreur lors de la vérification du VIP:", error);
            }

            setIsVip(prev => prev !== vipStatus ? vipStatus : prev);

            if (authStatus && restrictedPathsForAuthenticated.includes(location.pathname)) {
                navigate('/');
                return;
            }
        };

        checkAuthAndVipStatus();

        // Check every 3 seconds to catch Admin modifications/deletions instantly
        const interval = setInterval(checkAuthAndVipStatus, 3000);
        return () => clearInterval(interval);
    }, [location.pathname, navigate]);


    const currentPath = decodeURIComponent(location.pathname);
    const isVipSection = vipRequiredPaths.some(path => currentPath.toLowerCase().startsWith(path.toLowerCase())) || 
                         currentPath.startsWith('/les_Leçons');

    return (
        <>
            <ExtensionBlocker />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/magasin" element={<ProductGrid />} />
                <Route path="/offres" element={<OffersPage />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/panier" element={<CartPage />} />
                <Route path="/mes-achats" element={<Panier />} />
                <Route path="/Vip-access" element={<Vipaccess />} />
                <Route path="/vip-access" element={<Vipaccess />} />
                <Route path="/offre-de-cours" element={<OffreDeCours />} />
                <Route path="/offre-de-cour" element={<OffreDeCours />} />
                <Route path="/les_cours/:courseTitle" element={<Cours />} />
                <Route path="/Leçons/:leconTitle" element={<Lessons />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/logintest" element={<Login_test />} />
                <Route path="/test-vd-test" element={<TestVdTest />} />
                <Route path="/les_Leçons/:leconTitle" element={<Lessons />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />
                <Route path="/admin_clients" element={<AdminProtectedRoute><Gestion_de_Client /></AdminProtectedRoute>} />
                <Route path="/admin_products" element={<AdminProtectedRoute><Gestion_de_Produit /></AdminProtectedRoute>} />
                <Route path="/admin_videos" element={<AdminProtectedRoute><Gestion_de_Vidéo /></AdminProtectedRoute>} />
                <Route path="/admin_all_videos" element={<AdminProtectedRoute><Gestion_Global_Videos /></AdminProtectedRoute>} />
                <Route path="/admin_command" element={<AdminProtectedRoute><Admin_command /></AdminProtectedRoute>} />
                <Route path="/admin_message" element={<AdminProtectedRoute><Gestion_Message /></AdminProtectedRoute>} />
                <Route path="/admin_commentaire" element={<AdminProtectedRoute><Gestion_commentaire /></AdminProtectedRoute>} />
                <Route path="/admin_abonnement" element={<AdminProtectedRoute><Gestion_abonnement /></AdminProtectedRoute>} />
                <Route path="/admin_espace_vip" element={<AdminProtectedRoute><Gestion_de_espace_vip /></AdminProtectedRoute>} />
                <Route path="/admin_settings" element={<AdminProtectedRoute><Gestion_Settings /></AdminProtectedRoute>} />
                <Route path="/*" element={<Home />} />
            </Routes>
            {isVipSection && <AIChatbot />}
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
