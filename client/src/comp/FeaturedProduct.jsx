import React from 'react';
import { FaPlay, FaLongArrowAltRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

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
    return translations[lang][key] || translations['fr'][key];
};

export default function FeaturedProduct() {
    // 3. تحديد اتجاه النص (لأغراض RTL/LTR)
    const currentLang = localStorage.getItem('appLanguage') || 'fr';
    const isRTL = currentLang === 'ar';
    // دالة اختصار
    const t = getLocalizedText;

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

                <Link to="/Vip-access" className="product-cta-button">
                    {t('cta')}
                    {/* عكس اتجاه الأيقونة لـ RTL */}
                    {isRTL ? <FaLongArrowAltRight style={{ transform: 'scaleX(-1)' }} /> : <FaLongArrowAltRight />}
                </Link>
            </div>

        </section>
    );
}