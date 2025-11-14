import React, { useState, useEffect } from 'react';
import { FaHeart, FaHandsHelping, FaLightbulb, FaTools } from 'react-icons/fa'; // أيقونات للقيم
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link } from 'react-router-dom';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        heroTitle: () => `فن الخياطة  `,
        heroAccent: "شغفنا",
        heroTagline: "أن نكون الورشة المرجعية لإتقان الباترون والمولاج في شمال إفريقيا وخارجها.",
        
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
        heroTagline: "Devenir l'atelier de référence pour la maîtrise du patronage et du moulage en Afrique du Nord et au-delà.",
        
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
        heroTagline: "To become the reference workshop for mastering pattern-making and draping in North Africa and beyond.",
        
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
    const [appLanguage, setAppLanguage] = useState('fr');

    // 1. ⚙️ جلب اللغة من LocalStorage
    useEffect(() => {
        const lang = localStorage.getItem('appLanguage') || 'fr';
        setAppLanguage(lang);
    }, []);

    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';
    const accentText = <span className="about-accent">{t.heroAccent}</span>;

    return (
        <>
            <Navbar/>
            <section className="about-section" dir={direction}>
                
                {/* 1. قسم الرؤية والرسالة (Hero) */}
                <div className="about-hero">
                    <h1 className="about-main-title">
                        {t.heroTitle(accentText)}
                    </h1>
                    <p className="about-tagline">
                        {t.heroTagline}
                    </p>
                </div>

                {/* 2. قسم قصتنا */}
                <div className="about-story-container">
                    <div className="story-content">
                        <h2 className="story-title">{t.storyTitle}</h2>
                        <p className="story-paragraph">
                            {t.storyPara1}
                        </p>
                        <p className="story-paragraph">
                            {t.storyPara2}
                        </p>
                        <Link to="/contact" className="contact-link-btn">
                            {t.contactBtn}
                        </Link>
                    </div>
                    
                    <div className="story-image">
                        {/* صورة تعبيرية عن العمل أو الأتيليه */}
                        <img 
                            src="https://images.pexels.com/photos/3321453/pexels-photo-3321453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                            alt="Maître Tailleur au travail / Master Tailor at work"
                            className="about-image-style"
                        />
                    </div>
                </div>

                {/* 3. قسم القيم الأساسية */}
                <div className="about-values-section">
                    <h2 className="values-title">{t.valuesTitle}</h2>
                    <div className="values-grid">
                        {t.values.map((value, index) => (
                            <div key={index} className="value-card">
                                <value.icon className="value-icon" />
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </section>
            <Footer/>
        </>
    );
}