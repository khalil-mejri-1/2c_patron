import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import BASE_URL from './apiConfig';
import ScrollToTop from './comp/ScrollToTop';
import AIChatbot from './comp/AIChatbot';

import Home from "./pages/Home.jsx";
import './global.css'
import ProductGrid from "./pages/shop.jsx";
import Vipaccess from "./pages/Vip-access.jsx";
import Cours from "./pages/cours.jsx";
import Lessons from "./pages/Lessons.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Profile from "./pages/Profile.jsx";
import Login_test from "./pages/login_test.jsx";
import Abonnementvip from "./pages/abonnementvip.jsx";
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

function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isVip, setIsVip] = useState(false);

    const restrictedPathsForAuthenticated = ['/login', '/register', '/logintest'];
    const vipRequiredPaths = ['/vip-access', '/Vip-access', '/cours_Manches', '/Leçons'];

    useEffect(() => {
        const checkAuthAndVipStatus = async () => {
            const userEmail =
                localStorage.getItem('loggedInUserEmail') ||
                localStorage.getItem('currentUserEmail') ||
                null;

            const authStatus = localStorage.getItem('login') === 'true' && !!userEmail;

            setIsAuthenticated(authStatus);

            let vipStatus = false;

            // ✅ إذا المستخدم مسجل الدخول، نتحقق من قاعدة البيانات
            if (authStatus && userEmail) {
                try {
                    const response = await fetch(`${BASE_URL}/api/users/${userEmail}`);
                    const data = await response.json();
                    if (data && (data.abonne === "oui" || data.statut === "admin")) {
                        vipStatus = true;
                    }
                } catch (error) {
                    console.error("Erreur lors de la vérification du VIP:", error);
                }
            }

            setIsVip(vipStatus);

            const currentPath = location.pathname;

            // 🔹 منع الوصول لصفحات login/register بعد تسجيل الدخول
            if (authStatus && restrictedPathsForAuthenticated.includes(currentPath)) {
                navigate('/');
                return;
            }

            // 🔹 منع الوصول للصفحات VIP إذا لم يكن المستخدم abonné
            const isVipPath = vipRequiredPaths.some(path => currentPath.startsWith(path));

            if (isVipPath) {
                if (!vipStatus) {
                    console.warn(`Non-VIP user tried to access ${currentPath}. Redirecting to Abonnement VIP.`);
                    navigate('/Abonnement-VIP');
                }
            }
        };

        checkAuthAndVipStatus();
    }, [location.pathname, navigate]);


    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/magasin" element={<ProductGrid />} />
            <Route path="/Vip-access" element={<Vipaccess />} />
            <Route path="/vip-access" element={<Vipaccess />} />
            <Route path="/cours_Manches/:courseTitle" element={<Cours />} />
            <Route path="/Leçons/:leconTitle" element={<Lessons />} />
            <Route path="/register" element={<Register />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/logintest" element={<Login_test />} />
            <Route path="/Abonnement-VIP" element={<Abonnementvip />} />

            <Route path="/Leçons_coursage/:leconTitle" element={<Lessons />} />


            <Route path="/admin" element={<Admin />} />
            <Route path="/admin_clients" element={<Gestion_de_Client />} />
            <Route path="/admin_products" element={<Gestion_de_Produit />} />
            <Route path="/admin_videos" element={<Gestion_de_Vidéo />} />
            <Route path="/admin_all_videos" element={<Gestion_Global_Videos />} />
            <Route path="/admin_command" element={<Admin_command />} />
            <Route path="/admin_message" element={<Gestion_Message />} />
            <Route path="/admin_commentaire" element={<Gestion_commentaire />} />
            <Route path="/admin_abonnement" element={<Gestion_abonnement />} />
            <Route path="/admin_espace_vip" element={<Gestion_de_espace_vip />} />
            <Route path="/admin_settings" element={<Gestion_Settings />} />

            <Route path="/*" element={<Home />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AppContent />
            <AIChatbot />
        </BrowserRouter>
    );
}

export default App;







