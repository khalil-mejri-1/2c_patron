import React, { useState, useEffect, useRef } from 'react';
import { FaPlayCircle, FaCheckCircle, FaSpinner, FaChevronRight, FaEdit, FaPlus, FaTrash, FaTimes, FaVideo, FaImage, FaUpload, FaUser, FaPhoneAlt, FaCrown, FaLock } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import UniversalVideoPlayer from '../comp/UniversalVideoPlayer';
import { Link, useParams, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../apiConfig';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';
import { ProductGridSkeleton, PremiumErrorState } from '../comp/Skeletons';
import './cours_premium.css';
import { syncAuthSession } from '../utils/authSession';
import { getCategoryFallbackImage } from '../utils/categoryFallbacks';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        loading: "جاري تحميل الدورات المتخصصة...",
        error: "حدث خطأ أثناء تحميل الدورات. يرجى المحاولة لاحقاً.",
        videoTag: "مقدمة الدورة",
        videoTitle: (title) => `فن تصميم ${title}`,
        videoSubtitle: "ابدأ رحلتك التعليمية بمشاهدة هذا العرض المرئي الذي يلخص أهم المهارات التي ستكتسبها في هذا البرنامج.",
        videoFeature1: "إتقان الرسم الفني والباترون",
        videoFeature2: "تقنيات الخياطة الاحترافية",
        videoFeature3: "أسرار اللمسات النهائية الراقية",
        coursesTitle: "الدروس",
        coursesAccent: "المتاحة",
        button: "ابدأ الدرس",
        noCourses: "لا توجد دروس متاحة حالياً في هذه فئة.",
        duration: "عرض كامل",
        categoryTag: "برنامج تعليمي",
        editHero: "تعديل الواجهة",
        editIntro: "تعديل المقدمة",
        addLesson: "إضافة درس جديد",
        editLesson: "تعديل الدرس",
        save: "حفظ",
        cancel: "إلغاء",
        deleteConfirm: "هل أنت متأكد من حذف هذا الدرس؟",
        lessonTitle: "عنوان الدرس",
        lessonImg: "رابط الصورة",
        lessonDur: "المدة",
        videoUrl: "رابط الفيديو (Iframe)",
        courseMainTitle: "العنوان الرئيسي",
        breadcrumbHome: "الرئيسية",
        breadcrumbVip: "دخول VIP",
        limitedAccess: "دخول محدود",
        vipMessage: "دخول 'Master Atelier (VIP)' هو تجربة حصرية مخصصة لأعضائنا المميزين.",
        vipBenefits: "✦ اكتشف الباترونات السرية والدروس المتقدمة",
        later: "لاحقاً",
        requestSentTitle: "تم استلام طلبك!",
        requestSentMsg: "سنقوم بمراجعة طلبك والاتصال بك في أقرب وقت ممكن. شكراً لاهتمامك!"
    },
    fr: {
        loading: "Chargement des formations...",
        error: "Erreur lors du chargement des cours.",
        videoTag: "INTRODUCTION",
        videoTitle: (title) => `L'Art du ${title}`,
        videoSubtitle: "Commencez votre voyage par une vue d'ensemble des techniques avancées que vous découvrirez dans ce module.",
        videoFeature1: "Bases et perfectionnement du patron",
        videoFeature2: "Technique de montage professionnel",
        videoFeature3: "Finitions haute couture",
        coursesTitle: "Cours",
        coursesAccent: "Disponibles",
        button: "Commencer",
        noCourses: "Aucun cours trouvé dans cette catégorie.",
        duration: "Accès complet",
        categoryTag: "FORMATION",
        editHero: "Modifier Hero",
        editIntro: "Modifier Intro",
        addLesson: "Ajouter un cours",
        editLesson: "Modifier le cours",
        save: "Enregistrer",
        cancel: "Annuler",
        deleteConfirm: "Voulez-vous vraiment supprimer ce cours ?",
        lessonTitle: "Titre du cours",
        lessonImg: "Lien image (URL)",
        lessonDur: "Durée",
        videoUrl: "Lien Vidéo (Iframe)",
        courseMainTitle: "Titre Principal",
        breadcrumbHome: "Accueil",
        breadcrumbVip: "Accès VIP",
        limitedAccess: "Accès Limité",
        vipMessage: "L'accès 'Master Atelier (VIP)' est une expérience exclusive réservée à nos membres privilégiés.",
        vipBenefits: "✦ Débloquez des patrons secrets & tutoriels d'experts",
        later: "PLUS TARD",
        requestSentTitle: "Demande Reçue !",
        requestSentMsg: "Nous avons bien reçu votre demande. Un administrateur vous contactera sous peu. Merci !"
    },
    en: {
        loading: "Loading specialized courses...",
        error: "Error loading courses. Please try again.",
        videoTag: "VIDEO INTRO",
        videoTitle: (title) => `The Art of ${title}`,
        videoSubtitle: "Start your journey with an overview of the advanced techniques you'll discover in this module.",
        videoFeature1: "Pattern making mastery",
        videoFeature2: "Professional sewing techniques",
        videoFeature3: "Luxury finishing secrets",
        coursesTitle: "Available",
        coursesAccent: "Courses",
        button: "Start",
        noCourses: "No courses found in this category.",
        duration: "Full Access",
        categoryTag: "PROGRAM",
        editHero: "Edit Hero",
        editIntro: "Edit Intro",
        addLesson: "Add Lesson",
        editLesson: "Edit Lesson",
        save: "Save",
        cancel: "Cancel",
        deleteConfirm: "Are you sure you want to delete this lesson?",
        lessonTitle: "Lesson Title",
        lessonImg: "Image URL",
        lessonDur: "Duration",
        videoUrl: "Video URL (Iframe)",
        courseMainTitle: "Main Title",
        breadcrumbHome: "Home",
        breadcrumbVip: "VIP Access",
        limitedAccess: "Limited Access",
        vipMessage: "'Master Atelier (VIP)' access is an exclusive experience reserved for our premium members.",
        vipBenefits: "✦ Unlock secret patterns & expert tutorials",
        later: "LATER",
        requestSentTitle: "Request Received!",
        requestSentMsg: "We have received your request. An administrator will contact you shortly. Thank you!"
    }
};

