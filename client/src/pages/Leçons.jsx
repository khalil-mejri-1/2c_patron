import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner, FaPlay } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../apiConfig';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        loading: "جاري تحميل الدورات...",
        errorTitle: "فشل في تحميل الفيديوهات.",
        errorMsg: "فشل في استرداد الفيديوهات. يرجى التحقق من اتصال الخادم وعنوان الفئة.",
        lessonsTitle: (title) => `جميع دروس ${title}`,
        lessonsSubtitle: "اختر الدرس الذي ترغب بمشاهدته للبدء بالتعلم.",
        listTitle: "قائمة الدروس",
        noVideos: (title) => `لا يوجد فيديو متاح لفئة **"${title}"** في الوقت الحالي.`,
        certificateText: "بعد الانتهاء من جميع الدورات، يرجى الاتصال بالمسؤول للحصول على شهادتك:",
        whatsappNum: "26 123 456",
        free: "مجاني",
        stopVideo: "إيقاف الفيديو" // 🆕 تم إضافة هذا
    },
    fr: {
        loading: "Chargement des cours...",
        errorTitle: "Échec de la récupération des vidéos.",
        errorMsg: "Échec de la récupération des vidéos. Veuillez vérifier la connexion au serveur et le titre de la catégorie.",
        lessonsTitle: (title) => `Tous les cours pour ${title}`,
        lessonsSubtitle: "Sélectionnez le tutoriel que vous souhaitez regarder pour commencer à apprendre.",
        listTitle: "Liste des Leçons",
        noVideos: (title) => `Aucune vidéo disponible pour la catégorie **"${title}"** pour le moment.`,
        certificateText: "Après avoir terminé tous les cours, veuillez contacter l'administrateur pour recevoir votre certificat :",
        whatsappNum: "26 123 456",
        free: "GRATUIT",
        stopVideo: "Arrêter la vidéo" // 🆕 تم إضافة هذا
    },
    en: {
        loading: "Loading courses...",
        errorTitle: "Failed to retrieve videos.",
        errorMsg: "Failed to retrieve videos. Please check server connection and category title.",
        lessonsTitle: (title) => `All courses for ${title}`,
        lessonsSubtitle: "Select the tutorial you wish to watch to start learning.",
        listTitle: "Lessons List",
        noVideos: (title) => `No videos available for the category **"${title}"** at the moment.`,
        certificateText: "After completing all courses, please contact the administrator to receive your certificate:",
        whatsappNum: "26 123 456",
        free: "FREE",
        stopVideo: "Stop Video" // 🆕 تم إضافة هذا
    }
};

// --- دالة مساعدة للحصول على مصدر الفيديو (تم تعديلها لإزالة autoplay) ---
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

    return { type: 'direct-video', src: `${BASE_URL}${url}` };
};

