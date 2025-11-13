// Gestion_de_espace_vip.js

import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import axios from 'axios';
import { FaPlusCircle, FaTrash, FaEdit, FaSave, FaBookOpen, FaVideo, FaLayerGroup, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import '../admin_css/Gestion de espace vip.css';
import GestionCoursSpecialises from './Gestion_cours_specialises.jsx';
import GestionVedioSpecialises from './Gestion_vedio_specialises.jsx';

// ⚙️ Configuration de l'API (à ajustré selon votre backend)
const API_URL = 'http://localhost:3000/api/vip-categories'; 

// --- STYLES EN LIGNE MODERNES ET RESPONSIVES ---
const styles = {
    // Conteneur principal
    container: {
        maxWidth: '1200px',
        margin: '30px auto',
        padding: '0 20px',
        fontFamily: 'Arial, sans-serif',
    },
    // Header (Boutons et Titre)
    headerGroup: {
        display: 'flex',
        flexDirection: 'column', 
        alignItems: 'flex-start',
        gap: '15px',
        marginBottom: '30px',
        borderBottom: '2px solid #e9ecef',
        paddingBottom: '20px',
    },
    headerTitle: {
        fontSize: '2rem',
        color: '#343a40',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
    },
    buttonRow: {
        display: 'flex',
        flexWrap: 'wrap', 
        gap: '10px',
    },
    // Boutons d'action
    actionButton: {
        padding: '10px 15px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        color: 'white',
        border: 'none',
        transition: 'background-color 0.3s, transform 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '1rem',
    },
    manageCoursButton: {
        backgroundColor: '#10b981', 
    },
    manageVedioButton: {
        backgroundColor: '#3b82f6', 
    },
    // Formulaire d'Ajout
    addFormContainer: {
        background: '#ffffff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        marginBottom: '40px',
    },
    addFormTitle: {
        fontSize: '1.5rem',
        color: '#495057',
        marginBottom: '20px',
        borderBottom: '1px solid #e9ecef',
        paddingBottom: '10px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '15px',
    },
    inputField: {
        padding: '12px',
        border: '1px solid #ced4da',
        borderRadius: '6px',
        fontSize: '1rem',
        width: '100%',
        boxSizing: 'border-box',
    },
    inputFull: {
        gridColumn: '1 / -1', 
    },
    addButton: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '12px',
        borderRadius: '6px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        gridColumn: '1 / -1',
        marginTop: '10px',
    },
    // Tableau
    tableTitle: {
        fontSize: '1.5rem',
        color: '#495057',
        marginBottom: '15px',
        borderLeft: '4px solid #3b82f6',
        paddingLeft: '10px',
    },
    tableResponsive: {
        overflowX: 'auto',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    categoryTable: {
        width: '100%',
        minWidth: '700px',
        borderCollapse: 'separate',
        borderSpacing: '0',
    },
    tableTh: {
        backgroundColor: '#f8f9fa',
        padding: '12px 15px',
        textAlign: 'left',
        fontWeight: '700',
        color: '#495057',
        borderBottom: '2px solid #e9ecef',
    },
    tableTd: {
        padding: '15px',
        borderBottom: '1px solid #e9ecef',
        fontSize: '0.95rem',
        verticalAlign: 'middle',
    },
    // Actions
    actionsCell: {
        whiteSpace: 'nowrap',
        display: 'flex',
        gap: '5px',
    },
    actionBtnIcon: {
        padding: '8px',
        borderRadius: '4px',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    editBtn: { backgroundColor: '#ffc107', },
    saveBtn: { backgroundColor: '#28a745', },
    deleteBtn: { backgroundColor: '#dc3545', },
    coursBtn: { backgroundColor: '#007bff', },

    // 🆕 Styles pour la fenêtre de confirmation personnalisée
    confirmOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000, // Au-dessus de toutes les autres modales
    },
    confirmBox: {
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    },
    confirmTitle: {
        color: '#dc3545',
        fontSize: '1.5rem',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    confirmText: {
        color: '#495057',
        marginBottom: '25px',
    },
    confirmButtons: {
        display: 'flex',
        justifyContent: 'space-around',
        gap: '10px',
    },
    confirmButtonBase: {
        padding: '10px 20px',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: 'pointer',
        border: 'none',
        flexGrow: 1,
    },
    confirmYes: {
        backgroundColor: '#dc3545',
        color: 'white',
    },
    confirmNo: {
        backgroundColor: '#f8f9fa',
        color: '#495057',
        border: '1px solid #ced4da',
    }
};


export default function Gestion_de_espace_vip() {
    // ... (États existants)
    const [newCategory, setNewCategory] = useState({ title: '', description: '', duration: '', image: '' });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [isCoursModalOpen, setIsCoursModalOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null); 
    const [isVedioModalOpen, setIsVedioModalOpen] = useState(false);

    // 🆕 État pour la fenêtre de confirmation
    const [confirmDialog, setConfirmDialog] = useState(null); // { id: ID_A_SUPPRIMER, title: TITRE }

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL);
            setCategories(response.data);
            setError(null);
        } catch (err) {
            setError("Erreur lors du chargement des catégories.");
            console.error(err);
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
            setError(null);
        } catch (err) {
            setError("Erreur lors de l'ajout de la catégorie.");
            console.error(err);
        }
    };
    
    // 🆕 Remplace window.confirm par l'ouverture de la modale personnalisée
    const confirmDelete = (id, title) => {
        setConfirmDialog({ id, title });
    };

    // 🗑️ Fonction de suppression réelle
    const handleDelete = async (id) => {
        setConfirmDialog(null); // Fermer la modale

        try {
            await axios.delete(`${API_URL}/${id}`);
            setCategories(categories.filter(cat => cat._id !== id));
            setError(null);
        } catch (err) {
            setError("Erreur lors de la suppression.");
            console.error(err);
        }
    };
    
    const handleEditStart = (category) => {
        setEditingId(category._id);
        setEditData({ 
            title: category.title, 
            description: category.description, 
            duration: category.duration, 
            image: category.image 
        });
    };
    
    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };
    
    const handleEditSave = async (id) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, editData);
            setCategories(categories.map(cat => 
                cat._id === id ? response.data : cat
            ));
            setEditingId(null); 
            setError(null);
        } catch (err) {
            setError("Erreur lors de la mise à jour.");
            console.error(err);
        }
    };

    const handleOpenCoursModal = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setIsCoursModalOpen(true);
    };

    const handleCloseCoursModal = () => {
        setIsCoursModalOpen(false);
        setSelectedCategoryId(null);
    };

    const handleOpenVedioModal = () => {
        setIsVedioModalOpen(true);
    };

    const handleCloseVedioModal = () => {
        setIsVedioModalOpen(false);
    };

    // 🆕 Composant de la fenêtre de confirmation
    const ConfirmationDialog = ({ onConfirm, onCancel, itemTitle }) => (
        <div style={styles.confirmOverlay}>
            <div style={styles.confirmBox}>
                <h3 style={styles.confirmTitle}>
                    <FaExclamationTriangle size={24} /> Confirmation de Suppression
                </h3>
                <p style={styles.confirmText}>
                    Êtes-vous sûr de vouloir supprimer la catégorie **"{itemTitle}"** ? Cette action est irréversible.
                </p>
                <div style={styles.confirmButtons}>
                    <button 
                        onClick={onCancel} 
                        style={{...styles.confirmButtonBase, ...styles.confirmNo}}
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={onConfirm} 
                        style={{...styles.confirmButtonBase, ...styles.confirmYes}}
                    >
                        Oui, Supprimer
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <>
            <NavbarAdmin />
            <div style={{ textAlign: 'center', marginTop: '150px', color: '#343a40' }}>
                <FaSpinner size={30} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '15px' }}>Chargement Espace Vip...</p>
            </div>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </>
    );

    return (
        <>
            <NavbarAdmin/>
            <div style={styles.container}>

                {/* 🆕 AFFICHER LA FENÊTRE DE CONFIRMATION */}
                {confirmDialog && (
                    <ConfirmationDialog
                        itemTitle={confirmDialog.title}
                        onConfirm={() => handleDelete(confirmDialog.id)}
                        onCancel={() => setConfirmDialog(null)}
                    />
                )}
                
                {/* --- HEADER AVEC BOUTONS DE GESTION --- */}
                <div style={styles.headerGroup}>
                    <h1 style={styles.headerTitle}>
                        <FaLayerGroup style={{ marginRight: '10px', color: '#3b82f6' }} /> Gestion de l'Espace VIP
                    </h1>
                    
                    <div style={styles.buttonRow}>
                        {/* Bouton Gérer les Cours Spécialisés */}
                        <button 
                            onClick={() => handleOpenCoursModal(null)} 
                            style={{...styles.actionButton, ...styles.manageCoursButton}}
                            title="Gérer les Cours Spécialisés (Tous)"
                        >
                            <FaBookOpen /> Gérer les Cours Spécialisés
                        </button>
                        {/* 🆕 Bouton Gérer les Vidéos Spécialisées */}
                        <button 
                            onClick={handleOpenVedioModal} 
                            style={{...styles.actionButton, ...styles.manageVedioButton}}
                            title="Gérer les Vidéos Spécialisées"
                        >
                            <FaVideo /> Gérer les vidéos Spécialisées
                        </button>

                        
                    </div>
                </div>
                
                {/* Affichage des Erreurs */}
                {error && (
                    <div style={{ padding: '15px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '20px' }}>
                        {error}
                    </div>
                )}
                
                {/* --- 1. Formulaire d'Ajout --- */}
                <div style={styles.addFormContainer}>
                    <h2 style={styles.addFormTitle}>
                        <FaPlusCircle style={{ marginRight: '0.5rem', color: '#28a745' }}/> Ajouter une Nouvelle Catégorie
                    </h2>
                    <form onSubmit={handleAddSubmit} style={styles.formGrid}>
                        <input
                            type="text"
                            name="title"
                            value={newCategory.title}
                            onChange={handleAddChange}
                            placeholder="Titre (Ex: Les Corsage)"
                            required
                            style={styles.inputField}
                        />
                        <input
                            type="text"
                            name="duration"
                            value={newCategory.duration}
                            onChange={handleAddChange}
                            placeholder="Durée (Ex: 10 Leçons)"
                            style={styles.inputField}
                        />
                        <input
                            type="url"
                            name="image"
                            value={newCategory.image}
                            onChange={handleAddChange}
                            placeholder="URL de l'image"
                            required
                            style={{...styles.inputField, ...styles.inputFull}}
                        />
                        <textarea
                            name="description"
                            value={newCategory.description}
                            onChange={handleAddChange}
                            placeholder="Description détaillée"
                            required
                            rows="2"
                            style={{...styles.inputField, ...styles.inputFull}}
                        ></textarea>
                        <button type="submit" style={styles.addButton}>
                            Ajouter la Catégorie
                        </button>
                    </form>
                </div>

                {/* --- 2. Tableau des Catégories Existantes --- */}
                <h2 style={styles.tableTitle}>
                    Liste des Catégories ({categories.length})
                </h2>
                <div style={styles.tableResponsive}>
                    <table style={styles.categoryTable}>
                        <thead style={styles.tableHeader}>
                            <tr>
                                <th style={styles.tableTh}>Image</th>
                                <th style={styles.tableTh}>Titre</th>
                                <th style={styles.tableTh}>Description</th>
                                <th style={styles.tableTh}>Durée</th>
                                <th style={styles.tableTh}>Actions</th>
                            </tr>
                        </thead>
                        <tbody style={styles.tableTbody}>
                            {categories.map((category) => (
                                <tr key={category._id} style={styles.tableRow}>
                                    <td style={{...styles.tableTd, width: '100px'}}>
                                        <img src={category.image} alt={category.title} style={{ width: '80px', height: 'auto', borderRadius: '4px', objectFit: 'cover' }}/>
                                    </td>
                                    <td style={styles.tableTd}>
                                        {editingId === category._id ? (
                                            <input type="text" name="title" value={editData.title} onChange={handleEditChange} style={{...styles.inputField, padding: '8px'}}/>
                                        ) : (
                                            <span style={{ fontWeight: '600' }}>{category.title}</span>
                                        )}
                                    </td>
                                    <td style={styles.tableTd}>
                                        {editingId === category._id ? (
                                            <textarea name="description" value={editData.description} onChange={handleEditChange} rows="2" style={{...styles.inputField, padding: '8px'}}/>
                                        ) : (
                                            <span style={{ display: 'block', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{category.description}</span>
                                        )}
                                    </td>
                                    <td style={styles.tableTd}>
                                        {editingId === category._id ? (
                                            <input type="text" name="duration" value={editData.duration} onChange={handleEditChange} style={{...styles.inputField, padding: '8px', width: '80px'}}/>
                                        ) : (
                                            category.duration
                                        )}
                                    </td>
                                    <td style={{...styles.tableTd, ...styles.actionsCell}}>
                                        {/* Bouton Gérer les Cours pour cette catégorie spécifique */}
                                         {/* <button 
                                            onClick={() => handleOpenCoursModal(category._id)} 
                                            style={{...styles.actionBtnIcon, backgroundColor: styles.manageCoursButton.backgroundColor}}
                                            title="Gérer les cours liés"
                                        >
                                            <FaBookOpen size={18} />
                                        </button> */}

                                        {editingId === category._id ? (
                                            <button 
                                                onClick={() => handleEditSave(category._id)} 
                                                style={{...styles.actionBtnIcon, ...styles.saveBtn}}
                                                title="Sauvegarder"
                                            >
                                                <FaSave size={18} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleEditStart(category)} 
                                                style={{...styles.actionBtnIcon, ...styles.editBtn}}
                                                title="Éditer"
                                            >
                                                <FaEdit size={18} />
                                            </button>
                                        )}
                                        {/* 🆕 APPEL À LA FENÊTRE DE CONFIRMATION PERSONNALISÉE */}
                                        <button 
                                            onClick={() => confirmDelete(category._id, category.title)} 
                                            style={{...styles.actionBtnIcon, ...styles.deleteBtn}}
                                            title="Supprimer"
                                        >
                                            <FaTrash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- 3. Modales de Gestion (Cours et Vidéos) --- */}
                {isCoursModalOpen && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div className="modal-content" style={{ background: 'white', borderRadius: '8px' }}>
                            <GestionCoursSpecialises 
                                categoryId={selectedCategoryId} 
                                onClose={handleCloseCoursModal}
                            />
                        </div>
                    </div>
                )}
                {isVedioModalOpen && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div className="modal-content" style={{ background: 'white', borderRadius: '8px' }}>
                            <GestionVedioSpecialises 
                                onClose={handleCloseVedioModal}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}