import React from 'react';
// Icônes de couture et d'enseignement pour l'élégance
import { FaGraduationCap, FaHandsHelping, FaUnlockAlt } from 'react-icons/fa';

const featuresData = [
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
];

export default function KeyFeatures() {
  return (
    <section className="key-features-section">
      <div className="features-grid">
        {featuresData.map((feature, index) => (
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