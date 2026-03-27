import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlay, FaPlayCircle, FaCheckCircle, FaEdit, FaImage, FaTimes, FaWhatsapp, FaCertificate, FaArrowRight, FaLock, FaSpinner, FaTrash, FaCloudUploadAlt } from 'react-icons/fa';
import '../pages/lessons_premium.css';
import '../comp/PremiumSkeleton.css';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import UniversalVideoPlayer from '../comp/UniversalVideoPlayer';
import HLSStreamingPlayer from '../comp/HLSStreamingPlayer';
import { useParams, useLocation } from 'react-router-dom';
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
    },
    tn: {
        loading: "جاري تحميل محتوى الدورة...",
        errorTitle: "تعذر تحميل الدروس",
        errorMsg: "حدث خطأ أثناء استخراج الفيديوهات. يرجى التأكد من استقرار الخادم.",
        lessonsTitle: (title) => `دروس ${title}`,
        listTitle: "المنهج التعليمي (تونسي)",
        noVideos: (title) => `لا تتوفر فيديوهات حالياً لهذه الفئة: "${title}".`,
        certificateTitle: "احصل على شهادتك المعتمدة",
        certificateText: "بمجرد إكمال المنهج بالكامل، يمكنك الحصول على شهادة معتمدة من مشغل صفاقس تعزز ملفك المهني.",
        whatsappNum: "26 123 456",
        whatsappBtn: "اطلب شهادتك الآن",
        free: "مجاني",
        badge: "دورة تعليمية",
        playing: "قيد المشاهدة (TN)",
        cancel: "إلغاء",
        save: "حفظ"
    }
};



const getThumbnailUrl = (url, fallbackTitle) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const matchYoutube = url?.match(youtubeRegex);
    if (matchYoutube) return `https://img.youtube.com/vi/${matchYoutube[1]}/hqdefault.jpg`;

    const driveRegex = /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=|drive\.google\.com\/uc\?id=)([^\/\?&]+)/;
    const matchDrive = url?.match(driveRegex);
    if (matchDrive) return `https://drive.google.com/thumbnail?id=${matchDrive[1]}&sz=w1000`;

    // Cloudinary Direct URL
    if (url?.includes("res.cloudinary.com") && url?.endsWith(".mp4")) {
        return url.replace('.mp4', '.jpg');
    }

    // Cloudinary iframe Player URL
    const cloudinaryEmbedRegex = /player\.cloudinary\.com\/embed\/\?cloud_name=([^&]+)&public_id=([^&]+)/;
    const matchCloudinary = url?.match(cloudinaryEmbedRegex);
    if (matchCloudinary) {
        return `https://res.cloudinary.com/${matchCloudinary[1]}/video/upload/${matchCloudinary[2]}.jpg`;
    }

    return `https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop`;
};

const LessonCard = ({ video, isActive, onSelect, lang, isAdmin, onEdit, onDelete, appLanguage }) => {
    return (
        <div
            className={`lesson-card-item-premium ${isActive ? 'is-active' : ''}`}
            onClick={() => onSelect(video)}
            style={{ position: 'relative' }}
        >
            {isAdmin && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 5, display: 'flex', gap: '5px' }}>
                    <button
                        className="edit-btn-minimal-lux"
                        style={{ padding: '5px' }}
                        onClick={(e) => { e.stopPropagation(); onEdit(video); }}
                    >
                        <FaEdit size={12} />
                    </button>
                    <button
                        className="edit-btn-minimal-lux delete"
                        style={{ padding: '5px', backgroundColor: 'rgba(239, 68, 68, 0.8)', color: '#fff' }}
                        onClick={(e) => { e.stopPropagation(); onDelete(video); }}
                    >
                        <FaTrash size={12} />
                    </button>
                </div>
            )}
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
                    {(isActive || video.status_lang?.[appLanguage] || video.isVip) && (
                        <span className="l-meta-tag">
                            {isActive ? (video.playing_text || lang.playing) : (video.status_lang?.[appLanguage] || (video.isVip ? 'VIP' : ''))}
                        </span>
                    )}
                    <span className="l-meta-duration"><FaPlayCircle size={14} style={{ marginRight: '5px' }} /> 24/7 Access</span>
                </div>
            </div>
        </div>
    );
};

