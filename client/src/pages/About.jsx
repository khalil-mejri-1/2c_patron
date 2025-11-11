import React from 'react';
import { FaHeart, FaHandsHelping, FaLightbulb, FaTools } from 'react-icons/fa'; // أيقونات للقيم
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link } from 'react-router-dom';

// 📋 بيانات القيم الأساسية
const values = [
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
];

export default function About() {
    return (
        <>
            <Navbar/>
            <section className="about-section">
                
                {/* 1. قسم الرؤية والرسالة (Hero) */}
                <div className="about-hero">
                    <h1 className="about-main-title">
                        L'Art de la Couture, Notre <span className="about-accent">Passion</span>
                    </h1>
                    <p className="about-tagline">
                        Devenir l'atelier de référence pour la maîtrise du patronage et du moulage en Afrique du Nord et au-delà.
                    </p>
                </div>

                {/* 2. قسم قصتنا */}
                <div className="about-story-container">
                    <div className="story-content">
                        <h2 className="story-title">Notre Histoire : L'Atelier Couture</h2>
                        <p className="story-paragraph">
                            Fondé en 2015 par une maître tailleur passionnée, notre atelier est né d'une simple observation : la difficulté à trouver des formations en ligne qui allient la précision de la haute couture française et l'accessibilité locale. Depuis, nous avons guidé des milliers d'étudiants, des débutants aux professionnels, à travers des leçons vidéo exclusives et des patrons certifiés.
                        </p>
                        <p className="story-paragraph">
                            Nous croyons que la véritable maîtrise ne s'acquiert pas par la vitesse, mais par la répétition, la patience et l'excellence des outils. Notre mission est de démocratiser les secrets de l'artisanat de luxe.
                        </p>
                        <Link to="/contact" className="contact-link-btn">
                            Rencontrer l'équipe
                        </Link>
                    </div>
                    
                    <div className="story-image">
                        {/* صورة تعبيرية عن العمل أو الأتيليه */}
                        <img 
                            src="https://images.pexels.com/photos/3321453/pexels-photo-3321453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                            alt="Maître Tailleur au travail"
                            className="about-image-style"
                        />
                    </div>
                </div>

                {/* 3. قسم القيم الأساسية */}
                <div className="about-values-section">
                    <h2 className="values-title">Nos Valeurs Fondamentales</h2>
                    <div className="values-grid">
                        {values.map((value, index) => (
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