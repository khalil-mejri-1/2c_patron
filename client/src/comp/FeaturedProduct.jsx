import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { FaPlay, FaLongArrowAltRight, FaEdit, FaSave, FaTimes, FaVideo, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import BASE_URL from '../apiConfig';

// 1. كائن الترجمات (Localization Object)
const translations = {
    'fr': {
        tag: 'COURS VEDETTE & BEST-SELLER',
        title: 'Le Cours Maître :',
        subtitle: 'Patronage de Pantalons Professionnels',
        description: 'Débloquez les techniques de la coupe parfaite des pantalons de tailleur. Ce cours intensif, étape par étape, vous garantit un ajustement impeccable et une finition digne de la Haute Couture.',
        cta: "S'inscrire Maintenant ",
        imageAlt: 'Cours de Patronage de Pantalons Professionnels',
    },
    'en': {
        tag: 'FEATURED & BEST-SELLER COURSE',
        title: 'The Master Course:',
        subtitle: 'Professional Trouser Pattern Drafting',
        description: 'Unlock the techniques for the perfect tailoring of dress pants. This intensive, step-by-step course guarantees you an impeccable fit and a finish worthy of Haute Couture.',
        cta: 'Enroll Now ',
        imageAlt: 'Professional Trouser Pattern Drafting Course',
    },
    'ar': {
        tag: 'الدورة المميزة والأكثر مبيعًا',
        title: 'الدورة الرئيسية:',
        subtitle: 'رسم نماذج السراويل الاحترافية (الباتـرون)',
        description: 'اكتشف تقنيات القص المثالي لسراويل الخياطة. هذه الدورة المكثفة، خطوة بخطوة، تضمن لك مقاسًا لا تشوبه شائبة ولمسة نهائية تليق بالخياطة الراقية (Haute Couture).',
        cta: ' سجل الآن', // تم حذف المسافة الإضافية في البداية من '  سجل الآن'
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

    useEffect(() => {
        // Check Admin
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
        const currentUser = users.find(u => u.email === email);
        if (currentUser?.statut === 'admin') setIsAdmin(true);
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
                                cta: translations[lang.code]?.cta || translations.fr.cta 
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

                <span className="product-tag">
                    {t('tag')}
                </span>

                <h2 className="product-main-title home_titre">
                    {t('title')} <br />
                    <span className='product-subtitle'>{t('subtitle')}</span>
                </h2>

                <p className="product-description">
                    {t('description')}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Link to="/Vip-access" className="product-cta-button">
                        {isLoggedIn
                            ? (currentLang === 'ar' ? 'ابدأ الآن' : currentLang === 'en' ? 'Start Now' : 'Commencer')
                            : t('cta')
                        }
                        {/* عكس اتجاه الأيقونة لـ RTL */}
                        {isRTL ? <FaLongArrowAltRight style={{ transform: 'scaleX(-1)' }} /> : <FaLongArrowAltRight />}
                    </Link>
                </div>
            </div>

            {/* 🛑 Stylish Edit Modal */}
            {isEditing && ReactDOM.createPortal(
                <div className="premium-modal-backdrop" onClick={() => setIsEditing(false)}>
                    <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditing(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">
                            {currentLang === 'ar' ? 'تعديل المنتج المفضل' : 'Modifier le Produit Vedette'}
                        </h2>

                        <div className="premium-form-grid">
                            {/* Visual Setting Section */}
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
                                        <label>Tag (Badge)</label>
                                        <input
                                            type="text"
                                            value={editData[lang.code]?.tag || ''}
                                            onChange={e => setEditData({ ...editData, [lang.code]: { ...editData[lang.code], tag: e.target.value } })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
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
                                        <label>Texte du Bouton</label>
                                        <input
                                            type="text"
                                            value={editData[lang.code]?.cta || ''}
                                            onChange={e => setEditData({ ...editData, [lang.code]: { ...editData[lang.code], cta: e.target.value } })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
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