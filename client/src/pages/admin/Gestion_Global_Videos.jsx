import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaVideo, FaMapMarkerAlt, FaLink, FaLanguage, FaSpinner, FaSearch, FaFilter, FaExternalLinkAlt, FaLayerGroup, FaBook, FaChevronDown, FaChevronUp, FaTrash } from 'react-icons/fa';
import NavbarAdmin from '../../comp/Navbar_admin';
import BASE_URL from '../../apiConfig';
import { useLanguage } from '../../context/LanguageContext';
import { useAlert } from '../../context/AlertContext';

export default function Gestion_Global_Videos() {
    const { appLanguage } = useLanguage();
    const { showAlert } = useAlert();
    const [videos, setVideos] = useState([]);
    const [courses, setCourses] = useState([]);       // all SpecializedCourse groups
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'videos'
    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [videosRes, coursesRes] = await Promise.all([
                axios.get(`${BASE_URL}/api/specialized-videos`),
                axios.get(`${BASE_URL}/api/specialized-courses`)
            ]);
            setVideos(videosRes.data);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetAll = async () => {
        showAlert('confirm', "Attention", "⚠️ Cette action va supprimer TOUTES les vidéos spécialisées et TOUTES les leçons enregistrées. Êtes-vous sûr ?", () => {
            showAlert('confirm', "Dernière chance", "Voulez-vous vraiment TOUT supprimer ? Cette action est irréversible.", async () => {
                try {
                    setLoading(true);
                    await Promise.all([
                        axios.delete(`${BASE_URL}/api/specialized-videos-all/reset-now`),
                        axios.delete(`${BASE_URL}/api/specialized-courses-all/reset-now`)
                    ]);
                    showAlert('success', 'Succès', "Réinitialisation terminée avec succès.");
                    fetchAll();
                } catch (error) {
                    showAlert('error', 'Erreur', "Erreur lors de la réinitialisation.");
                } finally {
                    setLoading(false);
                }
            });
        });
    };

    const handleDeleteVideo = async (videoId) => {
        showAlert('confirm', 'Confirmation', "Supprimer cette vidéo ?", async () => {
            try {
                await axios.delete(`${BASE_URL}/api/specialized-videos/${videoId}`);
                setVideos(videos.filter(v => v._id !== videoId));
                showAlert('success', 'Succès', "Vidéo supprimée.");
            } catch (error) {
                console.error("Erreur delet video:", error);
                showAlert('error', 'Erreur', "Erreur lors de la suppression.");
            }
        });
    };

    const handleReassignVideo = async (video, newLessonTitle) => {
        if (!newLessonTitle) return;
        try {
            const formData = new FormData();
            formData.append('title', video.title);
            formData.append('category', video.category);
            formData.append('subCategory', newLessonTitle);

            // Re-send existing lang objects as JSON strings to satisfy the PUT route expectations
            formData.append('title_lang', JSON.stringify(video.title_lang || {}));
            formData.append('status_lang', JSON.stringify(video.status_lang || {}));
            formData.append('url_lang', JSON.stringify(video.url_lang || {}));

            await axios.put(`${BASE_URL}/api/specialized-videos/${video._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showAlert('success', 'Succès', 'La vidéo a été déplacée avec succès.');
            fetchAll();
        } catch (err) {
            console.error("Erreur reassign video:", err);
            showAlert('error', 'Erreur', 'Impossible de déplacer la vidéo.');
        }
    };

    const handleDeleteCourse = async (groupId) => {
        showAlert('confirm', 'Confirmation', "Voulez-vous vraiment supprimer cette catégorie principale et toutes ses leçons/vidéos associées ?", async () => {
            try {
                await axios.delete(`${BASE_URL}/api/specialized-courses/${groupId}`);
                setCourses(courses.filter(c => c._id !== groupId));
                showAlert('success', 'Succès', "Catégorie supprimée avec succès.");
                fetchAll(); // Refresh to ensure deleted videos disappear from UI
            } catch (error) {
                console.error("Erreur delet course:", error);
                showAlert('error', 'Erreur', "Erreur lors de la suppression de la catégorie.");
            }
        });
    };

    const handleDeleteSubCourse = async (groupId, courseIndex) => {
        showAlert('confirm', 'Confirmation', "Voulez-vous vraiment supprimer cette leçon (sous-catégorie) ?", async () => {
            try {
                const group = courses.find(c => c._id === groupId);
                if (!group) return;

                const updatedCourses = group.courses.filter((_, i) => i !== courseIndex);

                await axios.put(`${BASE_URL}/api/specialized-courses/${groupId}`, {
                    courses: updatedCourses
                });

                setCourses(courses.map(c => {
                    if (c._id === groupId) {
                        return { ...c, courses: updatedCourses };
                    }
                    return c;
                }));
                showAlert('success', 'Succès', "Leçon supprimée avec succès.");
            } catch (error) {
                console.error("Erreur delet subcourse:", error);
                showAlert('error', 'Erreur', "Erreur lors de la suppression de la leçon.");
            }
        });
    };

    const toggleGroup = (id) => setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));

    // --- Filtered Videos ---
    const uniqueCategories = Array.from(new Set(videos.map(v => v.category))).filter(Boolean);

    const filteredVideos = videos.filter(video => {
        const haystack = [video.title, video.category, JSON.stringify(video.title_lang)].join(' ').toLowerCase();
        const matchesSearch = haystack.includes(searchTerm.toLowerCase());
        const matchesFilter = filterCategory === '' || video.category === filterCategory;
        return matchesSearch && matchesFilter;
    });

    // --- Filtered Courses ---
    const filteredCourses = courses.filter(group => {
        const groupName = group.vip_category || '';
        const lessonsText = (group.courses || []).map(c => {
            const t = typeof c.title === 'object' ? Object.values(c.title).join(' ') : (c.title || '');
            return t;
        }).join(' ');
        const haystack = (groupName + ' ' + lessonsText).toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
    });

    // Videos grouped intelligently
    const videosByCategory = {};
    videos.forEach(v => {
        let origCat = v.category ? v.category.trim() : 'Non classé';
        const ctg = courses.find(c => c.vip_category?.toLowerCase() === origCat.toLowerCase());
        let mainCat = ctg ? ctg.vip_category : origCat;

        // Backwards compatibility: if video has no subCategory, check if its "category" is actually a lesson name
        if (!v.subCategory) {
            const matchedGroup = courses.find(g =>
                g.courses?.some(c => {
                    const t = typeof c.title === 'object' ? (c.title.fr || Object.values(c.title)[0]) : c.title;
                    return t?.toLowerCase() === mainCat.toLowerCase();
                })
            );
            if (matchedGroup && matchedGroup.vip_category !== mainCat) {
                mainCat = matchedGroup.vip_category;
                v._inferredSubCategory = origCat; // Helper for rendering
            }
        }

        if (!videosByCategory[mainCat]) videosByCategory[mainCat] = [];
        videosByCategory[mainCat].push(v);
    });

    // Stat counts
    const totalLessons = courses.reduce((sum, g) => sum + (g.courses?.length || 0), 0);

    const tabStyle = (tab) => ({
        padding: '12px 30px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '700',
        fontSize: '1rem',
        transition: 'all 0.2s',
        background: activeTab === tab ? 'linear-gradient(135deg, #D4AF37, #b8960c)' : '#f1f5f9',
        color: activeTab === tab ? '#fff' : '#475569',
        boxShadow: activeTab === tab ? '0 4px 15px rgba(212,175,55,0.3)' : 'none'
    });

    return (
        <div style={{ background: '#f0f4f8', minHeight: '100vh', paddingBottom: '60px' }}>
            <NavbarAdmin />

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 20px' }}>

                {/* ===== HEADER ===== */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    borderRadius: '24px', padding: '40px', marginBottom: '30px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)', color: '#fff', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <FaVideo style={{ color: '#D4AF37' }} /> Répertoire Global des Vidéos
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '30px' }}>
                            Vue complète de toutes les formations, leçons et vidéos enregistrées sur la plateforme.
                        </p>
                        {/* Stats Row */}
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            {[
                                { label: 'Catégories', value: courses.length, icon: <FaLayerGroup /> },
                                { label: 'Leçons', value: totalLessons, icon: <FaBook /> },
                                { label: 'Vidéos', value: videos.length, icon: <FaVideo /> },
                            ].map((stat, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px 30px',
                                    display: 'flex', alignItems: 'center', gap: '12px', backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <div style={{ color: '#D4AF37', fontSize: '1.5rem' }}>{stat.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1 }}>{stat.value}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ position: 'absolute', right: '-60px', top: '-60px', width: '350px', height: '350px', background: 'rgba(212,175,55,0.07)', borderRadius: '50%', zIndex: 0 }} />
                </div>

                {/* ===== SEARCH & ACTIONS BAR ===== */}
                <div style={{
                    background: '#fff', borderRadius: '20px', padding: '20px 25px',
                    marginBottom: '25px', display: 'flex', gap: '15px', alignItems: 'center',
                    flexWrap: 'wrap', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)'
                }}>
                    <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Rechercher par titre, catégorie..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 15px 12px 45px', borderRadius: '12px',
                                border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaFilter style={{ color: '#D4AF37' }} />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="">Toutes les catégories</option>
                            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <button onClick={fetchAll} style={{ padding: '12px 25px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>
                        Actualiser
                    </button>
                    <button onClick={handleResetAll} style={{
                        padding: '12px 25px', borderRadius: '12px', border: 'none',
                        background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff',
                        cursor: 'pointer', fontWeight: '700', marginLeft: 'auto'
                    }}>
                        Réinitialisation Totale
                    </button>
                </div>

                {/* ===== TABS ===== */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
                    <button style={tabStyle('categories')} onClick={() => setActiveTab('categories')}>
                        <FaLayerGroup style={{ marginRight: '8px' }} /> Catégories & Leçons
                    </button>
                    <button style={tabStyle('videos')} onClick={() => setActiveTab('videos')}>
                        <FaVideo style={{ marginRight: '8px' }} /> Toutes les Vidéos
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px', background: '#fff', borderRadius: '24px' }}>
                        <FaSpinner size={50} color="#D4AF37" style={{ animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: '20px', color: '#64748b' }}>Chargement...</p>
                    </div>
                ) : activeTab === 'categories' ? (
                    /* ============ CATEGORIES TAB ============ */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredCourses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '20px', color: '#64748b' }}>
                                <FaSearch size={40} style={{ marginBottom: '15px', opacity: 0.3 }} />
                                <p>Aucune catégorie trouvée.</p>
                            </div>
                        ) : filteredCourses.map(group => {
                            const isOpen = expandedGroups[group._id] !== false; // default open
                            const catVideos = videosByCategory[group.vip_category] || [];

                            return (
                                <div key={group._id} style={{
                                    background: '#fff', borderRadius: '20px', overflow: 'hidden',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    {/* Group Header */}
                                    <div
                                        onClick={() => toggleGroup(group._id)}
                                        style={{
                                            padding: '20px 30px', display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between', cursor: 'pointer',
                                            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                            borderBottom: isOpen ? '1px solid #e2e8f0' : 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{
                                                width: '45px', height: '45px', borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #D4AF37, #b8960c)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontSize: '1.2rem'
                                            }}>
                                                <FaLayerGroup />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1e293b' }}>{group.vip_category}</div>
                                                <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '3px' }}>
                                                    {group.courses?.length || 0} leçon(s) · {catVideos.length} vidéo(s)
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteCourse(group._id); }}
                                                style={{
                                                    padding: '8px 15px', borderRadius: '10px', border: 'none',
                                                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600'
                                                }}
                                                title="Supprimer la catégorie principale"
                                            >
                                                <FaTrash size={12} /> Supprimer
                                            </button>
                                            <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                                                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lessons & Videos inside group */}
                                    {isOpen && (
                                        <div style={{ padding: '30px 40px' }}>
                                            {/* Tree Structure Container */}
                                            {(group.courses?.length > 0) ? (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    {group.courses.map((course, i) => {
                                                        const titleStr = typeof course.title === 'object'
                                                            ? (course.title.fr || Object.values(course.title)[0])
                                                            : course.title;
                                                        const techName = course.technicalName || course.vip_category || titleStr;

                                                        // Videos for this specific lesson
                                                        const lessonVideos = catVideos.filter(v =>
                                                            v.subCategory === titleStr || v._inferredSubCategory === titleStr || (!v.subCategory && v.category === titleStr)
                                                        );

                                                        const isLastLesson = i === group.courses.length - 1;

                                                        return (
                                                            <div key={i} style={{ position: 'relative', paddingLeft: '40px' }}>
                                                                {/* Tree Lines for Lesson */}
                                                                <div style={{ position: 'absolute', top: 0, left: '15px', bottom: isLastLesson ? 'auto' : 0, height: isLastLesson ? '38px' : '100%', width: '2px', background: '#cbd5e1', zIndex: 0 }} />
                                                                <div style={{ position: 'absolute', top: '38px', left: '15px', width: '25px', height: '2px', background: '#cbd5e1', zIndex: 0 }} />

                                                                <div style={{ paddingTop: '15px', paddingBottom: '15px' }}>
                                                                    {/* Lesson Header Card */}
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e2e8f0', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', zIndex: 1 }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                            <div style={{ background: 'rgba(212,175,55,0.1)', padding: '6px', borderRadius: '8px', color: '#D4AF37', display: 'flex' }}>
                                                                                <FaBook size={14} />
                                                                            </div>
                                                                            <div>
                                                                                <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>{titleStr}</div>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleDeleteSubCourse(group._id, i)}
                                                                            style={{
                                                                                padding: '5px 10px', borderRadius: '6px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 'bold'
                                                                            }} title="Supprimer la leçon"
                                                                        >
                                                                            <FaTrash size={10} /> Supprimer
                                                                        </button>
                                                                    </div>

                                                                    {/* Videos Branch */}
                                                                    {lessonVideos.length > 0 && (
                                                                        <div style={{ position: 'relative', marginTop: '10px', paddingLeft: '40px' }}>
                                                                            {/* Root vertical line for videos branching from lesson module */}
                                                                            <div style={{ position: 'absolute', top: '-10px', left: '26px', bottom: lessonVideos.length === 0 ? 'auto' : 0, width: '2px', background: '#e2e8f0', zIndex: 0 }} />

                                                                            {lessonVideos.map((video, vIndex) => {
                                                                                const isLastVideo = vIndex === lessonVideos.length - 1;
                                                                                return (
                                                                                    <div key={video._id} style={{ position: 'relative', paddingTop: '8px', paddingBottom: '8px' }}>
                                                                                        {/* Tree Lines for Video */}
                                                                                        <div style={{ position: 'absolute', top: 0, left: '-14px', bottom: isLastVideo ? 'auto' : 0, height: isLastVideo ? '28px' : '100%', width: '2px', background: '#e2e8f0', zIndex: 0 }} />
                                                                                        <div style={{ position: 'absolute', top: '28px', left: '-14px', width: '25px', height: '2px', background: '#e2e8f0', zIndex: 0 }} />

                                                                                        {/* Video Item Card */}
                                                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #f1f5f9', padding: '10px 15px', borderRadius: '10px', position: 'relative', zIndex: 1 }}>
                                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                                                <FaVideo color="#94a3b8" size={13} />
                                                                                                <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>{video.title}</span>
                                                                                            </div>
                                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                                                                    {['fr', 'ar', 'tn'].map(lang => (
                                                                                                        <span key={lang} style={{
                                                                                                            padding: '2px 7px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase',
                                                                                                            background: video.url_lang?.[lang] ? 'rgba(34,197,94,0.1)' : '#f1f5f9',
                                                                                                            color: video.url_lang?.[lang] ? '#16a34a' : '#cbd5e1',
                                                                                                            border: video.url_lang?.[lang] ? '1px solid rgba(34,197,94,0.2)' : '1px solid #e2e8f0'
                                                                                                        }}>{lang}</span>
                                                                                                    ))}
                                                                                                </div>
                                                                                                <button onClick={() => handleDeleteVideo(video._id)} style={{
                                                                                                    padding: '4px', borderRadius: '4px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', display: 'flex'
                                                                                                }} title="Supprimer la vidéo"><FaTrash size={12} /></button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', paddingLeft: '15px' }}>
                                                    Aucune leçon enregistrée dans cette catégorie.
                                                </div>
                                            )}

                                            {/* Unassigned / Global Videos */}
                                            {(() => {
                                                const unassignedVideos = catVideos.filter(v => {
                                                    const lessonExists = group.courses?.some(c => {
                                                        const t = typeof c.title === 'object' ? (c.title.fr || Object.values(c.title)[0]) : c.title;
                                                        return t === v.subCategory || t === v._inferredSubCategory || t === v.category;
                                                    });
                                                    return !lessonExists;
                                                });

                                                if (unassignedVideos.length > 0) {
                                                    return (
                                                        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px dashed #f1f5f9' }}>
                                                            <div style={{ fontWeight: '700', color: '#64748b', marginBottom: '15px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                <FaVideo style={{ marginRight: '6px' }} /> Autres vidéos associées ({unassignedVideos.length})
                                                            </div>
                                                            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                                                    <tbody>
                                                                        {unassignedVideos.map(video => (
                                                                            <tr key={video._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                                <td style={{ padding: '12px 15px', fontWeight: '600', color: '#334155' }}>
                                                                                    <FaVideo color="#cbd5e1" style={{ marginRight: '10px' }} /> {video.title}
                                                                                </td>
                                                                                <td style={{ padding: '12px 15px', color: '#94a3b8' }}>
                                                                                    {['fr', 'ar', 'en'].map(lang => (
                                                                                        <span key={lang} style={{
                                                                                            marginRight: '6px', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
                                                                                            background: video.url_lang?.[lang] ? 'rgba(34,197,94,0.1)' : '#f1f5f9',
                                                                                            color: video.url_lang?.[lang] ? '#16a34a' : '#cbd5e1'
                                                                                        }}>{lang}</span>
                                                                                    ))}
                                                                                </td>
                                                                                <td style={{ padding: '12px 15px', textAlign: 'right' }}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                                                        <select
                                                                                            onChange={(e) => handleReassignVideo(video, e.target.value)}
                                                                                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.75rem', outline: 'none', background: '#f8fafc', color: '#475569', cursor: 'pointer' }}
                                                                                        >
                                                                                            <option value="">Déplacer vers...</option>
                                                                                            {group.courses.map((c, cIdx) => {
                                                                                                const t = typeof c.title === 'object' ? (c.title.fr || Object.values(c.title)[0]) : c.title;
                                                                                                return <option key={cIdx} value={t}>{t}</option>;
                                                                                            })}
                                                                                        </select>
                                                                                        <button onClick={() => handleDeleteVideo(video._id)} style={{
                                                                                            padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer'
                                                                                        }} title="Supprimer"><FaTrash size={14} /></button>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ============ ALL VIDEOS TAB ============ */
                    <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <tr>
                                        <th style={{ padding: '18px 25px', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>#</th>
                                        <th style={{ padding: '18px 25px', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>VIDÉO</th>
                                        <th style={{ padding: '18px 25px', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>CATÉGORIE</th>
                                        <th style={{ padding: '18px 25px', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>LANGUES</th>
                                        <th style={{ padding: '18px 25px', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVideos.map((video, index) => (
                                        <tr key={video._id}
                                            style={{ borderBottom: index === filteredVideos.length - 1 ? 'none' : '1px solid #f1f5f9', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fcfcfd'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '20px 25px', color: '#94a3b8', fontSize: '0.9rem' }}>{index + 1}</td>
                                            <td style={{ padding: '20px 25px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', flexShrink: 0 }}>
                                                        <FaVideo size={18} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{video.title}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FaLink size={9} /> {(video.url || '').substring(0, 45)}{video.url?.length > 45 ? '...' : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 25px' }}>
                                                <span style={{
                                                    padding: '5px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
                                                    background: 'rgba(212,175,55,0.1)', color: '#92700a', border: '1px solid rgba(212,175,55,0.2)'
                                                }}>
                                                    <FaMapMarkerAlt style={{ marginRight: '5px', fontSize: '0.75rem' }} />
                                                    {video.category || 'Non classé'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 25px' }}>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    {['fr', 'ar', 'en'].map(lang => (
                                                        <span key={lang} style={{
                                                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase',
                                                            background: video.url_lang?.[lang] ? 'rgba(34,197,94,0.1)' : '#f1f5f9',
                                                            color: video.url_lang?.[lang] ? '#16a34a' : '#94a3b8',
                                                            border: video.url_lang?.[lang] ? '1px solid rgba(34,197,94,0.2)' : '1px solid #e2e8f0'
                                                        }}>{lang}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 25px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <a href={video.url} target="_blank" rel="noopener noreferrer" style={{
                                                        padding: '7px 13px', borderRadius: '10px', background: '#f1f5f9',
                                                        color: '#475569', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none'
                                                    }}>
                                                        <FaExternalLinkAlt size={11} /> Voir
                                                    </a>
                                                    <button onClick={() => handleDeleteVideo(video._id)} style={{
                                                        padding: '7px 13px', borderRadius: '10px', border: 'none',
                                                        background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem'
                                                    }}>
                                                        <FaTrash size={11} /> Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredVideos.length === 0 && (
                                <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                                    <FaSearch size={40} style={{ marginBottom: '15px', opacity: 0.3 }} />
                                    <p>Aucune vidéo ne correspond à votre recherche.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }` }} />
        </div>
    );
}
