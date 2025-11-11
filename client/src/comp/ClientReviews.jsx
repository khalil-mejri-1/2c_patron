import React, { useState, useEffect } from 'react';
import { FaQuoteRight, FaChevronLeft, FaChevronRight, FaStar, FaUserCircle } from 'react-icons/fa'; // Ajout de FaUserCircle

// ⚠️ URL de l'API des commentaires
const API_COMMENTAIRES_URL = '/api/commentaires/filtre';

// 🌟 Composant Étoiles de Notation 🌟 (Inchanggé)
const RatingStars = ({ rating }) => {
    const stars = [];
    // Assurez-vous que la notation est un nombre entier entre 1 et 5.
    const validRating = Math.max(1, Math.min(5, Math.round(rating || 5))); 
    
    for (let i = 0; i < 5; i++) {
        stars.push(
            <FaStar
                key={i}
                className={i < validRating ? 'star active' : 'star'}
            />
        );
    }
    return <div className="rating-stars">{stars}</div>;
};

// 🎨 NOUVEAU Composant pour l'Avatar basé sur le nom
const NameAvatar = ({ name }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    
    // Déterminer une couleur de fond basée sur le hash du nom pour la cohérence
    const stringToHslColor = (str, s, l) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = hash % 360;
        return `hsl(${h}, ${s}%, ${l}%)`;
    };

    const color = stringToHslColor(name, 70, 60);

    return (
        <div 
            className="reviewer-avatar-initial"
            style={{ backgroundColor: color }}
        >
            {initial}
        </div>
    );
};

export default function ClientReviews() {
    // 🆕 NOUVEAUX ÉTATS pour les données réelles
    const [commentaires, setCommentaires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // États du Carrousel (index et durée inchangés)
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalReviews = commentaires.length;
    const reviewDuration = 5000; // 5 secondes pour le défilement automatique

    // 1. ⚙️ Logique de récupération des données de l'API
    useEffect(() => {
        const fetchCommentaires = async () => {
            setLoading(true);
            setError(null);
            try {
                // ⚠️ Appel à l'API backend
                const response = await fetch(API_COMMENTAIRES_URL);
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                const data = await response.json();
                
                // 📝 MAPPER les données de la DB aux données du carrousel
                // Note : J'ajoute une note de 5/5 par défaut car le schéma de commentaire ne contient pas de rating.
                // Vous pouvez ajuster cela si votre schéma de DB change.
                const mappedReviews = data.map((c, index) => ({
                    // L'ID est essentiel pour React (clé unique)
                    id: c._id || index, 
                    name: c.nom || 'Anonyme',
                    // J'ajoute un titre fictif pour le design car le schéma ne le fournit pas.
                    title: `Client Vérifié (Commentaire)`, 
                    rating: 5, // Note par défaut (à changer si la DB inclut un champ 'note')
                    text: c.commentaire || "Pas de commentaire.",
                }));

                setCommentaires(mappedReviews);
            } catch (err) {
                console.error("Échec de la récupération des commentaires :", err);
                setError("Impossible de charger les avis. Vérifiez l'API et le statut Approuvé.");
            } finally {
                setLoading(false);
            }
        };

        fetchCommentaires();
    }, []);

    // 2. 🔄 Défilement automatique
    useEffect(() => {
        if (commentaires.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % commentaires.length);
        }, reviewDuration);

        return () => clearInterval(interval);
    }, [commentaires.length]); // Dépend de la longueur des commentaires

    // 3. ⬅️ Déplacement manuel vers l'arrière
    const prevReview = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + totalReviews) % totalReviews);
    };

    // 4. ➡️ Déplacement manuel vers l'avant
    const nextReview = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalReviews);
    };

    // Calcul de la valeur de transformation (Translate X)
    const transformValue = `translateX(-${currentIndex * 100}%)`;

    // 5. Affichage du statut de chargement/erreur
    if (loading) {
        return (
            <section className="reviews-section-white" style={{ textAlign: 'center', padding: '100px 0' }}>
                <h2 className="reviews-title">Chargement des avis...</h2>
                <FaStar className="star active spinner" style={{ animation: 'spin 2s linear infinite' }} />
            </section>
        );
    }

    if (error) {
        return (
            <section className="reviews-section-white" style={{ textAlign: 'center', padding: '50px 0', color: 'red' }}>
                <h2 className="reviews-title">⚠️ Erreur de chargement des avis.</h2>
                <p>{error}</p>
            </section>
        );
    }
    
    if (commentaires.length === 0) {
        return (
            <section className="reviews-section-white" style={{ textAlign: 'center', padding: '50px 0' }}>
                <h2 className="reviews-title">Aucun Avis Client Disponible.</h2>
                <p>Soyez le premier à laisser un commentaire après votre achat !</p>
            </section>
        );
    }

    // 6. Rendu du Carrousel avec les données réelles
    return (
        <section className="reviews-section-white">
            <h2 className="reviews-title">Que disent nos clients ?</h2>
            <p className="reviews-subtitle">Avis fiables de la communauté</p>

            <div className="carousel-container-wrapper">
                
                {/* ⬅️ Bouton de contrôle Précédent */}
                <button className="carousel-control prev" onClick={prevReview} aria-label="Afficher la revue précédente">
                    <FaChevronLeft />
                </button>

                {/* ➡️ Bouton de contrôle Suivant */}
                <button className="carousel-control next" onClick={nextReview} aria-label="Afficher la revue suivante">
                    <FaChevronRight />
                </button>

                {/* Conteneur du carrousel qui se déplace */}
                <div className="reviews-carousel-track" style={{ transform: transformValue }}>
                    {commentaires.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                {/* 🎨 Utilisation du nouveau composant NameAvatar */}
                                <NameAvatar name={review.name} /> 
                                <div className="reviewer-info">
                                    <h3 className="reviewer-name">{review.name}</h3>
                            <RatingStars rating={review.rating} /> 
                                </div>
                            </div>
                            
                            {/* Les étoiles restent 5 car le rating n'est pas dans le schéma actuel */}
                            
                            <p className="review-text">
                                <FaQuoteRight className="quote-icon" />
                                {review.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🔘 Indicateurs de diapositives (points de contrôle) */}
            <div className="carousel-indicators">
                {commentaires.map((_, index) => (
                    <button
                        key={index}
                        className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Aller à la revue numéro ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}