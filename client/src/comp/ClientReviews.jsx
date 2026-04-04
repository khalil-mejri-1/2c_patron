import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAlert } from '../context/AlertContext';
import { FaQuoteRight, FaChevronLeft, FaChevronRight, FaStar, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import BASE_URL from '../apiConfig';

// ⚠️ URL de l'API des commentaires
const API_COMMENTAIRES_URL = `${BASE_URL}/api/commentaires/filtre`;

// 🌐 كائن الترجمة
const translations = {
    ar: {
        loading: "جاري تحميل المراجعات...",
        loadingIcon: "نجم",
        errorTitle: "⚠️ خطأ في تحميل المراجعات.",
        errorMsg: "تعذر تحميل الآراء. تحقق من واجهة API وحالة الموافقة.",
        noReviewsTitle: "لا توجد آراء عملاء متوفرة.",
        noReviewsMsg: "كن أول من يترك تعليقًا بعد الشراء!",
        mainTitle: "ماذا يقول عملاؤنا؟",
        subtitle: "آراء موثوقة من المجتمع",
        prev: "عرض المراجعة السابقة",
        next: "عرض المراجعة التالية",
        reviewerTitle: "عميل موثوق (تعليق)",
        anonymous: "مجهول",
        noComment: "لا يوجد تعليق.",
        goToReview: "الانتقال إلى المراجعة رقم"
    },
    fr: {
        loading: "Chargement des avis...",
        loadingIcon: "étoile",
        errorTitle: "⚠️ Erreur de chargement des avis.",
        errorMsg: "Impossible de charger les avis. Vérifiez l'API et le statut Approuvé.",
        noReviewsTitle: "Aucun Avis Client Disponible.",
        noReviewsMsg: "Soyez le premier à laisser un commentaire après votre achat !",
        mainTitle: "Que disent nos clients ?",
        subtitle: "Avis fiables de la communauté",
        prev: "Afficher la revue précédente",
        next: "Afficher la revue suivante",
        reviewerTitle: "Client Vérifié (Commentaire)",
        anonymous: "Anonyme",
        noComment: "Pas de commentaire.",
        goToReview: "Aller à la revue numéro"
    },
    en: {
        loading: "Loading reviews...",
        loadingIcon: "star",
        errorTitle: "⚠️ Error loading reviews.",
        errorMsg: "Unable to load reviews. Check the API and Approved status.",
        noReviewsTitle: "No Customer Reviews Available.",
        noReviewsMsg: "Be the first to leave a comment after your purchase!",
        mainTitle: "What Our Clients Say?",
        subtitle: "Trusted reviews from the community",
        prev: "Show previous review",
        next: "Show next review",
        reviewerTitle: "Verified Client (Comment)",
        anonymous: "Anonymous",
        noComment: "No comment.",
        goToReview: "Go to review number"
    }
};

// 🌟 Composant Étoiles de Notation 🌟 (تم تحسينه للتعامل مع النجوم القادمة من API)
const RatingStars = ({ rating }) => {
    const stars = [];
    // التأكد من أن التقييم صالح وبين 1 و 5 (إذا لم يكن هناك تقييم، استخدم 5 كافتراضي)
    const validRating = Math.max(0, Math.min(5, Math.round(rating || 5)));

    for (let i = 0; i < 5; i++) {
        stars.push(
            <FaStar
                key={i}
                // ✅ يتم تحديد فئة 'active' بناءً على مقارنة مؤشر النجمة مع قيمة التقييم
                className={i < validRating ? 'star active' : 'star'}
                style={{ color: i < validRating ? '#ffc107' : '#e4e5e9' }} // إضافة لون مباشر لتحسين الوضوح
            />
        );
    }
    return <div className="rating-stars">{stars}</div>;
};

// 🎨 Composant pour l'Avatar basé sur le nom (Inchanggé)
const NameAvatar = ({ name }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const stringToHslColor = (str, s, l) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = hash % 360;
        return `hsl(${h}, ${s}%, ${l}%)`;
    };

    const color = stringToHslColor(name, 70, 60);

    return (
        <div
            className="reviewer-avatar-initial"
            style={{ backgroundColor: color }}
        >
            {initial}
        </div>
    );
};

