import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaBars, FaTimes, FaSearch, FaShoppingBag, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCrown, FaTachometerAlt, FaPlus, FaSave } from 'react-icons/fa';
import logo from "../img/logo.png";
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useLanguage } from '../context/LanguageContext';
import ar from "../img/ar.png";
import fr from "../img/fr.png";
import eg from "../img/eg.png";
import BASE_URL from '../apiConfig';

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
    const [isAdmin, setIsAdmin] = useState(false);
    const [showVipModal, setShowVipModal] = useState(false);

    const { appLanguage, changeLanguage, languages, addLanguage } = useLanguage();
    const [isAddLanguageModalOpen, setIsAddLanguageModalOpen] = useState(false);
    const [newLangData, setNewLangData] = useState({ label: '', code: '', emoji: '', icon: '' });

    const dropdownRef = useRef(null);
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
                            {languages.map(({ code, emoji, label }) => (
                                <button
                                    key={code}
                                    className={`flag-btn ${appLanguage === code ? 'active-flag' : ''}`}
                                    onClick={() => handleLanguageChange(code)}
                                    aria-label={`Changer la langue en ${label}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                            {(isAdmin || userEmail?.includes('admin') || userEmail === '2cparton0011@gmail.com') && (
                                <button
                                    className="flag-btn add-language-btn-mobile"
                                    onClick={() => setIsAddLanguageModalOpen(true)}
                                    style={{ background: 'none', border: '1px solid #D4AF37', borderRadius: '50%', padding: '5px', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <FaPlus size={16} />
                                </button>
                            )}
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
            {/* 🛑 Modal Ajouter une Langue */}
            {isAddLanguageModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 3000 }}>
                    <div className="modal-content" style={{
                        background: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '400px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#333' }}>Nouvelle Langue</h3>
                            <button onClick={() => setIsAddLanguageModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><FaTimes size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Nom (ex: Italiano)</label>
                                <input
                                    type="text"
                                    value={newLangData.label}
                                    onChange={e => setNewLangData({ ...newLangData, label: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    placeholder="Nom de la langue..."
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Code (ex: it)</label>
                                <input
                                    type="text"
                                    value={newLangData.code}
                                    onChange={e => setNewLangData({ ...newLangData, code: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    placeholder="it, es, de..."
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Emoji (ex: 🇮🇹)</label>
                                <input
                                    type="text"
                                    value={newLangData.emoji}
                                    onChange={e => setNewLangData({ ...newLangData, emoji: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    placeholder="🇮🇹"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>URL de l'icône (Image)</label>
                                <input
                                    type="text"
                                    value={newLangData.icon}
                                    onChange={e => setNewLangData({ ...newLangData, icon: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    placeholder="https://.../flag.png"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsAddLanguageModalOpen(false)} style={{
                                padding: '10px 20px', background: '#f8f9fa', color: '#333',
                                border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer'
                            }}>
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
                                style={{
                                    padding: '10px 20px', background: '#D4AF37', color: '#fff',
                                    border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                                }}
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