export default function Lessons() {
    const { appLanguage, languages } = useLanguage();
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
    const [groupCategoryName, setGroupCategoryName] = useState(null);

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
    const [editVideoOrder, setEditVideoOrder] = useState(0);
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

    // Cloudinary Upload State
    const [uploadingToCloudinary, setUploadingToCloudinary] = useState(null);

    const topRef = useRef(null);

    const { leconTitle } = useParams();
    const { pathname } = useLocation();
    const actualTitle = decodeURIComponent(leconTitle);
    // Detect if we're on the /Leçons_coursage/ path (shorter video-only flow)
    const isCoursagePath = pathname.startsWith('/Le%C3%A7ons_coursage') || pathname.startsWith('/Leçons_coursage');

    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';


    const fetchSiteSettings = useCallback(async () => {
        try {
            const currRes = await axios.get(`${BASE_URL}/api/settings/curriculum-info`);
            if (currRes.data) {
                setCurriculumInfo(currRes.data);
                const initCurr = {};
                languages.forEach(l => {
                    initCurr[l.code] = {
                        title: currRes.data[l.code]?.title || translations[l.code]?.listTitle || "",
                        playing: currRes.data[l.code]?.playing || translations[l.code]?.playing || ""
                    };
                });
                setEditCurriculumData(initCurr);
            }

            const certRes = await axios.get(`${BASE_URL}/api/settings/certificate-info`);
            if (certRes.data) {
                setCertInfo(certRes.data);
                const initCert = {};
                languages.forEach(l => {
                    initCert[l.code] = {
                        title: certRes.data[l.code]?.title || translations[l.code]?.certificateTitle || "",
                        desc: certRes.data[l.code]?.desc || translations[l.code]?.certificateText || "",
                        whatsapp: certRes.data[l.code]?.whatsapp || translations[l.code]?.whatsappNum || "",
                        btn: certRes.data[l.code]?.btn || translations[l.code]?.whatsappBtn || ""
                    };
                });
                setEditCertData(initCert);
            }
        } catch (e) { console.error("Error fetching site settings", e); }
    }, []);

    const handleFastCloudinaryUpload = async (e, langCode, mode) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingToCloudinary(langCode);
        const formData = new FormData();
        formData.append('image', file); // Server route specifically looks for 'image' field for media

        try {
            const res = await axios.post(`${BASE_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data && res.data.url) {
                if (mode === 'edit') {
                    setEditVideoContent(prev => ({
                        ...prev,
                        [langCode]: { ...prev[langCode], url: res.data.url }
                    }));
                } else if (mode === 'add') {
                    setNewVideoData(prev => ({
                        ...prev,
                        url_lang: { ...prev.url_lang, [langCode]: res.data.url },
                        url: res.data.url // Ensure fallback base url is set
                    }));
                }
                showAlert('success', 'Success', appLanguage === 'ar' ? 'تم رفع الفيديو وربطه بنجاح!' : 'Vidéo uploadée et liée avec succès!');
            }
        } catch (err) {
            console.error(err);
            showAlert('error', 'Error', appLanguage === 'ar' ? 'فشل فاستخراج الرابط' : 'Échec de l\'upload de la vidéo.');
        } finally {
            setUploadingToCloudinary(null);
        }
    };

    const fetchVideos = useCallback(async (allTitles = [actualTitle]) => {
        setLoading(true);
        try {
            // Convert to array if it is not one
            const titles = Array.isArray(allTitles) ? allTitles : [allTitles];

            const res = await axios.get(`${BASE_URL}/api/specialized-videos`, {
                params: { category: titles.length === 1 ? titles[0] : titles } // Send string if single, array if multiple
            });
            const preparedVideos = res.data.map((v, i) => {
                const localizedTitle = v.title_lang?.[appLanguage] || (appLanguage === 'tn' && v.title_lang?.en) || v.title;
                const localizedUrl = v.url_lang?.[appLanguage] || (appLanguage === 'tn' && v.url_lang?.en) || v.url;
                return {
                    ...v,
                    title: localizedTitle, // Overwrite base title with translation
                    url: localizedUrl,     // Overwrite base url with translation
                    isVip: i % 3 === 0,
                    thumbnail: getThumbnailUrl(localizedUrl, localizedTitle)
                };
            });
            setVideos(preparedVideos);
            if (preparedVideos.length > 0) setCurrentVideo(preparedVideos[0]);
            setError(null);
        } catch (err) {
            setError(translations[appLanguage]?.errorMsg || translations.fr?.errorMsg || 'Erreur lors du chargement.');
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [actualTitle, appLanguage]);

    const fetchCourseInfo = useCallback(async () => {
        // If on the coursage path, skip the DB lookup and directly load by title
        if (isCoursagePath) {
            fetchVideos([actualTitle]);
            return;
        }

        try {
            const res = await axios.get(`${BASE_URL}/api/specialized-courses`);
            let foundCourse = null;
            let foundGroupId = null;
            let foundGroupCatName = null;

            for (const group of res.data) {
                const item = group.courses.find(c => {
                    // Try to find match in any language
                    if (typeof c.title === 'object') {
                        return Object.values(c.title).some(t => t?.toString().trim() === actualTitle.trim());
                    }
                    return c.title?.toString().trim() === actualTitle.trim();
                });
                if (item) {
                    foundCourse = item;
                    foundGroupId = group._id;
                    foundGroupCatName = group.vip_category;
                    break;
                }
            }

            if (foundCourse) {
                setCourseInfo(foundCourse);
                setGroupId(foundGroupId);
                setGroupCategoryName(foundGroupCatName);
                const hc = foundCourse.hero_content || {};
                setHeroContent(hc);
                setHeroBg(foundCourse.hero_bg || foundCourse.image || "");

                // Pre-initialize hero edit state
                const initHero = {};
                languages.forEach(l => {
                    initHero[l.code] = {
                        badge: hc[l.code]?.badge || translations[l.code]?.badge || "",
                        title: hc[l.code]?.title || actualTitle || "",
                        accent: hc[l.code]?.accent || "",
                        bg: hc[l.code]?.bg || foundCourse.hero_bg || foundCourse.image || ""
                    };
                });
                setEditHeroContent(initHero);

                // Fetch videos using only the strict category identifiers:
                // 1. The URL title (actualTitle) - what the user navigated to
                // 2. The technicalName if set (the canonical key for this lesson)
                // Do NOT use all language translations as this causes cross-category contamination
                const titles = [actualTitle];
                if (foundCourse.technicalName && !titles.includes(foundCourse.technicalName)) {
                    titles.push(foundCourse.technicalName);
                }

                fetchVideos(titles);
            } else {
                // If course not found in DB yet, fallback to just actualTitle
                fetchVideos([actualTitle]);
            }
        } catch (e) {
            console.error("Error fetching course info", e);
            fetchVideos([actualTitle]);
        }
    }, [actualTitle, languages, fetchVideos, isCoursagePath]);

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
        if (!groupId || !courseInfo) {
            showAlert('error', 'Error', 'Could not identify the course to update.');
            return;
        }

        try {
            // Fetch latest group data to ensure consistency
            const groupRes = await axios.get(`${BASE_URL}/api/specialized-courses/${groupId}`);
            const groupData = groupRes.data;

            const updatedCourses = groupData.courses.map(c => {
                if (c._id === courseInfo?._id || (typeof c.title === 'object' ? c.title.fr : c.title)?.toString().trim() === actualTitle.trim()) {
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
        setEditVideoOrder(video.order || 0);
        setIsEditingVideo(true);
    };

    const handleSaveVideo = async () => {
        if (!editingVideo) return;
        try {
            const formData = new FormData();
            formData.append('title', editVideoContent.fr?.title || editingVideo.title);
            formData.append('category', editingVideo.category);
            formData.append('subCategory', editingVideo.subCategory || '');
            formData.append('videoUrl', editVideoUrl);
            const title_lang = {};
            const status_lang = {};
            const url_lang = {};
            languages.forEach(l => {
                title_lang[l.code] = editVideoContent[l.code]?.title || editingVideo.title_lang?.[l.code] || editingVideo.title || "";
                status_lang[l.code] = editVideoContent[l.code]?.status || editingVideo.status_lang?.[l.code] || (editingVideo.isVip ? "VIP" : "FREE");
                url_lang[l.code] = editVideoContent[l.code]?.url || editingVideo.url_lang?.[l.code] || "";
            });

            formData.append('title_lang', JSON.stringify(title_lang));
            formData.append('status_lang', JSON.stringify(status_lang));
            formData.append('url_lang', JSON.stringify(url_lang));
            formData.append('order', editVideoOrder);

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
        const hasAnyLangVideo = ['fr', 'ar', 'en'].some(lang => newVideoData.url_lang[lang] || selectedLangFiles[lang]);
        if (!hasAnyLangVideo) {
            showAlert('error', 'Error', 'Please provide at least one localized video URL or file');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', newVideoData.title);
            formData.append('category', groupCategoryName || actualTitle);
            formData.append('subCategory', actualTitle);
            formData.append('videoUrl', newVideoData.url);
            const title_lang = {};
            const status_lang = {};
            const url_lang = {};
            languages.forEach(l => {
                title_lang[l.code] = newVideoData.title_lang?.[l.code] || newVideoData.title || "";
                status_lang[l.code] = newVideoData.status_lang?.[l.code] || "FREE";
                url_lang[l.code] = newVideoData.url_lang?.[l.code] || "";
            });

            formData.append('title_lang', JSON.stringify(title_lang));
            formData.append('status_lang', JSON.stringify(status_lang));
            formData.append('url_lang', JSON.stringify(url_lang));

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


    const handleDeleteVideo = async (video) => {
        if (!window.confirm(appLanguage === 'ar' ? 'هل أنت متأكد من حذف هذا الدرس؟' : 'Voulez-vous vraiment supprimer cette leçon ?')) return;

        try {
            await axios.delete(`${BASE_URL}/api/specialized-videos/${video._id}`);
            showAlert('success', 'Success', appLanguage === 'ar' ? 'تم الحذف بنجاح' : 'Leçon supprimée');
            fetchVideos();
        } catch (e) {
            showAlert('error', 'Error', 'Failed to delete lesson');
        }
    };


    useEffect(() => {
        // No longer calling fetchVideos here because it's now called inside fetchCourseInfo
        // which has the logic for all titles.
    }, [actualTitle]);

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
                                <>دروس <span>{typeof courseInfo?.title === 'object' ? (courseInfo.title[appLanguage] || courseInfo.title.fr) : actualTitle}</span></>
                            ) : appLanguage === 'en' ? (
                                <><span>{typeof courseInfo?.title === 'object' ? (courseInfo.title[appLanguage] || courseInfo.title.fr) : actualTitle}</span> Lessons</>
                            ) : (
                                <>Leçons de <span>{typeof courseInfo?.title === 'object' ? (courseInfo.title[appLanguage] || courseInfo.title.fr) : actualTitle}</span></>
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
                        <UniversalVideoPlayer
                            url={currentVideo.url}
                            title={currentVideo.title}
                            autoPlay={true}
                        />
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
                            video={{ ...video, playing_text: curriculumInfo[appLanguage]?.playing }}
                            isActive={currentVideo?._id === video._id}
                            onSelect={handleSelectVideo}
                            lang={t}
                            isAdmin={isAdmin}
                            onEdit={handleEditVideo}
                            onDelete={handleDeleteVideo}
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

                {/* --- PRODUCTION HLS STREAMING DASHBOARD (VPS INTEGRATED) --- */}
                <section className="hls-streaming-dashboard-premium" style={{ marginTop: '50px', background: '#0f172a', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', color: '#fff' }}>
                    <div className="hls-dashboard-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                            VPS High-Performance Streaming
                        </div>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {appLanguage === 'ar' ? 'نظام البث المباشر (HLS Adaptive)' : 'Système de Streaming (HLS Adaptive)'}
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                            {appLanguage === 'ar' ? 'بث ذكي يتكيف مع سرعة الإنترنت لضمان عدم التقطيع بدقة تصل لـ 1080p.' : 'Streaming adaptatif haute performance garantissant zéro mise en mémoire tampon jusqu\'à 1080p.'}
                        </p>
                    </div>

                    <div className="hls-player-wrapper-lux" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden', background: '#000' }}>
                        <HLSStreamingPlayer 
                            src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" // Master playlist URL (Example HLS for demo)
                            title="Production Server Stream Test"
                        />
                    </div>

                    {/* Stats & Quality Specs */}
                    <div className="hls-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '40px', maxWidth: '1000px', margin: '40px auto 0 auto' }}>
                        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>ENCODING</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>H.264 / AAC</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Mobile-Optimized Engine</div>
                        </div>
                        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>QUALITY LAYERS</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>360p • 480p • 720p • 1080p</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Adaptive Resolution Toggle</div>
                        </div>
                        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>LATENCY</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Low-Latency HLS</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Fast-Start Edge Segments</div>
                        </div>
                        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>VPS SERVER</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>5 Cores / 6GB RAM</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>NVMe Ready Storage</div>
                        </div>
                    </div>
                </section>
            </main>

            {isEditingHero && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditingHero(false)}>
                    <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingHero(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title" style={{ textAlign: 'center', marginBottom: '30px' }}>Modifier le Hero (Cours)</h2>

                        <div className="premium-form-grid">
                            {languages.filter(l => l.code === appLanguage).map(lang => (
                                <div key={lang.code} className="premium-lang-section" style={{ border: 'none', background: 'none' }}>
                                    <h4 className="lang-indicator" style={{ background: '#d4af37' }}>{lang.label}</h4>

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
                                                updated[lang.code] = { ...(updated[lang.code] || {}), bg: val };
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
                            {languages.filter(l => l.code === appLanguage).map(lang => (
                                <div key={lang.code} className="premium-lang-section" style={{ border: 'none', background: 'none' }}>
                                    <h4 className="lang-indicator" style={{ background: '#d4af37' }}>{lang.label}</h4>
                                    <div className="premium-form-group">
                                        <label>{lang.code === 'ar' ? 'عنوان القائمة' : 'Titre de la section'}</label>
                                        <input
                                            type="text"
                                            value={editCurriculumData[lang.code]?.title || ''}
                                            onChange={e => setEditCurriculumData({
                                                ...editCurriculumData,
                                                [lang.code]: { ...editCurriculumData[lang.code], title: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>{lang.code === 'ar' ? 'نص قيد المشاهدة' : 'Texte "Lecture en cours"'}</label>
                                        <input
                                            type="text"
                                            value={editCurriculumData[lang.code]?.playing || ''}
                                            onChange={e => setEditCurriculumData({
                                                ...editCurriculumData,
                                                [lang.code]: { ...editCurriculumData[lang.code], playing: e.target.value }
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
                            {languages.filter(l => l.code === appLanguage).map(lang => (
                                <div key={lang.code} className="premium-lang-section" style={{ border: 'none', background: 'none' }}>
                                    <h4 className="lang-indicator" style={{ background: '#d4af37' }}>{lang.label}</h4>
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

                        <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <label style={{ fontWeight: '600', color: '#1e293b' }}>Ordre d'affichage :</label>
                            <input
                                type="number"
                                value={editVideoOrder}
                                onChange={(e) => setEditVideoOrder(e.target.value)}
                                style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                            />
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>(Le numéro le plus petit s'affiche en premier)</span>
                        </div>

                        <div className="premium-form-grid">
                            {languages.filter(l => l.code === appLanguage).map(lang => (
                                <div key={lang.code} className="premium-lang-section" style={{ border: 'none', background: 'none' }}>
                                    <h4 className="lang-indicator" style={{ background: '#d4af37' }}>{lang.label}</h4>
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
                                        <label>URL Vidéo</label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                value={editVideoContent[lang.code]?.url || ''}
                                                onChange={e => setEditVideoContent({
                                                    ...editVideoContent,
                                                    [lang.code]: { ...editVideoContent[lang.code], url: e.target.value }
                                                })}
                                                placeholder="YouTube, Cloudinary, Streamable..."
                                                style={{ flex: 1 }}
                                            />
                                            <input
                                                type="file"
                                                accept="video/*"
                                                id={`edit-upload-${lang.code}`}
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFastCloudinaryUpload(e, lang.code, 'edit')}
                                            />
                                            <button
                                                type="button"
                                                className="premium-btn-cta gold"
                                                style={{ padding: '0 15px', height: '40px', minWidth: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                onClick={() => document.getElementById(`edit-upload-${lang.code}`).click()}
                                                disabled={uploadingToCloudinary === lang.code}
                                            >
                                                {uploadingToCloudinary === lang.code ? <FaSpinner className="player-spinner" size={16} /> : <FaCloudUploadAlt size={20} />}
                                            </button>
                                        </div>
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


                        <div className="premium-form-grid">
                            {languages.filter(l => l.code === appLanguage).map(lang => (
                                <div key={lang.code} className="premium-lang-section" style={{ border: 'none', background: 'none' }}>
                                    <h4 className="lang-indicator" style={{ background: '#d4af37' }}>{lang.label}</h4>
                                    <div className="premium-form-group">
                                        <label>{appLanguage === 'ar' ? 'عنوان الدرس' : 'Titre de la leçon'}</label>
                                        <input
                                            type="text"
                                            value={newVideoData.title_lang?.[lang.code] || ''}
                                            onChange={e => {
                                                const updated = { ...newVideoData.title_lang, [lang.code]: e.target.value };
                                                setNewVideoData({
                                                    ...newVideoData,
                                                    title_lang: updated,
                                                    title: e.target.value // Auto-sync base title
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>URL Vidéo</label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                value={newVideoData.url_lang?.[lang.code] || ''}
                                                onChange={e => {
                                                    const updated = { ...newVideoData.url_lang, [lang.code]: e.target.value };
                                                    setNewVideoData({ ...newVideoData, url_lang: updated });
                                                }}
                                                placeholder="YouTube, Cloudinary, Streamable..."
                                                style={{ flex: 1 }}
                                            />
                                            <input
                                                type="file"
                                                accept="video/*"
                                                id={`add-upload-${lang.code}`}
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFastCloudinaryUpload(e, lang.code, 'add')}
                                            />
                                            <button
                                                type="button"
                                                className="premium-btn-cta gold"
                                                style={{ padding: '0 15px', height: '40px', minWidth: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                onClick={() => document.getElementById(`add-upload-${lang.code}`).click()}
                                                disabled={uploadingToCloudinary === lang.code}
                                            >
                                                {uploadingToCloudinary === lang.code ? <FaSpinner className="player-spinner" size={16} /> : <FaCloudUploadAlt size={20} />}
                                            </button>
                                        </div>
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