const VideoIntroduction = ({ videoUrl, title, appLanguage, isAdmin, onEdit, onDelete, introData }) => {
    const actualTitle = decodeURIComponent(title);
    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    // ── Normalise the video URL ──────────────────────────────────────────
    const buildEmbedSrc = (raw) => {
        if (!raw) return null;
        let url = raw.trim();

        // Extract src from full <iframe> paste
        if (url.includes('<iframe')) {
            const m = url.match(/src=["']([^"']+)["']/);
            if (m && m[1]) url = m[1];
        }

        // Bunny / MediaDelivery
        if (url.includes('mediadelivery.net') || url.includes('bunny.net')) {
            url = url.replace('/play/', '/embed/');
            url = url.replace(/([?&])auto_?play=(?:0|1|true|false)/gi, '');
            url = url.replace(/[?&]$/, '');
            const sep = url.includes('?') ? '&' : '?';
            return `${url}${sep}autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
        }

        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            return m ? `https://www.youtube.com/embed/${m[1]}?rel=0&autoplay=0` : url;
        }

        // Streamable
        if (url.includes('streamable.com')) {
            const m = url.match(/streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/);
            return m ? `https://streamable.com/e/${m[1]}` : url;
        }

        return url;
    };

    const embedSrc = buildEmbedSrc(videoUrl);

    // Determine if it is an embeddable iframe platform
    const isIframePlatform = (src) =>
        src && (
            src.includes('mediadelivery.net') ||
            src.includes('bunny.net') ||
            src.includes('youtube.com') ||
            src.includes('streamable.com') ||
            src.includes('youtu.be')
        );

    return (
        <div className="premium-video-intro-box" dir={direction}>
            <div className="premium-video-info">
                <span className="premium-video-tag">{introData?.tag || t.videoTag}</span>
                <h2 className="premium-video-title">{introData?.title || t.videoTitle(actualTitle)}</h2>
                <p className="premium-video-desc">{introData?.subtitle || t.videoSubtitle}</p>
                <div className="premium-video-features">
                    <span className="p-feature-item"><FaCheckCircle /> {introData?.feature1 || t.videoFeature1}</span>
                    <span className="p-feature-item"><FaCheckCircle /> {introData?.feature2 || t.videoFeature2}</span>
                    <span className="p-feature-item"><FaCheckCircle /> {introData?.feature3 || t.videoFeature3}</span>
                </div>
            </div>

            <div className="premium-video-player-side">
                {isAdmin && (
                    <div className="admin-intro-controls" style={{ position: 'absolute', top: '40px', right: direction === 'rtl' ? 'auto' : '40px', left: direction === 'rtl' ? '40px' : 'auto', display: 'flex', gap: '8px', zIndex: 20 }}>
                        <button className="edit-btn-minimal-lux" onClick={onEdit} title={t.editIntro}>
                            <FaVideo size={12} /> {t.editIntro}
                        </button>
                        <button
                            className="edit-btn-minimal-lux"
                            onClick={onDelete}
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)', color: '#fff', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                            title={appLanguage === 'ar' ? 'حذف المقدمة' : 'Supprimer l\'intro'}
                        >
                            <FaTrash size={12} />
                        </button>
                    </div>
                )}
                {videoUrl ? (
                    <div className="premium-focus-cinema-intro">
                        {isIframePlatform(videoUrl) || isIframePlatform(embedSrc) ? (
                            /* ── iframe-based player (Bunny, YouTube, Streamable) ── */
                            <iframe
                                key={embedSrc}
                                src={embedSrc}
                                title={`Introduction - ${actualTitle}`}
                                loading="lazy"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                allowFullScreen={true}
                                referrerPolicy="no-referrer-when-downgrade"
                                style={{
                                    position: 'absolute',
                                    top: 0, left: 0,
                                    width: '100%', height: '100%',
                                    border: 'none',
                                }}
                            />
                        ) : (
                            /* ── HTML5 / Google Drive / direct MP4 ── */
                            <UniversalVideoPlayer
                                url={videoUrl}
                                title={`Introduction - ${actualTitle}`}
                                autoPlay={false}
                            />
                        )}
                    </div>
                ) : (
                    <div className="premium-focus-cinema-intro" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <FaVideo size={40} />
                    </div>
                )}
            </div>
        </div>
    );
};



