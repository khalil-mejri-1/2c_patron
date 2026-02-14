import React, { useState, useEffect, useCallback } from 'react';
import { FaUser, FaLock, FaEnvelope, FaChevronRight, FaKey } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link } from 'react-router-dom';
import BASE_URL from '../apiConfig';

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

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const mainTitle = isLogin ? "S'identifier à l'Atelier" : "Créer Votre Compte VIP";
    const accentText = isLogin ? "Bienvenue de retour" : "Rejoignez l'élite";


    // ----------------------------------------------------
    // دالة لتنفيذ تسجيل الدخول النهائي (تم التعديل)
    // ----------------------------------------------------
    const performLogin = (user) => {
        // 1. حفظ بيانات الدخول العامة
        localStorage.setItem('login', 'true');
        localStorage.setItem('currentUserEmail', user.email);

        // 2. التحقق من حالة المستخدم (statut) وإعادة التوجيه بناءً عليها
        if (user.statut === 'admin') {
            // إذا كان المستخدم مسؤولًا، أعد التوجيه إلى صفحة الإدارة
            window.location.href = '/admin_clients';
        } else {
            // أي حالة أخرى (مثل 'client' أو null) تعود للصفحة الرئيسية
            window.location.href = '/';
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

                    performLogin(user);
                    return;

                } else {
                    // فشل: المستخدم غير موجود في DB (401 أو 404)
                    await loginResponse.json().catch(() => ({})); // قراءة الاستجابة لتجنب تحذيرات
                    setErrorMessage("Cet email n'est pas enregistré dans la base de données. Veuillez créer un compte d'abord.");
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

            const newUser = { id: Date.now(), name: authData.nom, email: authData.mail, password: authData.mot_de_pass };
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
            console.error("Erreur de décodage JWT Google:", error);
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

                    performLogin(user);
                } else {
                    // فشل تسجيل الدخول
                    const errorData = await response.json().catch(() => ({}));
                    // هذه الرسالة تأتي من الخادم إذا لم تتطابق كلمة المرور/البريد
                    setErrorMessage(errorData.error || "E-mail ou mot de passe incorrect. Veuillez réessayer.");
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
        <>
            <Navbar />

            <section className="auth-section">

                <div className="auth-card-wrapper">

                    {/* 🎨 Brand Side (Left/Top) */}
                    <div className="auth-brand-side">
                        <div className="brand-overlay"></div>
                        <div className="brand-content">
                            <h2 className="brand-title">L'Art de la<br />Haute Couture</h2>
                            <p className="brand-text">Rejoignez notre communauté exclusive et accédez à des patrons uniques.</p>
                        </div>
                    </div>

                    {/* 📝 Form Side (Right/Bottom) */}
                    <div className="auth-form-side">
                        <div className="auth-header">
                            <h1 className="auth-main-title">{mainTitle}</h1>
                            <p className="auth-subtitle">{accentText}</p>
                        </div>

                        {/* رسالة الخطأ */}
                        {errorMessage && (
                            <div className="error-message">
                                {errorMessage}
                            </div>
                        )}

                        {/* 🚀 قسم زر Google Sign-In 🚀 */}
                        <div className="google-auth-container">
                            <div id="google-sign-in-button"></div>

                            <div className="separator">
                                <span>ou continuer avec email</span>
                            </div>
                        </div>

                        {/* نموذج المصادقة التقليدي */}
                        <form className="auth-form" onSubmit={handleSubmit}>

                            {/* حقل الاسم */}
                            {!isLogin && (
                                <div className="input-group">
                                    <FaUser className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Nom complet"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {/* حقل البريد الإلكتروني */}
                            <div className="input-group">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="Adresse e-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* حقل كلمة المرور */}
                            <div className="input-group">
                                <FaLock className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="Mot de passe"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* حقل تأكيد كلمة المرور */}
                            {!isLogin && (
                                <div className="input-group">
                                    <FaKey className="input-icon" />
                                    <input
                                        type="password"
                                        placeholder="Confirmer le mot de passe"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            )}


                            {/* خيارات إضافية */}
                            {isLogin && (
                                <div className="auth-options">
                                    <label className="remember-me">
                                        <input type="checkbox" style={{ marginRight: '5px' }} /> Se souvenir
                                    </label>
                                    <a href="/forgot-password" className="forgot-password-link">
                                        Mot de passe oublié?
                                    </a>
                                </div>
                            )}


                            {/* زر الإرسال */}
                            <button type="submit" className="submit-btn" disabled={!email || !password}>
                                {isLogin ? "Se Connecter" : "S'inscrire"} <FaChevronRight style={{ marginLeft: '10px' }} />
                            </button>

                            {/* رابط التبديل بين الصفحتين */}
                            <p className="switch-auth-link">
                                {isLogin ? (
                                    <>
                                        Vous n'avez pas de compte ? <Link to="/register">Inscrivez-vous</Link>
                                    </>
                                ) : (
                                    <>
                                        Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
                                    </>
                                )}
                            </p>
                        </form>
                    </div>

                </div>
            </section>

            <Footer />
        </>
    );
}