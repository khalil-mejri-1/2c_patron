import React, { useState, useEffect } from 'react';
import { FaPlayCircle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        loading: "جاري تحميل الدورات...",
        error: "خطأ أثناء تحميل الدورات.",
        headerSubtitle: "أتقن تصميم وتنفيذ الكورساج باحترافية، من الكلاسيكيات إلى النماذج الأكثر تعقيدًا.",
        videoTitle: (title) => `شاهد: مقدمة لفن ${title}`,
        videoSubtitle: "ابدأ رحلتك في عالم تصميم وخياطة الأكمام. يقدم لك هذا الفيديو نظرة عامة على التقنيات التي ستكتشفها في الدورات أدناه.",
        videoFeature1: "أساسيات باترون الكم",
        videoFeature2: "أنواع الأكمام المتقدمة",
        videoFeature3: "أسرار الخياطة الراقية",
        coursesTitle: "دورات",
        coursesAccent: "متخصصة",
        button: "بدء الدرس",
        noCourses: "لم يتم العثور على أي دورات.",
        duration: "مدة غير محددة"
    },
    fr: {
        loading: "Chargement des Cours...",
        error: "Erreur lors du chargement des cours.",
        headerSubtitle: "Maîtrisez la conception et la réalisation de Corsage avec professionnalisme, des classiques aux modèles les plus complexes.",
        videoTitle: (title) => `Regardez : Introduction à l'Art de ${title}`,
        videoSubtitle: "Commencez votre voyage dans le monde de la conception et de la couture des manches. Cette vidéo vous donne un aperçu des techniques que vous découvrirez dans les cours ci-dessous.",
        videoFeature1: "Bases du patron de manche",
        videoFeature2: "Types de manches avancées",
        videoFeature3: "Secrets de la couture haute gamme",
        coursesTitle: "Cours",
        coursesAccent: "Spécialisés",
        button: "Commencer la Leçon",
        noCourses: "Aucun cours trouvé.",
        duration: "Durée non spécifiée"
    },
    en: {
        loading: "Loading Courses...",
        error: "Error loading courses.",
        headerSubtitle: "Master the design and realization of Corsages with professionalism, from classics to the most complex models.",
        videoTitle: (title) => `Watch: Introduction to the Art of ${title}`,
        videoSubtitle: "Start your journey into the world of sleeve design and sewing. This video gives you an overview of the techniques you will discover in the courses below.",
        videoFeature1: "Sleeve pattern basics",
        videoFeature2: "Advanced sleeve types",
        videoFeature3: "High-end sewing secrets",
        coursesTitle: "Specialized",
        coursesAccent: "Courses",
        button: "Start Lesson",
        noCourses: "No courses found.",
        duration: "Duration not specified"
    }
};

// **********************************************
// ********* Composant de l'introduction vidéo *********
// **********************************************
const VideoIntroduction = ({ videoUrl, title, appLanguage }) => {
    const actualTitle = decodeURIComponent(title);
    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    return (
        <div className="video-intro-container" dir={direction}>
            <div className="video-content-text">
                <h2 className="video-title">{t.videoTitle(actualTitle)}</h2>
                <p className="video-subtitle">
                    {t.videoSubtitle}
                </p>
                <div className="key-features">
                    <span className="feature-item"><FaCheckCircle /> {t.videoFeature1}</span>
                    <span className="feature-item"><FaCheckCircle /> {t.videoFeature2}</span>
                    <span className="feature-item"><FaCheckCircle /> {t.videoFeature3}</span>
                </div>
            </div>
            
            <div className="video-player-wrapper">
                <div className="video-responsive">
                    <iframe
                        src={videoUrl}
                        title={`Vidéo d'Introduction - ${actualTitle}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

// **********************************************
// *************** PAGE PRINCIPALE **************
// **********************************************
export default function Cours() {
    const { courseTitle } = useParams();
    const actualTitle = decodeURIComponent(courseTitle);

    const [appLanguage, setAppLanguage] = useState('fr'); // حالة اللغة الافتراضية
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. ⚙️ جلب اللغة من LocalStorage
    useEffect(() => {
        const lang = localStorage.getItem('appLanguage') || 'fr';
        setAppLanguage(lang);
    }, []);

    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    useEffect(() => {
        fetchCourses();
    }, [actualTitle, t.error]); // إضافة ت.خطأ لضمان التحديث عند تغيير اللغة

    const fetchCourses = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/specialized-courses', {
                params: { category: actualTitle } // تمرير اسم الفئة
            });
            setGroups(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError(t.error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="lessons-section" style={{ textAlign: 'center', marginTop: '100px' }} dir={direction}>
                    <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite', textAlign:"center",margin:"auto" }} />
                    <p>{t.loading}</p>
                </div>
            
            </>
        );
    }

    if (error) return <div style={{ color: 'red', textAlign: 'center' }} dir={direction}>{error}</div>;

    const allCourses = groups.flatMap(group => group.courses);
    const videoUrl = groups.length > 0 && groups[0].video_link ? groups[0].video_link : null;

    return (
        <>
            <Navbar />
            <br /><br /><br />
            <section className="vip-section" dir={direction}>
                
                {/* 1. Entête de la page */}
                <div className="vip-header">
                    <h1 className="vip-main-title">
                        <span style={{color:"#d4af37"}}>{actualTitle}</span>
                    </h1>
                    <p className="vip-sub-text">
                        {t.headerSubtitle}
                    </p>
                </div>
                
                {/* ⚡️ Bloc Vidéo Introduction */}
                {videoUrl && <VideoIntroduction videoUrl={videoUrl} title={actualTitle} appLanguage={appLanguage} />}

                <br />
                <div className="vip-header" style={{ marginBottom: '40px' }}>
                    <h2 className="vip-main-title" style={{ fontSize: '2.2rem' }}>
                        {appLanguage === 'en' ? t.coursesAccent : t.coursesTitle}
                        <span className="vip-accent-text">{appLanguage === 'en' ? t.coursesTitle : t.coursesAccent}</span>
                    </h2>
                </div>

                {/* 2. Grille des cartes de cours */}
                <div className="courses-grid-container">
                    {allCourses.length > 0 ? (
                        allCourses.map((course, index) => {
                            const lessonPath = actualTitle === "Les corsages" 
                                ? `/Leçons_coursage/${encodeURIComponent(course.title)}` 
                                : `/Leçons/${encodeURIComponent(course.title)}`;

                            return (
                                <div key={index} className="course-card">
                                    <div className="course-image-wrapper">
                                        <img 
                                            src={course.image} 
                                            alt={course.title} 
                                            className="course-image" 
                                        />
                                    </div>
                                    
                                    <div className="course-content">
                                        <h3 className="course-title">{course.title}</h3>
                                        
                                        <div className="course-meta">
                                            <span className="course-duration">
                                                <FaPlayCircle /> {course.duration || t.duration}
                                            </span>
                                        </div>
                                        
                                        <Link to={lessonPath}>
                                            <button className="access-button">
                                                {t.button}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>{t.noCourses}</p>
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
}