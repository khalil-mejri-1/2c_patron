import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaLongArrowAltRight, FaEdit, FaSave, FaTimes, FaVideo, FaSpinner, FaCrown, FaPhoneAlt, FaUser, FaCheckCircle } from 'react-icons/fa';

import BASE_URL from '../apiConfig';
import UniversalVideoPlayer from './UniversalVideoPlayer';
import { syncAuthSession } from '../utils/authSession';

// 1. كائن الترجمات (Localization Object)
const translations = {
    'fr': {
        tag: 'COURS VEDETTE & BEST-SELLER',
        title: 'Le Cours Maître :',
        subtitle: 'Patronage de Pantalons Professionnels',
        description: 'Débloquez les techniques de la coupe parfaite des pantalons de tailleur. Ce cours intensif, étape par étape, vous garantit un ajustement impeccable et une finition digne de la Haute Couture.',
        cta: "S'inscrire Maintenant ",
        ctaLoggedIn: 'Commencer ',
        ctaGratuits: 'Cours Gratuits',
        imageAlt: 'Cours de Patronage de Pantalons Professionnels',
        videoUrl: "https://iframe.mediadelivery.net/embed/722726/504d21cf-5b01-4eb7-aaa7-d3530ab47b5e",
        videoType: 'iframe'
    },
    'en': {
        tag: 'FEATURED & BEST-SELLER COURSE',
        title: 'The Master Course:',
        subtitle: 'Professional Trouser Pattern Drafting',
        description: 'Unlock the techniques for the perfect tailoring of dress pants. This intensive, step-by-step course guarantees you an impeccable fit and a finish worthy of Haute Couture.',
        cta: 'Enroll Now ',
        ctaLoggedIn: 'Start Now ',
        ctaGratuits: 'Free Courses',
        imageAlt: 'Professional Trouser Pattern Drafting Course',
        videoUrl: "https://iframe.mediadelivery.net/embed/722726/504d21cf-5b01-4eb7-aaa7-d3530ab47b5e",
        videoType: 'iframe'
    },
    'ar': {
        tag: 'الدورة المميزة والأكثر مبيعًا',
        title: 'الدورة الرئيسية:',
        subtitle: 'رسم نماذج السراويل الاحترافية (الباتـرون)',
        description: 'اكتشف تقنيات القص المثالي لسراويل الخياطة. هذه الدورة المكثفة، خطوة بخطوة، تضمن لك مقاسًا لا تشوبه شائبة ولمسة نهائية تليق بالخياطة الراقية (Haute Couture).',
        cta: ' سجل الآن',
        ctaLoggedIn: ' ابدأ الآن',
        ctaGratuits: 'دروس مجانية',
        imageAlt: 'دورة رسم نماذج السراويل الاحترافية',
        videoUrl: "https://iframe.mediadelivery.net/embed/722726/504d21cf-5b01-4eb7-aaa7-d3530ab47b5e",
        videoType: 'iframe'
    }
};

// 2. دالة الحصول على النص المترجم
const getLocalizedText = (key) => {
    const lang = localStorage.getItem('appLanguage') || 'fr';
    return (translations[lang] && translations[lang][key]) || translations['fr'][key];
};

