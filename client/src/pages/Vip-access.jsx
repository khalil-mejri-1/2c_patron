import React, { useState, useEffect } from 'react';
import { FaPlayCircle, FaCheckCircle, FaSpinner, FaCertificate, FaTimes } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../apiConfig';

// Clé de localStorage pour mémoriser l'état
const CERTIF_MODAL_KEY = 'hasSeenVipCertifModal';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        title: "الوصول لـ",
        accent: "الورشة الماستر VIP",
        subtitle: "افتح دورات حصرية وحوّل شغفك إلى خبرة.",
        loading: "جاري تحميل الفئات...",
        error: "فشل في تحميل البيانات. الرجاء المحاولة لاحقًا.",
        button: "بدء الدرس",
        modalTitle: "تهانينا!",
        modalText: (certif) => `بعد الانتهاء من هذا التدريب، ستحصل على **شهادة معتمدة**${certif ? ' VIP' : ''}.`,
        modalSmallText: "لمزيد من التفاصيل، يرجى الاتصال بالمسؤول على رقم الواتساب:",
        modalBtn: "لقد فهمت",
        whatsappNum: "26 123 456"
    },
    fr: {
        title: "ACCÈS",
        accent: "MASTER ATELIER",
        subtitle: "Débloquez des cours exclusifs et transformez votre passion en expertise.",
        loading: "Chargement des Catégories...",
        error: "Échec du chargement des données. Veuillez réessayer plus tard.",
        button: "Commencer la Leçon",
        modalTitle: "Félicitations !",
        modalText: (certif) => `Après avoir terminé cette formation, vous obtiendrez un **Certificat Agréé**${certif ? ' VIP' : ''}.`,
        modalSmallText: "Pour plus de détails, veuillez contacter l’administrateur au numéro WhatsApp :",
        modalBtn: "J'ai Compris",
        whatsappNum: "26 123 456"
    },
    en: {
        title: "MASTER ATELIER",
        accent: "VIP ACCESS",
        subtitle: "Unlock exclusive courses and transform your passion into expertise.",
        loading: "Loading Categories...",
        error: "Failed to load data. Please try again later.",
        button: "Start Lesson",
        modalTitle: "Congratulations!",
        modalText: (certif) => `After completing this training, you will receive an **Accredited Certificate**${certif ? ' VIP' : ''}.`,
        modalSmallText: "For more details, please contact the administrator via WhatsApp at:",
        modalBtn: "I Understood",
        whatsappNum: "26 123 456"
    }
};

export default function Vipaccess() {
    const [appLanguage, setAppLanguage] = useState('fr');
    const [vipCategories, setVipCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. ⚙️ جلب اللغة من LocalStorage
    useEffect(() => {
        const lang = localStorage.getItem('appLanguage') || 'fr';
        setAppLanguage(lang);
    }, []);

    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    // 🌟 Initialiser l'état basé sur localStorage
    const [showCertifModal, setShowCertifModal] = useState(() => {
        return !localStorage.getItem(CERTIF_MODAL_KEY);
    });

    // --- Fonction pour fermer le modal et enregistrer l'état ---
    const handleCloseCertifModal = () => {
        setShowCertifModal(false);
        localStorage.setItem(CERTIF_MODAL_KEY, 'true');
    };

    // 2. useEffect pour gérer l'interdiction de défilement (scroll) (Inchanggée)
    useEffect(() => {
        if (showCertifModal) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [showCertifModal]);

    // 3. useEffect pour l'appel API (Inchanggée)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Note: using hardcoded port 3000, ensure it's correct for your dev environment
                const response = await axios.get(`${BASE_URL}/api/vip-categories`);
                setVipCategories(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Erreur de récupération des catégories VIP:", err);
                setError(t.error); // تحديث رسالة الخطأ
                setLoading(false);
            }
        };

        fetchCategories();
    }, [t.error]); // إضافة ت.كمعتماد

    // 4. Affichage de l'état de chargement ou d'erreur (محدث باللغات)
    if (loading) return (
        <>
            <Navbar />
            <br /><br /><br />
            <div className="vip-header" dir={direction}>
                <h1 className="vip-main-title">
                    {appLanguage === 'en' ? t.accent : t.title}
                    <span className="vip-accent-text">{appLanguage === 'en' ? t.title : t.accent}</span>
                </h1>
            </div>
            <div className="loading-state" style={{ textAlign: 'center', marginTop: '50px' }}>
                <FaSpinner className="spinner" size={40} color="#D4AF37" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '10px', color: '#333' }}>{t.loading}</p>
            </div>
        </>
    );

    if (error) {
        return (
            <>
                <Navbar />

                <div className="vip-header" dir={direction}>
                    <h1 className="vip-main-title">
                        {appLanguage === 'en' ? t.accent : t.title}
                        <span className="vip-accent-text">{appLanguage === 'en' ? t.title : t.accent}</span>
                    </h1>
                </div>
                <p className="error-text" style={{ textAlign: 'center', color: 'red', marginTop: '50px' }}>
                    {error}
                </p>
                <Footer />
            </>
        );
    }

    // 5. Rendu principal avec le modal (محدث باللغات)
    return (
        <>
            <Navbar />
            <br /><br /><br />
            <section className="vip-section" dir={direction}>

                {/* 1. Header (محدث باللغات) */}
                <div className="vip-header">
                    <h1 className="vip-main-title">
                        {appLanguage === 'en' ? t.accent : t.title}
                        <span className="vip-accent-text">{appLanguage === 'en' ? t.title : t.accent}</span>
                    </h1>
                    <p className="vip-sub-text">
                        {t.subtitle}
                    </p>
                </div>

                {/* 2. Grille de Cours (محدث باللغات) */}
                <div className="courses-grid-container">
                    {vipCategories.map(course => (
                        <div key={course.id || course._id} className="course-card">
                            <div className="course-image-wrapper">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="course-image"
                                />
                            </div>

                            <div className="course-content">
                                <h3 className="course-title">{course.title}</h3>
                                <p className="course-description">{course.description}</p>

                                <div className="course-meta">
                                    {course.duration && (
                                        <div className="duration">
                                            <FaPlayCircle /> {course.duration}
                                        </div>
                                    )}
                                </div>

                                <NavLink to={`/cours_Manches/${encodeURIComponent(course.title)}`}>
                                    <button className="access-button">
                                        {t.button}
                                    </button>
                                </NavLink>

                            </div>
                        </div>
                    ))}
                </div>

            </section>

            <Footer />

            {/* 🌟 MODAL DE CERTIFICATION 🌟 (محدث باللغات) */}
            {showCertifModal && (
                <div className="modal-overlay">
                    <div className="certification-modal" dir={direction}>
                        <FaCertificate size={45} color="#D4AF37" style={{ marginBottom: '15px' }} />
                        <h3 className="modal-title">{t.modalTitle}</h3>

                        <p className="modal-text">
                            {t.modalText(true)}
                        </p>
                        <p className="modal-text small-text">
                            {t.modalSmallText} <span dir="ltr">**{t.whatsappNum}**</span>
                        </p>

                        <div className="modal-actions">
                            <button onClick={handleCloseCertifModal} className="modal-btn confirm-btn">
                                {t.modalBtn}
                            </button>
                        </div>
                        <button onClick={handleCloseCertifModal} className="modal-close-btn"><FaTimes /></button>
                    </div>
                </div>
            )}
        </>
    );
}