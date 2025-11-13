// Leçons.jsx

import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa'; // FaPlayCircle is unused, removed for cleanup
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { useParams } from 'react-router-dom';
import axios from 'axios';
// Importez FaSpinner si vous l'utilisez, assurez-vous que l'animation 'spin' est définie dans votre CSS

export default function Leçons() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { leconTitle } = useParams();
    // 🔑 Décodage du titre de la catégorie pour l'utiliser dans la requête
    const actualTitle = decodeURIComponent(leconTitle); 

    const fetchVideos = async () => {
        setLoading(true);
        try {
            // Envoi de la requête avec le titre de la catégorie comme paramètre de requête
            const res = await axios.get('http://localhost:3000/api/specialized-videos', {
                params: { category: actualTitle }
            });
            setVideos(res.data);
            setError(null); // Réinitialiser l'erreur en cas de succès
        } catch (err) {
            console.error("Erreur de récupération des vidéos:", err);
            setError("Échec de la récupération des vidéos. Vérifiez la connexion au serveur et le titre de la catégorie.");
        } finally {
            setLoading(false);
        }
    };

    // 🔄 Le useEffect est correct : il se déclenche à l'initialisation et à chaque changement de catégorie
    useEffect(() => {
        fetchVideos();
    }, [actualTitle]); 

    // --- Rendu du Chargement / Erreur ---

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="lessons-section" style={{ textAlign: 'center', marginTop: '100px' }}>
                    <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                    <p>Chargement des Cours...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="lessons-section" style={{ textAlign: 'center', marginTop: '100px', color: 'red' }}>
                    <h2>{error}</h2>
                </div>
                <Footer />
            </>
        );
    }

    // --- Rendu des Leçons ---

    return (
        <>
            <Navbar />
            <br /><br /><br />
            <section className="lessons-section">
                <div className="lessons-header">
                    <h1 className="lessons-main-title">
                        Leçons pour <span className="lessons-accent-text">{actualTitle}</span>
                    </h1>
                    <p className="lessons-sub-text">
                        Accédez aux tutoriels détaillés pour maîtriser l'art de la couture.
                    </p>
                </div>

                <div className="lessons-grid-container">
                    {videos.length > 0 ? (
                        videos.map(video => (
                            <div key={video._id} className="lesson-card">
                                <div className="lesson-image-wrapper">
                                    <video
                                        controls
                                        // ✅ CORRECTION CONFIRMÉE : Pointage vers le chemin statique du fichier
                                        // Assurez-vous que video.url contient bien /uploads/videos/nomdufichier.mp4
                                        src={`http://localhost:3000${video.url}`} 
                                        className="uploaded-video-player"
                                        onContextMenu={(e) => e.preventDefault()}
                                        controlsList="nodownload"
                                    >
                                        Votre navigateur ne supporte pas la balise vidéo.
                                    </video>
                                </div>
                                <div className="lesson-content">
                                    <h3 className="lesson-title">{video.title}</h3>
                                    {video.description && <p>{video.description}</p>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0' }}>
                            Aucune vidéo disponible pour la catégorie **"{actualTitle}"**.
                        </p>
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
}