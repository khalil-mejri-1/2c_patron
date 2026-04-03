import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaBars, FaTimes, FaSearch, FaShoppingBag, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCrown, FaTachometerAlt, FaPlus, FaSave, FaArrowLeft, FaEdit, FaPhoneAlt, FaCheck } from 'react-icons/fa';
import logo from "../img/logo.png";
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import ar from "../img/ar.png";
import fr from "../img/fr.png";
import eg from "../img/eg.png";
import BASE_URL from '../apiConfig';

const translations = {
    ar: {
        home: "الرئيسية",
        about: "من نحن",
        courses: "الأكاديمية",
        shop: "الباترونات / الاكسسوارات",
        contact: "اتصل بنا",
        vip: "ماستر أتيليه (VIP)",
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
    const [cartItemCount, setCartItemCount] = useState(initialCartCount);
    const [isVip, setIsVip] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showVipModal, setShowVipModal] = useState(false);
    const [vipPhone, setVipPhone] = useState('');
    const [vipFullName, setVipFullName] = useState('');
    const [isSubmittingVip, setIsSubmittingVip] = useState(false);
    const [vipRequestSuccess, setVipRequestSuccess] = useState(false);

    const { appLanguage, changeLanguage, languages, addLanguage, deleteLanguage, updateLanguage } = useLanguage();
    const t = translations[appLanguage] || translations.fr;
    const [isAddLanguageModalOpen, setIsAddLanguageModalOpen] = useState(false);
    const [isEditLanguageModalOpen, setIsEditLanguageModalOpen] = useState(false);
    const [newLangData, setNewLangData] = useState({ label: '', code: '', emoji: '', icon: '' });
    const [editingLang, setEditingLang] = useState(null);

    const dropdownRef = useRef(null);
    const navbarRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    // --- Gestionnaire de changement de langue ---
    const handleLanguageChange = (lang) => {
        changeLanguage(lang);
    };

    // --- Fonction de Retour ---
    const handleGoBack = () => {
        navigate(-1);
    };

    // --- تحديث عدد العناصر في السلة ---
    const updateCartCount = useCallback(() => {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const totalCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
        setCartItemCount(totalCount);
    }, []);

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
            } else {
                setIsAdmin(false);
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du statut VIP:", error);
            setIsVip(false);
        }
    }, []);

    // --- 🌟 عند النقر على Master Atelier ---
    const handleVipClick = (e) => {
        if (!isVip) {
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
        updateCartCount();
        window.addEventListener('cartUpdated', updateCartCount);
        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, [updateCartCount]);

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
    const navItems = [
        { name: t.home, link: '/' },
        { name: t.shop, link: '/magasin' },
        {
            name: t.vip,
            link: '/Vip-access',
            className: !isVip ? 'disabled-vip-link' : '',
            onClick: handleVipClick
        },
        { name: t.about, link: '/about' },
        { name: t.contact, link: '/contact' },
    ];

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
        <>
            {/* Bouton de Retour Conditionnel */}
            {!isHomePage && (
                <button className='button_retour' onClick={handleGoBack} aria-label={t.back}>
                    <FaArrowLeft />
                    <span className="back-btn-label">{t.back}</span>
                </button>
            )}

            <nav className={`navbar-couture ${isScrolled ? 'scrolled-nav' : ''}`} ref={navbarRef}>
                <div className="navbar-logo">
                    <Link to="/">
                        <img src={logo} className='logo' alt="Logo Atelier Couture" />
                    </Link>
                </div>

                <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
                    {navItems.map((item) => (
                        <li key={item.name} onClick={() => setIsOpen(false)}>
                            <NavLink
                                to={item.link}
                                className={({ isActive }) =>
                                    `${isActive ? 'nav-link-item active-gold' : 'nav-link-item'} ${item.className || ''}`
                                }
                                onClick={item.onClick ? (e) => {
                                    item.onClick(e);
                                    if (isVip || item.link !== '/Vip-access') setIsOpen(false);
                                } : () => setIsOpen(false)}
                            >
                                {item.name}
                            </NavLink>
                        </li>
                    ))}

                    <li className="mobile-language-menu">
                        <div className="language-selector-mobile">
                            {languages.map(({ code, label, icon, emoji }) => (
                                <div key={code} style={{ position: 'relative' }}>
                                    <button
                                        className={`flag-btn ${appLanguage === code ? 'active-flag' : ''}`}
                                        onClick={() => { handleLanguageChange(code); setIsOpen(false); }}
                                    >
                                        <img src={icon} alt={label} className="flag-icon" />
                                    </button>
                                    {(isAdmin || userEmail?.includes('admin') || userEmail === '2cparton0011@gmail.com') && (
                                        <div style={{ position: 'absolute', top: '-10px', right: '-15px', display: 'flex', gap: '2px', zIndex: 10 }}>
                                            <button
                                                className="edit-lang-btn-small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingLang({ code, label, icon, emoji });
                                                    setIsEditLanguageModalOpen(true);
                                                }}
                                                style={{
                                                    background: '#D4AF37',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '18px',
                                                    height: '18px',
                                                    fontSize: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FaEdit size={10} />
                                            </button>
                                            <button
                                                className="delete-lang-btn-small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`Supprimer la langue ${label} ?`)) {
                                                        deleteLanguage(code);
                                                    }
                                                }}
                                                style={{
                                                    background: '#ef4444',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '18px',
                                                    height: '18px',
                                                    fontSize: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FaTimes size={10} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {(isAdmin || userEmail?.includes('admin') || userEmail === '2cparton0011@gmail.com') && (
                                <button
                                    className="flag-btn add-language-btn-mobile"
                                    onClick={() => setIsAddLanguageModalOpen(true)}
                                >
                                    <FaPlus size={16} />
                                </button>
                            )}
                        </div>
                    </li>



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
                    {/* --- Sélecteur de langue sur Desktop/Tablette --- */}
                    <div className="language-selector-desktop">
                        {languages.map(({ code, label, icon, emoji }) => (
                            <div
                                key={code}
                                className={`bloc_language-selector-desktop ${appLanguage === code ? 'active-bloc' : ''}`}
                                style={{ position: 'relative' }}
                            >
                                <button
                                    className={`flag-btn ${appLanguage === code ? 'active-flag' : ''}`}
                                    onClick={() => handleLanguageChange(code)}
                                    aria-label={`Changer la langue en ${label}`}
                                >
                                    <img
                                        src={icon}
                                        alt={`علم ${label}`}
                                        className="flag-icon"
                                    />
                                </button>
                                {(isAdmin || userEmail?.includes('admin') || userEmail === '2cparton0011@gmail.com') && (
                                    <div style={{ position: 'absolute', top: '-8px', right: '-12px', display: 'flex', gap: '3px', zIndex: 10 }}>
                                        <button
                                            className="edit-lang-btn-small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingLang({ code, label, icon, emoji });
                                                setIsEditLanguageModalOpen(true);
                                            }}
                                            style={{
                                                background: '#D4AF37',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '18px',
                                                height: '18px',
                                                fontSize: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FaEdit size={10} />
                                        </button>
                                        <button
                                            className="delete-lang-btn-small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(`Supprimer la langue ${label} ?`)) {
                                                    deleteLanguage(code);
                                                }
                                            }}
                                            style={{
                                                background: '#ef4444',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '18px',
                                                height: '18px',
                                                fontSize: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FaTimes size={10} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {(isAdmin || userEmail?.includes('admin') || userEmail === '2cparton0011@gmail.com') && (
                            <div className="bloc_language-selector-desktop">
                                <button
                                    className="flag-btn add-language-btn"
                                    onClick={() => setIsAddLanguageModalOpen(true)}
                                    title="Ajouter une nouvelle langue"
                                >
                                    <FaPlus size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                    {/* ------------------------------------------------ */}

                    {/* Icône Panier (Désactivée dans le code fourni, mais maintenue ici pour référence) */}
                    {/* <Link to="/panier" className="icon-btn cart-btn" aria-label="Panier">
                        <FaShoppingBag />
                        {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
                    </Link> */}

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

            {showVipModal && (
                <div className="premium-modal-backdrop" onClick={() => !isSubmittingVip && setShowVipModal(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '40px' }}>
                        <button className="premium-modal-close-icon" onClick={() => setShowVipModal(false)}><FaTimes /></button>

                        <div className="premium-modal-header">
                            <div className="vip-cert-icon-wrapper" style={{ margin: '0 auto 15px', background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37' }}>
                                <FaCrown />
                            </div>
                            <h2 className="premium-modal-title">{t.limitedAccess}</h2>
                        </div>

                        {!vipRequestSuccess ? (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6' }}>
                                        {t.vipMessage}
                                    </p>
                                    <div style={{ background: '#fef3c7', color: '#92400e', padding: '10px 15px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', marginTop: '15px' }}>
                                        {t.vipBenefits}
                                    </div>
                                    <p style={{ marginTop: '20px', color: '#1e293b', fontWeight: 'bold' }}>
                                        Un administrateur vous contactera dans les plus brefs délais pour vous informer des détails.
                                    </p>
                                </div>

                                <form onSubmit={handleVipRequest}>
                                    <div className="premium-form-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem' }}>Nom Complet</label>
                                        <div style={{ position: 'relative' }}>
                                            <FaUser style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }} />
                                            <input
                                                type="text"
                                                placeholder="Votre Nom et Prénom"
                                                value={vipFullName}
                                                onChange={(e) => setVipFullName(e.target.value)}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 15px 12px 45px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '1rem',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                            />
                                        </div>
                                    </div>

                                    <div className="premium-form-group" style={{ marginBottom: '25px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem' }}>Numéro de Téléphone</label>
                                        <div style={{ position: 'relative' }}>
                                            <FaPhoneAlt style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }} />
                                            <input
                                                type="tel"
                                                placeholder="Ex: +216 22 222 222"
                                                value={vipPhone}
                                                onChange={(e) => setVipPhone(e.target.value)}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 15px 12px 45px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '1rem',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                            />
                                        </div>
                                    </div>

                                    <div className="premium-btn-group">
                                        <button type="button" onClick={() => setShowVipModal(false)} className="premium-btn-cta secondary" disabled={isSubmittingVip}>
                                            {t.later}
                                        </button>
                                        <button type="submit" className="premium-btn-cta gold" disabled={isSubmittingVip}>
                                            {isSubmittingVip ? 'Envoi...' : 'Envoyer la demande'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ width: '60px', height: '60px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 20px' }}>
                                    <FaCheck />
                                </div>
                                <h3 style={{ color: '#064e3b', marginBottom: '10px' }}>Demande envoyée !</h3>
                                <p style={{ color: '#065f46', fontSize: '1.1rem' }}>
                                    Un administrateur vous contactera dans les plus brefs délais pour vous informer des détails.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
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
        </>
    );
}