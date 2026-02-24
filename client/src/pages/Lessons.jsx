import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlay, FaPlayCircle, FaCheckCircle, FaEdit, FaImage, FaTimes, FaWhatsapp, FaCertificate, FaArrowRight, FaLock, FaSpinner } from 'react-icons/fa';
import '../pages/lessons_premium.css';
import '../comp/PremiumSkeleton.css';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../apiConfig';
import { useLanguage } from '../context/LanguageContext';
import { useAlert } from '../context/AlertContext';
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
        playing: "قيد المشاهدة",
        cancel: "إلغاء",
        save: "حفظ"
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
        playing: "LECTURE EN COURS",
        cancel: "Annuler",
        save: "Enregistrer"
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
        playing: "NOW PLAYING",
        cancel: "Cancel",
        save: "Save"
    }
};

const getVideoSource = (url) => {
    if (!url) return { type: 'direct-video', src: '' };

    // Normalize relative paths to absolute backend URLs
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

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

    if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg") || url.startsWith("/uploads")) {
        return { type: 'direct-video', src: fullUrl };
    }

    return { type: 'iframe', src: fullUrl };
};

const getThumbnailUrl = (url, fallbackTitle) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const matchYoutube = url?.match(youtubeRegex);
    if (matchYoutube) return `https://img.youtube.com/vi/${matchYoutube[1]}/hqdefault.jpg`;
    return `https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop`;
};

const LessonCard = ({ video, isActive, onSelect, lang, isAdmin, onEdit, appLanguage }) => {
    return (
        <div
            className={`lesson-card-item-premium ${isActive ? 'is-active' : ''}`}
            onClick={() => onSelect(video)}
            style={{ position: 'relative' }}
        >
            {isAdmin && (
                <button
                    className="edit-btn-minimal-lux"
                    style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 5, padding: '5px' }}
                    onClick={(e) => { e.stopPropagation(); onEdit(video); }}
                >
                    <FaEdit size={12} />
                </button>
            )}
            <div className="l-card-preview-box">
                <img src={video.thumbnail} alt={video.title_lang?.[appLanguage] || video.title} className="l-card-preview-img" />
                <div className="l-play-overlay">
                    <div className="l-play-btn-circle">
                        {isActive ? <FaPlayCircle /> : <FaPlay />}
                    </div>
                </div>
            </div>
            <div className="l-card-details">
                <h3 className="l-card-title-text">{video.title_lang?.[appLanguage] || video.title}</h3>
                <div className="l-card-meta-bar">
                    {(isActive || video.status_lang?.[appLanguage] || video.isVip) && (
                        <span className="l-meta-tag">
                            {isActive ? lang.playing : (video.status_lang?.[appLanguage] || (video.isVip ? 'VIP' : ''))}
                        </span>
                    )}
                    <span className="l-meta-duration"><FaPlayCircle size={14} style={{ marginRight: '5px' }} /> 24/7 Access</span>
                </div>
            </div>
        </div>
    );
};

