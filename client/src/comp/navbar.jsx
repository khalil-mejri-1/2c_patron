import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { FaBars, FaTimes, FaSearch, FaShoppingBag, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCrown, FaTachometerAlt, FaPlus, FaSave, FaArrowLeft, FaEdit, FaPhoneAlt, FaCheck, FaCheckCircle, FaArrowUp, FaArrowDown, FaPalette } from 'react-icons/fa';
import logo from "../img/logo.png";
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import ar from "../img/ar.png";
import fr from "../img/fr.png";
import eg from "../img/eg.png";
import BASE_URL from '../apiConfig';
import '../pages/home_premium.css';

const translations = {
    ar: {
        home: "الرئيسية",
        about: "من نحن",
        courses: "الأكاديمية",
        shop: "الباترونات / الاكسسوارات",
        contact: "اتصل بنا",
        vip: "ماستر أتيليه (VIP)",
        offre: "العروض الخاصة",
        login: "تسجيل الدخول",
        dashboard: "لوحة التحكم",
        myAccount: "حسابي",
        manageSub: "إدارة الاشتراك",
        logout: "تسجيل الخروج",
        confirmLogout: "هل أنت متأكد من رغبتك في تسجيل الخروج؟",
        yes: "نعم، خروج",
        cancel: "إلغاء",
        limitedAccess: "دخول محدود",
        vipMessage: "دخول 'Master Atelier (VIP)' هو تجربة حصرية مخصصة لأعضائنا المميزين.",
        vipBenefits: "✦ اكتشف الباترونات السرية والدروس المتقدمة",
        later: "لاحقاً",
        becomeVip: "اصبح عضواً VIP",
        admin: "مسؤول",
        back: "رجوع"
    },
    fr: {
        home: "Accueil",
        about: "À Propos",
        courses: "L'Académie",
        shop: "Patrons / accessoires",
        contact: "Contact",
        vip: "Master Atelier (VIP)",
        offre: "Offres Spéciales",
        login: "Se connecter",
        dashboard: "Tableau de bord",
        myAccount: "Mon Compte",
        manageSub: "Gérer Abonnement",
        logout: "Déconnexion",
        confirmLogout: "Êtes-vous sûr(e) de vouloir vous déconnecter ?",
        yes: "Oui, Déconnexion",
        cancel: "Annuler",
        limitedAccess: "Accès Limité",
        vipMessage: "L'accès Master Atelier (VIP) est une expérience exclusive réservée à nos membres premium.",
        vipBenefits: "✦ Débloquez des patrons secrets & tutoriels d'experts",
        later: "Plus tard",
        becomeVip: "Devenir Membre VIP",
        admin: "Administrateur",
        back: "Retour"
    },
    en: {
        home: "Home",
        about: "About",
        courses: "Academy",
        shop: "Patterns / accessoires",
        contact: "Contact",
        vip: "Master Atelier (VIP)",
        offre: "Special Offers",
        login: "Login",
        dashboard: "Dashboard",
        myAccount: "My Account",
        manageSub: "Manage Subscription",
        logout: "Logout",
        confirmLogout: "Are you sure you want to log out?",
        yes: "Yes, Logout",
        cancel: "Cancel",
        limitedAccess: "Limited Access",
        vipMessage: "Master Atelier (VIP) access is an exclusive experience reserved for our premium members.",
        vipBenefits: "✦ Unlock secret patterns & expert tutorials",
        later: "Later",
        becomeVip: "Become a VIP Member",
        admin: "Administrator",
        back: "Back"
    }
};

