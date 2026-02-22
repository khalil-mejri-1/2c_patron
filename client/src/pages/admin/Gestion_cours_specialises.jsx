// GestionCoursSpecialises.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaPlusCircle, FaTrash, FaSave, FaVideo, FaLayerGroup, FaExclamationTriangle, FaCog } from 'react-icons/fa';
import BASE_URL from '../../apiConfig';

const COURS_API_URL = `${BASE_URL}/api/specialized-courses`;
const CATEGORIES_API_URL = `${BASE_URL}/api/vip-categories`;

export default function GestionCoursSpecialises({ onClose }) {
    const [videoLink, setVideoLink] = useState('');
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([{ title: '', duration: '', image: '', vip_category: '' }]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [existingGroups, setExistingGroups] = useState({});
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [optionModal, setOptionModal] = useState(null);

    useEffect(() => {
        fetchCategories();
        fetchGroups();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(CATEGORIES_API_URL);
            setCategories(res.data);
            setLoading(false);
        } catch {
            setError('Erreur lors du chargement des catégories.');
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await axios.get(COURS_API_URL);
            const data = res.data;

            const groupedCourses = data.reduce((acc, group) => {
                const categoryTitle = group.courses[0]?.vip_category;
                if (categoryTitle) {
                    if (!acc[categoryTitle]) {
                        acc[categoryTitle] = {
                            _id: group._id,
                            video_link: group.video_link,
                            subCategories: []
                        };
                    }
                    group.courses.forEach(course => {
                        if (course.title && !acc[categoryTitle].subCategories.includes(course.title)) {
                            acc[categoryTitle].subCategories.push(course.title);
                        }
                    });
                }
                return acc;
            }, {});

            setExistingGroups(groupedCourses);
        } catch (err) {
            console.error("Erreur:", err);
        }
    };

    const handleCourseChange = (index, field, value) => {
        const updated = [...courses];
        updated[index][field] = value;
        setCourses(updated);
        setError(null);
        setSuccess('');
    };

    const handleSubCategorySelection = (courseIndex, subCategoryTitle) => {
        handleCourseChange(courseIndex, 'vip_category', subCategoryTitle);
        setOptionModal(null);
    };

    const addCourse = () => setCourses([...courses, { title: '', duration: '', image: '', vip_category: '' }]);
    const removeCourse = (i) => {
        const updated = courses.filter((_, idx) => idx !== i);
        setCourses(updated.length > 0 ? updated : [{ title: '', duration: '', image: '', vip_category: '' }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validCourses = courses.filter(c => c.title.trim() && c.vip_category.trim() && c.image.trim());
        if (validCourses.length === 0) {
            setError("Veuillez remplir les champs obligatoires (*).");
            return;
        }
        try {
            await axios.post(`${COURS_API_URL}/group`, { video_link: videoLink.trim() || undefined, courses: validCourses });
            setSuccess('Sauvegardé avec succès !');
            setCourses([{ title: '', duration: '', image: '', vip_category: '' }]);
            setVideoLink('');
            fetchGroups();
        } catch {
            setError('Erreur lors de la sauvegarde.');
        }
    };

    const handleDeleteGroup = async (groupId) => {
        setConfirmDialog(null);
        try {
            await axios.delete(`${COURS_API_URL}/${groupId}`);
            setSuccess('Supprimé avec succès.');
            fetchGroups();
        } catch {
            setError('Erreur de suppression.');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#1e293b' }}><h3>Chargement...</h3></div>;

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="premium-modal-header" style={{ marginBottom: '30px' }}>
                <h2 className="premium-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FaVideo style={{ color: '#D4AF37' }} /> Gestion des Cours Spécialisés
                </h2>
                <button onClick={onClose} className="premium-modal-close-icon"><FaTimes /></button>
            </div>

            {error && <div style={{ marginBottom: '20px', padding: '15px', background: '#fef2f2', color: '#b91c1c', borderRadius: '12px', border: '1px solid #fee2e2' }}>{error}</div>}
            {success && <div style={{ marginBottom: '20px', padding: '15px', background: '#ecfdf5', color: '#047857', borderRadius: '12px', border: '1px solid #d1fae5', textAlign: 'center', fontWeight: 'bold' }}>{success}</div>}

            <form onSubmit={handleSubmit} className="premium-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#1e293b' }}>Lien Vidéo Intro (Optionnel)</label>
                    <input
                        type="url"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="premium-form-group"
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ced4da' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {courses.map((course, i) => (
                        <div key={i} className="premium-card" style={{ padding: '20px', border: '1px solid #D4AF37', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h4 style={{ margin: 0, color: '#D4AF37' }}>Cours #{i + 1}</h4>
                                {courses.length > 1 && (
                                    <button type="button" onClick={() => removeCourse(i)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                        <FaTrash /> Supprimer
                                    </button>
                                )}
                            </div>

                            <div className="premium-form-grid" style={{ gap: '15px' }}>
                                <div className="premium-form-group" style={{ flex: 1 }}>
                                    <label>Titre *</label>
                                    <input type="text" value={course.title} onChange={(e) => handleCourseChange(i, 'title', e.target.value)} placeholder="Titre du cours" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ced4da' }} />
                                </div>
                                <div className="premium-form-group" style={{ flex: 1 }}>
                                    <label>Catégorie VIP *</label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={course.vip_category}
                                            onChange={(e) => handleCourseChange(i, 'vip_category', e.target.value)}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ced4da', appearance: 'none', background: '#fff' }}
                                        >
                                            <option value="">-- Sélectionnez --</option>
                                            {categories.map(c => <option key={c._id} value={c.title}>{c.title}</option>)}
                                        </select>
                                        {existingGroups[course.vip_category] && existingGroups[course.vip_category].subCategories.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setOptionModal({ courseIndex: i, title: course.vip_category, subCategories: existingGroups[course.vip_category].subCategories })}
                                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: '#D4AF37', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '5px', fontSize: '0.7rem', cursor: 'pointer' }}
                                            >
                                                Options
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="premium-form-group" style={{ flex: 1 }}>
                                    <label>Durée</label>
                                    <input type="text" value={course.duration} onChange={(e) => handleCourseChange(i, 'duration', e.target.value)} placeholder="ex: 45 min" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ced4da' }} />
                                </div>
                                <div className="premium-form-group" style={{ flex: 1 }}>
                                    <label>Image *</label>
                                    <input type="url" value={course.image} onChange={(e) => handleCourseChange(i, 'image', e.target.value)} placeholder="Lien image" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ced4da' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="premium-btn-group" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button type="button" onClick={addCourse} className="premium-btn-cta secondary" style={{ flex: 1, padding: '12px' }}><FaPlusCircle /> Ajouter un cours</button>
                    <button type="submit" className="premium-btn-cta gold" style={{ flex: 1, padding: '12px' }}><FaSave /> Tout Enregistrer</button>
                </div>
            </form>

            <div className="premium-list-container" style={{ marginTop: '50px' }}>
                <h3 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '25px', paddingLeft: '10px', borderLeft: '4px solid #D4AF37', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaLayerGroup style={{ color: '#D4AF37' }} /> Groupes Existants ({Object.keys(existingGroups).length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {Object.keys(existingGroups).map(catTitle => {
                        const group = existingGroups[catTitle];
                        return (
                            <div key={group._id} className="premium-list-item" style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>{catTitle}</h4>
                                        <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#64748b' }}>{group.subCategories.length} sous-catégories</p>
                                        {group.video_link && (
                                            <div style={{ marginTop: '10px' }}>
                                                <video src={group.video_link} controls style={{ maxWidth: '200px', height: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => setConfirmDialog({ id: group._id, title: catTitle })} className="premium-btn-cta gold" style={{ background: '#fee2e2', color: '#ef4444', borderColor: '#fecaca', padding: '8px 15px', fontSize: '0.8rem' }}>
                                        <FaTrash /> Supprimer
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
                                    {group.subCategories.map((sub, idx) => (
                                        <span key={idx} style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{sub}</span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {optionModal && (
                <div className="premium-modal-backdrop" onClick={() => setOptionModal(null)}>
                    <div className="premium-modal-content" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <div className="premium-modal-header">
                            <h3 className="premium-modal-title">Sous-catégories : {optionModal.title}</h3>
                            <button onClick={() => setOptionModal(null)} className="premium-modal-close-icon"><FaTimes /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                            {optionModal.subCategories.map((sub, idx) => (
                                <div key={idx}
                                    onClick={() => handleSubCategorySelection(optionModal.courseIndex, sub)}
                                    style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 'bold' }}
                                    onMouseOver={e => e.currentTarget.style.borderColor = '#D4AF37'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                                    {sub}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setOptionModal(null)} className="premium-btn-cta secondary" style={{ width: '100%', marginTop: '20px' }}>Fermer</button>
                    </div>
                </div>
            )}

            {confirmDialog && (
                <div className="premium-modal-backdrop" onClick={() => setConfirmDialog(null)}>
                    <div className="premium-modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center' }}>
                            <FaExclamationTriangle style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '15px' }} />
                            <h3 className="premium-modal-title">Confirmation</h3>
                            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Voulez-vous supprimer le groupe de cours <strong>"{confirmDialog.title}"</strong> ? Cette action est irréversible.</p>
                        </div>
                        <div className="premium-btn-group" style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                            <button onClick={() => setConfirmDialog(null)} className="premium-btn-cta secondary" style={{ flex: 1 }}>Annuler</button>
                            <button onClick={() => handleDeleteGroup(confirmDialog.id)} className="premium-btn-cta gold" style={{ background: '#ef4444', borderColor: '#dc2626', flex: 1 }}>Oui, Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}