export default function Lessons() {
    const { appLanguage } = useLanguage();
    const { showAlert } = useAlert();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Hero Management
    const [isEditingHero, setIsEditingHero] = useState(false);
    const [heroContent, setHeroContent] = useState({});
    const [editHeroContent, setEditHeroContent] = useState({});
    const [heroBg, setHeroBg] = useState("");
    const [courseInfo, setCourseInfo] = useState(null);
    const [groupId, setGroupId] = useState(null);

    // Curriculum & Certificate Settings
    const [curriculumInfo, setCurriculumInfo] = useState({});
    const [certInfo, setCertInfo] = useState({});
    const [isEditingCurriculum, setIsEditingCurriculum] = useState(false);
    const [isEditingCert, setIsEditingCert] = useState(false);
    const [editCurriculumData, setEditCurriculumData] = useState({});
    const [editCertData, setEditCertData] = useState({});

    // Individual Video Editing
    const [isEditingVideo, setIsEditingVideo] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [editVideoContent, setEditVideoContent] = useState({});
    const [editVideoUrl, setEditVideoUrl] = useState("");
    const [editSelectedFile, setEditSelectedFile] = useState(null);
    const [editSelectedLangFiles, setEditSelectedLangFiles] = useState({});

    // Add New Video
    const [isAddingVideo, setIsAddingVideo] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedLangFiles, setSelectedLangFiles] = useState({});
    const [newVideoData, setNewVideoData] = useState({
        url: '',
        title: '',
        title_lang: { fr: '', ar: '', en: '' },
        status_lang: { fr: '', ar: '', en: '' },
        url_lang: { fr: '', ar: '', en: '' }
    });

    const topRef = useRef(null);

    const { leconTitle } = useParams();
    const actualTitle = decodeURIComponent(leconTitle);

    const languages = [
        { code: 'fr', label: 'FR' },
        { code: 'ar', label: 'AR' },
        { code: 'en', label: 'EN' }
    ];

    const fetchSiteSettings = useCallback(async () => {
        try {
            const currRes = await axios.get(`${BASE_URL}/api/settings/curriculum-info`);
            if (currRes.data) setCurriculumInfo(currRes.data);

            const certRes = await axios.get(`${BASE_URL}/api/settings/certificate-info`);
            if (certRes.data) setCertInfo(certRes.data);
        } catch (e) { console.error("Error fetching site settings", e); }
    }, []);

    const fetchCourseInfo = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/specialized-courses`);
            // Find the group and specific course item
            let foundCourse = null;
            let foundGroupId = null;

            for (const group of res.data) {
                const item = group.courses.find(c => c.title === actualTitle);
                if (item) {
                    foundCourse = item;
                    foundGroupId = group._id;
                    break;
                }
            }

            if (foundCourse) {
                setCourseInfo(foundCourse);
                setGroupId(foundGroupId);
                setHeroContent(foundCourse.hero_content || {});
                setHeroBg(foundCourse.hero_bg || foundCourse.image || "");
            }
        } catch (e) { console.error("Error fetching course info", e); }
    }, [actualTitle]);

    useEffect(() => {
        // Check Admin
        const email = localStorage.getItem('loggedInUserEmail') || localStorage.getItem('currentUserEmail') || null;
        if (email) {
            fetch(`${BASE_URL}/api/users/${email}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.statut === 'admin') setIsAdmin(true);
                })
                .catch(() => { });
        }

        fetchCourseInfo();
        fetchSiteSettings();
    }, [actualTitle, fetchCourseInfo, fetchSiteSettings]);

    const handleSaveHero = async () => {
        if (!groupId || !courseInfo) return;

        try {
            // Fetch latest group data to ensure consistency
            const groupRes = await axios.get(`${BASE_URL}/api/specialized-courses/${groupId}`);
            const groupData = groupRes.data;

            const updatedCourses = groupData.courses.map(c => {
                if (c.title === actualTitle) {
                    return {
                        ...c,
                        hero_content: editHeroContent,
                        hero_bg: editHeroContent[appLanguage]?.bg || heroBg
                    };
                }
                return c;
            });

            await axios.put(`${BASE_URL}/api/specialized-courses/${groupId}`, {
                courses: updatedCourses
            });

            setHeroContent(editHeroContent);
            setHeroBg(editHeroContent[appLanguage]?.bg || heroBg);
            setIsEditingHero(false);
            showAlert('success', 'Success', 'Hero updated successfully');
        } catch (err) {
            showAlert('error', 'Error', 'Failed to update hero');
        }
    };

    const handleSaveCurriculum = async () => {
        try {
            await axios.put(`${BASE_URL}/api/settings/curriculum-info`, { value: editCurriculumData });
            setCurriculumInfo(editCurriculumData);
            setIsEditingCurriculum(false);
            showAlert('success', 'Success', 'Curriculum updated');
        } catch (e) { showAlert('error', 'Error', 'Save failed'); }
    };

    const handleSaveCert = async () => {
        try {
            await axios.put(`${BASE_URL}/api/settings/certificate-info`, { value: editCertData });
            setCertInfo(editCertData);
            setIsEditingCert(false);
            showAlert('success', 'Success', 'Certificate updated');
        } catch (e) { showAlert('error', 'Error', 'Save failed'); }
    };

    const handleEditVideo = (video) => {
        setEditingVideo(video);
        setEditVideoUrl(video.url || "");
        setEditSelectedFile(null);
        setEditSelectedLangFiles({});
        const init = {};
        languages.forEach(l => {
            init[l.code] = {
                title: video.title_lang?.[l.code] || video.title || "",
                status: video.status_lang?.[l.code] || (video.isVip ? "VIP" : "FREE"),
                url: video.url_lang?.[l.code] || ""
            };
        });
        setEditVideoContent(init);
        setIsEditingVideo(true);
    };

    const handleSaveVideo = async () => {
        if (!editingVideo) return;
        try {
            const formData = new FormData();
            formData.append('title', editVideoContent.fr?.title || editingVideo.title);
            formData.append('category', editingVideo.category);
            formData.append('videoUrl', editVideoUrl);
            formData.append('title_lang', JSON.stringify({
                fr: editVideoContent.fr?.title,
                ar: editVideoContent.ar?.title,
                en: editVideoContent.en?.title
            }));
            formData.append('status_lang', JSON.stringify({
                fr: editVideoContent.fr?.status,
                ar: editVideoContent.ar?.status,
                en: editVideoContent.en?.status
            }));
            formData.append('status_lang', JSON.stringify({
                fr: editVideoContent.fr?.status,
                ar: editVideoContent.ar?.status,
                en: editVideoContent.en?.status
            }));
            formData.append('url_lang', JSON.stringify({
                fr: editVideoContent.fr?.url,
                ar: editVideoContent.ar?.url,
                en: editVideoContent.en?.url
            }));

            if (editSelectedFile) formData.append('video', editSelectedFile);

            // Append language specific files
            Object.keys(editSelectedLangFiles).forEach(lang => {
                formData.append(`video_${lang}`, editSelectedLangFiles[lang]);
            });

            await axios.put(`${BASE_URL}/api/specialized-videos/${editingVideo._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsEditingVideo(false);
            setEditSelectedFile(null);
            setEditSelectedLangFiles({});
            fetchVideos();
            showAlert('success', 'Success', 'Lesson updated');
        } catch (e) { showAlert('error', 'Error', 'Failed to update lesson'); }
    };

    const handleSaveNewVideo = async () => {
        if (!newVideoData.title) {
            showAlert('error', 'Error', 'Title is required');
            return;
        }
        if (!newVideoData.url && !selectedFile) {
            showAlert('error', 'Error', 'Please provide a URL or select a video file');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', newVideoData.title);
            formData.append('category', actualTitle);
            formData.append('videoUrl', newVideoData.url);
            formData.append('title_lang', JSON.stringify(newVideoData.title_lang));
            formData.append('status_lang', JSON.stringify(newVideoData.status_lang));
            formData.append('url_lang', JSON.stringify(newVideoData.url_lang));

            if (selectedFile) formData.append('video', selectedFile);

            // Append language specific files
            Object.keys(selectedLangFiles).forEach(lang => {
                formData.append(`video_${lang}`, selectedLangFiles[lang]);
            });

            await axios.post(`${BASE_URL}/api/specialized-videos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsAddingVideo(false);
            setSelectedFile(null);
            setSelectedLangFiles({});
            setNewVideoData({
                url: '',
                title: '',
                title_lang: { fr: '', ar: '', en: '' },
                status_lang: { fr: '', ar: '', en: '' },
                url_lang: { fr: '', ar: '', en: '' }
            });
            fetchVideos();
            showAlert('success', 'Success', 'New lesson added');
        } catch (e) { showAlert('error', 'Error', 'Failed to add lesson'); }
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
        <div className="lessons-premium-wrapper" style={{ background: '#fcfcfd' }}>
            <Navbar />
            <div className="skeleton-hero dark-skeleton-shimmer"></div>
            <div className="container-skeleton">
                <div className="skeleton-text-title skeleton-shimmer" style={{ marginTop: '-80px', position: 'relative', zIndex: 11, width: '40%' }}></div>
                <div className="skeleton-video dark-skeleton-shimmer" style={{ marginTop: '40px' }}></div>

                <div className="skeleton-text-title skeleton-shimmer" style={{ width: '30%', height: '50px' }}></div>
                <div className="curriculum-line" style={{ margin: '20px auto' }}></div>

                <div className="skeleton-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="skeleton-card skeleton-shimmer"></div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="lessons-premium-wrapper" dir={direction} style={{
            background: `linear-gradient(rgba(252, 252, 253, 0.96), rgba(252, 252, 253, 0.98)), url('${heroBg}') center/cover fixed`
        }}>
            <Navbar />


            <header
                className="lessons-hero-header"
                style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.4)), url('${heroBg}')`
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
                        onClick={() => {
                            const init = {};
                            languages.forEach(l => {
                                init[l.code] = {
                                    badge: heroContent[l.code]?.badge || t.badge || "",
                                    title: heroContent[l.code]?.title || actualTitle || "",
                                    accent: heroContent[l.code]?.accent || "",
                                    bg: heroContent[l.code]?.bg || heroBg || ""
                                };
                            });
                            setEditHeroContent(init);
                            setIsEditingHero(true);
                        }}
                    >
                        <FaImage /> {appLanguage === 'ar' ? 'تعديل الواجهة' : 'Modifier le Hero (Cours)'}
                    </button>


                )}

                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="lesson-badge-glam">{heroContent[appLanguage]?.badge || t.badge}</div>
                    <h1 className="lessons-main-title-premium">
                        {heroContent[appLanguage]?.title || (
                            appLanguage === 'ar' ? (
                                <>دروس <span>{actualTitle}</span></>
                            ) : appLanguage === 'en' ? (
                                <><span>{actualTitle}</span> Lessons</>
                            ) : (
                                <>Leçons de <span>{actualTitle}</span></>
                            )
                        )}
                        {heroContent[appLanguage]?.accent && (
                            <span className="accent-text" style={{ color: '#d4af37', fontStyle: 'italic', display: 'block', fontSize: '1.5rem', marginTop: '10px' }}>
                                {heroContent[appLanguage].accent}
                            </span>
                        )}
                    </h1>
                </div>
            </header>

            <main className="lessons-explorer-container">
                {/* --- ACTIVE FOCUS PLAYER --- */}
                {currentVideo && (
                    <div className="active-focus-cinema" ref={topRef}>
                        {(() => {
                            // Use language-specific URL if available, otherwise fallback
                            const finalUrl = currentVideo.url_lang?.[appLanguage] || currentVideo.url;
                            const config = getVideoSource(finalUrl);

                            if (config.type === 'direct-video') {
                                return <video controls autoPlay src={config.src} key={currentVideo._id + appLanguage} controlsList="nodownload" />;
                            }
                            return (
                                <iframe
                                    src={`${config.src}?autoplay=1`}
                                    title={currentVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    key={currentVideo._id + appLanguage}
                                />
                            );
                        })()}
                    </div>
                )}

                {/* --- LESSONS LIST --- */}
                <div className="curriculum-section-header" style={{ position: 'relative' }}>
                    {isAdmin && (
                        <div style={{ position: 'absolute', top: '-10px', right: '0', zIndex: 10, display: 'flex', gap: '10px' }}>
                            <button
                                className="edit-btn-minimal-lux"
                                onClick={() => setIsAddingVideo(true)}
                                style={{ background: '#d4af37', color: '#1e293b' }}
                            >
                                <FaPlayCircle /> {appLanguage === 'ar' ? 'إضافة درس' : 'Ajouter une leçon'}
                            </button>
                            <button
                                className="edit-btn-minimal-lux"
                                onClick={() => {
                                    const init = {};
                                    languages.forEach(l => {
                                        init[l.code] = { title: curriculumInfo[l.code]?.title || t.listTitle || "" };
                                    });
                                    setEditCurriculumData(init);
                                    setIsEditingCurriculum(true);
                                }}
                            >
                                <FaEdit />
                            </button>
                        </div>
                    )}
                    <h2>{curriculumInfo[appLanguage]?.title || t.listTitle}</h2>
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
                            isAdmin={isAdmin}
                            onEdit={handleEditVideo}
                            appLanguage={appLanguage}
                        />
                    ))}
                </div>

                {/* --- CERTIFICATE SECTION --- */}
                <section className="lessons-certificate-box-lux" style={{ position: 'relative' }}>
                    {isAdmin && (
                        <button
                            className="edit-btn-minimal-lux"
                            style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}
                            onClick={() => {
                                const init = {};
                                languages.forEach(l => {
                                    init[l.code] = {
                                        title: certInfo[l.code]?.title || t.certificateTitle || "",
                                        desc: certInfo[l.code]?.desc || t.certificateText || "",
                                        whatsapp: certInfo[l.code]?.whatsapp || t.whatsappNum || "",
                                        btn: certInfo[l.code]?.btn || t.whatsappBtn || ""
                                    };
                                });
                                setEditCertData(init);
                                setIsEditingCert(true);
                            }}
                        >
                            <FaEdit /> {appLanguage === 'ar' ? 'تعديل' : 'Modifier'}
                        </button>
                    )}
                    <FaCertificate className="cert-icon-glamor" />
                    <h2 className="cert-title-lux">{certInfo[appLanguage]?.title || t.certificateTitle}</h2>
                    <p className="cert-desc-lux">{certInfo[appLanguage]?.desc || t.certificateText}</p>
                    <a href={`https://wa.me/${(certInfo[appLanguage]?.whatsapp || t.whatsappNum).replace(/\s/g, '')}`} className="cert-whatsapp-btn" target="_blank" rel="noopener noreferrer">
                        <FaWhatsapp size={22} />
                        <span>{certInfo[appLanguage]?.btn || t.whatsappBtn}</span>
                    </a>
                </section>
            </main>

            {isEditingHero && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditingHero(false)}>
                    <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingHero(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title" style={{ textAlign: 'center', marginBottom: '30px' }}>Modifier le Hero (Cours)</h2>

                        <div className="premium-form-grid">
                            {languages.map(lang => (
                                <div key={lang.code} className="premium-lang-section">
                                    <h4 className="lang-indicator">{lang.label}</h4>

                                    <div className="premium-form-group">
                                        <label>{lang.code === 'ar' ? 'Badge' : 'BADGE'}</label>
                                        <input
                                            type="text"
                                            value={editHeroContent[lang.code]?.badge || ''}
                                            onChange={e => setEditHeroContent({
                                                ...editHeroContent,
                                                [lang.code]: { ...editHeroContent[lang.code], badge: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <div className="premium-form-group">
                                        <label>{lang.code === 'en' ? 'ACCENT TEXT' : (lang.code === 'ar' ? 'Title' : 'TITLE')}</label>
                                        <input
                                            type="text"
                                            value={editHeroContent[lang.code]?.title || ''}
                                            onChange={e => setEditHeroContent({
                                                ...editHeroContent,
                                                [lang.code]: { ...editHeroContent[lang.code], title: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <div className="premium-form-group">
                                        <label>{lang.code === 'en' ? 'MAIN TITLE' : (lang.code === 'ar' ? 'Accent Text' : 'ACCENT TEXT')}</label>
                                        <input
                                            type="text"
                                            value={editHeroContent[lang.code]?.accent || ''}
                                            onChange={e => setEditHeroContent({
                                                ...editHeroContent,
                                                [lang.code]: { ...editHeroContent[lang.code], accent: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <div className="premium-form-group">
                                        <label>{lang.code === 'ar' ? 'رابط الخلفية' : 'URL IMAGE DE FOND'}</label>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={editHeroContent[lang.code]?.bg || ''}
                                            onChange={e => {
                                                const val = e.target.value;
                                                const updated = { ...editHeroContent };
                                                updated[lang.code].bg = val;
                                                setEditHeroContent(updated);
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="premium-btn-group" style={{ justifyContent: 'center', marginTop: '30px' }}>
                            <button type="button" className="premium-btn-cta secondary" onClick={() => setIsEditingHero(false)} style={{ width: '200px' }}>
                                {t.cancel || 'Annuler'}
                            </button>
                            <button type="button" className="premium-btn-cta gold" onClick={handleSaveHero} style={{ width: '200px' }}>
                                {t.save || 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL CURRICULUM --- */}
            {isEditingCurriculum && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditingCurriculum(false)}>
                    <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingCurriculum(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">Modifier le Titre du Programme</h2>
                        <div className="premium-form-grid">
                            {languages.map(lang => (
                                <div key={lang.code} className="premium-lang-section">
                                    <h4 className="lang-indicator">{lang.label}</h4>
                                    <div className="premium-form-group">
                                        <label>Titre de la section</label>
                                        <input
                                            type="text"
                                            value={editCurriculumData[lang.code]?.title || ''}
                                            onChange={e => setEditCurriculumData({
                                                ...editCurriculumData,
                                                [lang.code]: { title: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="premium-btn-group" style={{ justifyContent: 'center', marginTop: '30px' }}>
                            <button type="button" className="premium-btn-cta secondary" onClick={() => setIsEditingCurriculum(false)}>{t.cancel}</button>
                            <button type="button" className="premium-btn-cta gold" onClick={handleSaveCurriculum}>{t.save}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL CERTIFICATE --- */}
            {isEditingCert && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditingCert(false)}>
                    <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingCert(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">Modifier la Section Certificat</h2>
                        <div className="premium-form-grid">
                            {languages.map(lang => (
                                <div key={lang.code} className="premium-lang-section">
                                    <h4 className="lang-indicator">{lang.label}</h4>
                                    <div className="premium-form-group">
                                        <label>Titre</label>
                                        <input
                                            type="text"
                                            value={editCertData[lang.code]?.title || ''}
                                            onChange={e => setEditCertData({
                                                ...editCertData,
                                                [lang.code]: { ...editCertData[lang.code], title: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Description</label>
                                        <textarea
                                            value={editCertData[lang.code]?.desc || ''}
                                            onChange={e => setEditCertData({
                                                ...editCertData,
                                                [lang.code]: { ...editCertData[lang.code], desc: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Texte Bouton</label>
                                        <input
                                            type="text"
                                            value={editCertData[lang.code]?.btn || ''}
                                            onChange={e => setEditCertData({
                                                ...editCertData,
                                                [lang.code]: { ...editCertData[lang.code], btn: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Numéro WhatsApp</label>
                                        <input
                                            type="text"
                                            value={editCertData[lang.code]?.whatsapp || ''}
                                            onChange={e => setEditCertData({
                                                ...editCertData,
                                                [lang.code]: { ...editCertData[lang.code], whatsapp: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="premium-btn-group" style={{ justifyContent: 'center', marginTop: '30px' }}>
                            <button type="button" className="premium-btn-cta secondary" onClick={() => setIsEditingCert(false)}>{t.cancel}</button>
                            <button type="button" className="premium-btn-cta gold" onClick={handleSaveCert}>{t.save}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL EDIT VIDEO (INDIVIDUAL) --- */}
            {isEditingVideo && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditingVideo(false)}>
                    <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingVideo(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title" style={{ textAlign: 'center' }}>Modifier la Leçon (Langues)</h2>

                        <div className="premium-form-group" style={{ marginBottom: '20px' }}>
                            <label>URL de la vidéo (Optionnel si fichier choisi)</label>
                            <input
                                type="text"
                                value={editVideoUrl}
                                onChange={e => setEditVideoUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="premium-form-group" style={{ marginBottom: '20px' }}>
                            <label>Ou Charger la vidéo depuis votre ordinateur</label>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={e => setEditSelectedFile(e.target.files[0])}
                                className="premium-file-input"
                            />
                            {editSelectedFile && <p style={{ fontSize: '12px', color: '#d4af37' }}>Fichier sélectionné: {editSelectedFile.name}</p>}
                        </div>

                        <div className="premium-form-grid">
                            {languages.map(lang => (
                                <div key={lang.code} className="premium-lang-section">
                                    <h4 className="lang-indicator">{lang.label}</h4>
                                    <div className="premium-form-group">
                                        <label>Titre de la leçon</label>
                                        <input
                                            type="text"
                                            value={editVideoContent[lang.code]?.title || ''}
                                            onChange={e => setEditVideoContent({
                                                ...editVideoContent,
                                                [lang.code]: { ...editVideoContent[lang.code], title: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Statut (ex: Free, VIP, مجاني)</label>
                                        <input
                                            type="text"
                                            value={editVideoContent[lang.code]?.status || ''}
                                            onChange={e => setEditVideoContent({
                                                ...editVideoContent,
                                                [lang.code]: { ...editVideoContent[lang.code], status: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>URL Vidéo spécifique ({lang.label})</label>
                                        <input
                                            type="text"
                                            value={editVideoContent[lang.code]?.url || ''}
                                            onChange={e => setEditVideoContent({
                                                ...editVideoContent,
                                                [lang.code]: { ...editVideoContent[lang.code], url: e.target.value }
                                            })}
                                            placeholder="YouTube/Streamable Link..."
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Ou Fichier Vidéo ({lang.label})</label>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={e => setEditSelectedLangFiles({
                                                ...editSelectedLangFiles,
                                                [lang.code]: e.target.files[0]
                                            })}
                                        />
                                        {editSelectedLangFiles[lang.code] && <p style={{ fontSize: '11px', color: '#d4af37' }}>{editSelectedLangFiles[lang.code].name}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="premium-btn-group" style={{ justifyContent: 'center', marginTop: '30px' }}>
                            <button type="button" className="premium-btn-cta secondary" onClick={() => setIsEditingVideo(false)}>{t.cancel}</button>
                            <button type="button" className="premium-btn-cta gold" onClick={handleSaveVideo}>{t.save}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL ADD NEW VIDEO --- */}
            {isAddingVideo && (
                <div className="premium-modal-backdrop" onClick={() => setIsAddingVideo(false)}>
                    <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsAddingVideo(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title" style={{ textAlign: 'center' }}>{appLanguage === 'ar' ? 'إضافة درس جديد' : 'Ajouter une nouvelle leçon'}</h2>

                        <div className="premium-form-group" style={{ marginBottom: '20px' }}>
                            <label>Base Title (Internal)</label>
                            <input
                                type="text"
                                value={newVideoData.title}
                                onChange={e => setNewVideoData({ ...newVideoData, title: e.target.value })}
                                placeholder="Basic title..."
                            />
                        </div>

                        <div className="premium-form-group" style={{ marginBottom: '20px' }}>
                            <label>Video URL (YouTube/Direct) - Optionnel si fichier choisi</label>
                            <input
                                type="text"
                                value={newVideoData.url}
                                onChange={e => setNewVideoData({ ...newVideoData, url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="premium-form-group" style={{ marginBottom: '20px' }}>
                            <label>Ou Charger la vidéo depuis votre ordinateur</label>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={e => setSelectedFile(e.target.files[0])}
                                className="premium-file-input"
                            />
                            {selectedFile && <p style={{ fontSize: '12px', color: '#d4af37' }}>Fichier sélectionné: {selectedFile.name}</p>}
                        </div>

                        <div className="premium-form-grid">
                            {languages.map(lang => (
                                <div key={lang.code} className="premium-lang-section">
                                    <h4 className="lang-indicator">{lang.label}</h4>
                                    <div className="premium-form-group">
                                        <label>Localized Title</label>
                                        <input
                                            type="text"
                                            value={newVideoData.title_lang?.[lang.code] || ''}
                                            onChange={e => {
                                                const updated = { ...newVideoData.title_lang, [lang.code]: e.target.value };
                                                setNewVideoData({ ...newVideoData, title_lang: updated });
                                            }}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Status (Free/VIP)</label>
                                        <input
                                            type="text"
                                            value={newVideoData.status_lang?.[lang.code] || ''}
                                            onChange={e => {
                                                const updated = { ...newVideoData.status_lang, [lang.code]: e.target.value };
                                                setNewVideoData({ ...newVideoData, status_lang: updated });
                                            }}
                                            placeholder="Ex: VIP"
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Video URL for {lang.label}</label>
                                        <input
                                            type="text"
                                            value={newVideoData.url_lang?.[lang.code] || ''}
                                            onChange={e => {
                                                const updated = { ...newVideoData.url_lang, [lang.code]: e.target.value };
                                                setNewVideoData({ ...newVideoData, url_lang: updated });
                                            }}
                                            placeholder="YouTube/Streamable Link..."
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Or Video File for {lang.label}</label>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={e => setSelectedLangFiles({
                                                ...selectedLangFiles,
                                                [lang.code]: e.target.files[0]
                                            })}
                                        />
                                        {selectedLangFiles[lang.code] && <p style={{ fontSize: '11px', color: '#d4af37' }}>{selectedLangFiles[lang.code].name}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="premium-btn-group" style={{ justifyContent: 'center', marginTop: '30px' }}>
                            <button type="button" className="premium-btn-cta secondary" onClick={() => setIsAddingVideo(false)}>{t.cancel}</button>
                            <button type="button" className="premium-btn-cta gold" onClick={handleSaveNewVideo}>{t.save}</button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
