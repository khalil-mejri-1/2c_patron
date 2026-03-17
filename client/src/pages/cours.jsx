import React, { useState, useEffect } from 'react';
import { FaPlayCircle, FaCheckCircle, FaSpinner, FaChevronRight, FaEdit, FaPlus, FaTrash, FaTimes, FaVideo, FaImage } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import UniversalVideoPlayer from '../comp/UniversalVideoPlayer';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../apiConfig';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';
import './cours_premium.css';

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
        button: "ابدأ التعلم الآن",
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
        courseMainTitle: "العنوان الرئيسي"
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
        button: "Commencer la Leçon",
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
        courseMainTitle: "Titre Principal"
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
        button: "Start Learning",
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
        courseMainTitle: "Main Title"
    }
};

const VideoIntroduction = ({ videoUrl, title, appLanguage, isAdmin, onEdit }) => {
    const actualTitle = decodeURIComponent(title);
    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';



    return (
        <div className="premium-video-intro-box" dir={direction}>
            {isAdmin && (
                <button className="admin-edit-intro-btn admin-edit-master-btn" onClick={onEdit}>
                    <FaVideo /> {t.editIntro}
                </button>
            )}
            <div className="premium-video-info">
                <span className="premium-video-tag">{t.videoTag}</span>
                <h2 className="premium-video-title">{t.videoTitle(actualTitle)}</h2>
                <p className="premium-video-desc">{t.videoSubtitle}</p>
                <div className="premium-video-features">
                    <span className="p-feature-item"><FaCheckCircle /> {t.videoFeature1}</span>
                    <span className="p-feature-item"><FaCheckCircle /> {t.videoFeature2}</span>
                    <span className="p-feature-item"><FaCheckCircle /> {t.videoFeature3}</span>
                </div>
            </div>

            <div className="premium-video-player-side">
                <UniversalVideoPlayer 
                    url={videoUrl} 
                    title={`Introduction - ${actualTitle}`}
                    autoPlay={false}
                />
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

    // Hero Customization (Optional per course)
    const [isEditingHero, setIsEditingHero] = useState(false);

    // Lesson Management State
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [lessonMode, setLessonMode] = useState('add');
    const [selectedLessonIndex, setSelectedLessonIndex] = useState(null);
    const [lessonData, setLessonData] = useState({ title: {}, image: '', duration: {} });

    // Video Intro Management State
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [newVideoUrl, setNewVideoUrl] = useState({});

    // Hero Background State
    const [heroBg, setHeroBg] = useState("");
    const [heroContent, setHeroContent] = useState({});
    const [editHeroContent, setEditHeroContent] = useState({});

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
                
                // Pre-initialize edit content with fallbacks
                const init = {};
                languages.forEach(l => {
                    init[l.code] = {
                        badge: hc[l.code]?.badge || translations[l.code]?.categoryTag || translations.fr.categoryTag || "",
                        title: hc[l.code]?.title || actualTitle || "",
                        accent: hc[l.code]?.accent || "",
                        bg: hc[l.code]?.bg || group.hero_bg || ""
                    };
                });
                setEditHeroContent(init);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError(t.error);
            setLoading(false);
        }
    };

    useEffect(() => {
        // Admin Check
        const email =
            localStorage.getItem('loggedInUserEmail') ||
            localStorage.getItem('currentUserEmail') ||
            null;

        const checkAdmin = async () => {
            if (email) {
                try {
                    const response = await fetch(`${BASE_URL}/api/users/${email}`);
                    const data = await response.json();
                    if (data && data.statut === 'admin') setIsAdmin(true);
                } catch (e) { }
            }
        }
        checkAdmin();

        fetchCourses();
    }, [actualTitle, t.error]);

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

        const group = groups[0];
        let updatedCourses = [...group.courses];

        if (lessonMode === 'add') {
            updatedCourses.push({ ...lessonData, vip_category: actualTitle });
        } else {
            updatedCourses[selectedLessonIndex] = { ...lessonData, vip_category: actualTitle };
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

    const handleDeleteLesson = (index) => {
        showAlert('confirm', t.deleteConfirm, '', async () => {
            const group = groups[0];
            const updatedCourses = group.courses.filter((_, i) => i !== index);
            try {
                await axios.put(`${BASE_URL}/api/specialized-courses/${group._id}`, {
                    courses: updatedCourses
                });
                showAlert('success', 'Deleted', 'Lesson removed');
                fetchCourses();
            } catch (e) { showAlert('error', 'Error', 'Failed to delete'); }
        });
    };

    const handleVideoUpdate = async () => {
        if (groups.length === 0) {
            showAlert('error', 'Note', 'Add at least one lesson first to create the category group.');
            return;
        }
        try {
            await axios.put(`${BASE_URL}/api/specialized-courses/${groups[0]._id}`, {
                video_link: newVideoUrl
            });
            showAlert('success', 'Updated', 'Video intro link updated');
            fetchCourses();
            setShowVideoModal(false);
        } catch (e) { showAlert('error', 'Error', 'Failed to update video'); }
    };

    const handleOpenEditLesson = (course, index) => {
        setLessonMode('edit');
        setSelectedLessonIndex(index);
        
        const title = typeof course.title === 'object' ? { ...course.title } : { fr: course.title || '' };
        const duration = typeof course.duration === 'object' ? { ...course.duration } : { fr: course.duration || '' };
        
        languages.forEach(l => {
            if (!title[l.code]) title[l.code] = title.fr || '';
            if (!duration[l.code]) duration[l.code] = duration.fr || '';
        });

        setLessonData({ 
            title, 
            image: course.image, 
            duration 
        });
        setShowLessonModal(true);
    };

    const handleOpenAddLesson = () => {
        setLessonMode('add');
        const emptyData = { title: {}, image: '', duration: {} };
        languages.forEach(l => {
            emptyData.title[l.code] = '';
            emptyData.duration[l.code] = '';
        });
        setLessonData(emptyData);
        setShowLessonModal(true);
    };

    const handleHeroUpdate = async () => {
        if (groups.length === 0) {
            showAlert('error', 'Note', 'Add at least one lesson first to create the category group.');
            return;
        }

        const newMasterTitle = editHeroContent[appLanguage]?.title || actualTitle;

        try {
            await axios.put(`${BASE_URL}/api/specialized-courses/${groups[0]._id}`, {
                hero_bg: editHeroContent[appLanguage]?.bg || heroBg,
                hero_content: editHeroContent,
                vip_category: newMasterTitle
            });

            // Update local state immediately for SPA feel
            setHeroContent(editHeroContent);
            setHeroBg(editHeroContent[appLanguage]?.bg || heroBg);

            showAlert('success', 'Updated', 'Hero content updated');

            if (newMasterTitle !== actualTitle) {
                // If title changed, navigate to new URL using SPA router
                navigate(`/cours_Manches/${encodeURIComponent(newMasterTitle)}`);
            } else {
                // Otherwise just refresh data and close modal
                fetchCourses();
                setIsEditingHero(false);
            }
        } catch (e) { showAlert('error', 'Error', 'Failed to update hero'); }
    };

    if (loading) {
        return (
            <div className="courses-premium-page" dir={direction}>
                <Navbar />
                <div className="loading-state" style={{ textAlign: 'center', padding: '160px 0' }}>
                    <FaSpinner className="spinner" size={60} color="#D4AF37" style={{ animation: 'spin 1.5s linear infinite' }} />
                    <p style={{ marginTop: '20px', fontSize: '1.2rem', color: '#64748b' }}>{t.loading}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="courses-premium-page" dir={direction}>
                <Navbar />
                <div style={{ padding: '160px 20px', textAlign: 'center', color: '#e11d48' }}>
                    <h2>{error}</h2>
                </div>
            </div>
        );
    }

    const allCourses = groups.flatMap(group => group.courses);
    const videoUrl = groups.length > 0 && groups[0].video_link ? (typeof groups[0].video_link === 'object' ? (groups[0].video_link[appLanguage] || groups[0].video_link.fr) : groups[0].video_link) : null;

    return (
        <div className="courses-premium-page" dir={direction}>
            <Navbar />

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
                {videoUrl || isAdmin ? (
                    <VideoIntroduction
                        videoUrl={videoUrl || ""}
                        title={actualTitle}
                        appLanguage={appLanguage}
                        isAdmin={isAdmin}
                        onEdit={() => setShowVideoModal(true)}
                    />
                ) : null}

                <div className="lessons-section-header">
                    <h2 className="lessons-section-title">
                        {appLanguage === 'en' ? t.coursesAccent : t.coursesTitle}
                        <span>{appLanguage === 'en' ? t.coursesTitle : t.coursesAccent}</span>
                    </h2>
                    {isAdmin && (
                        <button className="premium-btn-add" onClick={handleOpenAddLesson}>
                            <FaPlus /> {t.addLesson}
                        </button>
                    )}
                </div>

                <div className="premium-lessons-grid">
                    {allCourses.length > 0 ? (
                        allCourses.map((course, index) => {
                            const lessonPath = actualTitle === "Les corsages"
                                ? `/Leçons_coursage/${encodeURIComponent(course.title)}`
                                : `/Leçons/${encodeURIComponent(course.title)}`;

                            return (
                                <article key={index} className="lesson-card-premium" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="l-card-img-wrapper">
                                        <img src={course.image} alt={course.title} className="l-card-img" />
                                        {isAdmin && (
                                            <div className="admin-card-controls">
                                                <button className="control-btn edit" onClick={() => handleOpenEditLesson(course, index)}><FaEdit /></button>
                                                <button className="control-btn delete" onClick={() => handleDeleteLesson(index)}><FaTrash /></button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="l-card-body">
                                        <h3 className="l-card-title">
                                            {typeof course.title === 'object' ? (course.title[appLanguage] || course.title.fr) : course.title}
                                        </h3>
                                        <div className="l-card-footer">
                                            <div className="l-meta-duration">
                                                <FaPlayCircle />
                                                <span>
                                                    {typeof course.duration === 'object' ? (course.duration[appLanguage] || course.duration.fr) : (course.duration || t.duration)}
                                                </span>
                                            </div>
                                            <Link to={lessonPath} className="l-nav-link">
                                                <button className="l-action-btn">
                                                    <span>{t.button}</span>
                                                    <FaChevronRight size={12} />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                            <p style={{ fontSize: '1.2rem', color: '#64748b' }}>{t.noCourses}</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />

            {showLessonModal && (
                <div className="premium-modal-backdrop" onClick={() => setShowLessonModal(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setShowLessonModal(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">
                            {lessonMode === 'add' ? t.addLesson : t.editLesson}
                        </h2>

                        <div className="premium-form-grid" style={{ gridTemplateColumns: '1fr' }}>
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
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={lessonData.image}
                                    onChange={(e) => setLessonData({ ...lessonData, image: e.target.value })}
                                />
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

            {showVideoModal && (
                <div className="premium-modal-backdrop" onClick={() => setShowVideoModal(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setShowVideoModal(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">{t.editIntro}</h2>

                        <div className="premium-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                            {languages.filter(l => l.code === appLanguage).map(lang => (
                                <div key={lang.code} className="premium-lang-section" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
                                    <h4 className="lang-indicator" style={{ background: '#d4af37', display: 'inline-block', marginBottom: '10px' }}>{lang.label}</h4>
                                    <div className="premium-form-group">
                                        <label>{t.videoUrl}</label>
                                        <input
                                            type="text"
                                            placeholder="https://www.youtube.com/embed/..."
                                            value={newVideoUrl[lang.code] || ''}
                                            onChange={(e) => {
                                                const newV = { ...newVideoUrl, [lang.code]: e.target.value };
                                                setNewVideoUrl(newV);
                                            }}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                </div>
                            ))}
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '-10px', marginBottom: '15px' }}>
                                {appLanguage === 'ar' ? 'استخدم رابط التضمين (embed).' : "Utilisez le lien d'intégration (embed)."}
                            </p>
                        </div>

                        <div className="premium-btn-group">
                            <button type="button" className="premium-btn-cta secondary" onClick={() => setShowVideoModal(false)}>
                                {t.cancel}
                            </button>
                            <button type="button" className="premium-btn-cta gold" onClick={handleVideoUpdate}>
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
                                {t.cancel}
                            </button>
                            <button type="button" className="premium-btn-cta gold" onClick={handleHeroUpdate} style={{ width: '200px' }}>
                                {t.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
