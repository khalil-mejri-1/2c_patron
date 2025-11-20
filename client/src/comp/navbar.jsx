import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaBars, FaTimes, FaSearch, FaShoppingBag, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCrown } from 'react-icons/fa';
import logo from "../img/logo.png";
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ar from "../img/ar.png";
import fr from "../img/fr.png";
import eg from "../img/eg.png";

const GOOGLE_CLIENT_ID = "509196356589-2sqg41uk19epl6m7bpbaeee2i8pmppqm.apps.googleusercontent.com";

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
    const [showVipModal, setShowVipModal] = useState(false);
    
    // 🌟 NOUVEL ÉTAT pour la gestion de la langue
    const [currentLanguage, setCurrentLanguage] = useState(
        localStorage.getItem('appLanguage') || 'fr'
    );

    const dropdownRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    // --- Gestionnaire de changement de langue ---
    const handleLanguageChange = (lang) => {
        setCurrentLanguage(lang);
        localStorage.setItem('appLanguage', lang);
        // Ici, vous devriez idéalement déclencher le changement de langue
        // de votre bibliothèque i18n (ex: i18next.changeLanguage(lang)).
        // Pour cet exemple, nous simulons juste l'état.
        console.log(`Langue changée en : ${lang}`);
        window.location.reload()
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
            setIsVip(false);
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
        setShowConfirmModal(false);
        if (userEmail && window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.revoke(userEmail, (done) => {
                console.log('Consent revoked for:', userEmail, done);
                updateAuthStatus(false, null);
                renderGoogleSignInButton();
                window.location.reload();
            });
        } else {
            updateAuthStatus(false, null);
            renderGoogleSignInButton();
            window.location.reload();
        }
    };

    const cancelLogout = () => {
        setShowConfirmModal(false);
    };

    // --- 🔹 التحقق من اشتراك المستخدم في قاعدة البيانات ---
    const checkVipStatusFromDB = useCallback(async (email) => {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${email}`);
            const data = await response.json();

            if (data && data.abonne === "oui") {
                setIsVip(true);
            } else {
                setIsVip(false);
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
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
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

    // Liste des drapeaux (🇸🇦 Arabie Saoudite = Arabe; 🇬🇧 Royaume-Uni = Anglais; 🇫🇷 France = Français)
    const flags = [
        { lang: 'ar', emoji: '🇸🇦', country: 'ar',icon:ar },
        { lang: 'fr', emoji: '🇫🇷', country: 'Fr',icon:fr },
        { lang: 'en', emoji: '🇬🇧', country: 'En',icon:eg },
    ];

    return (
        <>
            {/* Bouton de Retour Conditionnel */}
            {!isHomePage && (
                <button className='button_retour' onClick={handleGoBack}>
                    &larr; Retour
                </button>
            )}

            <nav className="navbar-couture">
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
                    
                    {/* --- Affichage des drapeaux sur mobile (dans le menu burger) --- */}
                    <li className="mobile-language-menu">
                        <span className="nav-link-item">Langue :</span>
                        <div className="language-selector-mobile">
                            {flags.map(({ lang, emoji, country }) => (
                                <button
                                    key={lang}
                                    className={`flag-btn ${currentLanguage === lang ? 'active-flag' : ''}`}
                                    onClick={() => handleLanguageChange(lang)}
                                    aria-label={`Changer la langue en ${country}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </li>
                    {/* ------------------------------------------------------------- */}


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
                        // Lien VIP Mobile si l'utilisateur est connecté
                        <li className="mobile-auth-link vip-button">
                            <NavLink to="/Abonnement-VIP" className="nav-link-item mobile-vip-btn">
                                <FaCrown /> Accès VIP
                            </NavLink>
                        </li>
                    )}
                </ul>

                <div className="navbar-icons">
                    
                    {/* --- Sélecteur de langue sur Desktop/Tablette --- */}
               <div className="language-selector-desktop">
            {flags.map(({ lang, country, icon }) => (
                <div 
                    // ✅ يجب أن يكون المفتاح (key) على العنصر الخارجي للحلقة
                    key={lang} 
                    className={`bloc_language-selector-desktop ${currentLanguage === lang ? 'active-bloc' : ''}`}
                >
                    {/* ✅ استخدام خاصية 'icon' الخاصة بالعلم الحالي */}
                 
                     
                    <button
                        className={`flag-btn ${currentLanguage === lang ? 'active-flag' : ''}`}
                        onClick={() => handleLanguageChange(lang)}
                        aria-label={`Changer la langue en ${country}`}
                    >
                        {/* يمكنك اختيار عرض الرمز التعبيري أو تركه كما هو إذا كانت الصورة كافية */}
                      
                           <img 
                        src={icon} 
                        alt={`علم ${country}`} 
                        className="flag-icon"
                        
                    />
                      {/* {country}  */}
                    </button>
                </div>
            ))}
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
                                            <span className={`status-badge ${isVip ? 'vip-badge' : 'standard-badge'}`}>
                                                {isVip ? 'Membre VIP' : 'Membre Standard'}
                                            </span>
                                        </div>
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

            {/* Modals (unchanged) */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="confirmation-modal">
                        <p>Êtes-vous sûr(e) de vouloir vous déconnecter ?</p>
                        <div className="modal-actions">
                            <button onClick={confirmLogout} className="modal-btn confirm-btn">Oui, Déconnexion</button>
                            <button onClick={cancelLogout} className="modal-btn cancel-btn">Annuler</button>
                        </div>
                    </div>
                </div>
            )}

            {showVipModal && (
                <div className="modal-overlay">
                    <div className="confirmation-modal vip-modal">
                        <FaCrown size={30} color="#FFD700" style={{ marginBottom: '15px' }} />
                        <h3>Accès Limité</h3>
                        <p>L'accès <strong>Master Atelier (VIP)</strong> est réservé à nos membres premium.</p>
                        <p>Veuillez vous abonner pour débloquer le contenu exclusif !</p>
                        <div className="modal-actions">
                            <Link to="/Abonnement-VIP" onClick={() => setShowVipModal(false)} className="modal-btn confirm-btn">
                                S'abonner
                            </Link>
                            <button onClick={() => setShowVipModal(false)} className="modal-btn cancel-btn">Fermer</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}