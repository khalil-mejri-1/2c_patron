import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaGraduationCap, FaHandsHelping, FaUnlockAlt } from 'react-icons/fa';

// 🌟 Translation Data Object 🌟
const translations = {
    fr: {
        features: [
            {
                icon: FaGraduationCap,
                title: "50+ LEÇONS DE MAÎTRE",
                description: "Accès à une bibliothèque en constante évolution de tutoriels vidéo détaillés, couvrant tous les aspects du patronage."
            },
            {
                icon: FaHandsHelping,
                title: "SUPPORT PERSONNALISÉ",
                description: "Bénéficiez d'un accompagnement direct par nos experts pour surmonter les défis techniques et perfectionner votre art."
            },
            {
                icon: FaUnlockAlt,
                title: "ACCÈS ILLIMITÉ VIP",
                description: "Pour les abonnés Master Atelier : débloquez le contenu exclusif, les mises à jour et les événements privés."
            },
        ]
    },
    ar: {
        features: [
            {
                icon: FaGraduationCap,
                title: "أكثر من 50 درسًا احترافيًا",
                description: "وصول إلى مكتبة متنامية من الدروس التعليمية بالفيديو المفصلة، والتي تغطي جميع جوانب الباتروناج (Pattern Making)."
            },
            {
                icon: FaHandsHelping,
                title: "دعم شخصي ومخصص",
                description: "استفد من المرافقة المباشرة من خبرائنا للتغلب على التحديات التقنية وإتقان فنك."
            },
            {
                icon: FaUnlockAlt,
                title: "وصول غير محدود VIP",
                description: "للمشتركين في 'الأتيليه الرئيسي': افتح المحتوى الحصري، التحديثات، والفعاليات الخاصة."
            },
        ]
    },
    en: {
        features: [
            {
                icon: FaGraduationCap,
                title: "50+ MASTER LESSONS",
                description: "Access to a constantly evolving library of detailed video tutorials, covering all aspects of pattern making."
            },
            {
                icon: FaHandsHelping,
                title: "PERSONALIZED SUPPORT",
                description: "Benefit from direct coaching by our experts to overcome technical challenges and perfect your craft."
            },
            {
                icon: FaUnlockAlt,
                title: "UNLIMITED VIP ACCESS",
                description: "For Master Workshop subscribers: unlock exclusive content, updates, and private events."
            },
        ]
    },
};

export default function KeyFeatures() {
    const { appLanguage } = useLanguage();

    let effectiveLanguage = 'fr'; // اللغة الافتراضية
    if (appLanguage === 'ar') {
        effectiveLanguage = 'ar';
    } else if (appLanguage === 'en') {
        effectiveLanguage = 'en';
    }

    const texts = translations[effectiveLanguage];
    const sectionDirection = effectiveLanguage === 'ar' ? 'rtl' : 'ltr';

    return (
        // ⬅️ تطبيق الاتجاه على العنصر الرئيسي ➡️
        <section className="key-features-section" dir={sectionDirection}>
            <div className="features-grid">
                {texts.features.map((feature, index) => (
                    <div key={index} className="feature-card">
                        <feature.icon className="feature-icon" />
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-description">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}