import React, { useState, useEffect } from 'react';
import { FaPlayCircle, FaCheckCircle,FaSpinner } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link, NavLink } from 'react-router-dom';
import axios from 'axios'; // ⚠️ يجب تثبيت axios: npm install axios

// 📋 بيانات الكورسات المميزة - (تم إزالتها لصالح جلب البيانات من API)
// const vipCourses = [...]

export default function Vipaccess() {
    // 1. تعريف حالة لتخزين البيانات المجلوبة
    const [vipCategories, setVipCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. استخدام useEffect لجلب البيانات عند تحميل المكون
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // ⚠️ تأكد من أن المسار صحيح (قد تحتاج إلى استخدام عنوان URL كامل)
                const response = await axios.get('http://localhost:3000/api/vip-categories'); 
                
                // 3. تخزين البيانات المجلوبة في الحالة
                // نفترض أن API يرجع مصفوفة من الكائنات تحتوي على: 
                // id, title, description, level, image.
                setVipCategories(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Erreur de récupération des catégories VIP:", err);
                setError("فشل في تحميل البيانات. الرجاء المحاولة لاحقًا.");
                setLoading(false);
            }
        };

        fetchCategories();
    }, []); // تمرير مصفوفة فارغة لضمان تشغيل الجلب مرة واحدة فقط

    // 4. عرض حالة التحميل أو الخطأ
    if (loading) return (
        <>
        <Navbar/>
        <br /><br />
                        <div className="loading-state">
                                 <FaSpinner className="spinner" />
                                 <p>Chargement des Category...</p>
                               </div>
        </>
    );

    if (error) {
        return (
            <>
                <Navbar />
                <br /><br /><br />
                <div className="vip-header">
                    <h1 className="vip-main-title">
                        ACCÈS <span className="vip-accent-text">MASTER ATELIER</span>
                    </h1>
                </div>
                <p className="error-text" style={{ textAlign: 'center', color: 'red', marginTop: '50px' }}>
                    {error}
                </p>
                <Footer />
            </>
        );
    }
    
    // 5. استخدام البيانات المجلوبة بدلاً من البيانات الوهمية
    return (
        <>
            <Navbar />
            <br /><br /><br />
            <section className="vip-section">

                {/* 1. رأس الصفحة (Hero Section مُصغر) */}
                <div className="vip-header">
                    <h1 className="vip-main-title">
                        ACCÈS <span className="vip-accent-text">MASTER ATELIER</span>
                    </h1>
                    <p className="vip-sub-text">
                        Débloquez des cours exclusifs et transformez votre passion en expertise.
                    </p>
                </div>

                {/* 2. شبكة كاردات الكورسات - استخدام vipCategories */}
                <div className="courses-grid-container">
                    {vipCategories.map(course => (
                        <div key={course.id || course._id} className="course-card"> {/* استخدام course._id إذا كان من MongoDB */}

                            <div className="course-image-wrapper">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="course-image"
                                />
                                {/* <div className="course-level-tag">{course.level}</div> */}
                            </div>

                            <div className="course-content">
                                <h3 className="course-title">{course.title}</h3>
                                <p className="course-description">{course.description}</p>

                                <div className="course-meta">
                                    {/* يمكنك إضافة عناصر البيانات الوصفية الأخرى هنا مثل المدة (duration) إذا كانت متوفرة في API */}
                                    {course.duration && (
                                        <div className="duration">
                                            <FaPlayCircle /> {course.duration}
                                        </div>
                                    )}
                                </div>
                                
                                {/* ⚠️ تأكد من أن الرابط `/cours_Manches/${...}` صحيح ويعمل مع مسار التوجيه (Routing) */}
                                <NavLink to={`/cours_Manches/${encodeURIComponent(course.title)}`}>
                                    <button className="access-button">
                                        Commencer la Leçon
                                    </button>
                                </NavLink>

                            </div>
                        </div>
                    ))}
                </div>

            </section>
            <Footer />
        </>
    );
}