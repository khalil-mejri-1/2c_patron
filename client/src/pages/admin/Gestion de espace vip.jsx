import React, { useState, useEffect, useRef } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import axios from 'axios';
import { FaPlusCircle, FaTrash, FaEdit, FaSave, FaBookOpen, FaVideo, FaLayerGroup, FaSpinner, FaExclamationTriangle, FaTimes, FaImage, FaClock, FaCheckCircle, FaUpload, FaLink, FaGlobe } from 'react-icons/fa';
import GestionCoursSpecialises from './Gestion_cours_specialises.jsx';
import GestionVedioSpecialises from './Gestion_vedio_specialises.jsx';
import BASE_URL from '../../apiConfig';
import { useAlert } from '../../context/AlertContext';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = `${BASE_URL}/api/vip-categories`;

export default function Gestion_de_espace_vip() {
    const { languages, appLanguage } = useLanguage();
    const [newCategory, setNewCategory] = useState({ 
        title: {}, 
        description: {}, 
        duration: {}, 
        image: {}, 
        technicalName: '',
        order: 0,
        accessType: 'vip'
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [isCoursModalOpen, setIsCoursModalOpen] = useState(false);
    const [isVedioModalOpen, setIsVedioModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { showAlert } = useAlert();
    
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);


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

    const handleFileUpload = async (e, type = 'new', langCode = null) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post(`${BASE_URL}/api/upload`, formData);
            const imageUrl = res.data.url;
            
            if (type === 'new') {
                const updatedImage = typeof newCategory.image === 'object' ? { ...newCategory.image } : {};
                if (langCode) {
                    updatedImage[langCode] = imageUrl;
                } else {
                    languages.forEach(l => { updatedImage[l.code] = imageUrl; });
                }
                setNewCategory({ ...newCategory, image: updatedImage });
            } else {
                const updatedImage = typeof editData.image === 'object' ? { ...editData.image } : {};
                if (langCode) {
                    updatedImage[langCode] = imageUrl;
                } else {
                    languages.forEach(l => { updatedImage[l.code] = imageUrl; });
                }
                setEditData({ ...editData, image: updatedImage });
            }
            showAlert('success', 'Succès', 'Image téléchargée avec succès !');
        } catch (err) {
            showAlert('error', 'Erreur', "Échec de l'upload de l'image.");
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(API_URL, newCategory);
            setCategories([response.data, ...categories]);
            setNewCategory({ 
                title: {}, 
                description: {}, 
                duration: {}, 
                image: {}, 
                technicalName: '',
                order: 0,
                accessType: 'vip'
            });
            showAlert('success', 'Succès', 'Catégorie créée !');
        } catch (err) {
            showAlert('error', 'Erreur', "Échec de l'ajout.");
        }
    };

    const handleDelete = (id, title) => {
        const displayTitle = typeof title === 'object' ? (title.fr || title.ar || 'Catégorie') : title;
        showAlert('confirm', 'Supprimer Catégorie', `Voulez-vous supprimer "${displayTitle}" ?`, async () => {
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
        setEditData({ 
            ...category,
            title: typeof category.title === 'object' ? { ...category.title } : { fr: category.title },
            description: typeof category.description === 'object' ? { ...category.description } : { fr: category.description },
            duration: typeof category.duration === 'object' ? { ...category.duration } : { fr: category.duration },
            image: typeof category.image === 'object' ? { ...category.image } : { fr: category.image }
        });
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
                            <label>Nom Technique (Utilisé dans le lien)</label>
                            <div style={{ position: 'relative' }}>
                                <FaLink style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input 
                                    type="text" 
                                    value={newCategory.technicalName} 
                                    onChange={(e) => setNewCategory({ ...newCategory, technicalName: e.target.value })} 
                                    placeholder="ex: Master Corsage" 
                                    style={{ paddingLeft: '35px' }}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="premium-form-group" style={{ gridColumn: 'span 1' }}>
                            <label>Ordre</label>
                            <input type="number" value={newCategory.order} onChange={(e) => setNewCategory({ ...newCategory, order: parseInt(e.target.value) })} />
                        </div>

                        <div className="premium-form-group" style={{ gridColumn: 'span 1' }}>
                            <label>Type d'accès</label>
                            <select value={newCategory.accessType} onChange={(e) => setNewCategory({ ...newCategory, accessType: e.target.value })}>
                                <option value="vip">VIP</option>
                                <option value="gratuit">Gratuit</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: 'span 4', background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D4AF37' }}></div>
                                <h4 style={{ margin: 0, color: '#1e293b', fontSize: '0.95rem' }}>
                                    {appLanguage === 'ar' ? `إدخال البيانات باللغة: العربية` : `Saisie des données en : ${appLanguage === 'fr' ? 'Français' : appLanguage.toUpperCase()}`}
                                </h4>
                            </div>

                            <div className="premium-form-grid" style={{ gap: '20px' }}>
                                <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>{appLanguage === 'ar' ? 'العنوان' : 'Titre'}</label>
                                    <input 
                                        type="text" 
                                        value={newCategory.title[appLanguage] || ''} 
                                        onChange={(e) => setNewCategory({ ...newCategory, title: { ...newCategory.title, [appLanguage]: e.target.value } })} 
                                        placeholder={appLanguage === 'ar' ? 'أدخل العنوان هنا...' : 'Entrez le titre...'}
                                        required
                                    />
                                </div>
                                <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>{appLanguage === 'ar' ? 'المدة / معلومات' : 'Durée / Infos'}</label>
                                    <input 
                                        type="text" 
                                        value={newCategory.duration[appLanguage] || ''} 
                                        onChange={(e) => setNewCategory({ ...newCategory, duration: { ...newCategory.duration, [appLanguage]: e.target.value } })} 
                                        placeholder={appLanguage === 'ar' ? 'مثال: 12 وحدة' : 'Ex: 12 Modules'}
                                    />
                                </div>
                                <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                                    <label>{appLanguage === 'ar' ? 'الصورة' : 'Image'}</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input 
                                            type="text" 
                                            value={newCategory.image[appLanguage] || ''} 
                                            readOnly 
                                            style={{ flex: 1, background: '#f1f5f9' }}
                                        />
                                        <input 
                                            type="file" 
                                            id={`upload-${appLanguage}`}
                                            onChange={(e) => handleFileUpload(e, 'new', appLanguage)}
                                            style={{ display: 'none' }}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => document.getElementById(`upload-${appLanguage}`).click()}
                                            className="premium-btn-cta gold"
                                            style={{ padding: '10px', minWidth: 'auto' }}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? <FaSpinner className="spinner" /> : <FaUpload />}
                                        </button>
                                    </div>
                                    {(newCategory.image[appLanguage]) && (
                                        <img src={newCategory.image[appLanguage]} style={{ height: '80px', marginTop: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                    )}
                                </div>
                                <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                                    <label>{appLanguage === 'ar' ? 'الوصف' : 'Description'}</label>
                                    <textarea 
                                        rows="3"
                                        value={newCategory.description[appLanguage] || ''} 
                                        onChange={(e) => setNewCategory({ ...newCategory, description: { ...newCategory.description, [appLanguage]: e.target.value } })} 
                                        placeholder={appLanguage === 'ar' ? 'أدخل وصفاً جذباً...' : 'Entrez une description...'}
                                    />
                                </div>
                            </div>
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
                                    <img 
                                        src={typeof cat.image === 'object' ? (cat.image.fr || Object.values(cat.image)[0]) : cat.image} 
                                        alt="Category" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>

                                <div style={{ flex: 1 }}>
                                    {editingId === cat._id ? (
                                        <div className="premium-form-grid" style={{ gap: '10px' }}>
                                            <input 
                                                type="text" 
                                                value={editData.technicalName} 
                                                onChange={e => setEditData({ ...editData, technicalName: e.target.value })} 
                                                placeholder="Nom Technique"
                                                style={{ gridColumn: 'span 2' }} 
                                            />
                                            <select value={editData.accessType} onChange={e => setEditData({ ...editData, accessType: e.target.value })} style={{ gridColumn: 'span 2' }}>
                                                <option value="vip">VIP</option>
                                                <option value="gratuit">Gratuit</option>
                                            </select>
                                            
                                            <div style={{ gridColumn: 'span 4', padding: '15px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ marginBottom: '15px', fontWeight: 'bold', color: '#D4AF37', fontSize: '0.85rem' }}>
                                                    {appLanguage === 'ar' ? 'تعديل البيانات باللغة الحالية' : 'Modifier les données dans la langue actuelle'}
                                                </div>
                                                
                                                <div className="premium-form-grid" style={{ gap: '10px' }}>
                                                    <input 
                                                        type="text" 
                                                        value={editData.title[appLanguage] || ''} 
                                                        onChange={e => setEditData({ ...editData, title: { ...editData.title, [appLanguage]: e.target.value } })} 
                                                        placeholder={appLanguage === 'ar' ? 'العنوان' : 'Titre'}
                                                        style={{ gridColumn: 'span 4' }} 
                                                    />

                                                    <div style={{ gridColumn: 'span 4', display: 'flex', gap: '10px' }}>
                                                        <input type="text" value={editData.image[appLanguage] || ''} readOnly style={{ flex: 1, background: '#f1f5f9' }} />
                                                        <input 
                                                            type="file" 
                                                            id={`edit-upload-${appLanguage}`} 
                                                            onChange={e => handleFileUpload(e, 'edit', appLanguage)} 
                                                            style={{ display: 'none' }} 
                                                        />
                                                        <button type="button" onClick={() => document.getElementById(`edit-upload-${appLanguage}`).click()} className="premium-btn-cta gold" style={{ padding: '5px 10px' }}>
                                                            <FaUpload size={12} />
                                                        </button>
                                                    </div>

                                                    <textarea 
                                                        value={editData.description[appLanguage] || ''} 
                                                        onChange={e => setEditData({ ...editData, description: { ...editData.description, [appLanguage]: e.target.value } })} 
                                                        placeholder={appLanguage === 'ar' ? 'الوصف' : 'Description'}
                                                        style={{ gridColumn: 'span 4' }} 
                                                        rows="2"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#1e293b' }}>
                                                {typeof cat.title === 'object' ? (cat.title.fr || cat.title.ar || 'Sans titre') : cat.title}
                                            </h4>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px', display: 'flex', gap: '10px' }}>
                                                <span><FaLink size={10} /> {cat.technicalName || 'aucun'}</span>
                                                <span><FaLayerGroup size={10} /> Ordre: {cat.order || 0}</span>
                                            </div>
                                            <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>
                                                {typeof cat.description === 'object' ? (cat.description.fr || cat.description.ar || '') : cat.description}
                                            </p>
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <FaClock size={10} /> {typeof cat.duration === 'object' ? (cat.duration.fr || cat.duration.ar || '') : cat.duration}
                                                </span>
                                                <span style={{ background: cat.accessType === 'vip' ? '#fee2e2' : '#ecfdf5', color: cat.accessType === 'vip' ? '#ef4444' : '#059669', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    {cat.accessType === 'vip' ? <FaCrown size={10} /> : <FaCheckCircle size={10} />} {cat.accessType?.toUpperCase()}
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
