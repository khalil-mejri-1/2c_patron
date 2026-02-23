import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaBars, FaTimes, FaSearch, FaShoppingBag, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCrown, FaTachometerAlt, FaPlus, FaSave, FaArrowLeft } from 'react-icons/fa';
import logo from "../img/logo.png";
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useLanguage } from '../context/LanguageContext';
import ar from "../img/ar.png";
import fr from "../img/fr.png";
import eg from "../img/eg.png";
import BASE_URL from '../apiConfig';

const GOOGLE_CLIENT_ID = "435113772089-sa576v0m6hq96rg9369icj3g66pnkh9r.apps.googleusercontent.com";

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

    const { appLanguage, changeLanguage, languages, addLanguage } = useLanguage();
    const [isAddLanguageModalOpen, setIsAddLanguageModalOpen] = useState(false);
    const [newLangData, setNewLangData] = useState({ label: '', code: '', emoji: '', icon: '' });

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

    const handleCredentialResponse = useCallback((response) => {
        try {
            const userObject = jwtDecode(response.credential);
            updateAuthStatus(true, userObject.email);
            setIsOpen(false);
            setIsDropdownOpen(false);
        } catch (error) {
            console.error("Error decoding JWT:", error);
        }
    }, []);

    const renderGoogleSignInButton = () => {
        const buttonContainer = document.getElementById("google-sign-in-button");
        if (window.google && buttonContainer) {
            window.google.accounts.id.renderButton(buttonContainer, {
                type: "standard",
                shape: "rectangular",
                theme: "outline",
                text: "signin_with",
                size: "large",
                logo_alignment: "left"
            });
        }
    };

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

        // 3. Clear Google Session if exists (Async but non-blocking)
        if (emailToRevoke && window.google?.accounts?.id) {
            try {
                window.google.accounts.id.revoke(emailToRevoke, (done) => {
                    console.log('Consent revoked for:', emailToRevoke, done);
                });
            } catch (err) {
                console.error("Google revoke error:", err);
            }
        }

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

    useEffect(() => {
        if (window.google && !isLoggedIn) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                context: "signin",
                ux_mode: "popup",
                auto_prompt: false,
            });
            renderGoogleSignInButton();
            return () => {
                if (window.google && window.google.accounts && window.google.accounts.id) {
                    window.google.accounts.id.cancel();
                }
            };
        }
    }, [handleCredentialResponse, isLoggedIn]);

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
        { name: 'Accueil', link: '/' },
        { name: 'Patrons / Gabarits', link: '/magasin' },
        {
            name: 'Master Atelier (VIP)',
            link: '/Vip-access',
            className: !isVip ? 'disabled-vip-link' : '',
            onClick: handleVipClick
        },
        { name: 'À Propos', link: '/about' },
        { name: 'Contact', link: '/contact' },
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
                <button className='button_retour' onClick={handleGoBack} aria-label="Retour">
                    <FaArrowLeft />
                    <span className="back-btn-label">Retour</span>
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
                            {languages.map(({ code, label, icon }) => (
                                <button
                                    key={code}
                                    className={`flag-btn ${appLanguage === code ? 'active-flag' : ''}`}
                                    onClick={() => handleLanguageChange(code)}
                                >
                                    <img src={icon} alt={label} className="flag-icon" />
                                </button>
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
                            <li className="mobile-auth-link login_button" onClick={() => setIsOpen(false)}>
                                <NavLink to="/register" className="nav-link-item mobile-register-btn">
                                    <FaUserPlus /> S'inscrire
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
                        {languages.map(({ code, label, icon }) => (
                            <div
                                key={code}
                                className={`bloc_language-selector-desktop ${appLanguage === code ? 'active-bloc' : ''}`}
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
                                                <FaTachometerAlt /> Tableau de bord
                                            </Link>
                                        )}

                                        <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                            <FaUser /> Mon Compte
                                        </Link>
                                        <Link to="/Abonnement-VIP" className="dropdown-item vip-link" onClick={() => setIsDropdownOpen(false)}>
                                            <FaCrown /> Gérer Abonnement
                                        </Link>
                                        <button onClick={handleLogout} className="dropdown-item logout-item">
                                            <FaSignOutAlt /> Déconnexion
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="auth-buttons-desktop">
                            <Link to="/login" className="auth-btn login-btn">Se connecter</Link>
                            <Link to="/register" className="auth-btn register-btn">S'inscrire</Link>
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
                        <h2 className="premium-modal-title">Déconnexion</h2>
                        <p style={{ textAlign: 'center', color: '#4b5563', marginBottom: '30px', fontSize: '1.1rem' }}>
                            Êtes-vous sûr(e) de vouloir vous déconnecter ?
                        </p>
                        <div className="premium-btn-group">
                            <button onClick={cancelLogout} className="premium-btn-cta secondary">Annuler</button>
                            <button onClick={confirmLogout} className="premium-btn-cta gold">Oui, Déconnexion</button>
                        </div>
                    </div>
                </div>
            )}

            {showVipModal && (
                <div className="premium-modal-backdrop" onClick={() => setShowVipModal(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setShowVipModal(false)}><FaTimes /></button>

                        <div className="premium-modal-header">
                            <div className="vip-cert-icon-wrapper" style={{ margin: '0 auto 15px', background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37' }}>
                                <FaCrown />
                            </div>
                            <h2 className="premium-modal-title">Accès Limité</h2>
                        </div>

                        <div style={{ padding: '0 20px 30px', textAlign: 'center' }}>
                            <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6', margin: '0 0 20px' }}>
                                L'accès <strong>Master Atelier (VIP)</strong> est une expérience exclusive réservée à nos membres premium.
                            </p>
                            <div style={{ background: '#fef3c7', color: '#92400e', padding: '12px 20px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '700', display: 'inline-block' }}>
                                ✦ Débloquez des patrons secrets & tutoriels d'experts
                            </div>
                        </div>

                        <div className="premium-btn-group">
                            <button onClick={() => setShowVipModal(false)} className="premium-btn-cta secondary">
                                Plus tard
                            </button>
                            <Link to="/Abonnement-VIP" onClick={() => setShowVipModal(false)} className="premium-btn-cta gold" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                                Devenir Membre VIP
                            </Link>
                        </div>
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
        </>
    );
}