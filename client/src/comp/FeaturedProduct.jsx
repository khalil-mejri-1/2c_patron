import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaLongArrowAltRight, FaEdit, FaSave, FaTimes, FaVideo, FaSpinner, FaCrown, FaPhoneAlt, FaUser, FaCheckCircle } from 'react-icons/fa';

import BASE_URL from '../apiConfig';

// 1. كائن الترجمات (Localization Object)
const translations = {
    'fr': {
        tag: 'COURS VEDETTE & BEST-SELLER',
        title: 'Le Cours Maître :',
        subtitle: 'Patronage de Pantalons Professionnels',
        description: 'Débloquez les techniques de la coupe parfaite des pantalons de tailleur. Ce cours intensif, étape par étape, vous garantit un ajustement impeccable et une finition digne de la Haute Couture.',
        cta: "S'inscrire Maintenant ",
        ctaLoggedIn: 'Commencer ',
        imageAlt: 'Cours de Patronage de Pantalons Professionnels',
    },
    'en': {
        tag: 'FEATURED & BEST-SELLER COURSE',
        title: 'The Master Course:',
        subtitle: 'Professional Trouser Pattern Drafting',
        description: 'Unlock the techniques for the perfect tailoring of dress pants. This intensive, step-by-step course guarantees you an impeccable fit and a finish worthy of Haute Couture.',
        cta: 'Enroll Now ',
        ctaLoggedIn: 'Start Now ',
        imageAlt: 'Professional Trouser Pattern Drafting Course',
    },
    'ar': {
        tag: 'الدورة المميزة والأكثر مبيعًا',
        title: 'الدورة الرئيسية:',
        subtitle: 'رسم نماذج السراويل الاحترافية (الباتـرون)',
        description: 'اكتشف تقنيات القص المثالي لسراويل الخياطة. هذه الدورة المكثفة، خطوة بخطوة، تضمن لك مقاسًا لا تشوبه شائبة ولمسة نهائية تليق بالخياطة الراقية (Haute Couture).',
        cta: ' سجل الآن',
        ctaLoggedIn: ' ابدأ الآن',
        imageAlt: 'دورة رسم نماذج السراويل الاحترافية',
    }
};

// 2. دالة الحصول على النص المترجم
const getLocalizedText = (key) => {
    // قراءة اللغة من localStorage، والافتراضي هو 'fr'
    const lang = localStorage.getItem('appLanguage') || 'fr';

    // إرجاع النص بلغة المستخدم، أو العودة إلى 'fr' إذا لم تتوفر الترجمة
    return (translations[lang] && translations[lang][key]) || translations['fr'][key];
};