export default function Navbar({ initialCartCount = 0 }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userEmail, setUserEmail] = useState(() => {
        return localStorage.getItem('loggedInUserEmail') || localStorage.getItem('currentUserEmail') || null;
    });
    const [cartItemCount, setCartItemCount] = useState(() => {
        try {
            const items = JSON.parse(localStorage.getItem('panier_items') || '[]');
            return items.length;
        } catch (e) {
            return initialCartCount || 0;
        }
    });
    const [isVip, setIsVip] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showVipModal, setShowVipModal] = useState(false);
    const [vipPhone, setVipPhone] = useState('');
    const [vipFullName, setVipFullName] = useState('');
    const [isSubmittingVip, setIsSubmittingVip] = useState(false);
    const [vipRequestSuccess, setVipRequestSuccess] = useState(false);

    const { appLanguage, changeLanguage, languages, addLanguage, deleteLanguage, updateLanguage } = useLanguage();

    // --- Dynamic Navbar Translations ---
    const [navTranslations, setNavTranslations] = useState(translations);
    const t = navTranslations[appLanguage] || navTranslations.fr || translations.fr;
    const [isEditNavbarModalOpen, setIsEditNavbarModalOpen] = useState(false);
    const [editNavData, setEditNavData] = useState({});

    // --- Menu Configuration (Order & Colors) ---
    const [menuConfig, setMenuConfig] = useState([
        { id: 'home', color: '#d4af37' },
        { id: 'offre', color: '#d4af37' },
        { id: 'shop', color: '#d4af37' },
        { id: 'vip', color: '#d4af37' },
        { id: 'about', color: '#d4af37' },
        { id: 'contact', color: '#d4af37' },
    ]);
    const [isMenuConfigLoading, setIsMenuConfigLoading] = useState(true);

    const [isAddLanguageModalOpen, setIsAddLanguageModalOpen] = useState(false);
    const [isEditLanguageModalOpen, setIsEditLanguageModalOpen] = useState(false);
    const [newLangData, setNewLangData] = useState({ label: '', code: '', emoji: '', icon: '' });
    const [editingLang, setEditingLang] = useState(null);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);
    const langRef = useRef(null);
    const navbarRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Fetch Navbar Translations and Menu Config from API
    useEffect(() => {
        const fetchData = async () => {
            setIsMenuConfigLoading(true);
            try {
                // Fetch translations
                const transRes = await fetch(`${BASE_URL}/api/settings/navbar_translations`);
                if (transRes.ok) {
                    const transData = await transRes.json();
                    setNavTranslations(transData);
                }

                // Fetch menu config (order/colors)
                const configRes = await fetch(`${BASE_URL}/api/settings/menu_config`);
                if (configRes.ok) {
                    const configData = await configRes.json();
                    if (Array.isArray(configData) && configData.length > 0) {
                        setMenuConfig(configData);
                    }
                }
            } catch (err) {
                console.error("Error fetching navbar settings:", err);
            } finally {
                // Simulate a slight delay for the "wow" skeleton effect as requested
                setTimeout(() => {
                    setIsMenuConfigLoading(false);
                }, 800);
            }
        };

        fetchData();
    }, []);

    // Live Panier Sync (Reads from DB if logged in, else Local Storage)
    useEffect(() => {
        const updateCartCount = async () => {
            try {
                const userEmail = localStorage.getItem('loggedInUserEmail') || localStorage.getItem('currentUserEmail');
                
                if (userEmail) {
                    const res = await fetch(`${BASE_URL}/api/commands/user/${userEmail}`);
                    if (res.ok) {
                        const commands = await res.json();
                        let totalItems = 0;
                        commands.forEach(cmd => {
                            if (cmd.items) totalItems += cmd.items.length;
                        });
                        setCartItemCount(totalItems);
                        return;
                    }
                }

                // Fallback for guests
                const items = JSON.parse(localStorage.getItem('panier_items') || '[]');
                setCartItemCount(items.length);
            } catch (e) {
                console.error("Error reading panier logic:", e);
            }
        };
        
        updateCartCount(); // Force immediate check on mount
        window.addEventListener('panierUpdated', updateCartCount);
        return () => window.removeEventListener('panierUpdated', updateCartCount);
    }, []);

    const handleSaveNavbarTranslations = async () => {
        const updatedTranslations = { ...navTranslations, [appLanguage]: editNavData };
        setNavTranslations(updatedTranslations);
        setIsEditNavbarModalOpen(false);

        try {
            // Save translations
            await fetch(`${BASE_URL}/api/settings/navbar_translations`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: updatedTranslations })
            });

            // Save menu config (order/colors)
            await fetch(`${BASE_URL}/api/settings/menu_config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: menuConfig })
            });
        } catch (err) {
            console.error("Failed to save navbar settings", err);
        }
    };

    const moveMenuItem = (index, direction) => {
        const newConfig = [...menuConfig];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < newConfig.length) {
            [newConfig[index], newConfig[newIndex]] = [newConfig[newIndex], newConfig[index]];
            setMenuConfig(newConfig);
        }
    };

    const updateItemColor = (id, color) => {
        setMenuConfig(prev => prev.map(item => item.id === id ? { ...item, color } : item));
    };

    // --- Gestionnaire de changement de langue ---
    const handleLanguageChange = (lang) => {
        changeLanguage(lang);
    };

    // --- Fonction de Retour ---
    const handleGoBack = () => {
        // Sélectionner tous les liens du fil d'Ariane
        const breadcrumbLinks = document.querySelectorAll('.breadcrumb-container .breadcrumb-link');

        if (breadcrumbLinks.length > 0) {
            // Aller au dernier lien trouvé dans le fil d'Ariane (la page parente)
            const lastLink = breadcrumbLinks[breadcrumbLinks.length - 1];
            const targetUrl = lastLink.getAttribute('href');

            if (targetUrl) {
                navigate(targetUrl);
                return;
            }
        }

        // Si aucun fil d'Ariane n'est trouvé, retour classique
        navigate(-1);
    };



    // --- التحقق من حالة المستخدم (تسجيل الدخول/الخروج) ---
    const toggleMenu = () => {
        setIsOpen(!isOpen);
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
        setIsOpen(false);
    };

    const updateAuthStatus = (status, email = null) => {
        setIsLoggedIn(status);
        setUserEmail(email);
        if (status && email) {
            localStorage.setItem('login', 'true');
            localStorage.setItem('loggedInUserEmail', email);
        } else {
            localStorage.removeItem('login');
            localStorage.removeItem('loggedInUserEmail');
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('currentUserEmail');
            setIsVip(false);
            setIsAdmin(false);
        }
    };

    /* handleCredentialResponse removed */

    /* renderGoogleSignInButton removed */

    const handleLogout = () => {
        setShowConfirmModal(true);
        setIsOpen(false);
        setIsDropdownOpen(false);
    };

    const confirmLogout = () => {
        // 1. Close modal immediately
        setShowConfirmModal(false);

        // 2. Clear local storage items for all possible keys
        const emailToRevoke = userEmail; // Keep a reference
        updateAuthStatus(false, null);

        // Clean up remaining bits
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('role');
        localStorage.removeItem('login'); // Just in case

        /* Google revoke removed */

        // 4. Reset & Redirect immediately
        // window.location.href = '/' is usually faster/cleaner than reload() for a fresh start
        window.location.href = '/';
    };

    const cancelLogout = () => {
        setShowConfirmModal(false);
    };

    // --- 🔹 التحقق من اشتراك المستخدم في قاعدة البيانات ---
    const checkVipStatusFromDB = useCallback(async (email) => {
        try {
            const response = await fetch(`${BASE_URL}/api/users/${email}`);
            const data = await response.json();

            if (data && data.abonne === "oui") {
                setIsVip(true);
            } else {
                setIsVip(false);
            }

            // 🛡️ Vérification du statut Admin
            if (data && data.statut === 'admin') {
                setIsAdmin(true);
                localStorage.setItem('userRole', 'admin');
                localStorage.setItem('isAdmin', 'true');
            } else {
                setIsAdmin(false);
                // Don't clear role if it's already set to something else, but clear isAdmin to be safe
                localStorage.setItem('isAdmin', 'false');
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du statut VIP:", error);
            setIsVip(false);
        }
    }, []);

    // --- 🌟 عند النقر على Master Atelier ---
    const handleVipClick = (e) => {
        if (isLoggedIn && !isVip) {
            e.preventDefault();
            setIsOpen(false);
            setShowVipModal(true);
        }
    };

    const handleVipRequest = async (e) => {
        e.preventDefault();
        if (!vipPhone) return;
        setIsSubmittingVip(true);
        try {
            const userName = localStorage.getItem('currentUserEmail')?.split('@')[0] || 'Client';
            const res = await fetch(`${BASE_URL}/api/abonnement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: vipFullName || 'Client',
                    mail: userEmail,
                    telephone: vipPhone
                })
            });
            if (res.ok) {
                setVipRequestSuccess(true);
                setTimeout(() => {
                    setShowVipModal(false);
                    setVipRequestSuccess(false);
                    setVipFullName('');
                    setVipPhone('');
                }, 5000);
            } else {
                const data = await res.json();
                alert(data.message || 'Erreur lors de l\'envoi');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmittingVip(false);
        }
    };

    // --- useEffects (unchanged logic) ---

    useEffect(() => {
        const status = localStorage.getItem('login') === 'true' && !!userEmail;
        setIsLoggedIn(status);

        if (status && userEmail) {
            checkVipStatusFromDB(userEmail);
        }

        const handleClickOutside = (event) => {
            // Close Profile Dropdown if clicking outside its wrapper
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }

            // Close Language Dropdown
            if (langRef.current && !langRef.current.contains(event.target)) {
                setIsLangDropdownOpen(false);
            }

            // Close Mobile Menu if clicking outside the entire navbar
            if (isOpen && navbarRef.current && !navbarRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [userEmail, checkVipStatusFromDB]);

    /* Google ID initialize and render effect removed */

    useEffect(() => {
        if (showConfirmModal || showVipModal) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [showConfirmModal, showVipModal]);

    // --- Liens de navigation ---
    const staticNavItems = {
        home: { name: t.home, link: '/' },
        offre: { name: t.offre || (appLanguage === 'ar' ? 'العروض الخاصة' : 'Offres Spéciales'), link: '/offres' },
        shop: { name: t.shop, link: '/magasin' },
        vip: {
            name: t.vip,
            link: '/Vip-access',
            className: (isLoggedIn && !isVip) ? 'disabled-vip-link' : '',
            onClick: handleVipClick
        },
        about: { name: t.about, link: '/about' },
        contact: { name: t.contact, link: '/contact' },
    };

    const navItems = menuConfig.map(config => {
        const base = staticNavItems[config.id];
        if (!base) return null;
        return { ...base, color: config.color };
    }).filter(Boolean);

    // Vérifie si l'utilisateur est sur la page d'accueil
    const isHomePage = location.pathname === '/';



    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div dir="ltr">
            {/* Bouton de Retour Conditionnel */}
            {!isHomePage && (
                <button className='button_retour' onClick={handleGoBack} aria-label={t.back}>
                    <FaArrowLeft />
                    <span className="back-btn-label">{t.back}</span>
                </button>
            )}

            <nav className={`navbar-couture ${isScrolled ? 'scrolled-nav' : ''}`} ref={navbarRef} dir="ltr">
                <div className="navbar-logo">
                    <Link to="/">
                        <img src={logo} className='logo' alt="Logo Atelier Couture" />
                    </Link>
                </div>

                <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
                    {isMenuConfigLoading ? (
                        // --- 🦴 PREMIUM SKELETON FOR LINKS 🦴 ---
                        [1, 2, 3, 4, 5, 6].map((sk) => (
                            <li key={`nav-sk-${sk}`} className="nav-skeleton-item">
                                <div className="nav-skeleton-pill"></div>
                            </li>
                        ))
                    ) : (
                        navItems.map((item) => (
                            <li key={item.name} onClick={() => setIsOpen(false)}>
                                <NavLink
                                    to={item.link}
                                    className={({ isActive }) =>
                                        `${isActive ? 'nav-link-item active-gold' : 'nav-link-item'} ${item.className || ''}`
                                    }
                                    style={({ isActive }) => ({
                                        color: isActive ? '#D4AF37' : (item.color || 'var(--home-slate)'),
                                        '--link-hover-color': item.color || '#D4AF37'
                                    })}
                                    onClick={item.onClick ? (e) => {
                                        item.onClick(e);
                                        if (isVip || item.link !== '/Vip-access') setIsOpen(false);
                                    } : () => setIsOpen(false)}
                                >
                                    {item.name}
                                </NavLink>
                            </li>
                        ))
                    )}




                    {/* Liens Mobile pour l'Authentification */}
                    {!isLoggedIn ? (
                        <>
                            <li className="mobile-auth-link login_button" onClick={() => setIsOpen(false)}>
                                <NavLink to="/login" className="nav-link-item">
                                    <FaSignInAlt /> Se connecter
                                </NavLink>
                            </li>
                        </>
                    ) : (
                        <></>
                    )}
                </ul>

                <div className="navbar-icons">
                    {/* --- ✨ CUSTOM PREMIUM LANGUAGE SELECTOR ✨ --- */}
                    <div className="premium-lang-select-wrapper" ref={langRef}>
                        <button 
                            className={`premium-lang-trigger ${isLangDropdownOpen ? 'active' : ''}`}
                            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                        >
                            <div className="current-lang-visual">
                                {languages.find(l => l.code === appLanguage) && (
                                    <>
                                        <img 
                                            src={languages.find(l => l.code === appLanguage).icon} 
                                            alt="" 
                                            className="lang-flag-circle"
                                        />
                                        <span className="lang-code-short mobile-only">
                                            {languages.find(l => l.code === appLanguage).code.toUpperCase()}
                                        </span>
                                        <span className="lang-label-full desktop-only">
                                            {languages.find(l => l.code === appLanguage).label}
                                        </span>
                                    </>
                                )}
                            </div>
                            <FaArrowDown className="select-chevron" />
                        </button>

                        {isLangDropdownOpen && (
                            <div className="premium-lang-options-list">
                                {languages.map((lang) => (
                                    <div 
                                        key={lang.code}
                                        className={`premium-lang-item ${appLanguage === lang.code ? 'selected' : ''}`}
                                        onClick={() => {
                                            handleLanguageChange(lang.code);
                                            setIsLangDropdownOpen(false);
                                        }}
                                    >
                                        <img src={lang.icon} alt="" className="item-flag" />
                                        <span className="item-label">{lang.label}</span>
                                        {appLanguage === lang.code && <FaCheckCircle className="item-check" />}
                                    </div>
                                ))}
                            </div>
                        )}

                        {isAdmin && (
                            <div className="admin-lang-tools">
                                <button
                                    className="lang-tool-btn add"
                                    onClick={() => setIsAddLanguageModalOpen(true)}
                                    title="Add Language"
                                >
                                    <FaPlus size={10} />
                                </button>
                                <button
                                    className="lang-tool-btn edit"
                                    onClick={() => {
                                        const current = languages.find(l => l.code === appLanguage);
                                        if (current) {
                                            setEditingLang(current);
                                            setIsEditLanguageModalOpen(true);
                                        }
                                    }}
                                    title="Edit Current"
                                >
                                    <FaEdit size={10} />
                                </button>
                                <button
                                    className="lang-tool-btn delete"
                                    onClick={() => {
                                        if (window.confirm(`Supprimer cette langue ?`)) {
                                            deleteLanguage(appLanguage);
                                        }
                                    }}
                                    title="Delete Current"
                                >
                                    <FaTimes size={10} />
                                </button>
                                <div className="lang-tool-divider"></div>
                                <button
                                    className="lang-tool-btn settings"
                                    onClick={() => {
                                        setEditNavData(t);
                                        setIsEditNavbarModalOpen(true);
                                    }}
                                    title="Menu Settings"
                                >
                                    <FaPalette size={10} />
                                </button>
                            </div>
                        )}
                    </div>
                    {/* ------------------------------------------------ */}
                    {/* ------------------------------------------------ */}
                    {/* ------------------------------------------------ */}

                    {/* Icône Panier (Premium Redesign) */}
                    <Link to="/panier" className="cart-btn-premium" aria-label="Panier">
                        <div className="cart-icon-wrapper">
                            <FaShoppingBag />
                            {cartItemCount > 0 && <span className="cart-badge-premium">{cartItemCount}</span>}
                        </div>
                    </Link>

                    {isLoggedIn ? (
                        <div className="logged-in-controls">
                            <div className="user-menu-wrapper" ref={dropdownRef}>
                                <button className="icon-btn user-profile-btn" onClick={toggleDropdown}>
                                    <FaUser />
                                    {isVip && <FaCrown className="vip-icon-badge" />} {/* Badge VIP */}
                                </button>
                                {isDropdownOpen && (
                                    <div className="user-dropdown">
                                        <div className="dropdown-header">
                                            {/* Affichage de l'email pour référence */}
                                            <p className="user-email-display">{userEmail}</p>
                                            {/* <span className={`status-badge ${isVip ? 'vip-badge' : 'standard-badge'}`}>
                                                {(isAdmin || userEmail === 'admin@admin.com') ? 'Administrateur' : (isVip ? 'Membre VIP' : 'Membre Standard')}
                                            </span> */}
                                        </div>

                                        {/* 🛡️ Lien Tableau de Bord */}
                                        {(isAdmin || userEmail === 'admin@admin.com') && (
                                            <Link to="/admin" className="dropdown-item admin-dashboard-link" onClick={() => setIsDropdownOpen(false)}>
                                                <FaTachometerAlt /> {t.dashboard}
                                            </Link>
                                        )}

                                        <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                            <FaUser /> {t.myAccount}
                                        </Link>
                                        <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                            <FaCrown /> {t.manageSub}
                                        </Link>
                                        <button onClick={handleLogout} className="dropdown-item logout-item">
                                            <FaSignOutAlt /> {t.logout}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="auth-buttons-desktop">
                            <Link to="/login" className="auth-btn login-btn">{t.login}</Link>
                        </div>
                    )}

                    <button className="menu-toggle" onClick={toggleMenu}>
                        {isOpen ? <FaTimes /> : <FaBars />}
                    </button>

                    {/* Inline styles for Premium Cart */}
                    <style>{`
                        .cart-btn-premium {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            text-decoration: none;
                            background: linear-gradient(135deg, #0f172a, #1e293b);
                            border: 1px solid rgba(212, 175, 55, 0.3);
                            padding: 10px 14px;
                            border-radius: 14px;
                            margin-inline-start: 5px;
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
                        }
                        
                        .cart-btn-premium:hover {
                            transform: translateY(-2px);
                            border-color: #D4AF37;
                            box-shadow: 0 6px 15px rgba(212, 175, 55, 0.2);
                        }
                        
                        .cart-icon-wrapper {
                            position: relative;
                            display: flex;
                            align-items: center;
                            color: #D4AF37;
                            font-size: 1.1rem;
                        }
                        
                        .cart-badge-premium {
                            position: absolute;
                            top: -10px;
                            right: -12px;
                            background: linear-gradient(135deg, #ef4444, #dc2626);
                            color: #fff;
                            font-size: 0.65rem;
                            font-weight: 800;
                            width: 20px;
                            height: 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 50%;
                            border: 2px solid #1e293b;
                            box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
                            animation: pulseBadge 2s infinite;
                        }
                        
                        @keyframes pulseBadge {
                            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
                            70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                        }
                        
                        @media (max-width: 900px) {
                            .cart-btn-premium { margin-inline-start: 1px; margin-inline-end: 1px; }
                        }
                    `}</style>
                </div>
            </nav>

            {/* Modals */}
            {showConfirmModal && (
                <div className="premium-modal-backdrop" onClick={cancelLogout}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={cancelLogout}><FaTimes /></button>
                        <h2 className="premium-modal-title">{t.logout}</h2>
                        <p style={{ textAlign: 'center', color: '#4b5563', marginBottom: '30px', fontSize: '1.1rem' }}>
                            {t.confirmLogout}
                        </p>
                        <div className="premium-btn-group">
                            <button onClick={cancelLogout} className="premium-btn-cta secondary">{t.cancel}</button>
                            <button onClick={confirmLogout} className="premium-btn-cta gold">{t.yes}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🛑 Modal Accès Limité (Creative Design - Synced with Home) */}
            {showVipModal && ReactDOM.createPortal(
                <div className="premium-modal-backdrop" onClick={() => !isSubmittingVip && setShowVipModal(false)}>
                    <div className="creative-modal-content" onClick={(e) => e.stopPropagation()} style={{ overflow: 'visible' }}>
                        {/* ABSOLUTE CROWN */}
                        <div className="creative-crown-wrapper">
                            <FaCrown />
                        </div>

                        {/* Top Header Section */}
                        <div className="creative-modal-header">
                            <button
                                className="creative-close-btn"
                                onClick={() => setShowVipModal(false)}
                            >
                                <FaTimes />
                            </button>

                            <h2 className="creative-title">
                                {t.limitedAccess}
                            </h2>
                        </div>

                        {/* Body Section */}
                        <div className="creative-modal-body">
                            {!vipRequestSuccess ? (
                                <>
                                    <p className="creative-subtitle">
                                        {t.vipMessage}
                                    </p>

                                    <div className="creative-benefit-pill">
                                        {t.vipBenefits}
                                    </div>

                                    <form onSubmit={handleVipRequest} style={{ width: '100%' }}>
                                        <div className="creative-input-group">
                                            <label>{appLanguage === 'ar' ? 'رقم الهاتف' : 'Numéro de Téléphone'}</label>
                                            <div className="creative-input-wrapper">
                                                <FaPhoneAlt />
                                                <input
                                                    type="tel"
                                                    placeholder="Ex: 22 222 222"
                                                    value={vipPhone}
                                                    onChange={(e) => setVipPhone(e.target.value.replace(/\D/g, ''))}
                                                    minLength={8}
                                                    required
                                                    className="creative-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="creative-input-group">
                                            <label>{appLanguage === 'ar' ? 'الاسم الكامل' : 'Nom Complet'}</label>
                                            <div className="creative-input-wrapper">
                                                <FaUser />
                                                <input
                                                    type="text"
                                                    placeholder={appLanguage === 'ar' ? 'اسمك الكامل' : 'Votre Nom et Prénom'}
                                                    value={vipFullName}
                                                    onChange={(e) => setVipFullName(e.target.value.replace(/[^a-zA-Z\s\u0600-\u06FF]/g, ''))}
                                                    required
                                                    className="creative-input"
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className="creative-submit-btn" disabled={isSubmittingVip}>
                                            {isSubmittingVip ? (appLanguage === 'ar' ? 'جاري الإرسال...' : 'Envoi...') : (appLanguage === 'ar' ? 'إرسال الطلب' : 'Envoyer la demande')}
                                        </button>

                                        <button
                                            type="button"
                                            className="creative-later-btn"
                                            onClick={() => setShowVipModal(false)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#b5bac1',
                                                marginTop: '15px',
                                                cursor: 'pointer',
                                                fontWeight: '800',
                                                fontSize: '0.85rem',
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            {t.later}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div style={{ padding: '15px 0' }}>
                                    <div style={{
                                        width: '70px',
                                        height: '70px',
                                        background: '#ecfdf5',
                                        color: '#34d399',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        margin: '0 auto 20px',
                                        boxShadow: '0 15px 35px rgba(52, 211, 153, 0.15)'
                                    }}>
                                        <FaCheckCircle />
                                    </div>
                                    <h3 style={{ color: '#0f172a', fontSize: '1.6rem', marginBottom: '10px', fontWeight: '900' }}>
                                        {appLanguage === 'ar' ? 'تم استلام طلبك!' : 'Demande Reçue !'}
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', maxWidth: '300px', margin: '0 auto' }}>
                                        {appLanguage === 'ar'
                                            ? "تم إرسال بياناتك بنجاح. سيقوم المسؤول بالاتصال بك في أقرب وقت."
                                            : "Vos informations ont été envoyées. Un administrateur vous contactera prochainement."
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 🛑 Modal Ajouter une Langue */}
            {isAddLanguageModalOpen && (
                <div className="premium-modal-backdrop" onClick={() => setIsAddLanguageModalOpen(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsAddLanguageModalOpen(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">Nouvelle Langue</h2>

                        <div className="premium-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="premium-form-group">
                                <label>Nom (ex: Italiano)</label>
                                <input
                                    type="text"
                                    value={newLangData.label}
                                    onChange={e => setNewLangData({ ...newLangData, label: e.target.value })}
                                    placeholder="Nom de la langue..."
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Code (ex: it)</label>
                                <input
                                    type="text"
                                    value={newLangData.code}
                                    onChange={e => setNewLangData({ ...newLangData, code: e.target.value })}
                                    placeholder="it, es, de..."
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Emoji (ex: 🇮🇹)</label>
                                <input
                                    type="text"
                                    value={newLangData.emoji}
                                    onChange={e => setNewLangData({ ...newLangData, emoji: e.target.value })}
                                    placeholder="🇮🇹"
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>URL de l'icône (Image)</label>
                                <input
                                    type="text"
                                    value={newLangData.icon}
                                    onChange={e => setNewLangData({ ...newLangData, icon: e.target.value })}
                                    placeholder="https://.../flag.png"
                                />
                            </div>
                        </div>

                        <div className="premium-btn-group" style={{ marginTop: '25px' }}>
                            <button onClick={() => setIsAddLanguageModalOpen(false)} className="premium-btn-cta secondary">
                                Annuler
                            </button>
                            <button
                                onClick={() => {
                                    if (newLangData.label && newLangData.code) {
                                        addLanguage(newLangData);
                                        setIsAddLanguageModalOpen(false);
                                        setNewLangData({ label: '', code: '', emoji: '', icon: '' });
                                    }
                                }}
                                className="premium-btn-cta gold"
                            >
                                <FaSave /> Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* 🛑 Modal Modifier une Langue */}
            {isEditLanguageModalOpen && editingLang && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditLanguageModalOpen(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditLanguageModalOpen(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">Modifier la Langue</h2>

                        <div className="premium-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="premium-form-group">
                                <label>Nom (ex: Italiano)</label>
                                <input
                                    type="text"
                                    value={editingLang.label}
                                    onChange={e => setEditingLang({ ...editingLang, label: e.target.value })}
                                    placeholder="Nom de la langue..."
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Code (ex: it) - Non modifiable</label>
                                <input
                                    type="text"
                                    value={editingLang.code}
                                    disabled
                                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Emoji (ex: 🇮🇹)</label>
                                <input
                                    type="text"
                                    value={editingLang.emoji}
                                    onChange={e => setEditingLang({ ...editingLang, emoji: e.target.value })}
                                    placeholder="🇮🇹"
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>URL de l'icône (Image)</label>
                                <input
                                    type="text"
                                    value={editingLang.icon}
                                    onChange={e => setEditingLang({ ...editingLang, icon: e.target.value })}
                                    placeholder="https://.../flag.png"
                                />
                            </div>
                        </div>

                        <div className="premium-btn-group" style={{ marginTop: '25px' }}>
                            <button onClick={() => setIsEditLanguageModalOpen(false)} className="premium-btn-cta secondary">
                                Annuler
                            </button>
                            <button
                                onClick={() => {
                                    if (editingLang.label) {
                                        updateLanguage(editingLang);
                                        setIsEditLanguageModalOpen(false);
                                        setEditingLang(null);
                                    }
                                }}
                                className="premium-btn-cta gold"
                            >
                                <FaSave /> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🛑 Modal Modifier les boutons de la Navbar */}
            {isEditNavbarModalOpen && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditNavbarModalOpen(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', width: '95%' }}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditNavbarModalOpen(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">
                            {appLanguage === 'ar' ? 'تخصيص القائمة الرئيسية' : 'Personnaliser le Menu'}
                        </h2>

                        {isMenuConfigLoading ? (
                            <div className="menu-skeleton-container">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="menu-item-skeleton">
                                        <div className="skeleton-icon"></div>
                                        <div className="skeleton-text"></div>
                                        <div className="skeleton-color"></div>
                                        <div className="skeleton-arrows"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="menu-config-list">
                                {menuConfig.map((item, index) => (
                                    <div key={item.id} className="menu-config-row">
                                        <div className="menu-row-info">
                                            <span className="menu-item-id-badge">{item.id.toUpperCase()}</span>
                                            <div className="menu-input-wrapper">
                                                <label>{appLanguage === 'ar' ? 'العنوان' : 'Libellé'}</label>
                                                <input
                                                    type="text"
                                                    className="form-input-premium tiny"
                                                    value={editNavData[item.id] || ''}
                                                    onChange={e => setEditNavData({ ...editNavData, [item.id]: e.target.value })}
                                                    dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                                                />
                                            </div>
                                        </div>

                                        <div className="menu-row-controls">
                                            <div className="color-picker-group">
                                                <label><FaPalette /> {appLanguage === 'ar' ? 'اللون' : 'Couleur'}</label>
                                                <input
                                                    type="color"
                                                    className="premium-color-input"
                                                    value={item.color || '#0f172a'}
                                                    onChange={e => updateItemColor(item.id, e.target.value)}
                                                />
                                            </div>

                                            <div className="order-btns-group">
                                                <button
                                                    className="order-btn"
                                                    onClick={() => moveMenuItem(index, 'up')}
                                                    disabled={index === 0}
                                                >
                                                    <FaArrowUp />
                                                </button>
                                                <button
                                                    className="order-btn"
                                                    onClick={() => moveMenuItem(index, 'down')}
                                                    disabled={index === menuConfig.length - 1}
                                                >
                                                    <FaArrowDown />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="premium-btn-group" style={{ marginTop: '25px' }}>
                            <button onClick={() => setIsEditNavbarModalOpen(false)} className="premium-btn-cta secondary">
                                {appLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button onClick={handleSaveNavbarTranslations} className="premium-btn-cta gold">
                                <FaSave /> {appLanguage === 'ar' ? 'حفظ الإعدادات' : 'Enregistrer'}
                            </button>
                        </div>

                        <style>{`
                            .menu-skeleton-container { display: flex; flex-direction: column; gap: 15px; }
                            .menu-item-skeleton { 
                                height: 60px; 
                                background: #f1f5f9; 
                                border-radius: 15px; 
                                position: relative; 
                                overflow: hidden;
                                display: flex; 
                                align-items: center; 
                                padding: 0 15px;
                                gap: 15px;
                            }
                            .menu-item-skeleton::after {
                                content: "";
                                position: absolute;
                                top: 0; right: 0; bottom: 0; left: 0;
                                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
                                animation: skeleton-shimmer 1.5s infinite;
                            }
                            @keyframes skeleton-shimmer {
                                0% { transform: translateX(-100%); }
                                100% { transform: translateX(100%); }
                            }
                            .skeleton-icon { width: 30px; height: 30px; background: #e2e8f0; border-radius: 8px; }
                            .skeleton-text { flex: 1; height: 20px; background: #e2e8f0; border-radius: 10px; }
                            .skeleton-color { width: 40px; height: 40px; background: #e2e8f0; border-radius: 12px; }
                            .skeleton-arrows { width: 40px; height: 40px; background: #e2e8f0; border-radius: 12px; }

                            .menu-config-list { display: flex; flex-direction: column; gap: 12px; }
                            .menu-config-row {
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                background: #fff;
                                border: 1px solid #e2e8f0;
                                padding: 12px 20px;
                                border-radius: 20px;
                                transition: all 0.3s;
                            }
                            .menu-config-row:hover { border-color: #D4AF37; box-shadow: 0 10px 20px rgba(0,0,0,0.03); }
                            .menu-row-info { display: flex; align-items: center; gap: 20px; flex: 1; }
                            .menu-item-id-badge {
                                background: #f1f5f9;
                                color: #64748b;
                                font-size: 0.7rem;
                                font-weight: 800;
                                padding: 4px 8px;
                                border-radius: 6px;
                                min-width: 60px;
                                text-align: center;
                            }
                            .menu-input-wrapper { flex: 1; }
                            .menu-input-wrapper label { font-size: 0.65rem; color: #94a3b8; display: block; margin-bottom: 2px; }
                            .form-input-premium.tiny { padding: 6px 12px; font-size: 0.9rem; }
                            
                            .menu-row-controls { display: flex; align-items: center; gap: 20px; }
                            .color-picker-group { text-align: center; }
                            .color-picker-group label { font-size: 0.65rem; color: #94a3b8; display: flex; align-items: center; gap: 4px; justify-content: center; margin-bottom: 4px; }
                            .premium-color-input {
                                -webkit-appearance: none;
                                border: none;
                                width: 35px;
                                height: 35px;
                                border-radius: 50%;
                                cursor: pointer;
                                background: none;
                            }
                            .premium-color-input::-webkit-color-swatch-wrapper { padding: 0; }
                            .premium-color-input::-webkit-color-swatch { border-radius: 50%; border: 3px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                            
                            .order-btns-group { display: flex; flex-direction: column; gap: 4px; }
                            .order-btn {
                                background: #f8fafc;
                                border: 1px solid #e2e8f0;
                                color: #64748b;
                                width: 28px;
                                height: 28px;
                                border-radius: 8px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                cursor: pointer;
                                transition: all 0.2s;
                                font-size: 0.8rem;
                            }
                            .order-btn:hover:not(:disabled) { background: #0f172a; color: #fff; border-color: #0f172a; }
                            .order-btn:disabled { opacity: 0.2; cursor: not-allowed; }

                            .nav-link-item:hover {
                                color: var(--link-hover-color, #D4AF37) !important;
                            }

                            @media (max-width: 550px) {

                              /* ترتيب الأيقونات على الموبايل */
                              .navbar-icons {
                                order: 3;
                                gap: 8px; /* Slightly reduced gap for better mobile fit */
                              }

                            }
                            @media (max-width: 600px) {
                                .menu-config-row { flex-direction: column; gap: 15px; }
                                .menu-row-info { width: 100%; }
                                .menu-row-controls { width: 100%; justify-content: space-between; }
                            }
                        `}</style>
                    </div>
                </div>
            )}
        </div>
    );
}