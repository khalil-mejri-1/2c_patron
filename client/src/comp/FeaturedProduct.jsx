import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaPlay, FaLongArrowAltRight, FaEdit, FaSave } from 'react-icons/fa';
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
    const [featuredData, setFeaturedData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        fr: { tag: '', title: '', subtitle: '', description: '', cta: '' },
        ar: { tag: '', title: '', subtitle: '', description: '', cta: '' },
        en: { tag: '', title: '', subtitle: '', description: '', cta: '' }
    });

    useEffect(() => {
        // Check Admin
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
        const currentUser = users.find(u => u.email === email);
        if (currentUser?.statut === 'admin') setIsAdmin(true);

        // Fetch Data
        const localBackup = localStorage.getItem('featured_product_backup');
        if (localBackup) setFeaturedData(JSON.parse(localBackup));

        fetch(`${BASE_URL}/api/settings/featured-product`)
            .then(res => res.ok ? res.json() : null)
            .then(data => data && setFeaturedData(data))
            .catch(() => { });
    }, []);

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
            <div className="product-visual-block">

                {/* حاوية استجابة (responsive) للفيديو المضمن */}
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: 0,
                        paddingBottom: '56.250%' // نسبة 16:9
                    }}
                >
                    <iframe
                        allow="fullscreen"
                        allowFullScreen
                        height="100%"
                        src="https://streamable.com/e/4k6x0z?"
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
                        // استخدام الترجمة كعنوان iframe
                        title={t('imageAlt') || "Featured Product Video"}
                    />
                </div>

            </div>

            {/* 2. Bloc de Contenu : العناوين و CTA (محدث باللغات) */}
            <div className="product-content-block">

                {isAdmin && (
                    <button
                        onClick={() => { setEditData({ ...editData, ...featuredData }); setIsEditing(true); }}
                        className="hero-edit-title-btn small-edit-btn"
                        style={{ position: 'absolute', top: '10px', right: '10px' }}
                        title="Modifier le contenu du produit vedette"
                    >
                        <FaEdit />
                    </button>
                )}

                <span className="product-tag">
                    {t('tag')}
                </span>

                <h2 className="product-main-title">
                    {t('title')} <br />
                    {t('subtitle')}
                </h2>

                <p className="product-description">
                    {t('description')}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Link to="/Vip-access" className="product-cta-button">
                        {t('cta')}
                        {/* عكس اتجاه الأيقونة لـ RTL */}
                        {isRTL ? <FaLongArrowAltRight style={{ transform: 'scaleX(-1)' }} /> : <FaLongArrowAltRight />}
                    </Link>
                    {isAdmin && (
                        <button
                            onClick={() => { setEditData({ ...editData, ...featuredData }); setIsEditing(true); }}
                            className="hero-edit-title-btn small-edit-btn"
                            title="Modifier le texte du bouton CTA"
                        >
                            <FaEdit />
                        </button>
                    )}
                </div>
            </div>

            {/* 🛑 Edit Modal */}
            {isEditing && (
                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                    <div className="modal-content" style={{
                        background: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '600px',
                        maxHeight: '80vh', overflowY: 'auto'
                    }}>
                        <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Modifier le Produit Vedette</h3>

                        {languages.map(lang => (
                            <div key={lang.code} style={{ marginBottom: '25px', padding: '15px', border: '1px solid #eee', borderRadius: '10px' }}>
                                <h4 style={{ marginBottom: '10px', textTransform: 'uppercase', color: '#D4AF37' }}>
                                    {lang.label}
                                </h4>

                                {['tag', 'title', 'subtitle', 'cta'].map(field => (
                                    <div key={field} style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#888' }}>{field}</label>
                                        <input
                                            type="text"
                                            value={editData[lang.code]?.[field] || ''}
                                            onChange={e => setEditData({ ...editData, [lang.code]: { ...editData[lang.code], [field]: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                    </div>
                                ))}

                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#888' }}>description</label>
                                    <textarea
                                        value={editData[lang.code]?.description || ''}
                                        onChange={e => setEditData({ ...editData, [lang.code]: { ...editData[lang.code], description: e.target.value } })}
                                        rows="3"
                                        style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                    />
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', borderRadius: '5px', border: '1px solid #ddd', background: '#fff' }}>
                                Annuler
                            </button>
                            <button onClick={handleSave} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#28a745', color: '#fff' }}>
                                <FaSave /> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
}