export default function FeaturedProduct() {
    const { appLanguage, languages } = useLanguage();
    const currentLang = appLanguage;
    const isRTL = currentLang === 'ar';

    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [featuredData, setFeaturedData] = useState({
        videoUrl: "https://streamable.com/e/4k6x0z?",
        videoType: 'iframe'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        videoUrl: '',
        videoType: 'iframe'
    });
    const [isUploading, setIsUploading] = useState(false);

    // Limited Access Modal States
    const [showLimitedAccessModal, setShowLimitedAccessModal] = useState(false);
    const [vipPhone, setVipPhone] = useState('');
    const [vipFullName, setVipFullName] = useState('');
    const [isSubmittingVip, setIsSubmittingVip] = useState(false);
    const [vipRequestSuccess, setVipRequestSuccess] = useState(false);

    const navigate = useNavigate();


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
        // Check login status
        const loginStatus = localStorage.getItem('login') === 'true';
        setIsLoggedIn(loginStatus);

        // Fetch Data
        fetch(`${BASE_URL}/api/settings/featured-product`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    const merged = { ...data };
                    // Pre-initialize edit state with fallbacks
                    const initialized = { ...merged };
                    languages.forEach(lang => {
                        if (!initialized[lang.code]) {
                            initialized[lang.code] = {
                                tag: translations[lang.code]?.tag || translations.fr.tag,
                                title: translations[lang.code]?.title || translations.fr.title,
                                subtitle: translations[lang.code]?.subtitle || translations.fr.subtitle,
                                description: translations[lang.code]?.description || translations.fr.description,
                                cta: translations[lang.code]?.cta || translations.fr.cta,
                                ctaLoggedIn: translations[lang.code]?.ctaLoggedIn || translations.fr.ctaLoggedIn
                            };
                        }
                    });
                    setFeaturedData(initialized);
                    setEditData(initialized);
                }
            })
            .catch(() => { });
    }, [languages]);

    const handleSave = async () => {
        localStorage.setItem('featured_product_backup', JSON.stringify(editData));
        setFeaturedData(editData);
        setIsEditing(false);
        try {
            await fetch(`${BASE_URL}/api/settings/featured-product`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editData })
            });
        } catch (err) { }
    };

    const handleVipRequest = async (e) => {
        e.preventDefault();
        if (!vipPhone) return;
        setIsSubmittingVip(true);
        try {
            const userEmail = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail') || 'guest@2c-patron.com';
            const res = await fetch(`${BASE_URL}/api/abonnement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: vipFullName || 'Client',
                    mail: userEmail,
                    telephone: vipPhone
                })
            });
            if (res.ok) {
                setVipRequestSuccess(true);
                setTimeout(() => {
                    setShowLimitedAccessModal(false);
                    setVipRequestSuccess(false);
                    setVipFullName('');
                    setVipPhone('');
                }, 4000);
            } else {
                const data = await res.json();
                alert(data.message || 'Erreur lors de l\'envoi');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmittingVip(false);
        }
    };

    const t = (key) => {
        return (featuredData[currentLang] && featuredData[currentLang][key]) ||
            (translations[currentLang] && translations[currentLang][key]) ||
            translations['fr'][key];
    };


    return (
        <section
            className="featured-product-section"
            // تعيين اتجاه الكتابة بناءً على اللغة
            dir={isRTL ? 'rtl' : 'ltr'}
        >

            {/* 1. Bloc Visuel : فيديو المنتج المميز */}
            <div className="product-visual-block" style={{ position: 'relative' }}>
                {isAdmin && (
                    <button
                        onClick={() => {
                            const initialized = { ...featuredData };
                            languages.forEach(lang => {
                                if (!initialized[lang.code]) {
                                    initialized[lang.code] = {
                                        tag: translations[lang.code]?.tag || translations.fr.tag,
                                        title: translations[lang.code]?.title || translations.fr.title,
                                        subtitle: translations[lang.code]?.subtitle || translations.fr.subtitle,
                                        description: translations[lang.code]?.description || translations.fr.description,
                                        cta: translations[lang.code]?.cta || translations.fr.cta
                                    };
                                }
                            });
                            setEditData(initialized);
                            setIsEditing(true);
                        }}
                        className="hero-video-edit-btn"
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            zIndex: 10
                        }}
                    >
                        <FaVideo /> {currentLang === 'ar' ? 'تغيير الفيديو' : 'Changer Vidéo'}
                    </button>
                )}

                <div className="video-container-responsive">
                    {featuredData.videoType === 'local' ? (
                        <video
                            src={featuredData.videoUrl.startsWith('http') ? featuredData.videoUrl : `${BASE_URL}${featuredData.videoUrl}`}
                            controls
                            autoPlay
                            muted
                            loop
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <iframe
                            allow="fullscreen"
                            allowFullScreen
                            height="100%"
                            src={featuredData.videoUrl || "https://streamable.com/e/4k6x0z?"}
                            width="100%"
                            style={{
                                border: 'none',
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                overflow: 'hidden'
                            }}
                            title={t('imageAlt') || "Featured Product Video"}
                        />
                    )}
                </div>
            </div>

            {/* 2. Bloc de Contenu : العناوين و CTA (محدث باللغات) */}
            <div className="product-content-block">

                {isAdmin && (
                    <button
                        onClick={() => {
                            const initialized = { ...featuredData };
                            languages.forEach(lang => {
                                if (!initialized[lang.code]) {
                                    initialized[lang.code] = {
                                        tag: translations[lang.code]?.tag || translations.fr.tag,
                                        title: translations[lang.code]?.title || translations.fr.title,
                                        subtitle: translations[lang.code]?.subtitle || translations.fr.subtitle,
                                        description: translations[lang.code]?.description || translations.fr.description,
                                        cta: translations[lang.code]?.cta || translations.fr.cta
                                    };
                                }
                            });
                            setEditData(initialized);
                            setIsEditing(true);
                        }}
                        className="admin-edit-master-btn"
                        style={{
                            marginBottom: '25px',
                            width: 'fit-content'
                        }}
                    >
                        <FaEdit /> {currentLang === 'ar' ? 'تعديل السلعة المميزة' : 'Modifier Best Seller'}
                    </button>
                )}



                <h2 className="product-main-title home_titre">
                    {t('title')} <br />
                    <span className='product-subtitle'>{t('subtitle')}</span>
                </h2>

                <p className="product-description">
                    {t('description')}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={() => {
                            if (!isLoggedIn) {
                                setShowLimitedAccessModal(true);
                            } else {
                                navigate('/Vip-access');
                            }
                        }}
                        className="product-cta-button"
                        style={{ border: 'none', cursor: 'pointer' }}
                    >
                        {/* عرض نص مختلف للزر بحسب حالة تسجيل الدخول */}
                        {isLoggedIn ? (t('ctaLoggedIn') || t('cta')) : t('cta')}
                        {/* عكس اتجاه الأيقونة لـ RTL */}
                        {isRTL ? <FaLongArrowAltRight style={{ transform: 'scaleX(-1)' }} /> : <FaLongArrowAltRight />}
                    </button>
                </div>
            </div>

            {/* 🛑 Modal Accès Limité */}
            {showLimitedAccessModal && ReactDOM.createPortal(
                <div className="premium-modal-backdrop" onClick={() => !isSubmittingVip && setShowLimitedAccessModal(false)}>
                    <div className="creative-modal-content" onClick={(e) => e.stopPropagation()} style={{ overflow: 'visible' }}>
                        {/* ABSOLUTE CROWN */}
                        <div className="creative-crown-wrapper">
                            <FaCrown />
                        </div>

                        {/* Top Header Section */}
                        <div className="creative-modal-header">
                            <button
                                className="creative-close-btn"
                                onClick={() => setShowLimitedAccessModal(false)}
                            >
                                <FaTimes />
                            </button>

                            <h2 className="creative-title">
                                {currentLang === 'ar' ? 'دخول محدود' : 'Accès Limité'}
                            </h2>
                        </div>

                        {/* Body Section */}
                        <div className="creative-modal-body">
                            {!vipRequestSuccess ? (
                                <>
                                    <p className="creative-subtitle">
                                        {currentLang === 'ar'
                                            ? "دخول 'Master Atelier (VIP)' هو تجربة حصرية مخصصة لأعضائنا المميزين."
                                            : "L'accès Master Atelier (VIP) est une expérience exclusive réservée à nos membres premium."
                                        }
                                    </p>

                                    <div className="creative-benefit-pill">
                                        {currentLang === 'ar' ? '✦ اكتشف الباترونات السرية والدروس المتقدمة' : '✦ Débloquez des patrons secrets & tutoriels d\'experts'}
                                    </div>

                                    <form onSubmit={handleVipRequest} style={{ width: '100%' }}>
                                        <div className="creative-input-group">
                                            <label>{currentLang === 'ar' ? 'رقم الهاتف' : 'Numéro de Téléphone'}</label>
                                            <div className="creative-input-wrapper">
                                                <FaPhoneAlt />
                                                <input
                                                    type="tel"
                                                    placeholder="Ex: 22 222 222"
                                                    value={vipPhone}
                                                    onChange={(e) => setVipPhone(e.target.value.replace(/\D/g, ''))}
                                                    minLength={8}
                                                    required
                                                    className="creative-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="creative-input-group">
                                            <label>{currentLang === 'ar' ? 'الاسم الكامل' : 'Nom Complet'}</label>
                                            <div className="creative-input-wrapper">
                                                <FaUser />
                                                <input
                                                    type="text"
                                                    placeholder={currentLang === 'ar' ? 'اسمك الكامل' : 'Votre Nom et Prénom'}
                                                    value={vipFullName}
                                                    onChange={(e) => setVipFullName(e.target.value.replace(/[^a-zA-Z\s\u0600-\u06FF]/g, ''))}
                                                    required
                                                    className="creative-input"
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className="creative-submit-btn" disabled={isSubmittingVip}>
                                            {isSubmittingVip
                                                ? (currentLang === 'ar' ? 'جاري الإرسال...' : 'Envoi...')
                                                : (currentLang === 'ar' ? 'إرسال الطلب الآن' : 'Envoyer la demande')
                                            }
                                        </button>

                                        <button
                                            type="button"
                                            className="creative-later-btn"
                                            onClick={() => setShowLimitedAccessModal(false)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#b5bac1',
                                                marginTop: '15px',
                                                cursor: 'pointer',
                                                fontWeight: '800',
                                                fontSize: '0.85rem',
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            {currentLang === 'ar' ? 'لاحقاً' : 'Plus tard'}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div style={{ padding: '15px 0' }}>
                                    <div style={{
                                        width: '70px',
                                        height: '70px',
                                        background: '#ecfdf5',
                                        color: '#34d399',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        margin: '0 auto 20px',
                                        boxShadow: '0 15px 35px rgba(52, 211, 153, 0.15)'
                                    }}>
                                        <FaCheckCircle />
                                    </div>
                                    <h3 style={{ color: '#0f172a', fontSize: '1.6rem', marginBottom: '10px', fontWeight: '900' }}>
                                        {currentLang === 'ar' ? 'تم استلام طلبك!' : 'Demande Reçue !'}
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', maxWidth: '300px', margin: '0 auto' }}>
                                        {currentLang === 'ar'
                                            ? "تم إرسال بياناتك بنجاح. سيقوم المسؤول بالاتصال بك في أقرب وقت."
                                            : "Vos informations ont été envoyées. Un administrateur vous contactera prochainement."
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 🛑 Stylish Edit Modal */}
            {isEditing && ReactDOM.createPortal(
                <div className="premium-modal-backdrop" onClick={() => setIsEditing(false)}>
                    <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditing(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">
                            {currentLang === 'ar' ? 'تعديل المنتج المفضل' : 'Modifier le Produit Vedette'}
                        </h2>

                        <div className="premium-form-grid">
                            <div className="premium-lang-section" style={{ gridColumn: 'span 3', background: 'rgba(212, 175, 55, 0.05)', padding: '20px', borderRadius: '20px' }}>
                                <h4 className="lang-indicator" style={{ color: '#d4af37' }}>PROPRIÉTÉS VISUELLES (VIDÉO)</h4>
                                <div className="premium-form-group">
                                    <label>Type de Source</label>
                                    <select
                                        value={editData.videoType}
                                        onChange={e => setEditData({ ...editData, videoType: e.target.value })}
                                    >
                                        <option value="iframe">Lien Externe (Iframe/Streamable/YouTube)</option>
                                        <option value="local">Télécharger une vidéo (Fichier MP4/Local)</option>
                                    </select>
                                </div>

                                {editData.videoType === 'iframe' ? (
                                    <div className="premium-form-group">
                                        <label>Lien du Lecteur (URL Iframe)</label>
                                        <input
                                            type="text"
                                            placeholder="https://streamable.com/e/..."
                                            value={editData.videoUrl}
                                            onChange={e => setEditData({ ...editData, videoUrl: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <div className="premium-form-group">
                                        <label>Télécharger depuis l'ordinateur</label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;
                                                    setIsUploading(true);
                                                    const formData = new FormData();
                                                    formData.append('video', file);
                                                    try {
                                                        const res = await fetch(`${BASE_URL}/api/specialized-videos/upload`, {
                                                            method: 'POST',
                                                            body: formData
                                                        });
                                                        const data = await res.json();
                                                        if (res.ok) {
                                                            setEditData({ ...editData, videoUrl: data.filePath });
                                                        }
                                                    } catch (err) {
                                                        console.error("Upload failed", err);
                                                    } finally {
                                                        setIsUploading(false);
                                                    }
                                                }}
                                            />
                                            {isUploading && <FaSpinner className="spinner" />}
                                        </div>
                                        {editData.videoUrl && editData.videoType === 'local' && (
                                            <p style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '5px' }}>Vidéo prête: {editData.videoUrl}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {languages.filter(l => l.code === currentLang).map(lang => (
                                <div key={lang.code} className="premium-lang-section" style={{ border: 'none', background: 'none' }}>
                                    <h4 className="lang-indicator" style={{ background: '#d4af37' }}>{lang.label}</h4>

                                    <div className="premium-form-group">
                                        <label>Titre Principal</label>
                                        <input
                                            type="text"
                                            value={editData[lang.code]?.title || ''}
                                            onChange={e => setEditData({ ...editData, [lang.code]: { ...editData[lang.code], title: e.target.value } })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Sous-Titre</label>
                                        <input
                                            type="text"
                                            value={editData[lang.code]?.subtitle || ''}
                                            onChange={e => setEditData({ ...editData, [lang.code]: { ...editData[lang.code], subtitle: e.target.value } })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>{currentLang === 'ar' ? 'نص الزر (قبل تسجيل الدخول)' : 'Texte du Bouton (Non Connecté)'}</label>
                                        <input
                                            type="text"
                                            value={editData[lang.code]?.cta || ''}
                                            onChange={e => setEditData({ ...editData, [lang.code]: { ...editData[lang.code], cta: e.target.value } })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label style={{ color: '#10b981' }}>{currentLang === 'ar' ? '✓ نص الزر (بعد تسجيل الدخول)' : '✓ Texte du Bouton (Connecté)'}</label>
                                        <input
                                            type="text"
                                            value={editData[lang.code]?.ctaLoggedIn || ''}
                                            onChange={e => setEditData({ ...editData, [lang.code]: { ...editData[lang.code], ctaLoggedIn: e.target.value } })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                            style={{ borderColor: '#10b981' }}
                                        />
                                    </div>
                                    <div className="premium-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Description</label>
                                        <textarea
                                            value={editData[lang.code]?.description || ''}
                                            onChange={e => setEditData({ ...editData, [lang.code]: { ...editData[lang.code], description: e.target.value } })}
                                            rows="3"
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="premium-btn-group">
                            <button className="premium-btn-cta secondary" onClick={() => setIsEditing(false)}>
                                {currentLang === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button className="premium-btn-cta gold" onClick={handleSave}>
                                <FaSave /> {currentLang === 'ar' ? 'حفظ التعديلات' : 'Enregistrer tout'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </section>
    );
}