import React, { useState, useEffect, useCallback } from 'react';
import { FaUser, FaLock, FaEnvelope, FaChevronRight, FaKey } from 'react-icons/fa';
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
const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let browser = "Inconnu";
    let os = "Inconnu";
    let device = "PC / Desktop";

    // Browser
    if (ua.indexOf("Firefox") > -1) browser = "Mozilla Firefox";
    else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Browser";
    else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
    else if (ua.indexOf("Trident") > -1) browser = "Internet Explorer";
    else if (ua.indexOf("Edge") > -1) browser = "Microsoft Edge";
    else if (ua.indexOf("Chrome") > -1) browser = "Google Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Apple Safari";

    // OS & Windows Version Detail
    if (ua.indexOf("Windows NT 10.0") > -1) os = "Windows 10/11";
    else if (ua.indexOf("Windows NT 6.3") > -1) os = "Windows 8.1";
    else if (ua.indexOf("Windows NT 6.2") > -1) os = "Windows 8";
    else if (ua.indexOf("Windows NT 6.1") > -1) os = "Windows 7";
    else if (ua.indexOf("Windows NT 6.0") > -1) os = "Windows Vista";
    else if (ua.indexOf("Windows NT 5.1") > -1) os = "Windows XP";
    else if (ua.indexOf("Windows") > -1) os = "Windows";
    else if (ua.indexOf("Mac") > -1) os = "MacOS";
    else if (ua.indexOf("X11") > -1) os = "Linux";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("iPhone") > -1) os = "iOS (iPhone)";

    // Device
    if (/Mobi|Android|iPhone/i.test(ua)) {
        device = "Smartphone / Mobile";
        const match = ua.match(/\(([^;]+);/);
        if (match && match[1]) {
            device = `Mobile (${match[1].trim()})`;
        }
    }

    return { browser, os, device };
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
            localStorage.setItem('currentUserEmail', user.email);

            // 2. التحقق من حالة المستخدم (statut) وإعادة التوجيه بناءً عليها
            if (user.email === 'admin@admin.com' || user.mail === 'admin@admin.com') {
                window.location.href = '/Vip-access';
            } else if (user.statut === 'admin') {
                window.location.href = '/admin_clients';
            } else {
                window.location.href = '/';
            }
        };

        // IF first login, show ONLY the security alert
        if (user.firstLogin) {
            const securityLabels = {
                ar: {
                    title: "تنبيه أمني هام",
                    msg: "⚠️ ملاحظة هامة: لقد تم ربط حسابك بهذا الجهاز بنجاح.\n\nلضمان أقصى درجات الحماية لحسابك، يجب عليك تسجيل الدخول من هذا الجهاز حصراً في المرات القادمة.\n\nفي حال مواجهة أي مشكلة في الدخول، يرجى التواصل مع الإدارة."
                },
                fr: {
                    title: "Alerte de Sécurité",
                    msg: "⚠️ Note importante : Votre compte a été lié à cet appareil avec succès.\n\nPour garantir la sécurité de votre compte, vous devrez utiliser cet appareil exclusivement pour vos prochaines connexions.\n\nEn cas de problème, veuillez contacter l'administration."
                },
                en: {
                    title: "Security Alert",
                    msg: "⚠️ Important Note: Your account has been successfully linked to this device.\n\nTo ensure your account security, you must use this specific device exclusively for all future logins.\n\nIf you encounter any issues, please contact administration."
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

    // ----------------------------------------------------
    // 1. منطق معالجة الدخول/التسجيل عبر Google (المتصل بالـ DB)
    // ----------------------------------------------------
    const handleGoogleAuth = async (userObject) => {
        setErrorMessage('');

        const authData = {
            nom: userObject.name || 'Utilisateur Google',
            mail: userObject.email,
            // نستخدم ID Google كـ mot_de_pass للتمييز في DB
            mot_de_pass: `GOOGLE_AUTH_${userObject.sub}`,
            image: userObject.picture || null,
        };

        // 🚀 A. منطق تسجيل الدخول عبر Google (التحقق من الوجود في DB) 🚀
        if (isLogin) {
            try {
                // استدعاء مسار التحقق من الدخول الخاص بـ Google في الخادم
                const loginResponse = await fetch(`${BASE_URL}/api/login-google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mail: authData.mail, mot_de_pass: authData.mot_de_pass }),
                });

                if (loginResponse.ok) {
                    // نجاح: المستخدم موجود وتم تسجيل دخوله
                    const dbUser = await loginResponse.json();

                    const user = { email: authData.mail, name: authData.nom, statut: dbUser.statut, ...dbUser };
                    const users = getUsers().filter(u => u.email !== user.email);
                    saveUsers([...users, user]);

                    if (dbUser.firstLogin) {
                        user.firstLogin = true;
                    }

                    performLogin(user);
                    return;

                } else {
                    // فشل: المستخدم غير موجود في DB (401 أو 404)
                    const errorData = await loginResponse.json().catch(() => ({}));

                    if (errorData.errorType === 'IP_LOCKED') {
                        const contactMsg = appLanguage === 'ar'
                            ? `يجب عليك تسجيل الدخول من نفس الجهاز الذي تم تسجيل الدخول به أول مرة. إذا واجهت مشكلة، تواصل مع الإدارة عبر الواتساب: ${whatsApp}`
                            : `Accès restreint : Vous devez vous connecter depuis l'appareil initial. Contactez l'admin via WhatsApp : ${whatsApp}`;
                        setErrorMessage(contactMsg);
                    } else {
                        setErrorMessage("Cet email n'est pas enregistré dans la base de données. Veuillez créer un compte d'abord.");
                    }
                    return;
                }

            } catch (error) {
                console.error("Erreur de communication avec le serveur lors de la connexion:", error);
                setErrorMessage("Échec de la communication avec le serveur.");
                return;
            }
        }

        // B. منطق التسجيل عبر Google (فقط في وضع التسجيل - Register) 
        try {
            // استدعاء مسار التسجيل العام في الخادم
            const response = await fetch(`${BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.details && data.details.includes('E11000')) {
                    setErrorMessage("Cet email est déjà enregistré. Veuillez vous connecter.");
                } else {
                    setErrorMessage(data.error || "Erreur lors de l'enregistrement via Google.");
                }
                return;
            }

            console.log('User registered successfully in DB:', data.user);

            const newUser = {
                id: data.user._id,
                name: authData.nom,
                email: authData.mail,
                statut: data.user.statut,
                firstLogin: data.firstLogin
            };
            saveUsers([...getUsers(), newUser]);

            performLogin(newUser);
        } catch (error) {
            console.error("Erreur de communication avec le serveur:", error);
            setErrorMessage("Échec de la communication avec le serveur pour l'enregistrement.");
        }
    };

    // ----------------------------------------------------
    // منطق معالجة استجابة Google (Callback)
    // ----------------------------------------------------
    const handleGoogleCredentialResponse = useCallback((response) => {
        try {
            const userObject = jwtDecode(response.credential);
            handleGoogleAuth(userObject);
        } catch (error) {
            console.error("Erreur de décودage JWT Google:", error);
            setErrorMessage("Erreur d'authentification Google. Veuillez réessayer.");
        }
    }, [isLogin]);

    // ----------------------------------------------------
    // useEffect لتهيئة زر Google
    // ----------------------------------------------------
    useEffect(() => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: "435113772089-sa576v0m6hq96rg9369icj3g66pnkh9r.apps.googleusercontent.com",
                callback: handleGoogleCredentialResponse,
                context: isLogin ? "signin" : "signup",
                ux_mode: "popup",
            });

            window.google.accounts.id.renderButton(
                document.getElementById("google-sign-in-button"),
                {
                    type: "standard",
                    size: "large",
                    text: isLogin ? "signin_with" : "signup_with",
                    width: '350',
                    locale: 'fr',
                }
            );
        }
    }, [handleGoogleCredentialResponse, isLogin]);

    // ----------------------------------------------------
    // 2. منطق إرسال النموذج التقليدي (Email/Password) - المتصل بالـ DB
    // ----------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // A. قواعد التحقق (Validation Rules)
        if (!email || !password) {
            setErrorMessage("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        if (!isLogin) {
            if (password.length < 6) {
                setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
                return;
            }
            if (password !== confirmPassword) {
                setErrorMessage("Les mots de passe ne correspondent pas !");
                return;
            }
        }

        // B. منطق التسجيل (S'inscrire) - POST /api/users
        if (!isLogin) {
            const newUserForDB = {
                nom: name,
                mail: email,
                mot_de_pass: password, // يجب أن يقوم الخادم بتشفير هذا!
                image: null,
            };

            try {
                const response = await fetch(`${BASE_URL}/api/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUserForDB),
                });

                const data = await response.json();

                if (!response.ok) {
                    if (data.details && data.details.includes('E11000')) {
                        setErrorMessage("Cette adresse e-mail est déjà utilisée.");
                    } else {
                        setErrorMessage(data.error || "Échec de la création du compte.");
                    }
                    return;
                }

                // بعد نجاح التسجيل في الخادم، نحدث الـ localStorage وننتقل لصفحة الدخول
                const newUser = { id: Date.now(), name, email, password };
                saveUsers([...getUsers(), newUser]);

                window.location.href = '/login';
                return;

            } catch (error) {
                console.error("Erreur de communication avec le serveur lors de l'inscription:", error);
                setErrorMessage("Échec de la communication avec le serveur.");
                return;
            }
        }

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
                }

            } catch (error) {
                console.error("Erreur de communication avec le serveur lors de la connexion:", error);
                setErrorMessage("Échec de la communication avec le serveur.");
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
                                {isLogin
                                    ? "Accédez à votre espace privilégié et retrouvez tous vos ateliers et patrons exclusifs."
                                    : "Devenez membre VIP et accédez aux secrets les mieux gardés du patronage professionnel."}
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
                            <div className="auth-social-area">
                                <div id="google-sign-in-button" className="google-btn-premium"></div>
                                <div className="auth-divider">
                                    <span>ou avec vos identifiants</span>
                                </div>
                            </div>

                            {/* Traditional Form */}
                            <form className="glam-form-fields" onSubmit={handleSubmit}>
                                {!isLogin && (
                                    <div className="premium-input-group">
                                        <div className="input-field-wrapper">
                                            <FaUser className="field-icon" />
                                            <input
                                                type="text"
                                                placeholder="Votre Nom Complet"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

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
                                            type="password"
                                            placeholder="Mot de passe"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {!isLogin && (
                                    <div className="premium-input-group">
                                        <div className="input-field-wrapper">
                                            <FaKey className="field-icon" />
                                            <input
                                                type="password"
                                                placeholder="Confirmer le mot de passe"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {isLogin && (
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
                                )}

                                <button type="submit" className="glam-submit-btn" disabled={!email || !password}>
                                    <span>{isLogin ? "Se Connecter" : "Créer mon Compte"}</span>
                                    <FaChevronRight className="arrow-icon" />
                                </button>

                                <div className="auth-switch-box">
                                    {isLogin ? (
                                        <>Nouveau ici ? <Link to="/register">Rejoignez-nous</Link></>
                                    ) : (
                                        <>Déjà membre ? <Link to="/login">Connectez-vous</Link></>
                                    )}
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