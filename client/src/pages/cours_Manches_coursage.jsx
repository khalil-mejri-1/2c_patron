import React, { useState, useEffect } from 'react';
import { FaPlayCircle, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../apiConfig';

export default function Leçons_Manches_coursage() {
    const { leconTitle } = useParams();
    const actualTitle = decodeURIComponent(leconTitle);

    const [groups, setGroups] = useState([]); // تحتوي على كل المجموعات (object واحد يحتوي على courses[])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/specialized-courses`, {
                params: { category: actualTitle } // تمرير اسم الفئة
            });
            setGroups(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Erreur lors du chargement des cours.");
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Chargement...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;

    // 🔍 كل مجموعة تحتوي على video_link وداخلها courses[]
    const allCourses = groups.flatMap(group => group.courses);

    // نأخذ الفيديو من أول مجموعة فقط إذا كان موجودًا
    const videoUrl = groups.length > 0 && groups[0].video_link ? groups[0].video_link : null;

    return (
        <>
            <Navbar />
            <br /><br /><br />
            <section className="vip-section">

                {/* 1. Entête de la page */}
                <div className="vip-header">
                    <h1 className="vip-main-title">
                        <span style={{ color: "#d4af37" }}>{actualTitle}</span>
                    </h1>
                    <p className="vip-sub-text">
                        Maîtrisez la conception et la réalisation de Corsage avec professionnalisme, des classiques aux modèles les plus complexes.
                    </p>
                </div>

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
        </>
    );
}