export default function ClientReviews() {
    const { appLanguage, languages } = useLanguage();
    const [commentaires, setCommentaires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const reviewDuration = 5000;

    // 🛑 Admin & Settings State
    const [isAdmin, setIsAdmin] = useState(false);
    const [revTitles, setRevTitles] = useState({});
    const [revSubtitles, setRevSubtitles] = useState({});
    const [isEditingSection, setIsEditingSection] = useState(false);
    const [editRevData, setEditRevData] = useState({ titles: {}, subtitles: {} });
    const { showAlert } = useAlert();



    const t = translations[appLanguage] || translations.fr; // استخدام الترجمة بناءً على اللغة
    const totalReviews = commentaires.length;

    // 2. ⚙️ Logique de récupération des données de l'API 
    useEffect(() => {
        // Check Admin
        const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
        if (email) {
            fetch(`${BASE_URL}/api/users/${email}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data && data.statut === 'admin') setIsAdmin(true);
                })
                .catch(() => { });
        }

        const fetchRevSettings = async () => {
            try {
                const [titles, subtitles] = await Promise.all([
                    fetch(`${BASE_URL}/api/settings/rev-titles`).then(res => res.ok ? res.json() : {}),
                    fetch(`${BASE_URL}/api/settings/rev-subtitles`).then(res => res.ok ? res.json() : {})
                ]);
                setRevTitles(titles || {});
                setRevSubtitles(subtitles || {});

                // Initialize edit data
                const initData = { titles: {}, subtitles: {} };
                languages.forEach(lang => {
                    const fallback = translations[lang.code] || translations.fr;
                    initData.titles[lang.code] = titles[lang.code] || fallback.mainTitle;
                    initData.subtitles[lang.code] = subtitles[lang.code] || fallback.subtitle;
                });
                setEditRevData(initData);
            } catch (err) { }
        };

        const fetchCommentaires = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(API_COMMENTAIRES_URL);
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                const data = await response.json();

                const mappedReviews = data.map((c, index) => ({
                    id: c._id || index,
                    name: c.nom || t.anonymous,
                    title: t.reviewerTitle,
                    // ✅ التعديل هنا: استخدام قيمة النجوم القادمة من الـ API
                    rating: c.rating || 5, // استخدام rating من API أو 5 كقيمة افتراضية
                    text: c.commentaire || t.noComment,
                }));

                setCommentaires(mappedReviews);
            } catch (err) {
                console.error("Échec de la récupération des commentaires :", err);
                setError(t.errorMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchRevSettings();
        fetchCommentaires();
    }, [appLanguage, t.anonymous, t.reviewerTitle, t.noComment, t.errorMsg, languages]);

    // 3. 🔄 Défilement automatique (Inchanggée)
    useEffect(() => {
        if (commentaires.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % commentaires.length);
        }, reviewDuration);

        return () => clearInterval(interval);
    }, [commentaires.length]);

    // 4. ⬅️ Déplacement manuel vers l'arrière (Inchanggée)
    const prevReview = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + totalReviews) % totalReviews);
    };

    // 5. ➡️ Déplacement manuel vers l' avant (Inchanggée)
    const nextReview = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalReviews);
    };

    const handleSaveRevSettings = async () => {
        setRevTitles(editRevData.titles);
        setRevSubtitles(editRevData.subtitles);
        setIsEditingSection(false);
        try {
            await Promise.all([
                fetch(`${BASE_URL}/api/settings/rev-titles`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: editRevData.titles })
                }),
                fetch(`${BASE_URL}/api/settings/rev-subtitles`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: editRevData.subtitles })
                })
            ]);
            showAlert('success', appLanguage === 'ar' ? 'تم الحفظ' : 'Enregistré', appLanguage === 'ar' ? 'تم تحديث القسم بنجاح' : 'Section mise à jour');
        } catch (err) {
            showAlert('error', 'Error', 'Failed to save');
        }
    };

    const transformValue = `translateX(-${currentIndex * 100}%)`;

    // 6. Affichage du statut de chargement/erreur (محدث باللغات)
    if (loading) {
        return (
            <section className="reviews-section-white" style={{ textAlign: 'center', padding: '100px 0' }}>
                <h2 className="reviews-title">{t.loading}</h2>
                <FaStar className="star active spinner" style={{ animation: 'spin 2s linear infinite' }} />
            </section>
        );
    }

    if (error) {
        return (
            <section className="reviews-section-white" style={{ textAlign: 'center', padding: '50px 0', color: 'red' }}>
                <h2 className="reviews-title">{t.errorTitle}</h2>
                <p>{error}</p>
            </section>
        );
    }

    if (commentaires.length === 0) {
        return (
            <section className="reviews-section-white" style={{ textAlign: 'center', padding: '50px 0' }}>
                <h2 className="reviews-title">{t.noReviewsTitle}</h2>
                <p>{t.noReviewsMsg}</p>
            </section>
        );
    }

    // 7. Rendu du Carrousel avec les données réelles (محدث باللغات)
    return (
        <section className="reviews-section-white" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
            {isAdmin && (
                <button
                    onClick={() => setIsEditingSection(true)}
                    className="admin-edit-master-btn"
                    style={{
                        position: 'absolute',
                        top: '25px',
                        right: '35px',
                        zIndex: 100
                    }}
                >
                    <FaEdit /> {appLanguage === 'ar' ? 'تعديل القسم' : 'Modifier Section'}
                </button>
            )}
            <h2 className="reviews-title">{revTitles[appLanguage] || t.mainTitle}</h2>
            <p className="reviews-subtitle">{revSubtitles[appLanguage] || t.subtitle}</p>

            <div className="carousel-container-wrapper">

                {/* ⬅️ Bouton de contrôle Précédent */}
                <button
                    className={`carousel-control prev ${appLanguage === 'ar' ? 'ar-prev' : ''}`}
                    onClick={prevReview}
                    aria-label={t.prev}
                >
                    <FaChevronLeft />
                </button>

                {/* ➡️ Bouton de contrôle Suivant */}
                <button
                    className={`carousel-control next ${appLanguage === 'ar' ? 'ar-next' : ''}`}
                    onClick={nextReview}
                    aria-label={t.next}
                >
                    <FaChevronRight />
                </button>

                {/* Conteneur du carrousel qui se déplace */}
                <div className="reviews-carousel-track" style={{ transform: transformValue }}>
                    {commentaires.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <NameAvatar name={review.name} />
                                <div className="reviewer-info">
                                    <h3 className="reviewer-name">{review.name}</h3>
                                    {/* ✅ التعديل هنا: تمرير التقييم الفعلي من الـ API */}
                                    <RatingStars rating={review.rating} />
                                </div>
                            </div>

                            <p className="review-text">
                                <FaQuoteRight className="quote-icon" />
                                {review.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🔘 Indicateurs de diapositives (points de contrôle) */}
            <div className="carousel-indicators">
                {commentaires.map((_, index) => (
                    <button
                        key={index}
                        className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`${t.goToReview} ${index + 1}`}
                    />
                ))}
            </div>

            {/* 🛑 Admin Edit Modal */}
            {isEditingSection && ReactDOM.createPortal(
                <div className="premium-modal-backdrop" onClick={() => setIsEditingSection(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingSection(false)}>
                            <FaTimes />
                        </button>
                        <h2 className="premium-modal-title">
                            {appLanguage === 'ar' ? 'تعديل قسم الآراء' : 'Modifier Section Avis'}
                        </h2>

                        <div className="premium-lang-tabs" style={{ marginBottom: '20px' }}>
                            {languages.filter(l => l.code === appLanguage).map(lang => (
                                <div key={lang.code} className="premium-lang-section" style={{ border: 'none', background: 'none' }}>
                                    <h4 className="lang-indicator" style={{ background: '#d4af37' }}>{lang.label}</h4>
                                    <div className="premium-form-group">
                                        <label>Titre Principal</label>
                                        <input
                                            type="text"
                                            value={editRevData.titles[lang.code] || ''}
                                            onChange={e => setEditRevData({ ...editRevData, titles: { ...editRevData.titles, [lang.code]: e.target.value } })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Sous-Titre</label>
                                        <input
                                            type="text"
                                            value={editRevData.subtitles[lang.code] || ''}
                                            onChange={e => setEditRevData({ ...editRevData, subtitles: { ...editRevData.subtitles, [lang.code]: e.target.value } })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="premium-btn-group">
                            <button className="premium-btn-cta secondary" onClick={() => setIsEditingSection(false)}>
                                {appLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button className="premium-btn-cta gold" onClick={handleSaveRevSettings}>
                                <FaSave /> {appLanguage === 'ar' ? 'حفظ التغييرات' : 'Enregistrer tout'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
}