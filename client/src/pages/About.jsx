import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaHeart, FaHandsHelping, FaLightbulb, FaTools, FaEdit, FaSave, FaTimes, FaChevronRight, FaGem, FaImage } from 'react-icons/fa'; // أيقونات للقيم
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link } from 'react-router-dom';
import BASE_URL from '../apiConfig';
import './about_premium.css';

// 🌐 كائن الترجمة
const aboutTranslations = {
    ar: {
        heroTitle: () => `فن الخياطة  `,
        heroAccent: "شغفنا",
        heroAccent: "شغفنا",

        storyTitle: "قصتنا: ورشة كوتور",
        storyPara1: "تأسست ورشتنا في عام 2015 على يد خياطة ماهرة شغوفة، وولدت من ملاحظة بسيطة: صعوبة العثور على تدريب عبر الإنترنت يجمع بين دقة الخياطة الراقية الفرنسية وإمكانية الوصول المحلية. ومنذ ذلك الحين، قمنا بتوجيه الآلاف من الطلاب، من المبتدئين إلى المحترفين، من خلال دروس فيديو حصرية وباترونات معتمدة.",
        storyPara2: "نحن نؤمن بأن الإتقان الحقيقي لا يتحقق بالسرعة، بل بالتكرار والصبر والتميز في الأدوات. مهمتنا هي نشر أسرار الحرفية الفاخرة للجميع.",
        contactBtn: "مقابلة الفريق",

        valuesTitle: "قيمنا الأساسية",
        values: [
            {
                icon: FaHeart,
                title: "الشغف والتميز",
                description: "نشارك حبنا غير المشروط للخياطة، ونسعى دائمًا لأعلى مستويات الجودة في تدريباتنا ومنتجاتنا."
            },
            {
                icon: FaLightbulb,
                title: "الابتكار والإبداع",
                description: "نحن نشجع التجريب واعتماد التقنيات الحديثة مع احترام تقاليد الحرف اليدوية."
            },
            {
                icon: FaHandsHelping,
                title: "الدعم المجتمعي",
                description: "نبني مجتمعًا متماسكًا حيث المساعدة المتبادلة وتبادل المعرفة هما جوهر عملية التعلم."
            },
            {
                icon: FaTools,
                title: "الإتقان التقني",
                description: "تم تصميم كل دورة لتزويدك بالمهارات العملية والدقيقة اللازمة لتصبح حرفيًا ماهرًا."
            }
        ]
    },
    fr: {
        heroTitle: () => `L'Art de la Couture`,
        heroAccent: "Passion",
        heroAccent: "Passion",

        storyTitle: "Notre Histoire : L'Atelier Couture",
        storyPara1: "Fondé en 2015 par une maître tailleur passionnée, notre atelier est né d'une simple observation : la difficulté à trouver des formations en ligne qui allient la précision de la haute couture française et l'accessibilité locale. Depuis, nous avons guidé des milliers d'étudiants, des débutants aux professionnels, à travers des leçons vidéo exclusives et des patrons certifiés.",
        storyPara2: "Nous croyons que la véritable maîtrise ne s'acquiert pas par la vitesse, mais par la répétition, la patience et l'excellence des outils. Notre mission est de démocratiser les secrets de l'artisanat de luxe.",
        contactBtn: "Rencontrer l'équipe",

        valuesTitle: "Nos Valeurs Fondamentales",
        values: [
            {
                icon: FaHeart,
                title: "Passion et Excellence",
                description: "Nous partageons notre amour inconditionnel pour la couture, visant toujours la plus haute qualité dans nos formations et produits."
            },
            {
                icon: FaLightbulb,
                title: "Innovation et Créativité",
                description: "Nous encourageons l'expérimentation et l'adoption de techniques modernes tout en respectant les traditions de l'artisanat."
            },
            {
                icon: FaHandsHelping,
                title: "Soutien Communautaire",
                description: "Nous construisons une communauté soudée où l'entraide et le partage de connaissances sont au cœur de l'apprentissage."
            },
            {
                icon: FaTools,
                title: "Maîtrise Technique",
                description: "Chaque cours est conçu pour vous doter des compétences pratiques et précises nécessaires pour devenir un maître artisan."
            }
        ]
    },
    en: {
        heroTitle: () => `The Art of Sewing`,
        heroAccent: "Passion",
        heroAccent: "Passion",

        storyTitle: "Our Story: The Couture Workshop",
        storyPara1: "Founded in 2015 by a passionate master tailor, our workshop was born from a simple observation: the difficulty in finding online training that combines the precision of French haute couture with local accessibility. Since then, we have guided thousands of students, from beginners to professionals, through exclusive video lessons and certified patterns.",
        storyPara2: "We believe that true mastery is achieved not through speed, but through repetition, patience, and excellence of tools. Our mission is to democratize the secrets of luxury craftsmanship.",
        contactBtn: "Meet the Team",

        valuesTitle: "Our Core Values",
        values: [
            {
                icon: FaHeart,
                title: "Passion and Excellence",
                description: "We share our unconditional love for sewing, always aiming for the highest quality in our training and products."
            },
            {
                icon: FaLightbulb,
                title: "Innovation and Creativity",
                description: "We encourage experimentation and the adoption of modern techniques while respecting the traditions of craftsmanship."
            },
            {
                icon: FaHandsHelping,
                title: "Community Support",
                description: "We build a close-knit community where mutual aid and knowledge sharing are at the heart of learning."
            },
            {
                icon: FaTools,
                title: "Technical Mastery",
                description: "Every course is designed to equip you with the practical and precise skills needed to become a master artisan."
            }
        ]
    }
};


