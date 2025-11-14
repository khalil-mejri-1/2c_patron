import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        loading: "جاري تحميل الدورات...",
        errorTitle: "فشل في تحميل الفيديوهات.",
        errorMsg: "فشل في استرداد الفيديوهات. يرجى التحقق من اتصال الخادم وعنوان الفئة.",
        lessonsTitle: (title) => `دروس لـ ${title}`,
        lessonsSubtitle: "الوصول إلى الدروس التفصيلية لإتقان فن الخياطة.",
        selectLesson: "حدد درسًا من القائمة.",
        listTitle: "قائمة الدروس",
        noVideos: (title) => `لا يوجد فيديو متاح لفئة **"${title}"** في الوقت الحالي.`,
        certificateText: "بعد الانتهاء من جميع الدورات، يرجى الاتصال بالمسؤول للحصول على شهادتك:",
        whatsappNum: "26 123 456"
    },
    fr: {
        loading: "Chargement des cours...",
        errorTitle: "Échec de la récupération des vidéos.",
        errorMsg: "Échec de la récupération des vidéos. Veuillez vérifier la connexion au serveur et le titre de la catégorie.",
        lessonsTitle: (title) => `Leçons pour ${title}`,
        lessonsSubtitle: "Accédez aux tutoriels détaillés pour maîtriser l'art de la couture.",
        selectLesson: "Sélectionnez une leçon dans la liste.",
        listTitle: "Liste des Leçons",
        noVideos: (title) => `Aucune vidéo disponible pour la catégorie **"${title}"** pour le moment.`,
        certificateText: "Après avoir terminé tous les cours, veuillez contacter l'administrateur pour recevoir votre certificat :",
        whatsappNum: "26 123 456"
    },
    en: {
        loading: "Loading courses...",
        errorTitle: "Failed to retrieve videos.",
        errorMsg: "Failed to retrieve videos. Please check server connection and category title.",
        lessonsTitle: (title) => `Lessons for ${title}`,
        lessonsSubtitle: "Access detailed tutorials to master the art of sewing.",
        selectLesson: "Select a lesson from the list.",
        listTitle: "Lessons List",
        noVideos: (title) => `No videos available for the category **"${title}"** at the moment.`,
        certificateText: "After completing all courses, please contact the administrator to receive your certificate:",
        whatsappNum: "26 123 456"
    }
};

// --- Fonction Utilitaire pour l'Affichage Vidéo (Inchangée) ---
const getVideoSource = (url) => {
    if (!url) return { type: 'direct-video', src: '' };

    const streamableRegex = /streamable\.com\/([a-zA-Z0-9]+)/;
    const matchStreamable = url.match(streamableRegex);

    if (matchStreamable) {
        const videoId = matchStreamable[1];
        return {
            type: 'iframe', 
            src: `https://streamable.com/e/${videoId}`
        };
    }

    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const matchYoutube = url.match(youtubeRegex);

    if (matchYoutube) {
        const videoId = matchYoutube[1];
        return {
            type: 'iframe',
            src: `https://www.youtube.com/embed/${videoId}`
        };
    }

    if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg")) {
        return { type: 'direct-video', src: url };
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return { type: 'iframe', src: url };
    }

    return { type: 'direct-video', src: `http://localhost:3000${url}` };
};


