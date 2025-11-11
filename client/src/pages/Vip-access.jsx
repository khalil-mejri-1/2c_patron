import React from 'react';
import { FaPlayCircle, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link, NavLink } from 'react-router-dom';

// 📋 بيانات الكورسات المميزة
const vipCourses = [
    {
        id: 1,
        title: "Les Manches ", // الأكمام المتقدمة
        description: "Maîtriser les différentes coupes et montages de manches pour la haute couture.",
        duration: "10 Leçons",
        level: "Avancé",
        image: "https://images.unsplash.com/photo-1666358086912-6ca2b45afb31?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
    },
    {
        id: 2,
        title: "Les Jupes ", // التنورات الهيكلية
        description: "Techniques de patronage pour les jupes évasées, plissées et à panneaux complexes.",
        duration: "8 Leçons",
        level: "Intermédiaire",
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=864"
    },
    {
        id: 3,
        title: "Les Cols  ", // الياقات الكلاسيكية والخيالية
        description: "Apprenez à concevoir et à monter des cols claudine, tailleur et des cols montants.",
        duration: "12 Leçons",
        level: "Expert",
        image: "https://plus.unsplash.com/premium_photo-1726880484249-a81d389f766c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1127"
    },
    {
        id: 4,
        title: "Les pantalons", // التشكيل على المانيكان
        description: "Techniques de drapage pour créer des volumes directement sur le mannequin.",
        duration: "15 Leçons",
        level: "Avancé",
        image: "https://images.unsplash.com/photo-1741813788164-1270fab88d5a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074"
    },
];

export default function Vipaccess() {
    return (
        <>
            <Navbar/>
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
                                </div>
                                <NavLink to="/cours_Manches">
                                       <button className="access-button">
                                    Commencer la Leçon
                                </button>
                                 </NavLink>
                         
                            </div>
                        </div>
                    ))}
                </div>

            </section> 
            <Footer/>
        </>
    );
}