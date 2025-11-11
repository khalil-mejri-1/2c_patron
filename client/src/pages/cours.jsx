import React from 'react';
import { FaPlayCircle, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link } from 'react-router-dom';

// 📋 بيانات الكورسات المميزة
const vipCourses = [
    {
        id: 1,
        title: "Manche Montée ", // الأكمام المتقدمة
        description: "Maîtriser les différentes coupes et montages de manches pour la haute couture.",
        duration: "10 Leçons",
        level: "Avancé",
        image: "https://images.unsplash.com/photo-1666358086912-6ca2b45afb31?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
    },
    {
        id: 2,
        title: "Manche Raglan ", // التنورات الهيكلية
        description: "Techniques de patronage pour les jupes évasées, plissées et à panneaux complexes.",
        duration: "8 Leçons",
        level: "Intermédiaire",
        image: "https://plus.unsplash.com/premium_photo-1673384389085-000d6d9fe30e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=688"
    },
    {
        id: 3,
        title: "Manche Kimono", // الياقات الكلاسيكية والخيالية
        description: "Apprenez à concevoir et à monter des cols claudine, tailleur et des cols montants.",
        duration: "12 Leçons",
        level: "Expert",
        image: "https://images.unsplash.com/photo-1487611856288-319e35678e82?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
    },
    {
        id: 4,
        title: "Manche Ballon", // التشكيل على المانيكان
        description: "Techniques de drapage pour créer des volumes directement sur le mannequin.",
        duration: "15 Leçons",
        level: "Avancé",
        image: "https://images.unsplash.com/photo-1620276132897-58d9dd16c462?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1305"
    },
     {
        id: 4,
        title: "Manche Gigot", // التشكيل على المانيكان
        description: "Techniques de drapage pour créer des volumes directement sur le mannequin.",
        duration: "15 Leçons",
        level: "Avancé",
        image: "https://plus.unsplash.com/premium_photo-1690422280031-3270734a4f07?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
    },
];

export default function Cours() {
    return (
        <>
            <Navbar/>
            <br /><br /><br />
            <section className="vip-section">
                
                {/* 1. رأس الصفحة (Hero Section مُصغر) */}
                <div className="vip-header">
                    <h1 className="vip-main-title">
                        LES MANCHES <span className="vip-accent-text"> </span>
                    </h1>
                    <p className="vip-sub-text">
                    </p>
                </div>

                {/* 2. شبكة كاردات الكورسات */}
                <div className="courses-grid-container">
                    {vipCourses.map(course => (
                        <div key={course.id} className="course-card">
                            
                            <div className="course-image-wrapper">
                                <img 
                                    src={course.image} 
                                    alt={course.title} 
                                    className="course-image" 
                                />
                                <div className="course-level-tag">{course.level}</div>
                            </div>
                            
                            <div className="course-content">
                                <h3 className="course-title">{course.title}</h3>
                                <p className="course-description">{course.description}</p>
                                
                                <div className="course-meta">
                                    <span className="course-duration"><FaPlayCircle /> {course.duration}</span>
                                </div>
                                
                                    <Link to="/Leçons">
                                    
                                 

                                    <button className="access-button">
                                    Commencer la Leçon
                                </button>
                                   </Link>
                            </div>
                        </div>
                    ))}
                </div>

            </section> 
            <Footer/>
        </>
    );
}