// --- Composant Principal ---
export default function Leçons() {
    const [appLanguage, setAppLanguage] = useState('fr'); 
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentVideo, setCurrentVideo] = useState(null);

    const { leconTitle } = useParams();
    const actualTitle = decodeURIComponent(leconTitle);
    
    // 1. ⚙️ جلب اللغة من LocalStorage
    useEffect(() => {
        const lang = localStorage.getItem('appLanguage') || 'fr';
        setAppLanguage(lang);
    }, []);
    
    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    const fetchVideos = async () => {
        setLoading(true);
        try {
            // Note: using hardcoded port 3000, ensure it's correct for your dev environment
            const res = await axios.get('http://localhost:3000/api/specialized-videos', {
                params: { category: actualTitle }
            });

            const videosWithVipStatus = res.data.map((video, index) => ({
                ...video,
                isVip: index % 3 === 0
            }));

            setVideos(videosWithVipStatus);

            if (videosWithVipStatus.length > 0) {
                setCurrentVideo(videosWithVipStatus[0]);
            }

            setError(null);
        } catch (err) {
            console.error("Erreur lors de la récupération des vidéos:", err);
            setError(t.errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [actualTitle, t.errorMsg]); // إضافة ت.كمعتماد

    useEffect(() => {
        if (!currentVideo && videos.length > 0) {
            setCurrentVideo(videos[0]);
        }
    }, [videos, currentVideo]);


    // Rendu du Chargement / Erreur (محدث باللغات)
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="lessons-section" style={{ textAlign: 'center', marginTop: '100px' }} dir={direction}>
                    <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite', textAlign: "center", margin: "auto", fontSize: '2rem', color: '#D4AF37' }} />
                    <p style={{ marginTop: '15px', color: '#2c3e50' }}>{t.loading}</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="lessons-section" style={{ textAlign: 'center', marginTop: '100px', color: '#c0392b' }} dir={direction}>
                    <h2>{t.errorTitle}</h2>
                    <p>{error}</p>
                </div>
                <Footer />
            </>
        );
    }

    // Cas où il n'y a pas de vidéos après le chargement (محدث باللغات)
    if (videos.length === 0) {
        return (
            <>
                <Navbar />

                <section className="lessons-section" dir={direction}>

                    <div className="lessons-header">
                        <h1 className="lessons-main-title">{t.lessonsTitle(actualTitle)}</h1>
                        <p className="lessons-sub-text">{t.lessonsSubtitle}</p>
                    </div>
                    <p style={{ textAlign: 'center', padding: '50px 0', fontSize: '1.1rem', color: '#7f8c8d' }}>
                        {t.noVideos(actualTitle)}
                    </p>
                </section>
                <Footer />
            </>
        );
    }

    // --- Rendu du Nouveau Layout de Streaming (محدث باللغات) ---
    const currentVideoConfig = currentVideo ? getVideoSource(currentVideo.url) : { type: 'direct-video', src: '' };

    return (
        <>
            <Navbar />
            <br /><br /> 	<br /><br /> 	<br /><br />
            <section className="lessons-section" dir={direction}>
                <div className="lessons-header">
                    <h1 className="lessons-main-title">
                        <span className="lessons-accent-text">{t.lessonsTitle(actualTitle)}</span>
                    </h1>
                </div>

                <div className="main-content-wrapper">

                    {/* Colonne 1 : Lecteur Vidéo Principal */}
                    <div className="main-video-area">
                        {currentVideo ? (
                            <>
                                <div className="main-video-player">
                                    {currentVideoConfig.type === 'direct-video' ? (
                                        <video
                                            controls
                                            src={currentVideoConfig.src}
                                            key={currentVideo._id}
                                            controlsList="nodownload"
                                            onContextMenu={(e) => e.preventDefault()}
                                        />
                                    ) : (
                                        <iframe
                                            title={currentVideo.title}
                                            src={currentVideoConfig.src}
                                            key={currentVideo._id}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#FFF', padding: '50px' }}>{t.selectLesson}</p>
                        )}
                    </div>


                <div className="lessons-list-sidebar">
                    <div className="sidebar-title">
                        {t.listTitle}
                    </div>

                    <div className="lessons-list">
                        {videos.map(video => (
                            <div
                                key={video._id}
                                className={`lesson-item ${currentVideo && currentVideo._id === video._id ? 'active' : ''}`}
                                onClick={() => setCurrentVideo(video)}
                            >
                                <span className="lesson-title-list">{video.title}</span>
                            </div>
                        ))}
                    </div>

                    {/* 🔽 فقرة الشهادة (محدثة باللغات) */}
                    <div className="certificate-box">
                        <p className="certificate-text">
                            {t.certificateText}
                        </p>

                        <p className="certificate-whatsapp">
                            WhatsApp : <strong dir="ltr">{t.whatsappNum}</strong>
                        </p>
                    </div>
                </div>

                </div>
            </section>
            <Footer />
        </>
    );
}