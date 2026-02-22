import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaCrown, FaGem, FaAward, FaMagic } from 'react-icons/fa';

export default function WhyUs() {
    const { appLanguage } = useLanguage();
    const isRTL = appLanguage === 'ar';

    const content = {
        fr: {
            title: "L'Excellence du Savoir-Faire",
            subtitle: "Pourquoi choisir l'Atelier 2C Patron ?",
            features: [
                {
                    icon: <FaCrown />,
                    title: "Qualité Haute Couture",
                    desc: "Des techniques authentiques transmises par des maîtres artisans passionnés."
                },
                {
                    icon: <FaGem />,
                    title: "Cours Exclusifs",
                    desc: "Accédez à des contenus pédagogiques uniques, du patronage au moulage."
                },
                {
                    icon: <FaAward />,
                    title: "Certification",
                    desc: "Valorisez vos compétences avec nos programmes certifiants reconnus."
                },
                {
                    icon: <FaMagic />,
                    title: "Créativité Illimitée",
                    desc: "Libérez votre talent et créez des pièces qui vous ressemblent vraiment."
                }
            ]
        },
        ar: {
            title: "تميز المعرفة والخبرة",
            subtitle: "لماذا تختار أتيليه 2C Patron؟",
            features: [
                {
                    icon: <FaCrown />,
                    title: "جودة الخياطة الراقية",
                    desc: "تقنيات أصلية منقولة من حرفيين خبراء وشغوفين."
                },
                {
                    icon: <FaGem />,
                    title: "دورات حصرية",
                    desc: "احصل على محتوى تعليمي فريد، من الباتروناج إلى القولبة."
                },
                {
                    icon: <FaAward />,
                    title: "شهادات معتمدة",
                    desc: "عزز مهاراتك من خلال برامجنا التدريبية المعتمدة والمعترف بها."
                },
                {
                    icon: <FaMagic />,
                    title: "إبداع بلا حدود",
                    desc: "أطلق العنان لموهبتك وابتكر قطعاً فريدة تشبهك حقاً."
                }
            ]
        },
        en: {
            title: "Excellence in Craftsmanship",
            subtitle: "Why choose 2C Patron Workshop?",
            features: [
                {
                    icon: <FaCrown />,
                    title: "Haute Couture Quality",
                    desc: "Authentic techniques handed down by passionate master craftsmen."
                },
                {
                    icon: <FaGem />,
                    title: "Exclusive Courses",
                    desc: "Access unique educational content, from pattern making to draping."
                },
                {
                    icon: <FaAward />,
                    title: "Certification",
                    desc: "Enhance your skills with our recognized certification programs."
                },
                {
                    icon: <FaMagic />,
                    title: "Unlimited Creativity",
                    desc: "Unlock your talent and create pieces that truly reflect you."
                }
            ]
        }
    };

    const t = content[appLanguage] || content.fr;

    return (
        <section className="home-why-us-section" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="why-us-container">
                <div className="why-us-header">
                    <span className="premium-badge">{t.subtitle}</span>
                    <h2 className="why-us-title">{t.title}</h2>
                    <div className="title-divider"></div>
                </div>

                <div className="why-us-grid">
                    {t.features.map((item, idx) => (
                        <div className="why-us-card" key={idx}>
                            <div className="why-us-icon-wrapper">
                                {item.icon}
                            </div>
                            <div className="why-us-card-content">
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