export default function Cours() {
    const { courseTitle } = useParams();
    const actualTitle = decodeURIComponent(courseTitle);
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const { appLanguage, languages } = useLanguage();

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminCheckComplete, setAdminCheckComplete] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isVipCategory, setIsVipCategory] = useState(false);

    // Access Control Modal State
    const [showVipModal, setShowVipModal] = useState(false);
    const [vipPhone, setVipPhone] = useState('');
    const [vipFullName, setVipFullName] = useState('');
    const [isSubmittingVip, setIsSubmittingVip] = useState(false);
    const [vipRequestSuccess, setVipRequestSuccess] = useState(false);


    // Hero Customization (Optional per course)
    const [isEditingHero, setIsEditingHero] = useState(false);
    const [isEditingSection, setIsEditingSection] = useState(false);

    // Lesson Management State
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [lessonMode, setLessonMode] = useState('add');
    const [selectedLessonIndex, setSelectedLessonIndex] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [lessonData, setLessonData] = useState({ technicalName: '', title: {}, image: '', duration: {} });
    const [isUploading, setIsUploading] = useState(false);
    const lessonFileInputRef = useRef(null);
    const heroFileInputRefs = useRef({});



    // Video Intro Management State
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [newVideoUrl, setNewVideoUrl] = useState({});
    const [introContent, setIntroContent] = useState({});
    const [editIntroContent, setEditIntroContent] = useState({});

    // Hero Background State
    const [heroBg, setHeroBg] = useState("");
    const [heroContent, setHeroContent] = useState({});
    const [editHeroContent, setEditHeroContent] = useState({});
    const [navTranslations, setNavTranslations] = useState({});
    const [breadcrumbTranslations, setBreadcrumbTranslations] = useState({
        ar: { home: 'الرئيسية', shop: 'الباتيرنات / المتجر', vip: 'دخول VIP' },
        fr: { home: 'Accueil', shop: 'Boutique', vip: 'Accès VIP' },
        en: { home: 'Home', shop: 'Shop', vip: 'VIP Access' }
    });
    const [isEditingBreadcrumbs, setIsEditingBreadcrumbs] = useState(false);
    const [editBreadcrumbsData, setEditBreadcrumbsData] = useState({});

    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/specialized-courses`, {
                params: { category: actualTitle }
            });
            setGroups(res.data);
            if (res.data.length > 0) {
                const group = res.data[0];

                // Normalize Video Link
                const vl = typeof group.video_link === 'object' ? { ...group.video_link } : { fr: group.video_link || '' };
                languages.forEach(l => { if (!vl[l.code]) vl[l.code] = vl.fr || ''; });
                setNewVideoUrl(vl);
                setHeroBg(group.hero_bg || "");
                const hc = group.hero_content || {};
                setHeroContent(hc);

                // Initialize intro content
                const ic = group.intro_content || {};
                setIntroContent(ic);

                // Pre-initialize edit intro content with translations fallbacks
                const initIntro = {};
                languages.forEach(l => {
                    initIntro[l.code] = {
                        videoUrl: ic[l.code]?.videoUrl || vl[l.code] || "",
                        tag: ic[l.code]?.tag || translations[l.code]?.videoTag || "",
                        title: ic[l.code]?.title || (translations[l.code]?.videoTitle ? translations[l.code].videoTitle(actualTitle) : `L'Art du ${actualTitle}`),
                        subtitle: ic[l.code]?.subtitle || translations[l.code]?.videoSubtitle || "",
                        feature1: ic[l.code]?.feature1 || translations[l.code]?.videoFeature1 || "",
                        feature2: ic[l.code]?.feature2 || translations[l.code]?.videoFeature2 || "",
                        feature3: ic[l.code]?.feature3 || translations[l.code]?.videoFeature3 || ""
                    };
                });
                setEditIntroContent(initIntro);

                // Pre-initialize edit content with fallbacks
                const init = {};
                languages.forEach(l => {
                    init[l.code] = {
                        badge: hc[l.code]?.badge || translations[l.code]?.categoryTag || translations.fr.categoryTag || "",
                        title: hc[l.code]?.title || actualTitle || "",
                        accent: hc[l.code]?.accent || "",
                        bg: hc[l.code]?.bg || group.hero_bg || "",
                        sectionTitle: hc[l.code]?.sectionTitle || "",
                        sectionAccent: hc[l.code]?.sectionAccent || ""
                    };
                });
                setEditHeroContent(init);
            }
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'instant' });
        } catch (err) {
            console.error(err);
            setError(t.error);
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    };

    const fetchCategoryInfo = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/vip-categories`);
            const currentCat = res.data.find(c => {
                if (typeof c.title === 'object') {
                    return Object.values(c.title).some(t => t?.toString().trim() === actualTitle.trim());
                }
                return c.title?.toString().trim() === actualTitle.trim();
            });
            if (currentCat && currentCat.accessType === 'vip') {
                setIsVipCategory(true);
            }
        } catch (err) {
            console.error("Error fetching category info:", err);
        }
    };


    const [isVipExpired, setIsVipExpired] = useState(false);

    useEffect(() => {
        // 🍎 iOS Safari Fix: Restore session from cookies before checking auth
        syncAuthSession();

        // Admin & VIP Expiration Check
        const email =
            localStorage.getItem('loggedInUserEmail') ||
            localStorage.getItem('currentUserEmail') ||
            null;

        const checkUserStatus = async () => {
            if (email) {
                try {
                    const response = await fetch(`${BASE_URL}/api/users/${email}`);
                    const data = await response.json();
                    if (data) {
                        if (data.statut === 'admin') {
                            setIsAdmin(true);
                        } else {
                            setIsAdmin(false);
                        }
                        if (data.isExpired) {
                            setIsVipExpired(true);
                        } else {
                            setIsVipExpired(false);
                        }
                    }
                } catch (e) {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
            setAdminCheckComplete(true);
        }
        checkUserStatus();
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

        setIsLoggedIn(localStorage.getItem('login') === 'true');
        fetchCategoryInfo();
        fetchCourses();
    }, [actualTitle, t.error]);

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

    useEffect(() => {
        if (!loading && !error && adminCheckComplete) {
            const allCourses = groups.flatMap(group => group.courses);
            if (allCourses.length === 1 && !isAdmin) {
                const course = allCourses[0];
                const courseTitleStr = course.technicalName || (typeof course.title === 'object' ? (course.title.fr || course.title[Object.keys(course.title)[0]]) : course.title);
                const lessonPath = (actualTitle && actualTitle.toLowerCase() === "les corsages")
                    ? `/les_Leçons/${encodeURIComponent(courseTitleStr)}`
                    : `/Leçons/${encodeURIComponent(courseTitleStr)}`;

                if (isVipCategory && !isLoggedIn) {
                    navigate('/login');
                } else {
                    navigate(lessonPath, { replace: true });
                }
            }
        }
    }, [loading, error, adminCheckComplete, groups, isAdmin, isVipCategory, isLoggedIn, actualTitle, navigate]);


    const handleLessonSubmit = async () => {
        if (groups.length === 0) {
            // Create a new group if none exists
            try {
                const newCourse = { ...lessonData, vip_category: actualTitle };
                await axios.post(`${BASE_URL}/api/specialized-courses/group`, {
                    video_link: newVideoUrl || "",
                    courses: [newCourse]
                });
                showAlert('success', 'Created', 'Lesson added to a new group');
                fetchCourses();
                setShowLessonModal(false);
            } catch (e) { showAlert('error', 'Error', 'Failed to create group'); }
            return;
        }

        // Use the selected group if editing, otherwise default to the first group for adding
        const groupId = (lessonMode === 'edit' && selectedGroupId) ? selectedGroupId : groups[0]._id;
        const group = groups.find(g => g._id === groupId) || groups[0];
        let updatedCourses = [...group.courses];

        if (lessonMode === 'add') {
            updatedCourses.push({ ...lessonData, vip_category: lessonData.technicalName || actualTitle });
        } else {
            updatedCourses[selectedLessonIndex] = { ...lessonData, vip_category: lessonData.technicalName || actualTitle };
        }

        try {
            await axios.put(`${BASE_URL}/api/specialized-courses/${group._id}`, {
                courses: updatedCourses
            });
            showAlert('success', 'Saved', 'Lessons updated successfully');
            fetchCourses();
            setShowLessonModal(false);
        } catch (e) { showAlert('error', 'Error', 'Failed to update lessons'); }
    };

    const handleDeleteLesson = (groupId, indexInGroup) => {
        showAlert('confirm', t.deleteConfirm, '', async () => {
            const group = groups.find(g => g._id === groupId);
            if (!group) return;

            const lessonObj = group.courses[indexInGroup];
            const updatedCourses = group.courses.filter((_, i) => i !== indexInGroup);

            try {
                // Determine the category name to delete its associated videos
                const titleStr = typeof lessonObj.title === 'object' ? (lessonObj.title.fr || lessonObj.title.ar) : lessonObj.title;
                const categoryToDelete = lessonObj.technicalName || titleStr;

                await Promise.all([
                    axios.put(`${BASE_URL}/api/specialized-courses/${groupId}`, { courses: updatedCourses }),
                    axios.delete(`${BASE_URL}/api/specialized-videos/by-category`, { params: { category: categoryToDelete } })
                ]);

                showAlert('success', 'Deleted', 'Lesson removed');
                fetchCourses();
            } catch (e) { showAlert('error', 'Error', 'Failed to delete'); }
        });
    };

    const handleVideoUpdate = async () => {
        try {
            const updatedVideoUrl = { ...newVideoUrl };
            languages.forEach(l => {
                updatedVideoUrl[l.code] = editIntroContent[l.code]?.videoUrl || "";
            });

            if (groups.length === 0) {
                await axios.post(`${BASE_URL}/api/specialized-courses/group`, {
                    video_link: updatedVideoUrl,
                    intro_content: editIntroContent,
                    vip_category: actualTitle
                });
            } else {
                await axios.put(`${BASE_URL}/api/specialized-courses/${groups[0]._id}`, {
                    video_link: updatedVideoUrl,
                    intro_content: editIntroContent
                });
            }

            setIntroContent(editIntroContent);
            setNewVideoUrl(updatedVideoUrl);

            showAlert('success', 'Updated', 'Introduction section updated');
            fetchCourses();
            setShowVideoModal(false);
        } catch (e) {
            console.error(e);
            showAlert('error', 'Error', 'Failed to update introduction');
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


    const handleDeleteIntro = async () => {
        if (!groups.length || !groups[0].video_link) return;

        showAlert('confirm', appLanguage === 'ar' ? 'هل أنت متأكد من حذف المقدمة؟' : 'Voulez-vous vraiment supprimer l\'introduction ?', '', async () => {
            try {
                await axios.put(`${BASE_URL}/api/specialized-courses/${groups[0]._id}`, {
                    video_link: {} // Clear localized video links
                });
                showAlert('success', 'Deleted', appLanguage === 'ar' ? 'تم حذف المقدمة بنجاح' : 'Introduction supprimée');
                fetchCourses();
            } catch (e) {
                showAlert('error', 'Error', 'Failed to delete intro');
            }
        });
    };

    const handleOpenEditLesson = (groupId, indexInGroup, course) => {
        setLessonMode('edit');
        setSelectedGroupId(groupId);
        setSelectedLessonIndex(indexInGroup);

        const title = typeof course.title === 'object' ? { ...course.title } : { fr: course.title || '' };
        const duration = typeof course.duration === 'object' ? { ...course.duration } : { fr: course.duration || '' };

        languages.forEach(l => {
            if (!title[l.code]) title[l.code] = title.fr || '';
            if (!duration[l.code]) duration[l.code] = duration.fr || '';
        });

        setLessonData({
            technicalName: course.technicalName || '',
            title,
            image: course.image,
            duration
        });
        setShowLessonModal(true);
    };

    const handleLessonFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const uploadRes = await axios.post(`${BASE_URL}/api/upload`, formData);
            const imageUrl = uploadRes.data.url;

            setLessonData(prev => ({ ...prev, image: imageUrl }));
            showAlert('success', 'Image uploaded', 'New image set successfully');
        } catch (err) {
            console.error(err);
            showAlert('error', 'Error', 'Failed to upload image');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleHeroFileUpload = async (e, langCode) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const uploadRes = await axios.post(`${BASE_URL}/api/upload`, formData);
            const imageUrl = uploadRes.data.url;

            setEditHeroContent(prev => ({
                ...prev,
                [langCode]: { ...prev[langCode], bg: imageUrl }
            }));
            showAlert('success', 'Image uploaded', 'Hero background set successfully');
        } catch (err) {
            console.error(err);
            showAlert('error', 'Error', 'Failed to upload image');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };



    const handleOpenAddLesson = () => {
        setLessonMode('add');
        const emptyData = { technicalName: '', title: {}, image: '', duration: {} };
        languages.forEach(l => {
            emptyData.title[l.code] = '';
            emptyData.duration[l.code] = '';
        });
        setLessonData(emptyData);
        setShowLessonModal(true);
    };

    const handleHeroUpdate = async () => {
        try {
            if (groups.length === 0) {
                await axios.post(`${BASE_URL}/api/specialized-courses/group`, {
                    hero_bg: editHeroContent[appLanguage]?.bg || heroBg,
                    hero_content: editHeroContent,
                    vip_category: actualTitle
                });
            } else {
                await axios.put(`${BASE_URL}/api/specialized-courses/${groups[0]._id}`, {
                    hero_bg: editHeroContent[appLanguage]?.bg || heroBg,
                    hero_content: editHeroContent
                    // Removed vip_category mutation to prevent breaking URLs and video links
                });
            }

            // Update local state immediately for SPA feel
            setHeroContent(editHeroContent);
            setHeroBg(editHeroContent[appLanguage]?.bg || heroBg);

            showAlert('success', 'Updated', 'Hero content updated');

            // No navigation needed since URL identifier (vip_category) is safely preserved
            fetchCourses();
            setIsEditingHero(false);
            setIsEditingSection(false);
        } catch (e) {
            console.error(e);
            showAlert('error', 'Error', 'Failed to update hero');
        }
    };

    if (loading) {
        return (
            <div className="courses-premium-page" dir={direction}>
                <Navbar />

                {/* Skeleton Hero */}
                <div className="skeleton-hero">
                    <div className="skeleton-hero-badge skeleton-shimmer"></div>
                    <div className="skeleton-hero-title skeleton-shimmer"></div>
                </div>



                <div className="skeleton-section-title skeleton-shimmer"></div>

                {/* Skeleton Grid */}
                <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
                    <ProductGridSkeleton count={4} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="courses-premium-page" dir={direction}>
                <Navbar />
                <div style={{ padding: '140px 20px 80px' }}>
                    <PremiumErrorState message={error} onRetry={() => window.location.reload()} />
                </div>
                <Footer />
            </div>
        );
    }

    const allCourses = groups.flatMap(group => group.courses);
    const videoUrl = groups.length > 0 && groups[0].video_link ? (typeof groups[0].video_link === 'object' ? (groups[0].video_link[appLanguage] || groups[0].video_link.fr) : groups[0].video_link) : null;

    const isSingleCourseRedirect = allCourses.length === 1 && !isAdmin;

    return (
        <div className="courses-premium-page" dir={direction}>
            <Navbar />

            {!isSingleCourseRedirect && (
                <>
                    <header
                        className="course-hero-premium"
                        style={heroBg ? { backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.4)), url('${heroBg}')` } : {}}
                    >
                {isAdmin && (
                    <div style={{ position: 'absolute', top: '130px', right: '35px', zIndex: 100, display: 'flex', gap: '10px' }}>
                        <button className="admin-edit-master-btn" onClick={() => {
                            setIsEditingHero(true);
                        }}>
                            <FaEdit /> {t.editHero}

                        </button>
                    </div>
                )}
                <div className="course-category-tag">{heroContent[appLanguage]?.badge || t.categoryTag}</div>
                <h1 className="course-main-title-premium">
                    {heroContent[appLanguage]?.title || actualTitle}
                    {heroContent[appLanguage]?.accent && (
                        <span className="accent-text"> {heroContent[appLanguage].accent}</span>
                    )}
                </h1>
            </header>

            <div className="lessons-grid-section">
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
                    <FaChevronRight className="breadcrumb-separator" />
                    <NavLink to="/Vip-access" className="breadcrumb-link">
                        {breadcrumbTranslations[appLanguage]?.vip || navTranslations[appLanguage]?.vip || t.breadcrumbVip}
                    </NavLink>
                    <FaChevronRight className="breadcrumb-separator" />
                    <div className="breadcrumb-current">
                        {actualTitle}
                    </div>
                </nav>

                <div className="lessons-section-header">
                    <h2 className="lessons-section-title">
                        {heroContent[appLanguage]?.sectionTitle || (appLanguage === 'en' ? t.coursesAccent : t.coursesTitle)}
                        <span> {heroContent[appLanguage]?.sectionAccent || (appLanguage === 'en' ? t.coursesTitle : t.coursesAccent)}</span>
                    </h2>
                    {isAdmin && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="premium-btn-add" onClick={() => setIsEditingSection(true)} style={{ background: '#e2e8f0', color: '#1e293b' }}>
                                <FaEdit /> {appLanguage === 'ar' ? 'تعديل العنوان' : 'Modifier le Titre'}
                            </button>
                            <button className="premium-btn-add" onClick={handleOpenAddLesson}>
                                <FaPlus /> {t.addLesson}
                            </button>
                        </div>
                    )}
                </div>

                <div className="premium-lessons-grid">
                    {groups.some(g => g.courses.length > 0) ? (
                        groups.map((group) => (
                            group.courses.map((course, idx) => {
                                const courseTitleStr = course.technicalName || (typeof course.title === 'object' ? (course.title.fr || course.title[Object.keys(course.title)[0]]) : course.title);
                                const lessonPath = (actualTitle && actualTitle.toLowerCase() === "les corsages")
                                    ? `/les_Leçons/${encodeURIComponent(courseTitleStr)}`
                                    : `/Leçons/${encodeURIComponent(courseTitleStr)}`;

                                return (
                                    <article 
                                        key={`${group._id}-${idx}`} 
                                        className="lesson-card-premium"
                                        style={{ 
                                            cursor: (isVipExpired || (isVipCategory && !isLoggedIn)) ? 'not-allowed' : 'pointer',
                                            filter: (isVipExpired || (isVipCategory && !isLoggedIn)) ? 'grayscale(100%)' : 'none',
                                            opacity: (isVipExpired || (isVipCategory && !isLoggedIn)) ? 0.6 : 1
                                        }}
                                        onClick={() => {
                                            if (isVipExpired) {
                                                navigate('/offre-de-cours');
                                            } else if (isVipCategory && !isLoggedIn) {
                                                navigate('/login');
                                            } else {
                                                navigate(lessonPath);
                                            }
                                        }}

                                    >
                                        <div className="l-card-img-wrapper">
                                            <img 
                                                src={course.image || getCategoryFallbackImage(courseTitleStr, appLanguage)} 
                                                alt={courseTitleStr} 
                                                className="l-card-img" 
                                                style={{ objectFit: 'contain' }}
                                                onError={(e) => {
                                                    const fallback = getCategoryFallbackImage(courseTitleStr, appLanguage);
                                                    if (e.currentTarget.src !== fallback) {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = fallback;
                                                    }
                                                }}
                                            />
                                            {isAdmin && (
                                                <div className="admin-card-controls" onClick={(e) => e.stopPropagation()}>
                                                    <button className="control-btn edit" onClick={() => handleOpenEditLesson(group._id, idx, course)}><FaEdit /></button>
                                                    <button className="control-btn delete" onClick={() => handleDeleteLesson(group._id, idx)}><FaTrash /></button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="l-card-body">
                                            <h3 className="l-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {typeof course.title === 'object' ? (course.title[appLanguage] || course.title.fr) : course.title}
                                                {(isVipExpired || (isVipCategory && !isLoggedIn)) && <FaLock style={{ color: '#ef4444', fontSize: '0.9rem' }} />}
                                            </h3>

                                            <div className="l-card-footer">
                                                <button
                                                    className="l-action-btn"
                                                    disabled={isVipExpired || (isVipCategory && !isLoggedIn)}
                                                    style={{
                                                        opacity: (isVipExpired || (isVipCategory && !isLoggedIn)) ? 0.6 : 1,
                                                        width: '100%',
                                                        justify: 'center',
                                                        background: isVipExpired ? '#dc2626' : undefined,
                                                        borderColor: isVipExpired ? '#ef4444' : undefined,
                                                        color: isVipExpired ? '#ffffff' : undefined
                                                    }}
                                                >
                                                    <span>
                                                        {isVipExpired
                                                            ? (appLanguage === 'ar' ? 'منتهي (تم حظر الوصول)' : 'Expiré (Accès VIP Bloqué)')
                                                            : t.button}
                                                    </span>
                                                    {!isVipExpired && <FaChevronRight size={12} />}
                                                </button>

                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                            <p style={{ fontSize: '1.2rem', color: '#64748b' }}>{t.noCourses}</p>
                        </div>
                    )}
                </div>
            </div>



            <Footer />
            </>
            )}




            {showLessonModal && (
                <div className="premium-modal-backdrop" onClick={() => setShowLessonModal(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setShowLessonModal(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">
                            {lessonMode === 'add' ? t.addLesson : t.editLesson}
                        </h2>

                        <div className="premium-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="premium-form-group" style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <label style={{ color: '#d4af37', fontWeight: 'bold' }}>
                                    {appLanguage === 'ar' ? 'الاسم التقني (يستخدم في الرابط)' : 'Nom Technique (Utilisé dans le lien)'}
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: manche-ballon"
                                    value={lessonData.technicalName || ''}
                                    onChange={(e) => setLessonData({ ...lessonData, technicalName: e.target.value })}
                                    readOnly={appLanguage !== 'fr'}
                                    title={appLanguage !== 'fr' ? (appLanguage === 'ar' ? 'يمكن تعديل هذا الاسم فقط عند توجيه الموقع للغة الفرنسية' : 'Modification autorisée uniquement en Français') : ''}
                                    style={{
                                        background: appLanguage !== 'fr' ? '#070707ff' : '#080808ff',
                                        cursor: appLanguage !== 'fr' ? 'not-allowed' : 'text',
                                        color: appLanguage !== 'fr' ? '#000000ff' : 'inherit',
                                        opacity: appLanguage !== 'fr' ? 0.7 : 1
                                    }}
                                />
                                <p style={{ fontSize: '0.75rem', color: appLanguage !== 'fr' ? '#d4af37' : '#64748b', marginTop: '5px', fontWeight: appLanguage !== 'fr' ? 'bold' : 'normal' }}>
                                    {appLanguage === 'ar'
                                        ? '⚠️ هذا الاسم مشترك ومحمي؛ لتعديله يجب تحويل لغة الموقع للفرنسية.'
                                        : (appLanguage === 'fr'
                                            ? 'Ce nom est commun à toutes les langues. C\'est l\'identifiant unique de la leçon.'
                                            : '⚠️ Identifiant commun ; modification autorisée uniquement en Français.')
                                    }
                                </p>
                            </div>
                            {languages.filter(l => l.code === appLanguage).map(lang => (
                                <div key={lang.code} className="premium-lang-section" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
                                    <h4 className="lang-indicator" style={{ background: '#d4af37', display: 'inline-block', marginBottom: '10px' }}>{lang.label}</h4>
                                    <div className="premium-form-group">
                                        <label>{t.lessonTitle}</label>
                                        <input
                                            type="text"
                                            value={lessonData.title[lang.code] || ''}
                                            onChange={(e) => {
                                                const newTitle = { ...lessonData.title, [lang.code]: e.target.value };
                                                setLessonData({ ...lessonData, title: newTitle });
                                            }}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>{t.lessonDur}</label>
                                        <input
                                            type="text"
                                            value={lessonData.duration[lang.code] || ''}
                                            onChange={(e) => {
                                                const newDur = { ...lessonData.duration, [lang.code]: e.target.value };
                                                setLessonData({ ...lessonData, duration: newDur });
                                            }}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                </div>
                            ))}

                             <div className="premium-form-group">
                                <label>{t.lessonImg}</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder="URL de l'image"
                                        value={lessonData.image}
                                        readOnly
                                        style={{ flex: 1, backgroundColor: '#f1f5f9', cursor: 'default' }}
                                    />
                                    <input 
                                        type="file" 
                                        ref={lessonFileInputRef} 
                                        onChange={handleLessonFileUpload} 
                                        style={{ display: 'none' }} 
                                        accept="image/*"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => lessonFileInputRef.current.click()} 
                                        className="premium-btn-cta gold"
                                        style={{ padding: '8px 12px', minWidth: '70px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <FaSpinner className="spinner" /> : <FaUpload />}
                                    </button>
                                </div>
                                {lessonData.image && (
                                    <div style={{ marginTop: '10px' }}>
                                        <img src={lessonData.image} alt="Preview" style={{ width: '100px', height: '60px', objectFit: 'contain', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="premium-btn-group">
                            <button type="button" className="premium-btn-cta secondary" onClick={() => setShowLessonModal(false)}>
                                {t.cancel}
                            </button>
                            <button type="button" className="premium-btn-cta gold" onClick={handleLessonSubmit}>
                                {t.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {isEditingHero && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditingHero(false)}>
                    <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingHero(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title" style={{ textAlign: 'center', marginBottom: '30px' }}>Modifier le Hero</h2>

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
                                                disabled={isUploading}
                                            >
                                                {isUploading ? <FaSpinner className="spinner" /> : <FaUpload />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="premium-btn-group" style={{ justifyContent: 'center', marginTop: '30px' }}>
                            <button type="button" className="premium-btn-cta secondary" onClick={() => setIsEditingHero(false)} style={{ width: '200px' }}>
                                {t.cancel}
                            </button>
                            <button type="button" className="premium-btn-cta gold" onClick={handleHeroUpdate} style={{ width: '200px' }}>
                                {t.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditingSection && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditingSection(false)}>
                    <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingSection(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title" style={{ textAlign: 'center', marginBottom: '30px' }}>{appLanguage === 'ar' ? 'تعديل عنوان القسم' : 'Modifier le Titre de la Section'}</h2>

                        <div className="premium-form-grid">
                            {languages.filter(l => l.code === appLanguage).map(lang => (
                                <div key={lang.code} className="premium-lang-section" style={{ border: 'none', background: 'none' }}>
                                    <h4 className="lang-indicator" style={{ background: '#d4af37' }}>{lang.label}</h4>

                                    <div className="premium-form-group">
                                        <label>{lang.code === 'ar' ? 'الكلمة الأولى (مثل: الدروس)' : 'Premier Mot (ex: Cours)'}</label>
                                        <input
                                            type="text"
                                            value={editHeroContent[lang.code]?.sectionTitle !== undefined ? editHeroContent[lang.code].sectionTitle : ''}
                                            placeholder={lang.code === 'en' ? (translations[lang.code] || translations.fr).coursesAccent : (translations[lang.code] || translations.fr).coursesTitle}
                                            onChange={e => setEditHeroContent({
                                                ...editHeroContent,
                                                [lang.code]: { ...editHeroContent[lang.code], sectionTitle: e.target.value }
                                            })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>

                                    <div className="premium-form-group">
                                        <label>{lang.code === 'ar' ? 'الكلمة البارزة (مثل: المتاحة)' : 'Mot Accent (ex: Disponibles)'}</label>
                                        <input
                                            type="text"
                                            value={editHeroContent[lang.code]?.sectionAccent !== undefined ? editHeroContent[lang.code].sectionAccent : ''}
                                            placeholder={lang.code === 'en' ? (translations[lang.code] || translations.fr).coursesTitle : (translations[lang.code] || translations.fr).coursesAccent}
                                            onChange={e => setEditHeroContent({
                                                ...editHeroContent,
                                                [lang.code]: { ...editHeroContent[lang.code], sectionAccent: e.target.value }
                                            })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="premium-btn-group" style={{ justifyContent: 'center', marginTop: '30px' }}>
                            <button type="button" className="premium-btn-cta secondary" onClick={() => setIsEditingSection(false)} style={{ width: '200px' }}>
                                {t.cancel}
                            </button>
                            <button type="button" className="premium-btn-cta gold" onClick={handleHeroUpdate} style={{ width: '200px' }}>
                                {t.save}
                            </button>
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
        </div>
    );
}
