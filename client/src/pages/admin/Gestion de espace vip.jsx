import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import axios from 'axios';
import { FaPlusCircle, FaTrash, FaEdit, FaSave, FaBookOpen, FaVideo, FaLayerGroup, FaSpinner, FaExclamationTriangle, FaTimes, FaImage, FaClock, FaCheckCircle } from 'react-icons/fa';
import GestionCoursSpecialises from './Gestion_cours_specialises.jsx';
import GestionVedioSpecialises from './Gestion_vedio_specialises.jsx';
import BASE_URL from '../../apiConfig';
import { useAlert } from '../../context/AlertContext';

const API_URL = `${BASE_URL}/api/vip-categories`;

export default function Gestion_de_espace_vip() {
    const [newCategory, setNewCategory] = useState({ title: '', description: '', duration: '', image: '' });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [isCoursModalOpen, setIsCoursModalOpen] = useState(false);
    const [isVedioModalOpen, setIsVedioModalOpen] = useState(false);
    const { showAlert } = useAlert();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL);
            setCategories(response.data);
        } catch (err) {
            showAlert('error', 'Erreur', 'Échec du chargement des catégories.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddChange = (e) => {
        setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(API_URL, newCategory);
            setCategories([response.data, ...categories]);
            setNewCategory({ title: '', description: '', duration: '', image: '' });
            showAlert('success', 'Succès', 'Catégorie créée !');
        } catch (err) {
            showAlert('error', 'Erreur', "Échec de l'ajout.");
        }
    };

    const handleDelete = (id, title) => {
        showAlert('confirm', 'Supprimer Catégorie', `Voulez-vous supprimer "${title}" ?`, async () => {
            try {
                await axios.delete(`${API_URL}/${id}`);
                setCategories(categories.filter(cat => cat._id !== id));
                showAlert('success', 'Succès', 'Catégorie supprimée.');
            } catch (err) {
                showAlert('error', 'Erreur', 'Échec de la suppression.');
            }
        });
    };

    const handleEditStart = (category) => {
        setEditingId(category._id);
        setEditData({ ...category });
    };

    const handleEditSave = async (id) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, editData);
            setCategories(categories.map(cat => cat._id === id ? response.data : cat));
            setEditingId(null);
            showAlert('success', 'Succès', 'Mise à jour réussie !');
        } catch (err) {
            showAlert('error', 'Erreur', 'Échec de mise à jour.');
        }
    };

    if (loading) return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <FaSpinner className="spinner" style={{ fontSize: '3rem', color: '#D4AF37' }} />
                <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Chargement Espace Vip...</p>
            </div>
        </div>
    );

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <FaLayerGroup style={{ color: '#D4AF37' }} /> Gestion Espace VIP
                        </h1>
                        <p style={{ color: '#64748b', marginTop: '10px' }}>Organisez vos formations et contenus privilégiés.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => setIsCoursModalOpen(true)} className="premium-btn-cta secondary" style={{ padding: '12px 20px' }}>
                            <FaBookOpen /> Gérer Cours
                        </button>
                        <button onClick={() => setIsVedioModalOpen(true)} className="premium-btn-cta gold" style={{ padding: '12px 20px' }}>
                            <FaVideo /> Gérer Vidéos
                        </button>
                    </div>
                </div>

                <div className="premium-card" style={{ padding: '30px', marginBottom: '50px' }}>
                    <h3 style={{ marginBottom: '25px', color: '#1e293b', borderLeft: '4px solid #D4AF37', paddingLeft: '15px' }}>Nouvelle Catégorie VIP</h3>
                    <form onSubmit={handleAddSubmit} className="premium-form-grid">
                        <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Titre</label>
                            <input type="text" name="title" value={newCategory.title} onChange={handleAddChange} placeholder="Titre de la formation" required />
                        </div>
                        <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Durée / Infos</label>
                            <input type="text" name="duration" value={newCategory.duration} onChange={handleAddChange} placeholder="Ex: 12 Modules" />
                        </div>
                        <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                            <label>URL Image de Couverture</label>
                            <div style={{ position: 'relative' }}>
                                <FaImage style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }} />
                                <input type="url" name="image" value={newCategory.image} onChange={handleAddChange} placeholder="https://..." style={{ paddingLeft: '40px' }} required />
                            </div>
                        </div>
                        <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                            <label>Description</label>
                            <textarea name="description" value={newCategory.description} onChange={handleAddChange} placeholder="Description attractive pour les membres..." required rows="3" />
                        </div>
                        <div style={{ gridColumn: 'span 4' }}>
                            <button type="submit" className="premium-btn-cta gold" style={{ width: '100%', padding: '15px' }}>
                                <FaPlusCircle /> Créer la Catégorie
                            </button>
                        </div>
                    </form>
                </div>

                <div className="premium-list-container">
                    <h3 style={{ marginBottom: '30px', color: '#1e293b', borderLeft: '4px solid #D4AF37', paddingLeft: '15px' }}>
                        Catégories Actives ({categories.length})
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {categories.map((cat) => (
                            <div key={cat._id} className="premium-card" style={{ padding: '20px', display: 'flex', gap: '25px', alignItems: 'center', border: editingId === cat._id ? '2px solid #D4AF37' : '1px solid #e2e8f0' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '15px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                    <img src={cat.image} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    {editingId === cat._id ? (
                                        <div className="premium-form-grid" style={{ gap: '10px' }}>
                                            <input type="text" name="title" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} style={{ gridColumn: 'span 2' }} />
                                            <input type="text" name="duration" value={editData.duration} onChange={e => setEditData({ ...editData, duration: e.target.value })} style={{ gridColumn: 'span 2' }} />
                                            <textarea name="description" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} style={{ gridColumn: 'span 4' }} rows="2" />
                                        </div>
                                    ) : (
                                        <>
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#1e293b' }}>{cat.title}</h4>
                                            <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>{cat.description}</p>
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <FaClock size={10} /> {cat.duration}
                                                </span>
                                                <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <FaCheckCircle size={10} /> Actif
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {editingId === cat._id ? (
                                        <button onClick={() => handleEditSave(cat._id)} className="premium-btn-cta gold" style={{ padding: '10px', minWidth: 'auto' }}><FaSave /></button>
                                    ) : (
                                        <button onClick={() => handleEditStart(cat)} className="premium-btn-cta secondary" style={{ padding: '10px', minWidth: 'auto' }}><FaEdit /></button>
                                    )}
                                    <button onClick={() => handleDelete(cat._id, cat.title)} className="premium-btn-cta secondary" style={{ padding: '10px', minWidth: 'auto', background: '#fee2e2', color: '#ef4444', borderColor: '#fecaca' }}><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isCoursModalOpen && (
                <div className="premium-modal-backdrop" onClick={() => setIsCoursModalOpen(false)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <GestionCoursSpecialises onClose={() => setIsCoursModalOpen(false)} />
                    </div>
                </div>
            )}

            {isVedioModalOpen && (
                <div className="premium-modal-backdrop" onClick={() => setIsVedioModalOpen(false)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <GestionVedioSpecialises onClose={() => setIsVedioModalOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
