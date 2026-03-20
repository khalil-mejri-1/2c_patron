import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaVideo, FaMapMarkerAlt, FaLink, FaLanguage, FaSpinner, FaSearch, FaFilter, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import NavbarAdmin from '../../comp/Navbar_admin';
import BASE_URL from '../../apiConfig';
import { useLanguage } from '../../context/LanguageContext';

export default function Gestion_Global_Videos() {
    const { appLanguage } = useLanguage();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchAllVideos();
    }, []);

    const fetchAllVideos = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/api/specialized-videos`);
            setVideos(res.data);
            
            // Extract unique categories
            const cats = Array.from(new Set(res.data.map(v => v.category))).filter(Boolean);
            setCategories(cats);
        } catch (error) {
            console.error("Error fetching all specialized videos:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVideos = videos.filter(video => {
        const matchesSearch = 
            (video.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (video.category?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (JSON.stringify(video.title_lang)?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesFilter = filterCategory === '' || video.category === filterCategory;
        
        return matchesSearch && matchesFilter;
    });

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '50px' }}>
            <NavbarAdmin />
            
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
                {/* Header Section */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
                    borderRadius: '24px', 
                    padding: '40px', 
                    marginBottom: '40px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <FaVideo style={{ color: '#D4AF37' }} /> Répertoire Global des Vidéos
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                            Consultez et gérez l'intégralité des leçons vidéo et leurs emplacements dans les formations.
                        </p>
                    </div>
                    {/* Decorative element */}
                    <div style={{ 
                        position: 'absolute', 
                        right: '-50px', 
                        top: '-50px', 
                        width: '300px', 
                        height: '300px', 
                        background: 'rgba(212, 175, 55, 0.1)', 
                        borderRadius: '50%',
                        zIndex: 0
                    }}></div>
                </div>

                {/* Filters Row */}
                <div style={{ 
                    display: 'flex', 
                    gap: '20px', 
                    marginBottom: '30px', 
                    background: '#fff', 
                    padding: '25px', 
                    borderRadius: '20px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Rechercher par titre, catégorie أو contenu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 15px 12px 45px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                focus: { borderColor: '#D4AF37' }
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaFilter style={{ color: '#D4AF37' }} />
                        <select 
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{
                                padding: '12px 20px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                background: '#fff',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Toutes les catégories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={fetchAllVideos}
                        className="premium-btn-cta secondary"
                        style={{ padding: '12px 25px', minWidth: 'auto' }}
                    >
                        Actualiser
                    </button>
                </div>

                {/* Main Content Table/Grid */}
                <div style={{ 
                    background: '#fff', 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px' }}>
                            <FaSpinner className="spinner" size={50} color="#D4AF37" />
                            <p style={{ marginTop: '20px', color: '#64748b' }}>Chargement des données...</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <tr>
                                        <th style={{ padding: '20px 30px', color: '#475569', fontWeight: '700' }}>VIDÉO</th>
                                        <th style={{ padding: '20px 30px', color: '#475569', fontWeight: '700' }}>EMPLACEMENT (COURS)</th>
                                        <th style={{ padding: '20px 30px', color: '#475569', fontWeight: '700' }}>LANGUES DISPONIBLES</th>
                                        <th style={{ padding: '20px 30px', color: '#475569', fontWeight: '700' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVideos.map((video, index) => (
                                        <tr key={video._id} style={{ 
                                            borderBottom: index === filteredVideos.length - 1 ? 'none' : '1px solid #f1f5f9',
                                            transition: 'background 0.2s'
                                        }} 
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fcfcfd'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '25px 30px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ 
                                                        width: '50px', 
                                                        height: '50px', 
                                                        borderRadius: '12px', 
                                                        background: 'rgba(212, 175, 55, 0.1)', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        color: '#D4AF37'
                                                    }}>
                                                        <FaVideo size={20} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.05rem' }}>{video.title}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                                                            <FaLink size={10} /> {video.url?.substring(0, 40)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '25px 30px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '500' }}>
                                                    <FaMapMarkerAlt style={{ color: '#D4AF37' }} />
                                                    {video.category || "Non classé"}
                                                </div>
                                            </td>
                                            <td style={{ padding: '25px 30px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {['fr', 'ar', 'en'].map(lang => {
                                                        const hasLang = video.url_lang?.[lang];
                                                        return (
                                                            <span key={lang} style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '8px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '700',
                                                                textTransform: 'uppercase',
                                                                background: hasLang ? 'rgba(34, 197, 94, 0.1)' : 'rgba(241, 245, 249, 1)',
                                                                color: hasLang ? '#16a34a' : '#94a3b8',
                                                                border: hasLang ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid #e2e8f0'
                                                            }}>
                                                                {lang}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td style={{ padding: '25px 30px' }}>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <a 
                                                        href={video.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            padding: '8px 12px',
                                                            borderRadius: '10px',
                                                            background: '#f1f5f9',
                                                            color: '#475569',
                                                            fontSize: '0.9rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            textDecoration: 'none',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => { e.target.style.background = '#e2e8f0' }}
                                                        onMouseLeave={(e) => { e.target.style.background = '#f1f5f9' }}
                                                    >
                                                        <FaExternalLinkAlt size={12} /> Voir
                                                    </a>
                                                    {/* We can add more actions here if needed */}
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
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spinner {
                    animation: spin 1s linear infinite;
                }
            ` }} />
        </div>
    );
}