export default function SecondFeatured() {
    const { appLanguage, languages } = useLanguage();
    const currentLang = appLanguage;
    const isRTL = currentLang === 'ar';

    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [featuredData, setFeaturedData] = useState({
        videoUrl: "https://iframe.mediadelivery.net/embed/722726/504d21cf-5b01-4eb7-aaa7-d3530ab47b5e",
        videoType: 'iframe'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [activeLangTab, setActiveLangTab] = useState(currentLang || 'fr');
    const [editData, setEditData] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    // Limited Access Modal States
    const [showLimitedAccessModal, setShowLimitedAccessModal] = useState(false);
    const [vipPhone, setVipPhone] = useState('');
    const [vipFullName, setVipFullName] = useState('');
    const [isSubmittingVip, setIsSubmittingVip] = useState(false);
    const [vipRequestSuccess, setVipRequestSuccess] = useState(false);

    const navigate = useNavigate();

    const [isVipExpired, setIsVipExpired] = useState(false);

    useEffect(() => {
        // 🍎 iOS Safari Fix: Restore session from cookies before checking auth
        syncAuthSession();

        // Check Admin & Expiration Status
        const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
        if (email) {
            fetch(`${BASE_URL}/api/users/${email}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data) {
                        if (data.statut === 'admin') {
                            setIsAdmin(true);
                        } else {
                            setIsAdmin(false);
                        }
                        if (data.isExpired) {
                            setIsVipExpired(true);
                        } else {
                            setIsVipExpired(false);
                        }
                    }
                })
                .catch(() => { setIsAdmin(false); });
        } else {
            setIsAdmin(false);
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
                        const existing = initialized[lang.code] || {};
                        initialized[lang.code] = {
                            tag: existing.tag || translations[lang.code]?.tag || translations.fr.tag,
                            title: existing.title || translations[lang.code]?.title || translations.fr.title,
                            subtitle: existing.subtitle || translations[lang.code]?.subtitle || translations.fr.subtitle,
                            description: existing.description || translations[lang.code]?.description || translations.fr.description,
                            cta: existing.cta || translations[lang.code]?.cta || translations.fr.cta,
                            ctaLoggedIn: existing.ctaLoggedIn || translations[lang.code]?.ctaLoggedIn || translations.fr.ctaLoggedIn,
                            ctaGratuits: existing.ctaGratuits || translations[lang.code]?.ctaGratuits || translations.fr.ctaGratuits,
                            videoUrl: existing.videoUrl !== undefined ? existing.videoUrl : (merged.videoUrl || translations[lang.code]?.videoUrl || translations.fr.videoUrl || "https://iframe.mediadelivery.net/embed/722726/504d21cf-5b01-4eb7-aaa7-d3530ab47b5e"),
                            videoType: existing.videoType || merged.videoType || 'iframe'
                        };
                    });
                    setFeaturedData(initialized);
                    setEditData(initialized);
                }
            })
            .catch(() => { });
    }, [languages]);

    const openEditModal = () => {
        const initialized = { ...featuredData };
        languages.forEach(lang => {
            const existing = initialized[lang.code] || {};
            initialized[lang.code] = {
                tag: existing.tag || translations[lang.code]?.tag || translations.fr.tag,
                title: existing.title || translations[lang.code]?.title || translations.fr.title,
                subtitle: existing.subtitle || translations[lang.code]?.subtitle || translations.fr.subtitle,
                description: existing.description || translations[lang.code]?.description || translations.fr.description,
                cta: existing.cta || translations[lang.code]?.cta || translations.fr.cta,
                ctaLoggedIn: existing.ctaLoggedIn || translations[lang.code]?.ctaLoggedIn || translations.fr.ctaLoggedIn,
                ctaGratuits: existing.ctaGratuits || translations[lang.code]?.ctaGratuits || translations.fr.ctaGratuits,
                videoUrl: existing.videoUrl !== undefined ? existing.videoUrl : (initialized.videoUrl || translations[lang.code]?.videoUrl || translations.fr.videoUrl || "https://iframe.mediadelivery.net/embed/722726/504d21cf-5b01-4eb7-aaa7-d3530ab47b5e"),
                videoType: existing.videoType || initialized.videoType || 'iframe'
            };
        });
        setEditData(initialized);
        setActiveLangTab(currentLang);
        setIsEditing(true);
    };

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
            const userEmail = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail') || 'guest@cpatron.com';
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
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* 1. Bloc de Contenu : العناوين و CTA */}
            <div className="product-content-block">
                {isAdmin && (
                    <button
                        onClick={openEditModal}
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

                <div className="product-description" style={{ marginBottom: '40px' }}>
                    {t('description') ? (
                        <ul className="product-description-list">
                            {t('description').split('\n').map((line, idx) => {
                                const trimmed = line.trim();
                                if (!trimmed) return null;
                                const cleanText = trimmed.replace(/^[-\u2022•]\s*/, '').trim();
                                return (
                                    <li key={idx} className="desc-bullet-item">
                                        <span className="desc-bullet-icon">
                                            <FaCheckCircle />
                                        </span>
                                        <span className="desc-bullet-text">{cleanText}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : null}
                </div>

                <div className="product-cta-wrapper-block">
                    <button
                        onClick={!isVipExpired ? () => navigate('/cart') : undefined}
                        className="product-cta-button"
                        disabled={isVipExpired}
                        style={{
                            border: 'none',
                            cursor: isVipExpired ? 'not-allowed' : 'pointer',
                            opacity: isVipExpired ? 0.6 : 1,
                            background: isVipExpired ? '#dc2626' : undefined,
                            color: isVipExpired ? '#ffffff' : undefined
                        }}
                    >
                        {isVipExpired
                            ? (currentLang === 'ar' ? 'منتهي (تم حظر الوصول)' : 'Expiré (Accès VIP Bloqué)')
                            : (isLoggedIn ? (t('ctaLoggedIn') || t('cta')) : t('cta'))}
                        {!isVipExpired && (isRTL ? <FaLongArrowAltRight style={{ transform: 'scaleX(-1)' }} /> : <FaLongArrowAltRight />)}
                    </button>
                    {!isLoggedIn && (
                        <button
                            onClick={() => navigate('/Vip-access')}
                            className="product-cta-button"
                            style={{
                                border: '2px solid #10b981',
                                background: 'transparent',
                                color: '#10b981',
                                cursor: 'pointer'
                            }}
                        >
                            {t('ctaGratuits') || 'Cours Gratuits'}
                            {isRTL ? <FaLongArrowAltRight style={{ transform: 'scaleX(-1)' }} /> : <FaLongArrowAltRight />}
                        </button>
                    )}
                </div>
            </div>

            {/* 2. Bloc Visuel : فيديو المنتج المميز */}
            <div className="product-visual-block" style={{ position: 'relative' }}>
                {isAdmin && (
                    <button
                        onClick={openEditModal}
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

                {/* 🎬 Video Player — multi-language aware */}
                {(() => {
                    const langData = featuredData[currentLang] || {};
                    const videoUrl = langData.videoUrl || featuredData?.videoUrl || "https://iframe.mediadelivery.net/embed/722726/504d21cf-5b01-4eb7-aaa7-d3530ab47b5e";

                    let resolvedUrl = videoUrl;
                    if (videoUrl.includes('<iframe')) {
                        const srcMatch = videoUrl.match(/src=["']([^"']+)["']/);
                        if (srcMatch && srcMatch[1]) resolvedUrl = srcMatch[1];
                    }

                    const isYouTube = resolvedUrl.includes('youtube.com') || resolvedUrl.includes('youtu.be');
                    let youtubeSrc = '';
                    if (isYouTube) {
                        const ytMatch = resolvedUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                        if (ytMatch) youtubeSrc = `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
                    }

                    let streamableSrc = resolvedUrl;
                    if (resolvedUrl.includes('streamable.com')) {
                        const smMatch = resolvedUrl.match(/streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/);
                        if (smMatch) streamableSrc = `https://streamable.com/e/${smMatch[1]}`;
                    }

                    let bunnySrc = resolvedUrl;
                    if (resolvedUrl.includes('mediadelivery.net') || resolvedUrl.includes('bunny.net')) {
                        bunnySrc = bunnySrc.replace('/play/', '/embed/');
                        bunnySrc = bunnySrc.replace(/([?&])auto_?play=(?:0|1|true|false)/gi, '');
                        bunnySrc = bunnySrc.replace(/[?&]$/, '');
                        const sep = bunnySrc.includes('?') ? '&' : '?';
                        bunnySrc = `${bunnySrc}${sep}autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
                    }

                    const isIframe = resolvedUrl.includes('mediadelivery.net') ||
                        resolvedUrl.includes('bunny.net') ||
                        resolvedUrl.includes('player.') ||
                        resolvedUrl.includes('streamable.com') ||
                        isYouTube;

                    const iframeSrc = isYouTube ? youtubeSrc
                        : resolvedUrl.includes('streamable.com') ? streamableSrc
                        : (resolvedUrl.includes('mediadelivery.net') || resolvedUrl.includes('bunny.net')) ? bunnySrc
                        : resolvedUrl;

                    if (isIframe) {
                        return (
                            <div style={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
                                <iframe
                                    key={`${currentLang}-${iframeSrc}`}
                                    src={iframeSrc}
                                    loading="lazy"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                    allowFullScreen={true}
                                    referrerPolicy="no-referrer-when-downgrade"
                                    style={{
                                        border: 0,
                                        position: 'absolute',
                                        top: 0, left: 0,
                                        height: '100%', width: '100%',
                                    }}
                                />
                            </div>
                        );
                    }

                    return (
                        <div style={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
                            <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                                <UniversalVideoPlayer
                                    key={`${currentLang}-${resolvedUrl}`}
                                    url={resolvedUrl}
                                    title={t('imageAlt') || "Featured Product Video"}
                                />
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* 🛑 Modal Accès Limité */}
            {showLimitedAccessModal && ReactDOM.createPortal(
                <div className="premium-modal-backdrop" onClick={() => !isSubmittingVip && setShowLimitedAccessModal(false)}>
                    <div className="creative-modal-content" onClick={(e) => e.stopPropagation()} style={{ overflow: 'visible' }}>
                        <div className="creative-crown-wrapper">
                            <FaCrown />
                        </div>

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
                    <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditing(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">
                            {currentLang === 'ar' ? 'تعديل السلعة المميزة والفيديو' : 'Modifier le Produit Vedette & Vidéo'}
                        </h2>

                        {/* 🌐 Language Switcher Tabs in Modal */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => setActiveLangTab(lang.code)}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: '10px',
                                        border: activeLangTab === lang.code ? '2px solid #d4af37' : '1px solid #cbd5e1',
                                        background: activeLangTab === lang.code ? '#d4af37' : '#f8fafc',
                                        color: activeLangTab === lang.code ? '#0f172a' : '#475569',
                                        fontWeight: '700',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: activeLangTab === lang.code ? '0 4px 12px rgba(212, 175, 55, 0.25)' : 'none'
                                    }}
                                >
                                    {lang.emoji && <span>{lang.emoji}</span>}
                                    <span>{lang.label}</span>
                                </button>
                            ))}
                        </div>

                        {(() => {
                            const currentEditLang = activeLangTab || currentLang;
                            const langData = editData[currentEditLang] || {};
                            const activeLangObj = languages.find(l => l.code === currentEditLang) || { label: currentEditLang, code: currentEditLang };
                            const isLangRtl = currentEditLang === 'ar';

                            return (
                                <div className="premium-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* 🎬 Visual/Video Section for this language */}
                                    <div className="premium-lang-section" style={{ background: 'rgba(212, 175, 55, 0.06)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                                        <h4 className="lang-indicator" style={{ color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                            <FaVideo /> {currentLang === 'ar' ? `فيديو العرض (${activeLangObj.label})` : `PROPRIÉTÉS VIDÉO (${activeLangObj.label})`}
                                        </h4>

                                        <div className="premium-form-group" style={{ marginBottom: '15px' }}>
                                            <label>{currentLang === 'ar' ? 'نوع مصدر الفيديو' : 'Type de Source'}</label>
                                            <select
                                                value={langData.videoType || 'iframe'}
                                                onChange={e => setEditData({
                                                    ...editData,
                                                    [currentEditLang]: {
                                                        ...langData,
                                                        videoType: e.target.value
                                                    }
                                                })}
                                            >
                                                <option value="iframe">{currentLang === 'ar' ? 'رابط خارجي (Iframe / YouTube / Streamable / Bunny)' : 'Lien Externe (Iframe/Streamable/YouTube/Bunny)'}</option>
                                                <option value="local">{currentLang === 'ar' ? 'تحميل ملف فيديو (MP4 محلي)' : 'Télécharger une vidéo (Fichier MP4/Local)'}</option>
                                            </select>
                                        </div>

                                        {(langData.videoType || 'iframe') === 'iframe' ? (
                                            <div className="premium-form-group">
                                                <label>{currentLang === 'ar' ? `رابط الفيديو للغة (${activeLangObj.label})` : `Lien Vidéo (${activeLangObj.label})`}</label>
                                                <input
                                                    type="text"
                                                    placeholder="https://streamable.com/e/... ou https://iframe.mediadelivery.net/embed/..."
                                                    value={langData.videoUrl || ''}
                                                    onChange={e => setEditData({
                                                        ...editData,
                                                        [currentEditLang]: {
                                                            ...langData,
                                                            videoUrl: e.target.value
                                                        }
                                                    })}
                                                    dir="ltr"
                                                />
                                            </div>
                                        ) : (
                                            <div className="premium-form-group">
                                                <label>{currentLang === 'ar' ? 'تحميل من الجهاز' : "Télécharger depuis l'ordinateur"}</label>
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
                                                                    setEditData({
                                                                        ...editData,
                                                                        [currentEditLang]: {
                                                                            ...langData,
                                                                            videoUrl: data.filePath
                                                                        }
                                                                    });
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
                                                {langData.videoUrl && langData.videoType === 'local' && (
                                                    <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '5px' }}>
                                                        {currentLang === 'ar' ? 'الفيديو جاهز: ' : 'Vidéo prête: '} {langData.videoUrl}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* 📝 Text Content Section for this language */}
                                    <div className="premium-lang-section" style={{ border: 'none', background: 'none' }}>
                                        <h4 className="lang-indicator" style={{ background: '#d4af37', marginBottom: '15px' }}>{activeLangObj.label}</h4>

                                        <div className="premium-form-group">
                                            <label>{currentLang === 'ar' ? 'العنوان الرئيسي' : 'Titre Principal'}</label>
                                            <input
                                                type="text"
                                                value={langData.title || ''}
                                                onChange={e => setEditData({
                                                    ...editData,
                                                    [currentEditLang]: { ...langData, title: e.target.value }
                                                })}
                                                dir={isLangRtl ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        <div className="premium-form-group">
                                            <label>{currentLang === 'ar' ? 'العنوان الفرعي' : 'Sous-Titre'}</label>
                                            <input
                                                type="text"
                                                value={langData.subtitle || ''}
                                                onChange={e => setEditData({
                                                    ...editData,
                                                    [currentEditLang]: { ...langData, subtitle: e.target.value }
                                                })}
                                                dir={isLangRtl ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        <div className="premium-form-group">
                                            <label>{currentLang === 'ar' ? 'نص الزر (قبل تسجيل الدخول)' : 'Texte du Bouton (Non Connecté)'}</label>
                                            <input
                                                type="text"
                                                value={langData.cta || ''}
                                                onChange={e => setEditData({
                                                    ...editData,
                                                    [currentEditLang]: { ...langData, cta: e.target.value }
                                                })}
                                                dir={isLangRtl ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        <div className="premium-form-group">
                                            <label style={{ color: '#10b981' }}>{currentLang === 'ar' ? '✓ نص الزر (بعد تسجيل الدخول)' : '✓ Texte du Bouton (Connecté)'}</label>
                                            <input
                                                type="text"
                                                value={langData.ctaLoggedIn || ''}
                                                onChange={e => setEditData({
                                                    ...editData,
                                                    [currentEditLang]: { ...langData, ctaLoggedIn: e.target.value }
                                                })}
                                                dir={isLangRtl ? 'rtl' : 'ltr'}
                                                style={{ borderColor: '#10b981' }}
                                            />
                                        </div>
                                        <div className="premium-form-group">
                                            <label style={{ color: '#3b82f6' }}>{currentLang === 'ar' ? 'نص زر الدروس المجانية (لغير المسجلين)' : 'Texte du Bouton Cours Gratuits (Non Connecté)'}</label>
                                            <input
                                                type="text"
                                                value={langData.ctaGratuits || ''}
                                                onChange={e => setEditData({
                                                    ...editData,
                                                    [currentEditLang]: { ...langData, ctaGratuits: e.target.value }
                                                })}
                                                dir={isLangRtl ? 'rtl' : 'ltr'}
                                                style={{ borderColor: '#3b82f6' }}
                                            />
                                        </div>
                                        <div className="premium-form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label>{currentLang === 'ar' ? 'الوصف' : 'Description'}</label>
                                            <textarea
                                                value={langData.description || ''}
                                                onChange={e => setEditData({
                                                    ...editData,
                                                    [currentEditLang]: { ...langData, description: e.target.value }
                                                })}
                                                rows="3"
                                                dir={isLangRtl ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

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