export default function About() {
    const { appLanguage, languages } = useLanguage();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditingField, setIsEditingField] = useState(null);

    // Default structure for content
    const defaultStructure = {
        heroTitle: '', heroAccent: '', heroImage: '',
        storyTitle: '', storyPara1: '', storyPara2: '', storyImage: '',
        contactBtn: '', valuesTitle: '',
        vt1: '', vd1: '', vt2: '', vd2: '', vt3: '', vd3: '', vt4: '', vd4: '',
        pageBgImage: ''
    };

    const [aboutContent, setAboutContent] = useState({
        fr: { ...defaultStructure },
        ar: { ...defaultStructure },
        en: { ...defaultStructure }
    });
    const [editAboutContent, setEditAboutContent] = useState({
        fr: { ...defaultStructure },
        ar: { ...defaultStructure },
        en: { ...defaultStructure }
    });

    // 1. ⚙️ جلب التحقق من المسؤول
    useEffect(() => {
        // Check Admin - Multiple methods for robustness
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
        const storedRole = localStorage.getItem('userRole') || localStorage.getItem('role');
        const storedIsAdmin = localStorage.getItem('isAdmin');

        // Comprehensive check: statut, role, email, or isAdmin flag
        const currentUser = users.find(u => u.email === email);
        if (
            currentUser?.statut === 'admin' ||
            currentUser?.role === 'admin' ||
            storedRole === 'admin' ||
            storedIsAdmin === 'true' ||
            (email && email.toLowerCase().includes('admin'))
        ) {
            setIsAdmin(true);
        }

        // Load Content
        fetch(`${BASE_URL}/api/settings/about-content`)
            .then(res => res.ok ? res.json() : null)
            .then(data => data && setAboutContent(data))
            .catch(() => { });
    }, []);

    const handleSaveAboutContent = async () => {
        setAboutContent(editAboutContent);
        setIsEditingField(null);
        try {
            await fetch(`${BASE_URL}/api/settings/about-content`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editAboutContent })
            });
        } catch (err) { }
    };

    // 🔧 دالة مساعدة لتهيئة جميع اللغات المتاحة
    const initializeAllLanguages = (currentValues) => {
        const initialized = {};
        languages.forEach(lang => {
            initialized[lang.code] = {
                ...defaultStructure,
                ...(currentValues[lang.code] || {})
            };
        });
        return initialized;
    };

    const getT = (key, defaultVal) => {
        return (aboutContent[appLanguage] && aboutContent[appLanguage][key]) || defaultVal;
    };

    const EditBtn = ({ field, style = {}, children }) => (
        isAdmin && (
            <button
                onClick={() => { setEditAboutContent(initializeAllLanguages(aboutContent)); setIsEditingField(field); }}
                className="edit-btn-minimal-lux"
                title="Modifier"
                style={style}
            >
                {children || <FaEdit size={14} />}
            </button>
        )
    );

    const t = aboutTranslations[appLanguage] || aboutTranslations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';
    const accentText = <span className="about-accent">{getT('heroAccent', t.heroAccent)}</span>;

    return (
        <>
            <Navbar />
            <div dir={direction}>
                <main className="about-page-premium">

                    {/* 1. Hero Section - Premium & Cinematic */}
                    <header
                        className="about-hero-premium"
                        style={{
                            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.4)), url(${getT('heroImage', 'https://images.unsplash.com/photo-1556015048-4ded3446a160?q=80&w=2560&auto=format&fit=crop')})`
                        }}
                    >
                        <div className="about-hero-overlay"></div>

                        <div className="container about-container" style={{ position: 'relative', zIndex: 10 }}>
                            <div className="about-badge-lux">
                                {appLanguage === 'ar' ? '2C Patron Studio' : '2C Patron Studio'}
                            </div>
                            <h1 className="about-main-title">
                                {appLanguage === 'en' ? getT('heroAccent', t.heroAccent) : getT('heroTitle', t.heroTitle(''))}
                                <span className="about-accent"> {appLanguage === 'en' ? getT('heroTitle', t.heroTitle('')) : getT('heroAccent', t.heroAccent)}</span>
                            </h1>
                            <div style={{ marginTop: '35px', display: 'flex', justifyContent: 'center', gap: '20px', position: 'relative', zIndex: 20, flexWrap: 'wrap' }}>
                                <EditBtn field="hero">
                                    <FaEdit style={{ marginRight: '8px' }} /> {appLanguage === 'ar' ? 'تعديل النص' : 'Modifier le Texte'}
                                </EditBtn>
                                <EditBtn field="heroImage">
                                    <FaImage style={{ marginRight: '8px' }} /> {appLanguage === 'ar' ? 'تغيير الخلفية' : 'Changer l\'Image'}
                                </EditBtn>
                            </div>
                        </div>
                    </header>

                    {/* 2. Story Section - Premium Two Column */}
                    <section className="about-story-section">
                        <div className="story-grid-premium">
                            <div className="story-image-wrapper-lux" style={{ position: 'relative' }}>
                                <img
                                    src={getT('storyImage', 'https://images.unsplash.com/photo-1556015048-4ded3446a160?q=80&w=2560&auto=format&fit=crop')}
                                    alt="Atelier Couture"
                                    className="story-img-lux"
                                />
                                <EditBtn field="storyImage" style={{ position: 'absolute', top: '20px', right: '20px' }} />
                            </div>
                            <div className="story-content-lux" style={{ position: 'relative' }}>
                                <h2 className="story-title-lux">
                                    {getT('storyTitle', t.storyTitle)}
                                </h2>
                                <p className="story-para-lux">
                                    {getT('storyPara1', t.storyPara1)}
                                </p>
                                <p className="story-para-lux">
                                    {getT('storyPara2', t.storyPara2)}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <Link to="/contact" className="about-cta-btn">
                                        {getT('contactBtn', t.contactBtn)} <FaChevronRight size={14} />
                                    </Link>
                                </div>
                                <EditBtn field="story" style={{ position: 'absolute', top: '0', right: '0' }} />
                            </div>
                        </div>
                    </section>

                    {/* 3. Values Section - Premium Grid */}
                    <section className="values-section-premium">
                        <div className="container">
                            <div className="values-header-lux" style={{ position: 'relative' }}>
                                <h2 className="values-title-lux">
                                    {getT('valuesTitle', t.valuesTitle)}
                                </h2>
                                <EditBtn field="valuesTitle" style={{ position: 'absolute', top: '0', right: '0' }} />
                            </div>
                            <div className="values-grid-lux">
                                {t.values.map((value, index) => (
                                    <div key={index} className="value-card-lux" style={{ position: 'relative' }}>
                                        <div className="value-icon-wrapper-lux">
                                            <value.icon />
                                        </div>
                                        <h3 className="v-card-title-lux">
                                            {getT(`vt${index + 1}`, value.title)}
                                        </h3>
                                        <p className="v-card-desc-lux">
                                            {getT(`vd${index + 1}`, value.description)}
                                        </p>
                                        <EditBtn field={`value_${index + 1}`} style={{ position: 'absolute', top: '15px', right: '15px' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>


                    {/* 🛑 Admin Editing Modal */}
                    {isEditingField && (
                        <div className="premium-modal-backdrop" onClick={() => setIsEditingField(null)}>
                            <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                                <button className="premium-modal-close-icon" onClick={() => setIsEditingField(null)}><FaTimes /></button>
                                <h2 className="premium-modal-title">
                                    Modifier: {
                                        isEditingField === 'hero' ? 'En-tête (Hero)' :
                                            isEditingField === 'heroImage' ? 'Image de Fond (Hero)' :
                                                isEditingField === 'story' ? 'Notre Histoire (Contenu)' :
                                                    isEditingField === 'storyImage' ? 'Image de l\'Histoire' :
                                                        isEditingField === 'valuesTitle' ? 'Titre de la Section Valeurs' :
                                                            isEditingField.startsWith('value_') ? `Valeur #${isEditingField.split('_')[1]}` :
                                                                isEditingField
                                    }
                                </h2>

                                <div className="premium-form-grid">
                                    {languages.map(lang => (
                                        <div key={lang.code} className="premium-lang-section">
                                            <h4 className="lang-indicator">{lang.label}</h4>

                                            {isEditingField === 'heroImage' && (
                                                <div className="premium-form-group">
                                                    <label>URL Image de Fond (Hero)</label>
                                                    <input
                                                        type="text"
                                                        value={editAboutContent[lang.code]?.heroImage || ''}
                                                        onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], heroImage: e.target.value } })}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            )}

                                            {isEditingField === 'hero' && (
                                                <>
                                                    <div className="premium-form-group">
                                                        <label>Titre Principal</label>
                                                        <input
                                                            type="text"
                                                            value={editAboutContent[lang.code]?.heroTitle || ''}
                                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], heroTitle: e.target.value } })}
                                                        />
                                                    </div>
                                                    <div className="premium-form-group">
                                                        <label>Accent (Or)</label>
                                                        <input
                                                            type="text"
                                                            value={editAboutContent[lang.code]?.heroAccent || ''}
                                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], heroAccent: e.target.value } })}
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {isEditingField === 'story' && (
                                                <>
                                                    <div className="premium-form-group">
                                                        <label>Titre de l'Histoire</label>
                                                        <input
                                                            type="text"
                                                            value={editAboutContent[lang.code]?.storyTitle || ''}
                                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], storyTitle: e.target.value } })}
                                                        />
                                                    </div>
                                                    <div className="premium-form-group">
                                                        <label>Paragraphe 1</label>
                                                        <textarea
                                                            value={editAboutContent[lang.code]?.storyPara1 || ''}
                                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], storyPara1: e.target.value } })}
                                                            style={{ minHeight: '100px' }}
                                                        />
                                                    </div>
                                                    <div className="premium-form-group">
                                                        <label>Paragraphe 2</label>
                                                        <textarea
                                                            value={editAboutContent[lang.code]?.storyPara2 || ''}
                                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], storyPara2: e.target.value } })}
                                                            style={{ minHeight: '100px' }}
                                                        />
                                                    </div>
                                                    <div className="premium-form-group">
                                                        <label>Texte Bouton Contact</label>
                                                        <input
                                                            type="text"
                                                            value={editAboutContent[lang.code]?.contactBtn || ''}
                                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], contactBtn: e.target.value } })}
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {isEditingField === 'storyImage' && (
                                                <div className="premium-form-group">
                                                    <label>URL de l'image (Story)</label>
                                                    <input
                                                        type="text"
                                                        value={editAboutContent[lang.code]?.storyImage || ''}
                                                        onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], storyImage: e.target.value } })}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            )}

                                            {isEditingField === 'valuesTitle' && (
                                                <div className="premium-form-group">
                                                    <label>Titre des Valeurs</label>
                                                    <input
                                                        type="text"
                                                        value={editAboutContent[lang.code]?.valuesTitle || ''}
                                                        onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], valuesTitle: e.target.value } })}
                                                    />
                                                </div>
                                            )}

                                            {isEditingField.startsWith('value_') && (
                                                <>
                                                    <div className="premium-form-group">
                                                        <label>Titre de la Valeur</label>
                                                        <input
                                                            type="text"
                                                            value={editAboutContent[lang.code]?.[`vt${isEditingField.split('_')[1]}`] || ''}
                                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], [`vt${isEditingField.split('_')[1]}`]: e.target.value } })}
                                                        />
                                                    </div>
                                                    <div className="premium-form-group">
                                                        <label>Description de la Valeur</label>
                                                        <textarea
                                                            value={editAboutContent[lang.code]?.[`vd${isEditingField.split('_')[1]}`] || ''}
                                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], [`vd${isEditingField.split('_')[1]}`]: e.target.value } })}
                                                            style={{ minHeight: '80px' }}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="premium-btn-group">
                                    <button className="premium-btn-cta secondary" onClick={() => setIsEditingField(null)}>
                                        Annuler
                                    </button>
                                    <button className="premium-btn-cta gold" onClick={handleSaveAboutContent}>
                                        <FaSave /> Enregistrer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </main>
                <Footer />
            </div >
        </>
    );
}