import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaBars, FaTimes, FaSearch, FaShoppingBag, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCrown } from 'react-icons/fa';
import logo from "../img/logo.png";
import { Link, NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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

    const dropdownRef = useRef(null);

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
            // 🔹 هنا لم نعد نقرأ VIP من localStorage
            // سيتم جلبه من قاعدة البيانات لاحقاً
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
            // غيّر هذا الرابط حسب عنوان API الخاص بك
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

    // --- useEffects ---
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

        // 🔹 عند تسجيل الدخول، نتحقق من قاعدة البيانات لمعرفة إذا كان VIP
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

    return (
        <>
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
                        <li className="mobile-auth-link vip-button">
                            <NavLink to="/Abonnement-VIP" className="nav-link-item mobile-vip-btn">
                                <FaCrown /> Accès VIP
                            </NavLink>
                        </li>
                    )}
                </ul>

                <div className="navbar-icons">
                    {/* <button className="icon-btn search-btn" aria-label="Rechercher">
                        <FaSearch />
                    </button> */}

                    {isLoggedIn ? (
                        <div className="logged-in-controls">
                            <div className="user-menu-wrapper" ref={dropdownRef}>
                                <button className="icon-btn user-profile-btn" onClick={toggleDropdown}>
                                    <FaUser />
                                </button>
                                {isDropdownOpen && (
                                    <div className="user-dropdown">
                                        <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                            <FaUser /> Mon Compte
                                        </Link>
                                        <button onClick={handleLogout} className="dropdown-item logout-item">
                                            <FaSignOutAlt /> Déconnexion
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="auth-btn login-btn">Se connecter</Link>
                            <Link to="/register" className="auth-btn register-btn">S'inscrire</Link>
                        </>
                    )}

                    <button className="menu-toggle" onClick={toggleMenu}>
                        {isOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </nav>

            {/* Modals */}
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