// --- دالة استخراج الصورة المصغرة (Thumbnail) (تم الإبقاء عليها للكمال) ---
const getThumbnailUrl = (url, fallbackTitle, appLanguage) => {
    const fallbackBaseText = appLanguage === 'ar' ? 'تشغيل الدرس' :
        appLanguage === 'fr' ? 'Lancer la Leçon' :
            'Play Lesson';

    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const matchYoutube = url?.match(youtubeRegex);

    if (matchYoutube) {
        const videoId = matchYoutube[1];
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    const streamableRegex = /streamable\.com\/([a-zA-Z0-9]+)/;
    if (url?.match(streamableRegex)) {
        const encodedText = encodeURIComponent(`${fallbackBaseText} | Streamable`);
        return `https://via.placeholder.com/280x157/3498db/1e1e1e?text=${encodedText}`;
    }

    const encodedText = encodeURIComponent(`${fallbackBaseText} | ${fallbackTitle.substring(0, 15)}...`);
    return `https://via.placeholder.com/280x157/34495e/1e1e1e?text=${encodedText}`;
};

// --- المكون المُعدَّل: بطاقة الفيديو (Video Card) ---
const VideoCard = ({ video, isActive, onClick, direction, lang }) => {

    const statusClass = video.isVip ? 'vip' : 'free';
    const statusText = video.isVip ? 'VIP' : lang.free;
    const videoConfig = getVideoSource(video.url);

    const isPlaying = isActive;

    // دالة للتبديل بين حالتي التشغيل والإيقاف
    const handleTogglePlay = (e) => {
        if (e) e.stopPropagation();
        // تمرير ID لتشغيل الفيديو، أو null لإيقافه
        onClick(isPlaying ? null : video._id);
    };

    // رابط المشغل: نضيف 'autoplay=1' فقط إذا كان نشطاً
    const iframeSrc = videoConfig.src + (videoConfig.src.includes('?') ? '&' : '?') +
        (isPlaying ? 'autoplay=1' : 'autoplay=0');

    return (
        // is-playing يحدد ما إذا كانت الأيقونة مرئية أم لا
        <div
            className={`video-card-item ${isPlaying ? 'is-playing' : ''}`}
            // النقر على البطاقة بالكامل يبدأ التشغيل
            onClick={!isPlaying ? handleTogglePlay : undefined}
            dir={direction}
        >
            <div className="video-thumbnail-container">

                {/* 1. المشغل (يغطي الحاوية بالكامل) */}
                <div className="video-player-embed">
                    {videoConfig.type === 'direct-video' ? (
                        <video
                            controls
                            autoPlay={isPlaying}
                            src={videoConfig.src}
                            key={video._id}
                            controlsList="nodownload"
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    ) : (
                        <iframe
                            title={video.title}
                            src={iframeSrc}
                            key={video._id}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            // نمنع التفاعل مع المشغل المتوقف
                            style={{ pointerEvents: isPlaying ? 'auto' : 'none' }}
                        ></iframe>
                    )}
                </div>

                {/* 2. أيقونة التشغيل (طبقة علوية تظهر فقط عند التوقف) */}
                <div className="play-icon" onMouseDown={handleTogglePlay}>
                    <FaPlay />
                </div>

                {/* 3. تفاصيل المحتوى (طبقة علوية شفافة) */}


            </div>
        </div>
    );
};
// --------------------------------------------------


// --- المكون الرئيسي: Leçons ---
export default function Leçons() {
    const [appLanguage, setAppLanguage] = useState('fr');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeVideoId, setActiveVideoId] = useState(null);

    const { leconTitle } = useParams();
    const actualTitle = decodeURIComponent(leconTitle);

    // إعدادات اللغة
    useEffect(() => {
        const lang = localStorage.getItem('appLanguage') || 'fr';
        setAppLanguage(lang);
    }, []);

    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    // جلب الفيديوهات
    const fetchVideos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/api/specialized-videos`, {
                params: { category: actualTitle }
            });

            const videosWithDetails = res.data.map((video, index) => {
                const isVip = index % 3 === 0;
                const description = video.description || t.lessonsSubtitle;

                const thumbnail = getThumbnailUrl(video.url, video.title, appLanguage);

                return {
                    ...video,
                    isVip,
                    description,
                    thumbnail
                };
            });

            setVideos(videosWithDetails);
            setError(null);
        } catch (err) {
            console.error("Erreur lors من جلب الفيديوهات:", err);
            setError(t.errorMsg);
        } finally {
            setLoading(false);
        }
    }, [actualTitle, t.lessonsSubtitle, t.errorMsg, appLanguage]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);


    // دالة النقر على الفيديو (تغير حالة الفيديو النشط)
    const handleVideoClick = (videoId) => {
        setActiveVideoId(videoId);
    };


    // --- شاشات التحميل/الخطأ/الفيديوهات الفارغة ---
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="lessons-section" style={{ textAlign: 'center', marginTop: '100px', backgroundColor: 'transparent' }} dir={direction}>
                    <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite', textAlign: "center", margin: "auto", fontSize: '2rem', color: '#D4AF37' }} />
                    <p style={{ marginTop: '15px', color: '#ecf0f1' }}>{t.loading}</p>
                </div>
            </>
        );
    }

    if (error || videos.length === 0) {
        return (
            <>
                <Navbar />
                <section className="lessons-section" dir={direction}>
                    <div className="lessons-header">
                        <h1 className="lessons-main-title">{t.lessonsTitle(actualTitle)}</h1>
                    </div>
                    <p style={{ textAlign: 'center', padding: '50px 0', fontSize: '1.1rem', color: '#95a5a6' }}>
                        {error ? t.errorTitle + ': ' + error : t.noVideos(actualTitle)}
                    </p>
                </section>
                <Footer />
            </>
        );
    }

    // --- عرض الشبكة (Grid View) ---
    return (
        <>
            <Navbar />
            <br /><br />    <br /><br />    <br /><br />
            <section className="lessons-section" dir={direction}>
                <div className="lessons-header">
                    <h1 className="lessons-main-title">
                        <span className="lessons-accent-text">{t.lessonsTitle(actualTitle)}</span>
                    </h1>
                    <p className="lessons-sub-text">{t.lessonsSubtitle}</p>
                </div>

                {/* 🌟 شبكة عرض جميع الفيديوهات 🌟 */}
                <div className="videos-grid-wrapper">
                    {videos.map(video => (
                        <VideoCard
                            key={video._id}
                            video={video}
                            onClick={handleVideoClick}
                            isActive={activeVideoId === video._id}
                            direction={direction}
                            lang={t}
                        />
                    ))}
                </div>

                {/* 🔽 فقرة الشهادة */}
                <div className="certificate-box">
                    <p className="certificate-text">
                        {t.certificateText}
                    </p>
                    <p className="certificate-whatsapp">
                        WhatsApp : <strong dir="ltr">{t.whatsappNum}</strong>
                    </p>
                </div>

            </section>

            <Footer />
        </>
    );
}

