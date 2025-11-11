import React, { useState, useEffect } from 'react';
import { FaPlayCircle,FaSpinner } from 'react-icons/fa'; // لم نعد نحتاج FaLock
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';

export default function Leçons() {
    // 1. حالة لتخزين الفيديوهات التي تم جلبها
    const [videos, setVideos] = useState([]);
    // 2. حالة التحميل
    const [loading, setLoading] = useState(true);
    // 3. حالة الخطأ
    const [error, setError] = useState(null);

    // 🚀 قيم افتراضية للصورة والمدة
    // سنستخدم هذه القيم لأنك لا تريد جلبها من قاعدة البيانات
    const DEFAULT_THUMBNAIL = "https://via.placeholder.com/400x225?text=Leçon+de+Couture";
    const DEFAULT_DURATION = "20 min";

       const fetchVideos = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/videos');
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}. Vérifiez le serveur Node.js.`);

            const data = await response.json();
            setVideos(data);
        } catch (err) {
            console.error("Erreur de récupération des vidéos:", err);
            showNotification(err.message || 'Échec de la récupération des vidéos.', 'error');
        } finally {
            setLoading(false);
        }
    };

        useEffect(() => {
            fetchVideos();
        }, []);
    
    // عرض حالة التحميل أو الخطأ
    if (loading) {
        return (
            <>
                <Navbar/>
                <div className="lessons-section" style={{ textAlign: 'center', marginTop: '100px' }}>
                                      <div className="loading-state">
                                                           <FaSpinner className="spinner" />
                                                           <p>Chargement des Cours...</p>
                                                       </div>
                </div>
                <Footer/>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar/>
                <div className="lessons-section" style={{ textAlign: 'center', marginTop: '100px', color: 'red' }}>
                    <h2>{error}</h2>
                </div>
                <Footer/>
            </>
        );
    }


    // 7. عرض قائمة الفيديوهات
    return (
        <>
            <Navbar/>
            <br /> <br /> <br />
            <section className="lessons-section">
                
                {/* 1. رأس الصفحة (Hero Section مُصغر) */}
                <div className="lessons-header">
                    <h1 className="lessons-main-title">
                        Bibliothèque de <span className="lessons-accent-text">Leçons Vidéo</span>
                    </h1>
                    <p className="lessons-sub-text">
                        Accédez aux tutoriels détaillés pour maîtriser l'art de la couture.
                    </p>
                </div>

                {/* 2. شبكة بطاقات الدروس */}
                <div className="lessons-grid-container">
                    {videos.length > 0 ? (
                        videos.map(lesson => (
                            <div key={lesson.id} className="lesson-card">
                                
                                <div className="lesson-image-wrapper">
                                   <video
                                            controls
                                            src={`http://localhost:3000/api/videos/stream/${lesson._id}`}
                                            className="uploaded-video-player"
                                            onContextMenu={(e) => e.preventDefault()}
                                            // ✅ إضافة الخاصية لمنع زر التحميل من الظهور في قائمة التحكم (النقاط الثلاث)
                                            controlsList="nodownload"
                                        >
                                            Votre navigateur ne supporte pas la balise vidéo.
                                        </video>
                                    {/* 💡 تم إزالة التحقق من حالة VIP وعرض أيقونة التشغيل فقط */}
                                  
                                    
                                    {/* شارة المدة */}
                                    <span className="lesson-duration-tag">{lesson.duration}</span>
                                </div>
                                
                                <div className="lesson-content">
                                    <h3 className="lesson-title">{lesson.titre}</h3>
                                    {/* 💡 تم تعيين الشارة دائمًا على "Gratuit" */}
                                   
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0' }}>
                            Aucune vidéo disponible pour le moment.
                        </p>
                    )}
                </div>


             

            </section> 
            <Footer/>
        </>
    );
}