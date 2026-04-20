import React, { useState, useEffect, useCallback } from 'react';
import { FaUser, FaLock, FaEnvelope, FaChevronRight, FaKey, FaSpinner } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link } from 'react-router-dom';
import BASE_URL from '../apiConfig';
import './auth_premium.css';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';

// ----------------------------------------------------
// دالة لجلب معلومات الجهاز والمتصفح
// ----------------------------------------------------
// ----------------------------------------------------
// Helpers for Cookies (Hidden Logic)
// ----------------------------------------------------
const setCookie = (name, value, days = 365) => {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
};

const getCookie = (name) => {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

// ----------------------------------------------------
// الدوال المساعدة (Users Management)
// *تستخدم للحفاظ على state الدخول في localStorage مؤقتًا*
// ----------------------------------------------------
const getUsers = () => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
};

const saveUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
};

// ----------------------------------------------------
// مكون AuthForm
// ----------------------------------------------------
export default function AuthForm({ type = 'login' }) {
    const isLogin = type === 'login';
    const { showAlert } = useAlert();
    const { appLanguage } = useLanguage();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [whatsApp, setWhatsApp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetch(`${BASE_URL}/api/settings/general`)
            .then(res => res.json())
            .then(data => {
                if (data && data.value && data.value.whatsapp) {
                    setWhatsApp(data.value.whatsapp);
                }
            })
            .catch(() => { });
    }, []);

    const mainTitle = isLogin ? "S'identifier à l'Atelier" : "Créer Votre Compte";
    const accentText = isLogin ? "Bienvenue de retour" : "Rejoignez l'élite";

    // ----------------------------------------------------
    // دالة لتنفيذ تسجيل الدخول النهائي (تم التعديل)
    // ----------------------------------------------------
    const performLogin = async (user) => {
        const completeRedirection = () => {
            // 1. حفظ بيانات الدخول العامة
            localStorage.setItem('login', 'true');
            localStorage.setItem('currentUserEmail', user.email || user.mail);
            localStorage.setItem('userRole', user.statut || 'client');
            // 3. Stocker le code chiffré (Fingerprint)
            if (user.fingerprint) {
                setCookie('_device_session_key', user.fingerprint);
            }

            // 4. التحقق من حالة المستخدم (statut) وإعادة التوجيه بناءً عليها
            if (user.email === 'admin@admin.com' || user.mail === 'admin@admin.com' || user.statut === 'admin') {
                localStorage.setItem('userRole', 'admin');
                localStorage.setItem('isAdmin', 'true');
                window.location.href = '/Vip-access';
            } else {
                window.location.href = '/';
            }
        };

        // IF first login, show ONLY the security alert
        if (user.firstLogin) {
            const securityLabels = {
                ar: {
                    title: "تنبيه أمني هام",
                    msg: "⚠️ لقد تم ربط حسابك بهذا المتصفح بنجاح.\n\nلا يمكن فتح هذا الحساب من متصفح آخر فيجب الحفاظ على هذا الجهاز لتسجيل الدخول بنجاح في كل مرة."
                },
                fr: {
                    title: "Alerte de Sécurité",
                    msg: "⚠️ Votre compte a été lié à ce navigateur avec succès.\n\nCe compte ne peut pas être ouvert depuis un autre navigateur. Vous devez conserver cet appareil pour vous connecter avec succès à chaque fois."
                },
                en: {
                    title: "Security Alert",
                    msg: "⚠️ Your account has been successfully linked to this browser.\n\nThis account cannot be opened from another browser. You must maintain this device to log in successfully every time."
                }
            };
            const sl = securityLabels[appLanguage] || securityLabels.fr;

            // Show as a Modal Window (type 'confirm' with hidden cancel)
            showAlert('confirm', sl.title, sl.msg, completeRedirection, null, (appLanguage === 'ar' ? 'فهمت' : 'J\'ai compris'), 'null');
        } else {
            // Regular login - directly redirect
            completeRedirection();
        }
    };

    // Google login removed based on user request.

    // ----------------------------------------------------
    // 2. منطق إرسال النموذج التقليدي (Email/Password) - المتصل بالـ DB
    // ----------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        // A. قواعد التحقق (Validation Rules)
        if (!email || !password) {
            setErrorMessage("Veuillez remplir tous les champs obligatoires.");
            setIsLoading(false);
            return;
        }

        // Login only logic below. Registration removed.

        // C. منطق تسجيل الدخول (Se connecter) - POST /api/login-traditional
        if (isLogin) {
            // 🛑 Hardcoded Admin Login (Requested Feature)
            if (email === 'admin@admin.com' && password === 'admin123') {
                const adminUser = {
                    id: 'master_admin_id',
                    nom: 'Master Admin',
                    email: 'admin@admin.com',
                    statut: 'admin',
                    image: null
                };

                const users = getUsers().filter(u => u.email !== adminUser.email);
                saveUsers([...users, adminUser]);

                performLogin(adminUser);
                return;
            }

            const loginCredentials = {
                mail: email,
                mot_de_pass: password,
                fingerprint: getCookie('_device_session_key') // 🕵️‍♂️ Envoi du code chiffré caché
            };

            try {
                const response = await fetch(`${BASE_URL}/api/login-traditional`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginCredentials),
                });

                if (response.ok) {
                    // نجاح تسجيل الدخول
                    const dbUser = await response.json();

                    const user = { email, name: dbUser.nom || 'Utilisateur', statut: dbUser.statut, ...dbUser };
                    const users = getUsers().filter(u => u.email !== user.email);
                    saveUsers([...users, user]);

                    if (dbUser.firstLogin) {
                        user.firstLogin = true;
                    }

                    performLogin(user);
                } else {
                    // فشل تسجيل الدخول
                    const errorData = await response.json().catch(() => ({}));

                    if (errorData.errorType === 'IP_LOCKED') {
                        const contactMsg = appLanguage === 'ar'
                            ? `يجب عليك تسجيل الدخول من الجهاز الذي تم استخدامه أول مرة. للدعم تواصل معنا: ${whatsApp}`
                            : `Appareil non reconnu. Veuillez utiliser votre appareil initial ou contacter l'admin : ${whatsApp}`;
                        setErrorMessage(contactMsg);
                    } else {
                        setErrorMessage(errorData.error || "E-mail ou mot de passe incorrect. Veuillez réessayer.");
                    }
                    setIsLoading(false);
                }

            } catch (error) {
                console.error("Erreur de communication avec le serveur lors de la connexion:", error);
                setErrorMessage("Échec de la communication avec le serveur.");
                setIsLoading(false);
            }
        }
    };

    // ----------------------------------------------------
    // JSX للعرض
    // ----------------------------------------------------
    return (
        <div className="auth-premium-wrapper">
            <Navbar />

            <section className="auth-section-premium">
                <div className="auth-main-container">

                    {/* Left Side: Creative Brand Experience */}
                    <div className="auth-visual-side">
                        <div className="visual-overlay"></div>
                        <div className="visual-content">
                            <div className="premium-tag">ATELIER 2C PATRON</div>
                            <h2 className="luxury-title">
                                {isLogin ? (
                                    <>L'Élégance de<br /><span className="accent-text">La Couture</span></>
                                ) : (
                                    <>Rejoignez<br /><span className="accent-text">L'Excellence</span></>
                                )}
                            </h2>
                            <p className="luxury-desc">
                                Accédez à votre espace privilégié et retrouvez tous vos ateliers et patrons exclusifs.
                            </p>

                        </div>
                    </div>

                    {/* Right Side: Organized Form */}
                    <div className="auth-form-side-premium">
                        <div className="form-inner-box">
                            <header className="form-header-premium">
                                <h1 className="glam-auth-title">{mainTitle}</h1>
                            </header>

                            {/* Error Alert */}
                            {errorMessage && (
                                <div className="auth-error-alert">
                                    <span className="error-icon">!</span> {errorMessage}
                                </div>
                            )}

                            {/* Social Auth Section */}
                            <div className="auth-social-area" style={{ display: 'none' }}></div>

                            {/* Traditional Form */}
                            <form className="glam-form-fields" onSubmit={handleSubmit}>


                                <div className="premium-input-group">
                                    <div className="input-field-wrapper">
                                        <FaEnvelope className="field-icon" />
                                        <input
                                            type="email"
                                            placeholder="Adresse E-mail"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="premium-input-group">
                                    <div className="input-field-wrapper">
                                        <FaLock className="field-icon" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Mot de passe"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="show-password-toggle">
                                    <label className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            checked={showPassword}
                                            onChange={() => setShowPassword(!showPassword)}
                                        />
                                        <span className="checkmark"></span>
                                        {appLanguage === 'ar' ? 'إظهار كلمة السر' : 'Afficher le mot de passe'}
                                    </label>
                                </div>

                                <></>

                                {/* {isLogin && (
                                    <div className="auth-footer-options">
                                        <label className="checkbox-container">
                                            <input type="checkbox" />
                                            <span className="checkmark"></span>
                                            Se souvenir de moi
                                        </label>
                                        <Link to="/forgot-password" title="Coming soon" className="forgot-link">
                                            Mot de passe oublié ?
                                        </Link>
                                    </div>
                                )} */}

                                <button type="submit" className="glam-submit-btn" disabled={!email || !password || isLoading}>
                                    {isLoading ? (
                                        <>
                                            <FaSpinner className="btn-spinner" />
                                            <span>{isLogin ? "Connexion..." : "Création..."}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{isLogin ? "Se Connecter" : "Créer mon Compte"}</span>
                                            <FaChevronRight className="arrow-icon" />
                                        </>
                                    )}
                                </button>

                                <div className="auth-switch-box">
                                    Mot de passe requis pour accéder à l'atelier.
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
}