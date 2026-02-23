import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaSpinner, FaPlay, FaCertificate, FaWhatsapp, FaPlayCircle, FaEdit, FaSave, FaTimes, FaImage } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../apiConfig';
import './lessons_premium.css';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        loading: "جاري تحميل محتوى الدورة...",
        errorTitle: "تعذر تحميل الدروس",
        errorMsg: "حدث خطأ أثناء استخراج الفيديوهات. يرجى التأكد من استقرار الخادم.",
        lessonsTitle: (title) => `دروس ${title}`,
        lessonsTitle: (title) => `دروس ${title}`,
        listTitle: "المنهج التعليمي",
        noVideos: (title) => `لا تتوفر فيديوهات حالياً لهذه الفئة: "${title}".`,
        certificateTitle: "احصل على شهادتك المعتمدة",
        certificateText: "بمجرد إكمال المنهج بالكامل، يمكنك الحصول على شهادة معتمدة من مشغل صفاقس تعزز ملفك المهني.",
        whatsappNum: "26 123 456",
        whatsappBtn: "اطلب شهادتك الآن",
        free: "مجاني",
        badge: "دورة تعليمية",
        playing: "قيد المشاهدة"
    },
    fr: {
        loading: "Chargement du contenu...",
        errorTitle: "Échec du chargement.",
        errorMsg: "Impossible de récupérer les vidéos. Veuillez vérifier votre connexion.",
        lessonsTitle: (title) => `Leçons de ${title}`,
        lessonsTitle: (title) => `Leçons de ${title}`,
        listTitle: "Programme des cours",
        noVideos: (title) => `Aucune vidéo disponible pour la catégorie "${title}" pour le moment.`,
        certificateTitle: "Obtenez votre Certificat",
        certificateText: "Après avoir complété tout le cursus, vous êtes éligible pour recevoir un certificat de complétion officiel de l'Atelier Sfax.",
        whatsappNum: "26 123 456",
        whatsappBtn: "Demander mon certificat",
        free: "GRATUIT",
        badge: "FORMATION VIP",
        playing: "LECTURE EN COURS"
    },
    en: {
        loading: "Loading content...",
        errorTitle: "Loading failed.",
        errorMsg: "Failed to retrieve videos. Please check server connection.",
        lessonsTitle: (title) => `${title} Lessons`,
        lessonsTitle: (title) => `${title} Lessons`,
        listTitle: "Lesson Curriculum",
        noVideos: (title) => `No videos available for category "${title}" at the moment.`,
        certificateTitle: "Get Your Certification",
        certificateText: "Upon completing the entire curriculum, you are eligible to receive an official Certificate of Completion from Atelier Sfax.",
        whatsappNum: "26 123 456",
        whatsappBtn: "Request Certificate",
        free: "FREE",
        badge: "VIP PROGRAM",
        playing: "NOW PLAYING"
    }
};

const getVideoSource = (url) => {
    if (!url) return { type: 'direct-video', src: '' };
    const streamableRegex = /streamable\.com\/([a-zA-Z0-9]+)/;
    const matchStreamable = url.match(streamableRegex);
    if (matchStreamable) {
        return { type: 'iframe', src: `https://streamable.com/e/${matchStreamable[1]}` };
    }
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const matchYoutube = url.match(youtubeRegex);
    if (matchYoutube) {
        return { type: 'iframe', src: `https://www.youtube.com/embed/${matchYoutube[1]}` };
    }
    if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg")) {
        return { type: 'direct-video', src: url };
    }
    return { type: 'iframe', src: url.startsWith("http") ? url : `${BASE_URL}${url}` };
};

const getThumbnailUrl = (url, fallbackTitle) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const matchYoutube = url?.match(youtubeRegex);
    if (matchYoutube) return `https://img.youtube.com/vi/${matchYoutube[1]}/hqdefault.jpg`;
    return `https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop`;
};

const LessonCard = ({ video, isActive, onSelect, lang }) => {
    return (
        <div
            className={`lesson-card-item-premium ${isActive ? 'is-active' : ''}`}
            onClick={() => onSelect(video)}
        >
            <div className="l-card-preview-box">
                <img src={video.thumbnail} alt={video.title} className="l-card-preview-img" />
                <div className="l-play-overlay">
                    <div className="l-play-btn-circle">
                        {isActive ? <FaPlayCircle /> : <FaPlay />}
                    </div>
                </div>
            </div>
            <div className="l-card-details">
                <h3 className="l-card-title-text">{video.title}</h3>
                <div className="l-card-meta-bar">
                    <span className="l-meta-tag">{isActive ? lang.playing : (video.isVip ? 'VIP' : lang.free)}</span>
                    <span className="l-meta-duration"><FaPlayCircle size={14} style={{ marginRight: '5px' }} /> 24/7 Access</span>
                </div>
            </div>
        </div>
    );
};

