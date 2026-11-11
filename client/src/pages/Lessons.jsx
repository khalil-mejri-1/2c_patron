import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlay, FaPlayCircle, FaCheckCircle, FaEdit, FaImage, FaTimes, FaWhatsapp, FaCertificate, FaArrowRight, FaLock, FaSpinner, FaTrash, FaCloudUploadAlt, FaUpload, FaUser, FaPhoneAlt, FaCrown, FaExpand, FaCompress } from 'react-icons/fa';
import '../pages/lessons_premium.css';
import '../comp/PremiumSkeleton.css';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import UniversalVideoPlayer from '../comp/UniversalVideoPlayer';
import { useParams, useLocation, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../apiConfig';
import { useLanguage } from '../context/LanguageContext';
import { useAlert } from '../context/AlertContext';
import { CoursePlayerSkeleton } from '../comp/Skeletons';
import './lessons_premium.css';
import { getCategoryFallbackImage } from '../utils/categoryFallbacks';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        loading: "جاري تحميل محتوى الدورة...",
        errorTitle: "تعذر تحميل الدروس",
        errorMsg: "حدث خطأ أثناء استخراج الفيديوهات. يرجى التأكد من استقرار الخادم.",
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
        save: "حفظ",
        breadcrumbHome: "الرئيسية",
        breadcrumbVip: "دخول VIP",
        limitedAccess: "دخول محدود",
        vipMessage: "دخول 'Master Atelier (VIP)' هو تجربة حصرية مخصصة لأعضائنا المميزين.",
        vipBenefits: "✦ اكتشف الباترونات السرية والدروس المتقدمة",
        later: "لاحقاً",
        requestSentTitle: "تم استلام طلبك!",
        requestSentMsg: "سنقوم بمراجعة طلبك والاتصال بك في أقرب وقت ممكن. شكراً لاهتمامك!",
        rotateBtn: "تدوير الشاشة بالعرض",
        exitRotateBtn: "تصغير الفيديو وإرجاعه"
    },
    fr: {
        loading: "Chargement du contenu...",
        errorTitle: "Échec du chargement.",
        errorMsg: "Impossible de récupérer les vidéos. Veuillez vérifier votre connexion.",
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
        save: "Enregistrer",
        breadcrumbHome: "Accueil",
        breadcrumbVip: "Accès VIP",
        limitedAccess: "Accès Limité",
        vipMessage: "L'accès 'Master Atelier (VIP)' est une expérience exclusive réservée à nos membres privilégiés.",
        vipBenefits: "✦ Débloquez des patrons secrets & tutoriels d'experts",
        later: "PLUS TARD",
        requestSentTitle: "Demande Reçue !",
        requestSentMsg: "Nous avons bien reçu votre demande. Un administrateur vous contactera sous peu. Merci !",
        rotateBtn: "Pivoter l'écran (Plein écran)",
        exitRotateBtn: "Réduire la vidéo"
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
        save: "Save",
        breadcrumbHome: "Home",
        breadcrumbVip: "VIP Access",
        limitedAccess: "Limited Access",
        vipMessage: "'Master Atelier (VIP)' access is an exclusive experience reserved for our premium members.",
        vipBenefits: "✦ Unlock secret patterns & expert tutorials",
        later: "LATER",
        requestSentTitle: "Request Received!",
        requestSentMsg: "We have received your request. An administrator will contact you shortly. Thank you!",
        rotateBtn: "Rotate Screen (Landscape)",
        exitRotateBtn: "Minimize Video"
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
        save: "حفظ",
        breadcrumbHome: "الرئيسية",
        breadcrumbVip: "دخول VIP",
        limitedAccess: "دخول محدود",
        vipMessage: "دخول 'Master Atelier (VIP)' هو تجربة حصرية مخصصة لأعضائنا المميزين.",
        vipBenefits: "✦ اكتشف الباترونات السرية والدروس المتقدمة",
        later: "لاحقاً",
        requestSentTitle: "تم استلام طلبك!",
        requestSentMsg: "سنقوم بمراجعة طلبك والاتصال بك في أقرب وقت ممكن. شكراً لاهتمامك!",
        rotateBtn: "تدوير الشاشة بالعرض",
        exitRotateBtn: "تصغير الفيديو وإرجاعه"
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

// Helper to determine if a lesson is accessible in free trial mode (Patron, Coupe, Couture)
const isTrialAllowedVideo = (video, idx) => {
    if (!video) return false;
    // The first video (e.g. Patron) is always accessible
    if (idx === 0) return true;

    // By position in curriculum: Patron (idx 0), Coupe (idx 1), Couture (idx 2)
    if (idx === 1 || idx === 2) return true;

    // Check title in all language variants
    const titleCandidates = [
        video.title,
        video.title_lang?.fr,
        video.title_lang?.ar,
        video.title_lang?.en,
        video.title_lang?.tn,
        video.category,
        video.subCategory
    ].filter(Boolean).map(t => t.toString().toLowerCase().trim());

    return titleCandidates.some(t =>
        t.includes('coupe') ||
        t.includes('couture') ||
        t.includes('patron') ||
        t.includes('قص') ||
        t.includes('فصالة') ||
        t.includes('خياطة') ||
        t.includes('باترون') ||
        t.includes('cut') ||
        t.includes('sew')
    );
};

const LessonCard = ({ video, isActive, onSelect, lang, isAdmin, onEdit, onDelete, onUploadThumbnail, uploadingId, appLanguage, isTrialMode, isTrialVideo }) => {
    const fileRef = useRef(null);
    const isLocked = isTrialMode && !isAdmin && !isTrialVideo;

    return (
        <div
            className={`lesson-card-item-premium ${isActive ? 'is-active' : ''} ${isLocked ? 'trial-locked-card' : ''}`}
            onClick={() => onSelect(video)}
            style={{ position: 'relative', opacity: isLocked ? 0.7 : 1 }}
        >
            {isAdmin && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 12, display: 'flex', gap: '5px' }}>
                    <input
                        type="file"
                        ref={fileRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => onUploadThumbnail(video, e.target.files[0])}
                    />
                    <button
                        className="edit-btn-minimal-lux"
                        style={{ padding: '5px', background: 'rgba(212,175,55,0.9)' }}
                        onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                        title="Upload Thumbnail"
                    >
                        {uploadingId === video._id ? <FaSpinner className="spinner" size={12} /> : <FaCloudUploadAlt size={12} />}
                    </button>
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

            {/* Trial mode badges */}
            {isTrialMode && !isAdmin && (
                <div style={{
                    position: 'absolute', top: '8px', left: '8px', zIndex: 12,
                    padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800,
                    background: isTrialVideo ? 'linear-gradient(135deg,#d4af37,#f5e478)' : 'rgba(30,41,59,0.85)',
                    color: isTrialVideo ? '#1e293b' : '#94a3b8',
                    border: isTrialVideo ? 'none' : '1px solid rgba(148,163,184,0.3)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    {isTrialVideo
                        ? <>{appLanguage === 'ar' ? '⭐ درس تجريبي' : '⭐ Essai'}</>
                        : <><FaLock size={10} /> {appLanguage === 'ar' ? 'مقفل' : 'VIP'}</>
                    }
                </div>
            )}

            <div className="l-card-preview-box">
                <img 
                    src={video.thumbnail || getCategoryFallbackImage(video.title, appLanguage)} 
                    alt={video.title} 
                    className="l-card-preview-img" 
                    onError={(e) => {
                        const fallback = getCategoryFallbackImage(video.title, appLanguage);
                        if (e.currentTarget.src !== fallback) {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallback;
                        }
                    }}
                />
                <div className="l-play-overlay">
                    <div className="l-play-btn-circle">
                        {isLocked ? <FaLock style={{ color: '#d4af37' }} /> : (isActive ? <FaPlayCircle /> : <FaPlay />)}
                    </div>
                </div>
            </div>
            <div className="l-card-details" style={{ textAlign: appLanguage === 'ar' ? 'right' : 'left' }}>
                <h3 className="l-card-title-text">{video.title}</h3>
                <div className="l-card-meta-bar">
                    {isActive ? (
                        <span className="l-meta-tag">
                            {video.playing_text || lang.playing}
                        </span>
                    ) : (isTrialMode && isTrialVideo) ? (
                        <span className="l-meta-tag" style={{ color: '#d4af37' }}>
                            {appLanguage === 'ar' ? 'تجربة مجانية' : 'Essai gratuit'}
                        </span>
                    ) : (video.status_lang?.[appLanguage] || video.isVip) ? (
                        <span className="l-meta-tag">
                            {video.status_lang?.[appLanguage] || (video.isVip ? 'VIP' : '')}
                        </span>
                    ) : null}
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
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Access Control Modal State
    const [showVipModal, setShowVipModal] = useState(false);
    const [vipPhone, setVipPhone] = useState('');
    const [vipFullName, setVipFullName] = useState('');
    const [isSubmittingVip, setIsSubmittingVip] = useState(false);
    const [vipRequestSuccess, setVipRequestSuccess] = useState(false);


    // Hero Management
    const [isEditingHero, setIsEditingHero] = useState(false);
    const [heroContent, setHeroContent] = useState({});
    const [editHeroContent, setEditHeroContent] = useState({});
    const [heroBg, setHeroBg] = useState("");
    const [courseInfo, setCourseInfo] = useState(null);
    const [groupId, setGroupId] = useState(null);
    const [groupCategoryName, setGroupCategoryName] = useState(null);
    const [allCoursesCount, setAllCoursesCount] = useState(null);
    const [navTranslations, setNavTranslations] = useState({});
    const [breadcrumbTranslations, setBreadcrumbTranslations] = useState({
        ar: { home: 'الرئيسية', shop: 'الباتيرنات / المتجر', vip: 'دخول VIP' },
        fr: { home: 'Accueil', shop: 'Boutique', vip: 'Accès VIP' },
        en: { home: 'Home', shop: 'Shop', vip: 'VIP Access' }
    });
    const [isEditingBreadcrumbs, setIsEditingBreadcrumbs] = useState(false);
    const [editBreadcrumbsData, setEditBreadcrumbsData] = useState({});


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
    const heroFileInputRefs = useRef({});


    const topRef = useRef(null);
    const videoSectionRef = useRef(null);
    const iframeRef = useRef(null);
    const [isLandscapeMode, setIsLandscapeMode] = useState(false);

    // Sync fullscreen state with browser events
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFs = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );
            if (!isFs) {
                setIsLandscapeMode(false);
                try {
                    if (window.screen?.orientation?.unlock) {
                        window.screen.orientation.unlock();
                    } else if (window.screen?.unlockOrientation) {
                        window.screen.unlockOrientation();
                    }
                } catch (e) {}
            } else {
                setIsLandscapeMode(true);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // Handle Escape key to exit landscape fullscreen
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isLandscapeMode) {
                toggleRotateLandscape();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLandscapeMode]);

    const toggleRotateLandscape = async () => {
        const isCurrentlyFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            isLandscapeMode
        );

        if (!isCurrentlyFullscreen) {
            setIsLandscapeMode(true);

            // 1. Enter native fullscreen on the container (videoSectionRef) so the minimize button remains visible on top of the video
            const target = videoSectionRef.current || iframeRef.current;
            if (target) {
                try {
                    if (target.requestFullscreen) {
                        await target.requestFullscreen();
                    } else if (target.webkitRequestFullscreen) {
                        await target.webkitRequestFullscreen();
                    } else if (target.mozRequestFullScreen) {
                        await target.mozRequestFullScreen();
                    } else if (target.msRequestFullscreen) {
                        await target.msRequestFullscreen();
                    }
                } catch (err) {
                    console.log("Container fullscreen notice, trying iframe fallback:", err);
                    if (iframeRef.current && target !== iframeRef.current) {
                        try {
                            if (iframeRef.current.requestFullscreen) {
                                await iframeRef.current.requestFullscreen();
                            } else if (iframeRef.current.webkitRequestFullscreen) {
                                await iframeRef.current.webkitRequestFullscreen();
                            }
                        } catch (e2) {}
                    }
                }
            }

            // 2. Lock screen orientation to landscape horizontally on mobile devices
            try {
                if (window.screen?.orientation?.lock) {
                    await window.screen.orientation.lock('landscape');
                } else if (window.screen?.lockOrientation) {
                    window.screen.lockOrientation('landscape');
                } else if (window.screen?.webkitLockOrientation) {
                    window.screen.webkitLockOrientation('landscape');
                } else if (window.screen?.mozLockOrientation) {
                    window.screen.mozLockOrientation('landscape');
                }
            } catch (e) {
                console.log("Orientation lock notice:", e);
            }
        } else {
            setIsLandscapeMode(false);

            // 1. Unlock screen orientation
            try {
                if (window.screen?.orientation?.unlock) {
                    window.screen.orientation.unlock();
                } else if (window.screen?.unlockOrientation) {
                    window.screen.unlockOrientation();
                }
            } catch (e) {}

            // 2. Exit native fullscreen if active
            try {
                if (
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.mozFullScreenElement ||
                    document.msFullscreenElement
                ) {
                    if (document.exitFullscreen) await document.exitFullscreen();
                    else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
                    else if (document.mozCancelFullScreen) await document.mozCancelFullScreen();
                    else if (document.msExitFullscreen) await document.msExitFullscreen();
                }
            } catch (e) {}
        }
    };

    const { leconTitle } = useParams();
    const location = useLocation();
    const { pathname } = location;
    const navigate = useNavigate();
    const [isFullscreenCard, setIsFullscreenCard] = useState(false);
    const actualTitle = decodeURIComponent(leconTitle);
    const isCoursagePath = pathname.startsWith('/les_Leçons') || pathname.startsWith('/les_Leçons');
    const isTrialMode = location.search.includes('trial=true') || sessionStorage.getItem('is_trial_mode') === 'true';

    // State for trial-mode locked lesson modal
    const [showLockedModal, setShowLockedModal] = useState(false);

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
    }, [languages]);

    const handleVideoThumbnailUpload = async (video, file) => {
        if (!file) return;

        setUploadingToCloudinary(video._id);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post(`${BASE_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data && res.data.url) {
                // Update specific video thumbnail directly via specialized-videos PUT
                await axios.put(`${BASE_URL}/api/specialized-videos/${video._id}`, {
                    thumbnail: res.data.url
                });

                showAlert('success', 'Success', appLanguage === 'ar' ? 'تم تحديث الصورة المصغرة بنجاح!' : 'Thumbnail mise à jour !');
                fetchVideos();
            }
        } catch (err) {
            console.error(err);
            showAlert('error', 'Error', 'Failed to upload thumbnail');
        } finally {
            setUploadingToCloudinary(null);
        }
    };

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

    const fetchVideos = useCallback(async (allTitles = [actualTitle], parentCategory = null) => {
        setIsVideoLoading(true);
        setVideos(prev => {
            if (!prev || prev.length === 0) setLoading(true);
            return prev;
        });

        try {
            // Convert to array if it is not one
            const titles = Array.isArray(allTitles) ? allTitles : [allTitles];
            const targetLessonTitles = titles.map(t => (t || '').toString().trim().toLowerCase());

            const params = {
                subCategory: titles.length === 1 ? titles[0] : titles
            };
            if (parentCategory) {
                params.category = parentCategory;
            } else if (groupCategoryName) {
                params.category = groupCategoryName;
            }

            const res = await axios.get(`${BASE_URL}/api/specialized-videos`, { params });

            // Filter result strictly so that a video with a subCategory matches the requested subcategory
            const filteredVideos = res.data.filter(v => {
                const vSub = (v.subCategory || '').trim().toLowerCase();
                const vCat = (v.category || '').trim().toLowerCase();

                if (vSub) {
                    return targetLessonTitles.includes(vSub);
                }
                // Fallback for legacy videos without subCategory
                return targetLessonTitles.includes(vCat);
            });

            const preparedVideos = filteredVideos.map((v, i) => {
                const localizedTitle = v.title_lang?.[appLanguage] || (appLanguage === 'tn' && v.title_lang?.en) || v.title;
                const localizedUrl = v.url_lang?.[appLanguage] || (appLanguage === 'tn' && v.url_lang?.en) || v.url;
                return {
                    ...v,
                    title: localizedTitle,
                    url: localizedUrl,
                    isVip: v.status_lang?.fr === 'VIP' || v.status_lang?.ar === 'VIP' || i % 3 === 0,
                    thumbnail: v.thumbnail || getThumbnailUrl(localizedUrl, localizedTitle)
                };
            });
            setVideos(preparedVideos);

            if (preparedVideos.length > 0) {
                setCurrentVideo(prev => {
                    if (prev) {
                        const existingMatch = preparedVideos.find(v => v._id === prev._id);
                        if (existingMatch) return existingMatch;
                    }
                    const firstVideo = preparedVideos[0];
                    const isLessonFree = firstVideo.status_lang?.[appLanguage]?.toLowerCase().includes('free') ||
                        firstVideo.status_lang?.[appLanguage]?.toLowerCase().includes('مجاني') ||
                        !firstVideo.isVip;

                    const loggedIn = localStorage.getItem('login') === 'true';
                    // Allow trial mode: first video plays freely without login
                    if (loggedIn || isLessonFree || isTrialMode) {
                        return firstVideo;
                    } else {
                        navigate('/login');
                        return null;
                    }
                });
            } else {
                setCurrentVideo(null);
            }
            setError(null);
        } catch (err) {
            setError(translations[appLanguage]?.errorMsg || translations.fr?.errorMsg || 'Erreur lors du chargement.');
        } finally {
            setLoading(false);
            setIsVideoLoading(false);
        }
    }, [actualTitle, appLanguage, groupCategoryName, navigate]);

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
                    const cTech = (c.technicalName || '').trim().toLowerCase();
                    const groupCat = (group.vip_category || '').trim().toLowerCase();
                    if (cTech && cTech === actualTitle.trim().toLowerCase() && cTech !== groupCat) return true;
                    if (typeof c.title === 'object') {
                        return Object.values(c.title).some(t => t?.toString().trim().toLowerCase() === actualTitle.trim().toLowerCase());
                    }
                    return c.title?.toString().trim().toLowerCase() === actualTitle.trim().toLowerCase();
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

                const allCoursesInCat = res.data
                    .filter(group => group.vip_category === foundGroupCatName)
                    .flatMap(group => group.courses);
                setAllCoursesCount(allCoursesInCat.length);

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

                const titles = [actualTitle];
                if (typeof foundCourse.title === 'object') {
                    Object.values(foundCourse.title).forEach(tVal => {
                        if (tVal && !titles.includes(tVal)) titles.push(tVal);
                    });
                }

                fetchVideos(titles, foundGroupCatName);
            } else {
                fetchVideos([actualTitle]);
            }
        } catch (e) {
            console.error("Error fetching course info", e);
            fetchVideos([actualTitle]);
        }
    }, [actualTitle, languages, fetchVideos, isCoursagePath, appLanguage]);

    useEffect(() => {
        // Check Auth
        const loggedIn = localStorage.getItem('login') === 'true';
        setIsLoggedIn(loggedIn);

        // Check Admin
        const email = localStorage.getItem('loggedInUserEmail') || localStorage.getItem('currentUserEmail') || null;
        if (email) {
            fetch(`${BASE_URL}/api/users/${email}`)
                .then(res => res.json())
                .then(data => {
                    setIsAdmin(data && data.statut === 'admin');
                })
                .catch(() => { setIsAdmin(false); });
        } else {
            setIsAdmin(false);
        }

        // Fetch Navbar Translations
        fetch(`${BASE_URL}/api/settings/navbar_translations`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setNavTranslations(data);
            })
            .catch(() => {});

        // Fetch Breadcrumb Translations
        fetch(`${BASE_URL}/api/settings/breadcrumb_translations`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setBreadcrumbTranslations(prev => ({ ...prev, ...data }));
            })
            .catch(() => {});

        fetchCourseInfo();
        fetchSiteSettings();
    }, [actualTitle]);

    const handleSaveBreadcrumbs = async () => {
        setBreadcrumbTranslations(editBreadcrumbsData);
        setIsEditingBreadcrumbs(false);
        try {
            await fetch(`${BASE_URL}/api/settings/breadcrumb_translations`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editBreadcrumbsData })
            });
            showAlert('success', appLanguage === 'ar' ? 'تم الحفظ' : 'Enregistré', appLanguage === 'ar' ? 'تم تحديث مسار التنقل بنجاح' : 'Navigation mise à jour');
        } catch (err) {
            showAlert('error', 'Error', 'Failed to save');
        }
    };
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


    // ✅ إعادة تحميل الفيديوهات وقسم البرنامج عند تغيير اللغة
    useEffect(() => {
        setCurrentVideo(null);
        setIsVideoLoading(true);
        fetchCourseInfo();
    }, [appLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSelectVideo = (video) => {
        const isLessonFree = video.status_lang?.[appLanguage]?.toLowerCase().includes('free') ||
            video.status_lang?.[appLanguage]?.toLowerCase().includes('مجاني') ||
            !video.isVip;

        // In trial mode: allow Patron, Coupe, and Couture lessons freely. Others show locked modal.
        if (isTrialMode && !isAdmin) {
            const videoIdx = videos.findIndex(v => v._id === video._id);
            const isAllowed = isTrialAllowedVideo(video, videoIdx);
            if (!isAllowed) {
                setShowLockedModal(true);
                return;
            }
            setCurrentVideo(video);
            if (topRef.current) {
                topRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        if (!isLoggedIn && !isLessonFree) {
            navigate('/login');
            return;
        }

        setCurrentVideo(video);
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleVipRequest = async (e) => {
        e.preventDefault();
        const userEmail = localStorage.getItem('loggedInUserEmail') || localStorage.getItem('currentUserEmail') || 'invite@ateliersfax.com';

        if (!vipPhone) return;
        setIsSubmittingVip(true);
        try {
            const res = await fetch(`${BASE_URL}/api/abonnement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: vipFullName || 'Client',
                    mail: userEmail,
                    telephone: vipPhone
                })
            });
            if (res.ok) {
                setVipRequestSuccess(true);
                setTimeout(() => {
                    setShowVipModal(false);
                    setVipRequestSuccess(false);
                    setVipFullName('');
                    setVipPhone('');
                }, 5000);
            } else {
                const data = await res.json();
                showAlert('error', 'Error', data.message || 'Erreur lors de l\'envoi');
            }
        } catch (err) {
            console.error(err);
            showAlert('error', 'Error', 'Connection error');
        } finally {
            setIsSubmittingVip(false);
        }
    };

    if (loading) return (
        <div className="lessons-premium-wrapper" style={{ background: '#fcfcfd' }}>
            <Navbar />
            <CoursePlayerSkeleton />
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
                {/* --- 🥖 BREADCRUMB NAVIGATION 🥖 --- */}
                <nav className="breadcrumb-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {isAdmin && (
                        <button 
                            onClick={() => {
                                setEditBreadcrumbsData({ ...breadcrumbTranslations });
                                setIsEditingBreadcrumbs(true);
                            }}
                            style={{
                                padding: '4px',
                                background: 'transparent',
                                border: 'none',
                                color: '#d4af37',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title={appLanguage === 'ar' ? 'تعديل مسار التنقل' : 'Modifier les boutons'}
                        >
                            <FaEdit size={14} />
                        </button>
                    )}
                    <NavLink to="/" className="breadcrumb-link">
                        {breadcrumbTranslations[appLanguage]?.home || t.breadcrumbHome}
                    </NavLink>
                    <FaArrowRight className="breadcrumb-separator" style={{ transform: direction === 'rtl' ? 'rotate(180deg)' : 'none' }} />
                    <NavLink to="/Vip-access" className="breadcrumb-link">
                        {breadcrumbTranslations[appLanguage]?.vip || navTranslations[appLanguage]?.vip || t.breadcrumbVip}
                    </NavLink>
                    <FaArrowRight className="breadcrumb-separator" style={{ transform: direction === 'rtl' ? 'rotate(180deg)' : 'none' }} />
                    {(groupCategoryName || actualTitle) !== (currentVideo?.title || actualTitle) && (
                        <>
                            {allCoursesCount === 1 ? (
                                <span className="breadcrumb-current-parent">
                                    {groupCategoryName || actualTitle}
                                </span>
                            ) : (
                                <NavLink to={`/les_cours/${encodeURIComponent(groupCategoryName || actualTitle)}`} className="breadcrumb-link">
                                    {groupCategoryName || actualTitle}
                                </NavLink>
                            )}
                            <FaArrowRight className="breadcrumb-separator" style={{ transform: direction === 'rtl' ? 'rotate(180deg)' : 'none' }} />
                        </>
                    )}
                    <div className="breadcrumb-current">
                        {currentVideo?.title || actualTitle}
                    </div>
                </nav>

                {/* --- ⭐ TRIAL MODE WELCOME BANNER --- */}
                {isTrialMode && !isAdmin && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(30, 41, 59, 0.95))',
                        border: '1.5px solid rgba(212, 175, 55, 0.4)',
                        borderRadius: '16px',
                        padding: '14px 20px',
                        marginTop: '16px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.5rem' }}>⭐</span>
                            <div>
                                <strong style={{ color: '#d4af37', fontSize: '0.95rem', display: 'block', marginBottom: '2px' }}>
                                    {appLanguage === 'ar' ? 'أنت في وضع التجربة المجانية' : 'Mode Essai Gratuit'}
                                </strong>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                    {appLanguage === 'ar'
                                        ? 'يمكنك مشاهدة دروس هذا النموذج التجريبي (الباترون، القص، الخياطة) مجاناً وبدون تسجيل الدخول. لمشاهدة بقية الدروس والدورات، تفضل بالاشتراك في عروضنا.'
                                        : 'Vous pouvez visionner les leçons de ce modèle (Patron, Coupe, Couture) gratuitement et sans inscription. Pour débloquer toutes les leçons, découvrez nos offres.'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                sessionStorage.removeItem('is_trial_mode');
                                navigate('/offre-de-cours');
                            }}
                            style={{
                                background: 'linear-gradient(135deg, #d4af37, #f5e478)',
                                color: '#1e293b',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '9px 18px',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 10px rgba(212,175,55,0.3)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                        >
                            {appLanguage === 'ar' ? 'عرض خطط الاشتراك ←' : 'Voir les offres VIP →'}
                        </button>
                    </div>
                )}
                <br />


                {/* --- 🎬 VIDEO SKELETON / PREMIUM VIDEO CARD --- */}
                {isVideoLoading ? (
                    <section className="premium-video-card-section" ref={topRef}>
                        <div className="premium-video-card" style={{ overflow: 'hidden' }}>
                            {/* Skeleton Screen */}
                            <div style={{
                                position: 'relative', paddingTop: '56.25%', width: '100%',
                                background: 'linear-gradient(90deg, #1e293b 25%, #2d3f55 50%, #1e293b 75%)',
                                backgroundSize: '200% 100%',
                                animation: 'skeletonShimmer 1.5s infinite',
                                borderRadius: '16px'
                            }}>
                                {/* Centered play icon placeholder */}
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <div style={{
                                        width: 0, height: 0,
                                        borderTop: '12px solid transparent',
                                        borderBottom: '12px solid transparent',
                                        borderLeft: '20px solid rgba(255,255,255,0.18)',
                                        marginLeft: '4px'
                                    }} />
                                </div>
                                {/* Bottom bar skeleton */}
                                <div style={{
                                    position: 'absolute', bottom: '16px', left: '16px', right: '16px',
                                    display: 'flex', flexDirection: 'column', gap: '8px'
                                }}>
                                    <div style={{
                                        height: '6px', borderRadius: '4px',
                                        background: 'rgba(255,255,255,0.08)', width: '70%'
                                    }} />
                                    <div style={{
                                        height: '4px', borderRadius: '4px',
                                        background: 'rgba(255,255,255,0.05)', width: '40%'
                                    }} />
                                </div>
                            </div>
                            {/* Skeleton title line */}
                            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{
                                    height: '16px', borderRadius: '6px', width: '55%',
                                    background: 'linear-gradient(90deg, #1e293b 25%, #2d3f55 50%, #1e293b 75%)',
                                    backgroundSize: '200% 100%',
                                    animation: 'skeletonShimmer 1.5s infinite 0.2s'
                                }} />
                                <div style={{
                                    height: '12px', borderRadius: '6px', width: '35%',
                                    background: 'linear-gradient(90deg, #1e293b 25%, #2d3f55 50%, #1e293b 75%)',
                                    backgroundSize: '200% 100%',
                                    animation: 'skeletonShimmer 1.5s infinite 0.4s'
                                }} />
                            </div>
                        </div>
                    </section>
                ) : currentVideo && (
                    <section className={`premium-video-card-section ${isLandscapeMode ? 'is-landscape-fullscreen' : ''} ${isFullscreenCard ? 'is-fullscreen' : ''}`} ref={videoSectionRef}>

                        <div className="premium-video-card">
                            <div className="video-card-screen" style={{ position: 'relative' }}>
                                {/* 🔄 Rotate & Minimize button — overlaid at top of video */}
                                <button
                                    onClick={toggleRotateLandscape}
                                    className={`rotate-screen-btn ${isLandscapeMode ? 'is-minimized-state' : ''}`}
                                    type="button"
                                    title={isLandscapeMode ? (t.exitRotateBtn || 'تصغير الفيديو وإرجاعه') : (t.rotateBtn || 'تدوير الشاشة بالعرض')}
                                    style={{
                                        position: 'absolute',
                                        top: isLandscapeMode ? '14px' : '12px',
                                        [direction === 'rtl' ? 'left' : 'right']: isLandscapeMode ? '16px' : '12px',
                                        zIndex: 2147483647,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: isLandscapeMode ? '8px 18px' : '7px 16px',
                                        borderRadius: '30px',
                                        background: isLandscapeMode
                                            ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.95), rgba(185, 28, 28, 0.95))'
                                            : 'rgba(15,23,42,0.78)',
                                        backdropFilter: 'blur(8px)',
                                        WebkitBackdropFilter: 'blur(8px)',
                                        color: '#ffffff',
                                        border: isLandscapeMode
                                            ? '1.5px solid rgba(255,255,255,0.6)'
                                            : '1px solid rgba(212,175,55,0.45)',
                                        fontWeight: '700',
                                        fontSize: isLandscapeMode ? '0.86rem' : '0.82rem',
                                        cursor: 'pointer',
                                        pointerEvents: 'auto',
                                        touchAction: 'manipulation',
                                        boxShadow: isLandscapeMode
                                            ? '0 6px 20px rgba(220,38,38,0.5)'
                                            : '0 4px 16px rgba(0,0,0,0.35)',
                                        transition: 'all 0.25s ease',
                                    }}
                                >
                                    {isLandscapeMode ? (
                                        <>
                                            <FaCompress style={{ color: '#ffffff', fontSize: '0.95rem' }} />
                                            <span>{t.exitRotateBtn || 'تصغير الفيديو وإرجاعه'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="6" width="20" height="12" rx="2" transform="rotate(90 12 12)" />
                                                <path d="M12 2v4M12 18v4M4 12H2M22 12h-2" />
                                            </svg>
                                            <span>{t.rotateBtn || 'تدوير الشاشة بالعرض'}</span>
                                            <FaExpand style={{ color: '#d4af37' }} />
                                        </>
                                    )}
                                </button>

                                {(() => {
                                    const url = currentVideo.url || '';

                                    // Extract src if user pasted full <iframe> code
                                    let resolvedUrl = url;
                                    if (url.includes('<iframe')) {
                                        const srcMatch = url.match(/src=["']([^"']+)["']/);
                                        if (srcMatch && srcMatch[1]) resolvedUrl = srcMatch[1];
                                    }

                                    // YouTube embed
                                    const isYouTube = resolvedUrl.includes('youtube.com') || resolvedUrl.includes('youtu.be');
                                    let youtubeSrc = '';
                                    if (isYouTube) {
                                        const ytMatch = resolvedUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                                        if (ytMatch) youtubeSrc = `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
                                    }

                                    // Streamable embed
                                    let streamableSrc = resolvedUrl;
                                    if (resolvedUrl.includes('streamable.com')) {
                                        const smMatch = resolvedUrl.match(/streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/);
                                        if (smMatch) streamableSrc = `https://streamable.com/e/${smMatch[1]}`;
                                    }

                                    // Bunny.net / MediaDelivery embed
                                    let bunnySrc = resolvedUrl;
                                    if (resolvedUrl.includes('mediadelivery.net') || resolvedUrl.includes('bunny.net')) {
                                        bunnySrc = bunnySrc.replace('/play/', '/embed/');
                                        bunnySrc = bunnySrc.replace(/([?&])auto_?play=(?:0|1|true|false)/gi, '');
                                        bunnySrc = bunnySrc.replace(/[?&]$/, '');
                                        const sep = bunnySrc.includes('?') ? '&' : '?';
                                        bunnySrc = `${bunnySrc}${sep}autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
                                    }

                                    // All iframe-based platforms
                                    const isIframe = resolvedUrl.includes('mediadelivery.net') ||
                                        resolvedUrl.includes('bunny.net') ||
                                        resolvedUrl.includes('streamable.com') ||
                                        resolvedUrl.includes('player.') ||
                                        isYouTube;

                                    const iframeSrc = isYouTube ? youtubeSrc
                                        : resolvedUrl.includes('streamable.com') ? streamableSrc
                                        : (resolvedUrl.includes('mediadelivery.net') || resolvedUrl.includes('bunny.net')) ? bunnySrc
                                        : resolvedUrl;

                                    if (isIframe) {
                                        return (
                                            <div
                                                className="lesson-video-iframe-wrapper"
                                                style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    ...(isLandscapeMode ? {
                                                        height: '100vh',
                                                        maxHeight: '100vh',
                                                        width: '100vw',
                                                        maxWidth: '100vw',
                                                        paddingTop: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    } : {
                                                        paddingTop: '56.25%',
                                                    })
                                                }}
                                            >
                                                <iframe
                                                    ref={iframeRef}
                                                    key={iframeSrc}
                                                    src={iframeSrc}
                                                    loading="lazy"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                                    allowFullScreen={true}
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    style={{
                                                        border: 0,
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        height: '100%',
                                                        width: '100%',
                                                        pointerEvents: 'auto',
                                                        touchAction: 'auto',
                                                    }}
                                                />
                                            </div>
                                        );
                                    }

                                    // Google Drive or direct MP4/video file
                                    return (
                                        <UniversalVideoPlayer
                                            url={resolvedUrl}
                                            title={currentVideo.title}
                                        />
                                    );
                                })()}
                            </div>
                        </div>
                    </section>
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
                    {videos.map((video, idx) => (
                        <LessonCard
                            key={video._id}
                            video={{ ...video, playing_text: curriculumInfo[appLanguage]?.playing }}
                            isActive={currentVideo?._id === video._id}
                            onSelect={handleSelectVideo}
                            lang={t}
                            isAdmin={isAdmin}
                            onEdit={handleEditVideo}
                            onDelete={handleDeleteVideo}
                            onUploadThumbnail={handleVideoThumbnailUpload}
                            uploadingId={uploadingToCloudinary}
                            appLanguage={appLanguage}
                            isTrialMode={isTrialMode}
                            isTrialVideo={isTrialMode && isTrialAllowedVideo(video, idx)}
                        />
                    ))}
                </div>
            </main>

            {/* --- 🔒 TRIAL MODE LOCKED LESSON MODAL --- */}
            {showLockedModal && (
                <div
                    className="premium-modal-backdrop"
                    onClick={() => setShowLockedModal(false)}
                    style={{ zIndex: 9999 }}
                >
                    <div
                        className="premium-modal-content"
                        onClick={e => e.stopPropagation()}
                        style={{
                            maxWidth: '420px',
                            textAlign: 'center',
                            padding: '40px 30px',
                            background: 'linear-gradient(135deg,#0f172a 60%,#1a103c)',
                            border: '1.5px solid rgba(212,175,55,0.35)',
                            borderRadius: '24px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
                        }}
                    >
                        <button
                            className="premium-modal-close-icon"
                            onClick={() => setShowLockedModal(false)}
                            style={{ position: 'absolute', top: '14px', right: '14px' }}
                        >
                            <FaTimes />
                        </button>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
                        <h2 style={{ color: '#f5eed4', fontSize: '1.3rem', fontWeight: 800, marginBottom: '12px' }}>
                            {appLanguage === 'ar' ? 'هذا الدرس مقفل (VIP)' : 'Cette leçon est réservée aux membres VIP'}
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
                            {appLanguage === 'ar'
                                ? 'أنت في وضع التجربة المجانية. لمشاهدة باقي الدروس، يرجى الاشتراك في عرض VIP.'
                                : 'Vous êtes en mode essai gratuit. Pour accéder à toutes les leçons, abonnez-vous à une offre VIP.'}
                        </p>
                        <button
                            onClick={() => {
                                sessionStorage.removeItem('is_trial_mode');
                                navigate('/offre-de-cours');
                            }}
                            style={{
                                padding: '14px 28px',
                                background: 'linear-gradient(135deg,#d4af37,#f5e478)',
                                color: '#1e293b',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                width: '100%',
                                marginBottom: '10px',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                        >
                            {appLanguage === 'ar' ? '⭐ اشترك الآن في عرض VIP' : '⭐ S\'abonner à une offre VIP'}
                        </button>
                        <button
                            onClick={() => setShowLockedModal(false)}
                            style={{
                                background: 'transparent', border: '1px solid rgba(148,163,184,0.3)',
                                color: '#94a3b8', borderRadius: '10px', padding: '10px 20px',
                                cursor: 'pointer', fontSize: '0.85rem', width: '100%'
                            }}
                        >
                            {appLanguage === 'ar' ? 'العودة للدرس التجريبي' : 'Retour à l\'essai'}
                        </button>
                    </div>
                </div>
            )}

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
                                        <label>{lang.code === 'ar' ? 'رابط الخلفية' : 'URL IMAGE DE FOND'}</label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                placeholder="https://..."
                                                value={editHeroContent[lang.code]?.bg || ''}
                                                readOnly
                                                style={{ flex: 1, backgroundColor: '#f1f5f9' }}
                                            />
                                            <input
                                                type="file"
                                                ref={(el) => (heroFileInputRefs.current[lang.code] = el)}
                                                onChange={(e) => handleHeroFileUpload(e, lang.code)}
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => heroFileInputRefs.current[lang.code].click()}
                                                className="premium-btn-cta gold"
                                                style={{ padding: '8px 12px', minWidth: '70px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                disabled={uploadingToCloudinary === lang.code}
                                            >
                                                {uploadingToCloudinary === lang.code ? <FaSpinner className="spinner" /> : <FaUpload />}
                                            </button>
                                        </div>
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

            {/* --- 📝 EDIT BREADCRUMBS MODAL 📝 --- */}
            {isEditingBreadcrumbs && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditingBreadcrumbs(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '95vh', overflowY: 'auto' }}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingBreadcrumbs(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">{appLanguage === 'ar' ? 'تعديل نصوص أزرار مسار التنقل' : 'Modifier les libellés du fil d\'ariane'}</h2>
                        
                        <div className="premium-form-grid" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
                            {languages.map(lang => {
                                const langData = editBreadcrumbsData[lang.code] || { home: '', shop: '', vip: '' };
                                return (
                                    <div key={lang.code} className="premium-lang-section" style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '12px', padding: '15px' }}>
                                        <h4 className="lang-indicator" style={{ background: '#d4af37', display: 'inline-block', marginBottom: '10px', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                            {lang.label}
                                        </h4>
                                        <div className="premium-form-group" style={{ marginBottom: '10px' }}>
                                            <label style={{ fontSize: '0.85rem' }}>{appLanguage === 'ar' ? 'الرئيسية' : 'Accueil (Home)'}</label>
                                            <input 
                                                type="text" 
                                                value={langData.home || ''} 
                                                onChange={(e) => {
                                                    const updated = { ...editBreadcrumbsData };
                                                    updated[lang.code] = { ...langData, home: e.target.value };
                                                    setEditBreadcrumbsData(updated);
                                                }}
                                                dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        <div className="premium-form-group" style={{ marginBottom: '10px' }}>
                                            <label style={{ fontSize: '0.85rem' }}>{appLanguage === 'ar' ? 'المتجر / الباتيرنات' : 'Boutique (Shop)'}</label>
                                            <input 
                                                type="text" 
                                                value={langData.shop || ''} 
                                                onChange={(e) => {
                                                    const updated = { ...editBreadcrumbsData };
                                                    updated[lang.code] = { ...langData, shop: e.target.value };
                                                    setEditBreadcrumbsData(updated);
                                                }}
                                                dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        <div className="premium-form-group" style={{ marginBottom: '5px' }}>
                                            <label style={{ fontSize: '0.85rem' }}>{appLanguage === 'ar' ? 'دخول VIP' : 'Accès VIP (VIP)'}</label>
                                            <input 
                                                type="text" 
                                                value={langData.vip || ''} 
                                                onChange={(e) => {
                                                    const updated = { ...editBreadcrumbsData };
                                                    updated[lang.code] = { ...langData, vip: e.target.value };
                                                    setEditBreadcrumbsData(updated);
                                                }}
                                                dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="premium-btn-group" style={{ marginTop: '20px' }}>
                            <button type="button" className="premium-btn-cta secondary" onClick={() => setIsEditingBreadcrumbs(false)}>
                                {appLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button type="button" className="premium-btn-cta gold" onClick={handleSaveBreadcrumbs}>
                                {appLanguage === 'ar' ? 'حفظ التغييرات' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />

        </div>
    );
}
