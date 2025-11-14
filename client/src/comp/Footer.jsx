import React, { useState, useEffect } from 'react';
import { FaInstagram, FaPinterestP, FaEnvelope, FaLongArrowAltRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        tagline: "التميز في فن الخياطة الرفيعة.",
        navTitle: "الملاحة السريعة",
        navPatterns: "باترونات",
        navCourses: "دورات متخصصة",
        navVip: "ورشة عمل ماستر VIP",
        navAbout: "حولنا",
        helpTitle: "مساعدة ومعلومات",
        helpFaq: "الأسئلة الشائعة",
        helpShipping: "الشحن والإرجاع",
        helpTerms: "الشروط العامة",
        helpPrivacy: "سياسة الخصوصية",
        newsTitle: "ابق على اطلاع بأحدث الموضات",
        newsSubtitle: "احصل على نصائحنا الحصرية وآخر المستجدات.",
        newsPlaceholder: "بريدك الإلكتروني الأنيق",
        newsBtn: "اشتراك",
        copy: (year) => `© ${   year} . جميع الحقوق محفوظة 2C Patron.`,
    },
    fr: {
        tagline: "L'excellence dans l'art du vêtement.",
        navTitle: "Navigation Rapide",
        navPatterns: "Patrons",
        navCourses: "Cours Spécialisés",
        navVip: "Master Atelier VIP",
        navAbout: "À Propos",
        helpTitle: "Aide & Infos",
        helpFaq: "FAQ",
        helpShipping: "Livraison & Retours",
        helpTerms: "Conditions Générales",
        helpPrivacy: "Politique de Confidentialité",
        newsTitle: "Restez à la Pointe de la Mode",
        newsSubtitle: "Recevez nos astuces couture exclusives et les dernières nouveautés.",
        newsPlaceholder: "Votre email élégant",
        newsBtn: "S'inscrire",
        copy: (year) => `© ${year}  . Tous droits réservés 2C Patron.`,
    },
    en: {
        tagline: "Excellence in the art of clothing.",
        navTitle: "Quick Navigation",
        navPatterns: "Patterns",
        navCourses: "Specialized Courses",
        navVip: "Master Atelier VIP",
        navAbout: "About Us",
        helpTitle: "Help & Info",
        helpFaq: "FAQ",
        helpShipping: "Shipping & Returns",
        helpTerms: "General Terms",
        helpPrivacy: "Privacy Policy",
        newsTitle: "Stay Ahead in Fashion",
        newsSubtitle: "Receive our exclusive sewing tips and latest news.",
        newsPlaceholder: "Your elegant email",
        newsBtn: "Subscribe",
        copy: (year) => `© ${year}  All rights reserved 2C Patron.`,
    }
};



  const FeedbackModal = () => {
        const [reviewText, setReviewText] = useState('');
        const [isSubmitted, setIsSubmitted] = useState(false);
        const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, success: false });
        const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

        const handleReviewSubmit = async (e) => {
            e.preventDefault();
            
            // 🚨 1. تعيين حالة التحميل
            setSubmitStatus({ loading: true, error: null, success: false });
            
            const clientName = finalCustomerData.firstName; 
            const commentContent = reviewText.trim();
            
            if (!clientName || clientName.trim() === '') {
                setSubmitStatus({ loading: false, error: t.feedbackErrorName, success: false });
                return;
            }
            if (commentContent.length < 5) {
                setSubmitStatus({ loading: false, error: t.feedbackErrorLength, success: false });
                return;
            }

            // 🚨 2. كائن البيانات المرسل
            const commentData = {
                nom: clientName, 
                commentaire: commentContent,
            };

            try {
                const response = await fetch(API_COMMENTAIRE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(commentData),
                });
                
                // 🚨 محاولة قراءة النتيجة كـ JSON حتى لو كان هناك خطأ
                let result;
                try {
                    result = await response.json();
                } catch (jsonError) {
                    if (!response.ok) {
                        throw new Error(`Server responded with status ${response.status} but no valid JSON body.`);
                    }
                    result = {}; // استجابة فارغة لكن ناجحة
                }

                if (response.ok) {
                    setSubmitStatus({ loading: false, error: null, success: true });
                    setIsSubmitted(true);
                    setReviewText('');

                    setTimeout(() => {
                        closeFeedbackModal();
                    }, 3000);
                } else {
                    // 🚨 تحسين معالجة أخطاء الاستجابة غير الناجحة (4xx, 5xx)
                    const errorMessage = Array.isArray(result.error) 
                        ? result.error.join(', ') 
                        : result.message || result.error || t.networkError;
                    
                    setSubmitStatus({ loading: false, error: t.feedbackErrorSubmit(errorMessage), success: false });
                }
            } catch (error) {
                console.error("Erreur de réseau ou du serveur lors de la soumission du commentaire:", error);
                setSubmitStatus({ loading: false, error: t.networkError, success: false });
            }
        };

        return (
            <div className="custom-modal-backdrop-success">
                <div className="modern-modal-content-success" dir={direction}>
                    {/* 🚨 تعطيل زر الإغلاق أثناء الإرسال */}
                    <button className="close-btn-success" onClick={closeFeedbackModal} disabled={submitStatus.loading}><FaTimes /></button>

                    {isSubmitted ? (
                        <>
                            <div className="success-icon-section">
                                <FaCheckCircle className="check-icon-large" style={{ color: '#ffc107' }} />
                            </div>
                            <h2 className="success-modal-title" style={{ color: '#007bff' }}>
                                {t.feedbackSuccessTitle}
                            </h2>
                            <p className="success-message-text" dangerouslySetInnerHTML={{ __html: t.feedbackSuccessMsg.replace('هي', 'is').replace('satisfaction', `**${t.backToShop.includes('satisfaction') ? 'satisfaction' : 'satisfaction'}**`) }}></p>
                            <button type="button" onClick={closeFeedbackModal} className="return-button-success" disabled={submitStatus.loading}>
                                {t.backToShop}
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleReviewSubmit}>
                            <div className="success-icon-section">
                                <FaCommentAlt className="check-icon-large" style={{ color: '#d7b33f' }} />
                            </div>
                            <h2 className="success-modal-title">
                                {t.feedbackModalTitle}
                            </h2>
                            <p className="success-message-text">
                                {t.feedbackModalSubtitle}
                                <br/>
                                <small dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>{t.feedbackModalSmallText(finalCustomerData.firstName)}</small>
                            </p>
                            
                            <textarea
                                className="feedback-textarea"
                                placeholder={t.feedbackPlaceholder}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows="5"
                                required
                                disabled={submitStatus.loading}
                                dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                            />
                            
                            {/* Affichage des messages d'état/erreur */}
                            {submitStatus.error && (
                                <p className="status-message" style={{ color: 'red' }}>
                                    ❌ {submitStatus.error}
                                </p>
                            )}

                            <div className="modal-action-buttons-success">
                                <button 
                                    type="submit" 
                                    className="feedback-button-success" 
                                    disabled={reviewText.trim().length < 5 || submitStatus.loading}
                                >
                                    {submitStatus.loading ? (
                                        <> <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> {t.submitting}</>
                                    ) : (
                                        t.feedbackSubmit
                                    )}
                                </button>
                                
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    };
export default function Footer() {
    const [appLanguage, setAppLanguage] = useState('fr'); // حالة اللغة الافتراضية

    // 1. ⚙️ جلب اللغة من LocalStorage
    useEffect(() => {
        const lang = localStorage.getItem('appLanguage') || 'fr';
        setAppLanguage(lang);
    }, []);

    const t = translations[appLanguage] || translations.fr;
    const currentYear = new Date().getFullYear();

    return (
        <footer className="couture-footer" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
            <div className="footer-content">

                {/* 1. Bloc du Logo et Média Sociaux */}
                <div className="footer-section footer-brand">
                    <h3 className="footer-logo">2C Patron</h3>
                    <p className="footer-tagline">
                        {t.tagline}
                    </p>
                    <div className="social-links">
                        <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
                        <a href="mailto:contact@atelier.com" aria-label="Email"><FaEnvelope /></a>
                    </div>
                </div>

                {/* 2. Bloc de Navigation */}
                <div className="footer-section footer-links">
                    <h4>{t.navTitle}</h4>
                    <ul>
                        <li><Link to="/magasin">{t.navPatterns}</Link></li>
                        <li><Link to="/Vip-access">{t.navCourses}</Link></li>
                        <li><Link to="/about">{t.navAbout}</Link></li>

                    </ul>
                </div>

                {/* 3. Bloc Aide & Support */}
                <div className="footer-section footer-links">
                    <h4>{t.helpTitle}</h4>
                    <ul>
                        <li><a >{t.helpFaq}</a></li>
                        <li><a >{t.helpShipping}</a></li>
                        <li><a >{t.helpTerms}</a></li>
                        <li><a >{t.helpPrivacy}</a></li>
                    </ul>
                </div>

                {/* 4. Bloc Newsletter (Unique et Stylisé) */}
                <div className="footer-section footer-newsletter">
                    <h4>{t.newsTitle}</h4>
                    <p>{t.newsSubtitle}</p>
                    <form className={`newsletter-form ${appLanguage === 'ar' ? 'rtl-form' : ''}`}>
                        <input type="email" placeholder={t.newsPlaceholder} required dir="ltr" />
                        <button type="submit" aria-label={t.newsBtn}>
                            <FaLongArrowAltRight />
                        </button>
                    </form>
                </div>

            </div>

            <div className="footer-bottom">
                <p>{t.copy(currentYear)}</p>
            </div>
        </footer>
    );
}