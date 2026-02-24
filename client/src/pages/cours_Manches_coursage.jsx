import React, { useState, useEffect } from 'react';
import { FaPlayCircle, FaCheckCircle, FaImage, FaTimes } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../apiConfig';
import '../comp/PremiumSkeleton.css';
import './vip_premium.css';

export default function Leçons_Manches_coursage() {
    const { leconTitle } = useParams();
    const actualTitle = decodeURIComponent(leconTitle);

    const [groups, setGroups] = useState([]); // تحتوي على كل المجموعات (object واحد يحتوي على courses[])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [heroBg, setHeroBg] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [showHeroBgModal, setShowHeroBgModal] = useState(false);
    const [appLanguage, setAppLanguage] = useState('fr');
    useEffect(() => {
        const lang = localStorage.getItem('appLanguage') || 'fr';
        setAppLanguage(lang);

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
    }, [actualTitle]);

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/specialized-courses`, {
                params: { category: actualTitle } // تمرير اسم الفئة
            });
            setGroups(res.data);
            if (res.data.length > 0) {
                setHeroBg(res.data[0].hero_bg || "");
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Erreur lors du chargement des cours.");
            setLoading(false);
        }
    };

    const handleHeroBgUpdate = async () => {
        if (groups.length === 0) return;
        try {
            await axios.put(`${BASE_URL}/api/specialized-courses/${groups[0]._id}`, {
                hero_bg: heroBg
            });
            fetchCourses();
            setShowHeroBgModal(false);
        } catch (e) { console.error(e); }
    };

    if (loading) return (
        <div className="courses-premium-page">
            <Navbar />
            <div className="skeleton-hero dark-skeleton-shimmer"></div>
            <div className="container-skeleton">
                <div className="skeleton-text-title skeleton-shimmer" style={{ marginTop: '-80px', position: 'relative', zIndex: 11, width: '40%' }}></div>

                <div className="skeleton-text-title skeleton-shimmer" style={{ width: '30%', height: '50px', marginTop: '100px' }}></div>

                <div className="skeleton-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="skeleton-card skeleton-shimmer"></div>
                    ))}
                </div>
            </div>
        </div>
    );
    if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;

    // 🔍 كل مجموعة تحتوي على video_link وداخلها courses[]
    const allCourses = groups.flatMap(group => group.courses);

    // نأخذ الفيديو من أول مجموعة فقط إذا كان موجودًا
    const videoUrl = groups.length > 0 && groups[0].video_link ? groups[0].video_link : null;

    return (
        <div className="courses-premium-page">
            <Navbar />

            {/* 1. Entête de la page - Premium Hero */}
            <header
                className="course-hero-premium"
                style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.4)), url('${heroBg || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2670&auto=format&fit=crop'}')`
                }}
            >
                {isAdmin && (
                    <div style={{ position: 'absolute', top: '25px', right: '35px', zIndex: 100 }}>
                        <button className="admin-edit-master-btn" onClick={() => setShowHeroBgModal(true)}>
                            <FaImage /> {appLanguage === 'ar' ? 'تغيير الخلفية' : 'Changer Fond'}
                        </button>
                    </div>
                )}
                <div className="course-hero-overlay"></div>

                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="course-category-tag">2C Patron Studio</div>
                    <h1 className="course-main-title-premium">
                        <span style={{ color: "#d4af37" }}>{actualTitle}</span>
                    </h1>
                </div>
            </header>

            <section className="vip-section" style={{ marginTop: '50px' }}>

                {/* ⚡️ Bloc Vidéo Introduction - يظهر فقط إذا كان الفيديو موجود */}

                <br />
                <div className="vip-header" style={{ marginBottom: '40px' }}>
                    <h2 className="vip-main-title" style={{ fontSize: '2.2rem' }}>
                        Cours <span className="vip-accent-text">Spécialisés</span>
                    </h2>
                </div>

                {/* 2. Grille des cartes de cours */}
                <div className="courses-grid-container">
                    {allCourses.length > 0 ? (
                        allCourses.map((course, index) => {
                            // 💡 تحديد المسار شرطيًا بناءً على actualTitle
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
                                                <FaPlayCircle /> {course.duration || "Durée non spécifiée"}
                                            </span>
                                        </div>

                                        {/* 🚀 التعديل هنا: استخدام المتغير lessonPath المحدد شرطيًا */}
                                        <Link to={lessonPath}>
                                            <button className="access-button">
                                                Commencer la Leçon
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>Aucun cours trouvé.</p>
                    )}
                </div>
            </section>
            <Footer />

            {
                showHeroBgModal && (
                    <div className="premium-modal-backdrop" onClick={() => setShowHeroBgModal(false)}>
                        <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="premium-modal-close-icon" onClick={() => setShowHeroBgModal(false)}><FaTimes /></button>
                            <h2 className="premium-modal-title">{appLanguage === 'ar' ? 'تغيير خلفية الواجهة' : 'Changer Fond Hero'}</h2>

                            <div className="premium-form-grid-single">
                                <div className="premium-form-group">
                                    <label>URL de l'Image</label>
                                    <input
                                        type="text"
                                        placeholder="https://images.unsplash.com/..."
                                        value={heroBg}
                                        onChange={(e) => setHeroBg(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="premium-btn-group">
                                <button className="premium-btn-cta secondary" onClick={() => setShowHeroBgModal(false)}>
                                    Annuler
                                </button>
                                <button className="premium-btn-cta gold" onClick={handleHeroBgUpdate}>
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