export default function Lessons() {
    const [appLanguage, setAppLanguage] = useState('fr');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditingBg, setIsEditingBg] = useState(false);
    const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=2070&auto=format&fit=crop');
    const [newBgUrl, setNewBgUrl] = useState('');
    const topRef = useRef(null);

    const { leconTitle } = useParams();
    const actualTitle = decodeURIComponent(leconTitle);

    useEffect(() => {
        const lang = localStorage.getItem('appLanguage') || 'fr';
        setAppLanguage(lang);

        // Check Admin
        const email = localStorage.getItem('loggedInUserEmail') || localStorage.getItem('currentUserEmail') || null;
        if (email) {
            if (email === 'admin@admin.com') {
                setIsAdmin(true);
            } else {
                fetch(`${BASE_URL}/api/users/${email}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.statut === 'admin') setIsAdmin(true);
                    })
                    .catch(() => { });
            }
        }

        // Load Background
        fetch(`${BASE_URL}/api/settings/lecons-page-bg`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setBgImage(data);
            })
            .catch(() => { });
    }, [actualTitle]);

    const handleSaveBg = async () => {
        setBgImage(newBgUrl);
        setIsEditingBg(false);
        try {
            await fetch(`${BASE_URL}/api/settings/lecons-page-bg`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: newBgUrl })
            });
        } catch (err) { }
    };

    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    const fetchVideos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/api/specialized-videos`, {
                params: { category: actualTitle }
            });
            const preparedVideos = res.data.map((v, i) => ({
                ...v,
                isVip: i % 3 === 0,
                thumbnail: getThumbnailUrl(v.url, v.title, appLanguage)
            }));
            setVideos(preparedVideos);
            if (preparedVideos.length > 0) setCurrentVideo(preparedVideos[0]);
            setError(null);
        } catch (err) {
            setError(t.errorMsg);
        } finally {
            setLoading(false);
        }
    }, [actualTitle, t.errorMsg, appLanguage]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const handleSelectVideo = (video) => {
        setCurrentVideo(video);
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    if (loading) return (
        <div className="lessons-premium-wrapper">
            <Navbar />
            <div style={{ textAlign: 'center', padding: '160px 0' }}>
                <FaSpinner className="spinner" size={60} color="#D4AF37" style={{ animation: 'spin 1.5s linear infinite' }} />
                <p style={{ marginTop: '20px', color: '#64748b', fontSize: '1.2rem' }}>{t.loading}</p>
            </div>
        </div>
    );

    return (
        <div className="lessons-premium-wrapper" dir={direction} style={{
            background: `linear-gradient(rgba(252, 252, 253, 0.96), rgba(252, 252, 253, 0.98)), url('${bgImage}') center/cover fixed`
        }}>
            <Navbar />


            <header
                className="lessons-hero-header"
                style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.4)), url('${bgImage}')`
                }}
            >
                <div className="lessons-hero-overlay"></div>
                {isAdmin && (
                    <button
                        className="edit-btn-minimal-lux"
                        style={{
                            position: 'absolute',
                            top: '120px',
                            right: '40px',
                            zIndex: 200,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        onClick={() => { setIsEditingBg(true); setNewBgUrl(bgImage); }}
                    >
                        <FaImage /> {appLanguage === 'ar' ? 'تغيير الخلفية' : 'Changer Fond'}
                    </button>


                )}

                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="lesson-badge-glam">{t.badge}</div>
                    <h1 className="lessons-main-title-premium">
                        {appLanguage === 'ar' ? (
                            <>دروس <span>{actualTitle}</span></>
                        ) : appLanguage === 'en' ? (
                            <><span>{actualTitle}</span> Lessons</>
                        ) : (
                            <>Leçons de <span>{actualTitle}</span></>
                        )}
                    </h1>
                </div>
            </header>

            <main className="lessons-explorer-container">
                {/* --- ACTIVE FOCUS PLAYER --- */}
                {currentVideo && (
                    <div className="active-focus-cinema" ref={topRef}>
                        {(() => {
                            const config = getVideoSource(currentVideo.url);
                            if (config.type === 'direct-video') {
                                return <video controls autoPlay src={config.src} key={currentVideo._id} controlsList="nodownload" />;
                            }
                            return (
                                <iframe
                                    src={`${config.src}?autoplay=1`}
                                    title={currentVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    key={currentVideo._id}
                                />
                            );
                        })()}
                    </div>
                )}

                {/* --- LESSONS LIST --- */}
                <div className="curriculum-section-header">
                    <h2>{t.listTitle}</h2>
                    <div className="curriculum-line"></div>
                </div>

                <div className="lessons-selection-grid">
                    {videos.map(video => (
                        <LessonCard
                            key={video._id}
                            video={video}
                            isActive={currentVideo?._id === video._id}
                            onSelect={handleSelectVideo}
                            lang={t}
                        />
                    ))}
                </div>

                {/* --- CERTIFICATE SECTION --- */}
                <section className="lessons-certificate-box-lux">
                    <FaCertificate className="cert-icon-glamor" />
                    <h2 className="cert-title-lux">{t.certificateTitle}</h2>
                    <p className="cert-desc-lux">{t.certificateText}</p>
                    <a href={`https://wa.me/${t.whatsappNum.replace(/\s/g, '')}`} className="cert-whatsapp-btn" target="_blank" rel="noopener noreferrer">
                        <FaWhatsapp size={22} />
                        <span>{t.whatsappBtn}</span>
                    </a>
                </section>
            </main>

            {isEditingBg && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditingBg(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingBg(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">Changer l'image de fond</h2>
                        <div className="premium-form-group" style={{ marginBottom: '20px' }}>
                            <label>URL de l'image</label>
                            <input
                                type="text"
                                value={newBgUrl}
                                onChange={(e) => setNewBgUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="premium-btn-group">
                            <button className="premium-btn-cta secondary" onClick={() => setIsEditingBg(false)}>Annuler</button>
                            <button className="premium-btn-cta gold" onClick={handleSaveBg}><FaSave /> Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
