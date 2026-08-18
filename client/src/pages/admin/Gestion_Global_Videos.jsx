import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaVideo, FaMapMarkerAlt, FaLink, FaLanguage, FaSpinner, FaSearch, FaFilter, FaExternalLinkAlt, FaLayerGroup, FaBook, FaChevronDown, FaChevronUp, FaTrash, FaPlus, FaTimes, FaPencilAlt, FaImage, FaUpload } from 'react-icons/fa';
import NavbarAdmin from '../../comp/Navbar_admin';
import BASE_URL from '../../apiConfig';
import { useLanguage } from '../../context/LanguageContext';
import { useAlert } from '../../context/AlertContext';

export default function Gestion_Global_Videos() {
    const { appLanguage } = useLanguage();
    const { showAlert } = useAlert();
    const [videos, setVideos] = useState([]);
    const [courses, setCourses] = useState([]);       // all SpecializedCourse groups
    const [vipCategories, setVipCategories] = useState([]); // 🌟 Synced VipCategory objects (same as Vip-access page)
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'videos'
    const [expandedGroups, setExpandedGroups] = useState({});
    const fileInputRef = useRef(null);
    const [uploadingId, setUploadingId] = useState(null); // Track specific course being uploaded

    // Category image upload state
    const categoryFileInputRef = useRef(null);
    const [uploadingCatId, setUploadingCatId] = useState(null);

    // Current selection for upload
    const [uploadContext, setUploadContext] = useState({ groupId: null, courseIndex: null });
    const videoThumbnailRef = useRef(null);
    const [videoThumbnailTitle, setVideoThumbnailTitle] = useState(null);
    const [isBulkThumbUploading, setIsBulkThumbUploading] = useState(false);

    // --- 📹 Videos JSON Modal Library State ---
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
    const [jsonVideos, setJsonVideos] = useState([]);
    const [jsonSearch, setJsonSearch] = useState('');
    const [jsonModalTargetLang, setJsonModalTargetLang] = useState(null); // 'fr' | 'ar' | 'tn' | null
    const [hiddenVideoGuids, setHiddenVideoGuids] = useState([]);
    const [showHiddenPanel, setShowHiddenPanel] = useState(false);

    const openJsonModalForLang = (langKey) => {
        setJsonModalTargetLang(langKey);
        setIsJsonModalOpen(true);
    };

    const handleSelectJsonVideo = (videoItem) => {
        const selectedUrl = videoItem.url || '';
        const videoGuid = videoItem.guid;

        if (jsonModalTargetLang) {
            setBulkUrls(prev => ({ ...prev, [jsonModalTargetLang]: selectedUrl }));
        }

        if (videoGuid) {
            setHiddenVideoGuids(prev => [...prev, videoGuid]);
        }

        setIsJsonModalOpen(false);
        setJsonModalTargetLang(null);
    };

    // --- 📥 Bulk Video State ---
    const [isBulkEntryOpen, setIsBulkEntryOpen] = useState(false);
    const [activeLangs, setActiveLangs] = useState({ fr: true, ar: true, tn: true });
    const [bulkContext, setBulkContext] = useState({ mainCat: '', subCat: '' });
    const [bulkTitles, setBulkTitles] = useState({ fr: '', ar: '', tn: '' });
    const [bulkUrls, setBulkUrls] = useState({ fr: '', ar: '', tn: '' });
    const [bulkOrder, setBulkOrder] = useState(0);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkModalMode, setBulkModalMode] = useState('add'); // 'add' | 'edit'
    const [bulkVideoId, setBulkVideoId] = useState(null);

    // --- ➕ Add Lesson Modal State ---
    const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
    const [addLessonGroupId, setAddLessonGroupId] = useState(null);
    const [addLessonLoading, setAddLessonLoading] = useState(false);
    // --- 🗑️ Hidden Placeholders (persisted in localStorage) ---
    const [hiddenPlaceholders, setHiddenPlaceholders] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('admin_hiddenPlaceholders') || '{}');
        } catch {
            return {};
        }
    });

    const hidePlaceholder = (groupId, courseIndex, placeholderName) => {
        const key = `${groupId}-${courseIndex}`;
        setHiddenPlaceholders(prev => {
            const updated = {
                ...prev,
                [key]: [...(prev[key] || []), placeholderName]
            };
            localStorage.setItem('admin_hiddenPlaceholders', JSON.stringify(updated));
            return updated;
        });
    };
    const [newLessonTitle, setNewLessonTitle] = useState({ fr: '', ar: '', tn: '' });

    useEffect(() => {
        // Load videos.json dynamically from client/src/videos.json
        import('../../videos.json').then(data => {
            setJsonVideos(data.default || data || []);
        }).catch(err => {
            console.error("Failed to load videos.json", err);
        });
    }, []);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [videosRes, coursesRes, vipCatRes] = await Promise.all([
                axios.get(`${BASE_URL}/api/specialized-videos`),
                axios.get(`${BASE_URL}/api/specialized-courses`),
                axios.get(`${BASE_URL}/api/vip-categories`)
            ]);
            setVideos(videosRes.data);
            setCourses(coursesRes.data);
            setVipCategories(vipCatRes.data);
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

    const handleSaveVideoMultiLang = async () => {
        if (!bulkUrls.fr && !bulkUrls.ar && !bulkUrls.tn) {
            showAlert('error', "Erreur", "Veuillez fournir au moins un lien de vidéo.");
            return;
        }
        setBulkLoading(true);
        try {
            const formData = new FormData();
            formData.append('category', bulkContext.mainCat);
            formData.append('subCategory', bulkContext.subCat);
            formData.append('title', bulkTitles.fr || bulkTitles.ar || bulkTitles.tn || "Sans Titre");

            formData.append('title_lang', JSON.stringify({
                fr: bulkTitles.fr || "",
                ar: bulkTitles.ar || "",
                en: bulkTitles.tn || "",
                tn: bulkTitles.tn || ""
            }));
            formData.append('url_lang', JSON.stringify({
                fr: bulkUrls.fr || "",
                ar: bulkUrls.ar || "",
                en: bulkUrls.tn || "",
                tn: bulkUrls.tn || ""
            }));
            formData.append('status_lang', JSON.stringify({
                fr: "VIP", ar: "VIP", en: "VIP", tn: "VIP"
            }));
            formData.append('order', bulkOrder);

            if (bulkModalMode === 'edit' && bulkVideoId) {
                await axios.put(`${BASE_URL}/api/specialized-videos/${bulkVideoId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showAlert('success', "Succès", "Vidéo modifiée avec succès !");
            } else {
                await axios.post(`${BASE_URL}/api/specialized-videos`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showAlert('success', "Succès", "Vidéo multi-langues ajoutée avec succès !");
            }

            setIsBulkEntryOpen(false);
            setBulkTitles({ fr: '', ar: '', tn: '' });
            setBulkUrls({ fr: '', ar: '', tn: '' });
            setBulkVideoId(null);
            setBulkOrder(0);

            // ✅ Refresh from DB so changes appear in all browsers
            await fetchAll();
        } catch (err) {
            console.error("Erreur save video:", err);
            showAlert('error', "Erreur", "Impossible d'enregistrer la vidéo.");
        } finally {
            setBulkLoading(false);
        }
    };

    const handleOpenEditVideo = (video) => {
        setBulkModalMode('edit');
        setBulkVideoId(video._id);
        setBulkContext({ mainCat: video.category, subCat: video.subCategory });
        setBulkTitles({
            fr: video.title_lang?.fr || (video.title && !video.title_lang?.ar ? video.title : ''),
            ar: video.title_lang?.ar || '',
            tn: video.title_lang?.tn || video.title_lang?.en || ''
        });
        setBulkUrls({
            fr: video.url_lang?.fr || (video.url && !video.url_lang?.ar ? video.url : ''),
            ar: video.url_lang?.ar || '',
            tn: video.url_lang?.tn || video.url_lang?.en || ''
        });
        setBulkOrder(video.order || 0);
        setIsBulkEntryOpen(true);
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

    const triggerThumbnailUpload = (groupId, courseIndex) => {
        setUploadContext({ groupId, courseIndex });
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const { groupId, courseIndex } = uploadContext;
        if (!groupId || courseIndex === null) return;

        setUploadingId(`${groupId}-${courseIndex}`);
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const uploadRes = await axios.post(`${BASE_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const imageUrl = uploadRes.data.url;

            const groupToUpdate = courses.find(c => c._id === groupId);
            if (!groupToUpdate) throw new Error("Groupe non trouvé");

            const updatedCourses = [...groupToUpdate.courses];
            updatedCourses[courseIndex] = { ...updatedCourses[courseIndex], image: imageUrl };

            await axios.put(`${BASE_URL}/api/specialized-courses/${groupId}`, {
                courses: updatedCourses
            });

            showAlert('success', "Succès", "Image mise à jour !");
            fetchAll();
        } catch (error) {
            console.error("Upload error:", error);
            showAlert('error', "Erreur", "Échec de l'upload de l'image.");
        } finally {
            setUploadingId(null);
            e.target.value = '';
        }
    };

    const triggerCategoryImageUpload = (catId) => {
        setUploadingCatId(catId);
        if (categoryFileInputRef.current) categoryFileInputRef.current.click();
    };

    const handleCategoryImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !uploadingCatId) return;

        const catId = uploadingCatId;
        try {
            const formData = new FormData();
            formData.append('image', file);

            const uploadRes = await axios.post(`${BASE_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = uploadRes.data.url;

            // 1. Try finding existing VipCategory by ID or matching group name/technicalName
            const targetGroup = courses.find(c => c._id === catId);
            const groupName = targetGroup ? (targetGroup.vip_category || '').trim() : '';

            let existingCat = vipCategories.find(c => c._id === catId || c.id === catId);

            if (!existingCat && groupName) {
                const normName = groupName.toLowerCase();
                existingCat = vipCategories.find(c => {
                    let titles = [];
                    if (typeof c.title === 'object' && c.title !== null) {
                        titles = Object.values(c.title).map(t => (t || '').trim().toLowerCase());
                    } else if (c.title) {
                        titles = [(c.title || '').trim().toLowerCase()];
                    }
                    return titles.includes(normName) || (c.technicalName && c.technicalName.toLowerCase() === normName);
                });
            }

            if (existingCat) {
                let updatedImagePayload = imageUrl;
                if (typeof existingCat.image === 'object' && existingCat.image !== null) {
                    updatedImagePayload = { ...existingCat.image, fr: imageUrl, ar: imageUrl, en: imageUrl, tn: imageUrl };
                }

                await axios.put(`${BASE_URL}/api/vip-categories/${existingCat._id || existingCat.id}`, {
                    image: updatedImagePayload
                });
            } else if (groupName) {
                // If no VipCategory exists for this group, CREATE ONE so Vip-access page can render it!
                await axios.post(`${BASE_URL}/api/vip-categories`, {
                    title: { fr: groupName, ar: groupName, en: groupName, tn: groupName },
                    image: { fr: imageUrl, ar: imageUrl, en: imageUrl, tn: imageUrl },
                    technicalName: targetGroup?.technicalName || groupName
                });
            }

            // 2. Also update SpecializedCourse image if group exists
            if (targetGroup) {
                await axios.put(`${BASE_URL}/api/specialized-courses/${targetGroup._id}`, {
                    image: imageUrl
                });
            }

            showAlert('success', "Succès", "Image de la catégorie mise à jour (Synchronisée) !");
            fetchAll();
        } catch (error) {
            console.error("Category Upload error:", error);
            showAlert('error', "Erreur", "Échec de la mise à jour de l'image de la catégorie.");
        } finally {
            setUploadingCatId(null);
            e.target.value = '';
        }
    };

    const triggerVideoBulkThumbnailUpload = (title) => {
        setVideoThumbnailTitle(title);
        if (videoThumbnailRef.current) videoThumbnailRef.current.click();
    };

    const handleVideoBulkThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !videoThumbnailTitle) return;

        setIsBulkThumbUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const uploadRes = await axios.post(`${BASE_URL}/api/upload`, formData);
            const imageUrl = uploadRes.data.url;

            const res = await axios.patch(`${BASE_URL}/api/specialized-videos/bulk-thumbnail`, {
                title: videoThumbnailTitle,
                thumbnail: imageUrl
            });

            showAlert('success', 'Succès', res.data.message);
            fetchAll();
        } catch (err) {
            console.error(err);
            showAlert('error', 'Erreur', "Échec de la mise à jour des miniatures.");
        } finally {
            setIsBulkThumbUploading(false);
            setVideoThumbnailTitle(null);
            e.target.value = '';
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

    const handleAddLesson = async () => {
        const titleFr = newLessonTitle.fr.trim();
        const titleAr = newLessonTitle.ar.trim();
        const titleTn = newLessonTitle.tn.trim();

        if (!titleFr && !titleAr && !titleTn) {
            showAlert('error', 'خطأ', 'يرجى إدخال عنوان الدرس بأحد اللغات على الأقل.');
            return;
        }

        setAddLessonLoading(true);
        try {
            const group = courses.find(c => c._id === addLessonGroupId);
            if (!group) return;

            const defaultLessonImage = group.image || (group.courses && group.courses[0]?.image) || 'https://res.cloudinary.com/magasin/image/upload/placeholder.png';
            const newLesson = {
                title: {
                    fr: titleFr || titleAr || titleTn,
                    ar: titleAr || titleFr || titleTn,
                    tn: titleTn || titleFr || titleAr,
                    en: titleTn || titleFr || titleAr
                },
                image: defaultLessonImage,
                vip_category: group.vip_category || '',
                technicalName: titleFr.toLowerCase().replace(/[^a-z0-9]+/g, '-') || titleAr || titleTn
            };

            const updatedCourses = [...(group.courses || []), newLesson];

            await axios.put(`${BASE_URL}/api/specialized-courses/${addLessonGroupId}`, {
                courses: updatedCourses
            });

            setCourses(courses.map(c => {
                if (c._id === addLessonGroupId) {
                    return { ...c, courses: updatedCourses };
                }
                return c;
            }));

            setExpandedGroups(prev => ({ ...prev, [addLessonGroupId]: true }));
            setIsAddLessonOpen(false);
            setNewLessonTitle({ fr: '', ar: '', tn: '' });
            setAddLessonGroupId(null);
            showAlert('success', 'تم بنجاح', `تم إضافة الدرس "${titleFr || titleAr || titleTn}" بنجاح!`);
        } catch (error) {
            console.error('Erreur ajout leçon:', error);
            showAlert('error', 'خطأ', 'حدث خطأ أثناء إضافة الدرس.');
        } finally {
            setAddLessonLoading(false);
        }
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
    const unassignedVideosMap = {}; // For videos that don't match any official group

    videos.forEach(v => {
        const vCat = (v.category || '').trim();
        const vSub = (v.subCategory || '').trim();

        // 1. Find the official group (Course Category Group)
        const matchedGroup = courses.find(c => 
            (c.vip_category || '').trim().toLowerCase() === vCat.toLowerCase() ||
            c._id?.toString() === vCat // Fallback if category was saved as ID
        );

        if (matchedGroup) {
            const groupId = matchedGroup._id?.toString();
            if (!videosByCategory[groupId]) videosByCategory[groupId] = [];
            videosByCategory[groupId].push(v);
        } else {
            // Check if maybe the "category" is actually a lesson name (backwards compatibility)
            const groupByLesson = courses.find(g =>
                g.courses?.some(c => {
                    const t = typeof c.title === 'object' ? (c.title.fr || Object.values(c.title)[0]) : c.title;
                    return (t || '').trim().toLowerCase() === vCat.toLowerCase();
                })
            );

            if (groupByLesson) {
                const groupId = groupByLesson._id?.toString();
                if (!videosByCategory[groupId]) videosByCategory[groupId] = [];
                v._inferredSubCategory = vCat; 
                videosByCategory[groupId].push(v);
            } else {
                // Truly unassigned
                const key = vCat || 'Non classé';
                if (!unassignedVideosMap[key]) unassignedVideosMap[key] = [];
                unassignedVideosMap[key].push(v);
            }
        }
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
            <input type="file" ref={videoThumbnailRef} onChange={handleVideoBulkThumbnailUpload} style={{ display: 'none' }} />

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
                    <button 
                        onClick={() => setIsJsonModalOpen(true)}
                        style={{
                            padding: '12px 22px', borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff',
                            cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <FaVideo /> مكتبة الفيديوهات المقسمة (videos.json)
                    </button>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredCourses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '20px', color: '#64748b' }}>
                                <FaSearch size={40} style={{ marginBottom: '15px', opacity: 0.3 }} />
                                <p>Aucune catégorie trouvée.</p>
                            </div>
                        ) : filteredCourses.map(group => {
                            const isOpen = expandedGroups[group._id] !== false;
                            const catVideos = videosByCategory[group._id?.toString()] || [];

                            return (
                                <div key={group._id} style={{
                                    background: '#fff', borderRadius: '20px', overflow: 'hidden',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
                                    border: '1px solid #f1f5f9'
                                }}>
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
                                            {(() => {
                                                const catName = (group.vip_category || '').trim().toLowerCase();
                                                const techName = (group.technicalName || '').trim().toLowerCase();
                                                const matchedVipCat = vipCategories.find(c => {
                                                    let titles = [];
                                                    if (typeof c.title === 'object' && c.title !== null) {
                                                        titles = Object.values(c.title).map(t => (t || '').trim().toLowerCase());
                                                    } else if (c.title) {
                                                        titles = [(c.title || '').trim().toLowerCase()];
                                                    }
                                                    const cTech = (c.technicalName || '').trim().toLowerCase();
                                                    return titles.includes(catName) || (cTech && (cTech === catName || cTech === techName));
                                                });

                                                let catImage = null;
                                                if (matchedVipCat) {
                                                    if (typeof matchedVipCat.image === 'object' && matchedVipCat.image !== null) {
                                                        catImage = matchedVipCat.image.fr || matchedVipCat.image.ar || Object.values(matchedVipCat.image)[0];
                                                    } else {
                                                        catImage = matchedVipCat.image;
                                                    }
                                                }
                                                if (!catImage) {
                                                    catImage = group.image || (group.courses && group.courses[0]?.image);
                                                }

                                                const catId = matchedVipCat ? (matchedVipCat._id || matchedVipCat.id) : null;
                                                const targetUploadId = catId || group._id;

                                                return (
                                                    <div 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            triggerCategoryImageUpload(targetUploadId);
                                                        }}
                                                        style={{
                                                            width: '80px', height: '55px', borderRadius: '12px',
                                                            overflow: 'hidden', background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#D4AF37', fontSize: '1.2rem', position: 'relative',
                                                            border: '2px solid rgba(212,175,55,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {catImage ? (
                                                            <img src={catImage} alt={group.vip_category} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <FaLayerGroup />
                                                        )}

                                                        <div
                                                            style={{
                                                                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)',
                                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                                opacity: 0, transition: 'opacity 0.2s ease', color: '#fff', fontSize: '0.75rem', gap: '2px'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                                            onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                                                        >
                                                            {uploadingCatId === targetUploadId ? <FaSpinner className="spinner" size={16} /> : <FaUpload size={16} />}
                                                            <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>تغيير</span>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {group.vip_category}
                                                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', fontWeight: 'bold' }}>VIP Category</span>
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '3px' }}>
                                                    {group.courses?.length || 0} leçon(s) · {catVideos.length} vidéo(s)
                                                </div>
                                            </div>
                                        </div>

                                        {/* ➕ Add Lesson Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAddLessonGroupId(group._id);
                                                setNewLessonTitle({ fr: '', ar: '', tn: '' });
                                                setIsAddLessonOpen(true);
                                            }}
                                            style={{
                                                padding: '9px 18px', borderRadius: '12px',
                                                border: '1px solid rgba(212,175,55,0.4)',
                                                background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.06))',
                                                color: '#b8860b',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                gap: '7px', fontSize: '0.85rem', fontWeight: '800',
                                                transition: 'all 0.2s ease',
                                                boxShadow: '0 2px 8px rgba(212,175,55,0.15)'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.12))'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.06))'; e.currentTarget.style.transform = 'none'; }}
                                            title="إضافة درس جديد إلى هذه الفئة"
                                        >
                                            <FaPlus size={11} /> إضافة درس
                                        </button>
                                    </div>

                                    {isOpen && (
                                        <div style={{ padding: '30px 40px' }}>
                                            {group.courses?.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    {group.courses.map((course, i) => {
                                                        const titleStr = typeof course.title === 'object'
                                                            ? (course.title.fr || Object.values(course.title)[0])
                                                            : course.title;

                                                        const lessonVideos = catVideos.filter(v => {
                                                            const vSub = (v.subCategory || '').trim().toLowerCase();
                                                            const vInf = (v._inferredSubCategory || '').trim().toLowerCase();
                                                            const titleNorm = (titleStr || '').trim().toLowerCase();
                                                            const vCat = (v.category || '').trim().toLowerCase();
                                                            
                                                            return vSub === titleNorm || vInf === titleNorm || (!v.subCategory && vCat === titleNorm);
                                                        });

                                                        const isLastLesson = i === group.courses.length - 1;

                                                        return (
                                                            <div key={i} style={{ position: 'relative', paddingLeft: '40px' }}>
                                                                <div style={{ position: 'absolute', top: 0, left: '15px', bottom: isLastLesson ? 'auto' : 0, height: isLastLesson ? '38px' : '100%', width: '2px', background: '#cbd5e1', zIndex: 0 }} />
                                                                <div style={{ position: 'absolute', top: '38px', left: '15px', width: '25px', height: '2px', background: '#cbd5e1', zIndex: 0 }} />

                                                                <div style={{ paddingTop: '15px', paddingBottom: '15px' }}>
                                                                    <div style={{ 
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                                                        background: '#fff', border: '1px solid #e2e8f0', padding: '10px 15px', 
                                                                        borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
                                                                        position: 'relative', zIndex: 1, minHeight: '75px'
                                                                    }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                                            <div style={{ 
                                                                                width: '90px', height: '60px', borderRadius: '10px', 
                                                                                overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0',
                                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                                                                            }}>
                                                                                {course.image ? (
                                                                                    <img src={course.image} alt={titleStr} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                                ) : (
                                                                                    <FaImage color="#cbd5e1" size={24} />
                                                                                )}
                                                                                
                                                                                <div 
                                                                                    onClick={() => triggerThumbnailUpload(group._id, i)}
                                                                                    style={{
                                                                                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                        opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer', color: '#fff'
                                                                                    }}
                                                                                    onMouseEnter={(e) => e.target.style.opacity = 1}
                                                                                    onMouseLeave={(e) => e.target.style.opacity = 0}
                                                                                >
                                                                                    {uploadingId === `${group._id}-${i}` ? <FaSpinner className="spinner" /> : <FaUpload />}
                                                                                </div>
                                                                            </div>

                                                                            <div>
                                                                                <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1rem', letterSpacing: '-0.01e' }}>{titleStr}</div>
                                                                            </div>
                                                                        </div>

                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteSubCourse(group._id, i);
                                                                            }}
                                                                            style={{
                                                                                padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
                                                                                background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: '700'
                                                                            }}
                                                                            title="حذف هذا الدرس/القسم الفرعي"
                                                                        >
                                                                            <FaTrash size={11} /> حذف القسم
                                                                        </button>
                                                                    </div>

                                                                    <div style={{ position: 'relative', marginTop: '10px', paddingLeft: '40px' }}>
                                                                        <div style={{ position: 'absolute', top: '-10px', left: '26px', bottom: 0, width: '2px', background: '#e2e8f0', zIndex: 0 }} />

                                                                        {/* 1. Render Saved Videos for this lesson */}
                                                                        {lessonVideos.map((video, vIndex) => {
                                                                            const remainingPlaceholders = [
                                                                                { fr: 'Coupe', ar: 'قص' },
                                                                                { fr: 'Patron', ar: 'باترون' },
                                                                                { fr: 'Couture', ar: 'خياطة' }
                                                                            ].filter(item => 
                                                                                !lessonVideos.some(v => (v.title || '').toLowerCase().includes(item.fr.toLowerCase()) || (v.title_lang?.fr || '').toLowerCase().includes(item.fr.toLowerCase())) &&
                                                                                !(hiddenPlaceholders[`${group._id}-${i}`] || []).includes(item.fr)
                                                                            );
                                                                            const isLastVideo = vIndex === lessonVideos.length - 1 && remainingPlaceholders.length === 0;

                                                                            return (
                                                                                <div key={video._id} style={{ position: 'relative', paddingTop: '8px', paddingBottom: '8px' }}>
                                                                                    <div style={{ position: 'absolute', top: 0, left: '-14px', bottom: isLastVideo ? 'auto' : 0, height: isLastVideo ? '28px' : '100%', width: '2px', background: '#e2e8f0', zIndex: 0 }} />
                                                                                    <div style={{ position: 'absolute', top: '28px', left: '-14px', width: '25px', height: '2px', background: '#e2e8f0', zIndex: 0 }} />

                                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #f1f5f9', padding: '10px 15px', borderRadius: '10px', position: 'relative', zIndex: 1 }}>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                                            {video.thumbnail ? (
                                                                                                <img src={video.thumbnail} alt="" style={{ width: '26px', height: '26px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                                                                            ) : (
                                                                                                <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                                    <FaVideo color="#94a3b8" size={11} />
                                                                                                </div>
                                                                                            )}
                                                                                            <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>{video.title}</span>
                                                                                        </div>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                                                {['fr', 'ar', 'tn'].map(lang => {
                                                                                                    const isPresent = video.url_lang?.[lang] || (lang === 'tn' && video.url_lang?.en);
                                                                                                    return (
                                                                                                        <span key={lang} style={{
                                                                                                            padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase',
                                                                                                            background: isPresent ? 'rgba(34,197,94,0.1)' : 'rgba(239, 68, 68, 0.08)',
                                                                                                            color: isPresent ? '#16a34a' : '#ef4444',
                                                                                                            border: isPresent ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239, 68, 68, 0.15)'
                                                                                                        }}>{lang}</span>
                                                                                                    );
                                                                                                })}
                                                                                            </div>
                                                                                            <button
                                                                                                onClick={() => handleOpenEditVideo(video)}
                                                                                                style={{
                                                                                                    padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.4)',
                                                                                                    background: 'rgba(212,175,55,0.1)', color: '#D4AF37',
                                                                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: '700'
                                                                                                }}
                                                                                                title="تعديل اسم الفيديو أو الروابط"
                                                                                            >
                                                                                                <FaPencilAlt size={11} /> تعديل
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleDeleteVideo(video._id)}
                                                                                                style={{
                                                                                                    padding: '5px 8px', borderRadius: '8px', border: 'none',
                                                                                                    background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer'
                                                                                                }}
                                                                                                title="حذف"
                                                                                            >
                                                                                                <FaTrash size={11} />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}

                                                                        {/* 2. Render Remaining Placeholders for Missing Video Types */}
                                                                        {[
                                                                            { fr: 'Coupe', ar: 'قص' },
                                                                            { fr: 'Patron', ar: 'باترون' },
                                                                            { fr: 'Couture', ar: 'خياطة' }
                                                                        ].filter(item => 
                                                                            !lessonVideos.some(v => 
                                                                                (v.title || '').toLowerCase().includes(item.fr.toLowerCase()) || 
                                                                                (v.title_lang?.fr || '').toLowerCase().includes(item.fr.toLowerCase())
                                                                            ) && !(hiddenPlaceholders[`${group._id}-${i}`] || []).includes(item.fr)
                                                                        ).map((item, pIdx, visibleArr) => {
                                                                            const isLastPlaceholder = pIdx === visibleArr.length - 1;
                                                                            const displayTitle = `${item.fr} / ${item.ar}`;
                                                                            return (
                                                                                <div key={item.fr} style={{ position: 'relative', paddingTop: '6px', paddingBottom: '6px' }}>
                                                                                    <div style={{ position: 'absolute', top: 0, left: '-14px', bottom: isLastPlaceholder ? 'auto' : 0, height: isLastPlaceholder ? '24px' : '100%', width: '2px', background: '#cbd5e1', zIndex: 0 }} />
                                                                                    <div style={{ position: 'absolute', top: '24px', left: '-14px', width: '25px', height: '2px', background: '#cbd5e1', zIndex: 0 }} />

                                                                                    <div style={{
                                                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                                        background: 'rgba(255, 255, 255, 0.9)', border: '1px dashed #cbd5e1',
                                                                                        padding: '8px 14px', borderRadius: '10px', position: 'relative', zIndex: 1
                                                                                    }}>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                                            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                                <FaVideo color="#D4AF37" size={11} />
                                                                                            </div>
                                                                                            <span style={{ fontWeight: '700', color: '#475569', fontSize: '0.85rem' }}>{displayTitle}</span>
                                                                                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>(في انتظار إضافة الرابط)</span>
                                                                                        </div>

                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    const resolvedMainCat = (group.vip_category || group._id || '').toString().trim();
                                                                                                    const resolvedSubCat = (titleStr || course.technicalName || '').trim();
                                                                                                    setBulkModalMode('add');
                                                                                                    setBulkVideoId(null);
                                                                                                    setBulkContext({ mainCat: resolvedMainCat, subCat: resolvedSubCat });
                                                                                                    setBulkTitles({ fr: item.fr, ar: item.ar, tn: item.fr });
                                                                                                    setBulkUrls({ fr: '', ar: '', tn: '' });
                                                                                                    setBulkOrder(pIdx + 1);
                                                                                                    setActiveLangs({ fr: true, ar: true, tn: true });
                                                                                                    setIsBulkEntryOpen(true);
                                                                                                }}
                                                                                                style={{
                                                                                                    padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.4)',
                                                                                                    background: 'rgba(34,197,94,0.1)', color: '#16a34a',
                                                                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700'
                                                                                                }}
                                                                                                title={`إضافة/تعديل رابط فيديو لـ ${displayTitle}`}
                                                                                            >
                                                                                                <FaPencilAlt size={10} /> إضافة وتعديل الرابط
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    hidePlaceholder(group._id, i, item.fr);
                                                                                                }}
                                                                                                style={{
                                                                                                    padding: '5px 10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
                                                                                                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                                                                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: '700'
                                                                                                }}
                                                                                                title={`إخفاء ${displayTitle}`}
                                                                                            >
                                                                                                <FaTrash size={10} /> حذف
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
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
                                                        const titleNorm = (t || '').trim().toLowerCase();
                                                        const vSub = (v.subCategory || '').trim().toLowerCase();
                                                        const vInf = (v._inferredSubCategory || '').trim().toLowerCase();
                                                        const vCat = (v.category || '').trim().toLowerCase();
                                                        
                                                        return titleNorm === vSub || titleNorm === vInf || titleNorm === vCat;
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
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                                        {video.thumbnail ? (
                                                                                            <img src={video.thumbnail} alt="" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                                                                                        ) : (
                                                                                            <FaVideo color="#cbd5e1" />
                                                                                        )}
                                                                                        {video.title}
                                                                                    </div>
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
                                                                                        <button onClick={() => triggerVideoBulkThumbnailUpload(video.title)} style={{
                                                                                            padding: '5px', borderRadius: '6px', border: 'none', background: 'rgba(34,197,94,0.1)', color: '#16a34a', cursor: 'pointer', display: 'flex'
                                                                                        }} title="Thumbnail par titre (Patron/Coupe/Couture)">
                                                                                            {isBulkThumbUploading && videoThumbnailTitle === video.title ? <FaSpinner className="spinner" size={12} /> : <FaImage size={12} />}
                                                                                        </button>
                                                                                        <button onClick={() => handleOpenEditVideo(video)} style={{
                                                                                            padding: '5px', borderRadius: '6px', border: 'none', background: 'rgba(71,85,105,0.1)', color: '#475569', cursor: 'pointer', display: 'flex'
                                                                                        }}><FaPencilAlt size={11} /></button>
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
                                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', flexShrink: 0, overflow: 'hidden' }}>
                                                        {video.thumbnail ? (
                                                            <img src={video.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <FaVideo size={18} />
                                                        )}
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
                                                    {['fr', 'ar', 'tn'].map(lang => {
                                                        const isPresent = video.url_lang?.[lang] || (lang === 'tn' && video.url_lang?.en);
                                                        return (
                                                            <span key={lang} style={{
                                                                padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase',
                                                                background: isPresent ? 'rgba(34,197,94,0.1)' : 'rgba(239, 68, 68, 0.08)',
                                                                color: isPresent ? '#16a34a' : '#ef4444',
                                                                border: isPresent ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239, 68, 68, 0.15)'
                                                            }}>{lang}</span>
                                                        );
                                                    })}
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
                                                    <button onClick={() => handleOpenEditVideo(video)} style={{
                                                        padding: '7px 13px', borderRadius: '10px', border: 'none',
                                                        background: 'rgba(51, 65, 85, 0.08)', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem'
                                                    }}>
                                                        <FaPencilAlt size={11} /> Modifier
                                                    </button>
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

            {/* --- 📝 BULK ADD VIDEO MODAL --- */}
            {isBulkEntryOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }} onClick={() => setIsBulkEntryOpen(false)}>
                    <div style={{
                        background: '#fff', width: '100%', maxWidth: '800px', borderRadius: '24px',
                        padding: '35px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative'
                    }} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setIsBulkEntryOpen(false)}
                            style={{ position: 'absolute', top: '25px', right: '25px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                        ><FaTimes size={22} /></button>

                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                                {bulkModalMode === 'edit' ? 'Modifier Vidéo' : 'Ajouter une Video'}
                            </h2>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '0.9rem' }}>
                                <span style={{ color: '#64748b' }}>Filière:</span>
                                <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{bulkContext.mainCat}</span>
                                <span style={{ color: '#cbd5e1' }}>|</span>
                                <span style={{ color: '#64748b' }}>Leçon:</span>
                                <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{bulkContext.subCategory || bulkContext.subCat}</span>
                            </div>
                            
                            <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #f1f5f9' }}>
                                <label style={{ fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Ordre d'affichage :</label>
                                <input 
                                    type="number" 
                                    value={bulkOrder} 
                                    onChange={(e) => setBulkOrder(e.target.value)}
                                    style={{ width: '80px', padding: '10px', borderRadius: '10px', border: '1px dotted #cbd5e1', outline: 'none', textAlign: 'center', fontWeight: 'bold' }}
                                />
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>(Les petits numéros s'affichent en premier)</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '35px' }}>
                            {/* --- French Section --- */}
                            {activeLangs.fr && (
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1px solid #f1f5f9', position: 'relative' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveLangs(prev => ({ ...prev, fr: false }));
                                            setBulkTitles(prev => ({ ...prev, fr: '' }));
                                            setBulkUrls(prev => ({ ...prev, fr: '' }));
                                        }}
                                        style={{
                                            position: 'absolute', top: '15px', right: '15px', width: '24px', height: '24px',
                                            borderRadius: '50%', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px'
                                        }}
                                        title="حذف هذا الكارت"
                                    >
                                        <FaTimes />
                                    </button>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(34,197,94,0.1)', color: '#16a34a', fontSize: '0.7rem', fontWeight: 'bold' }}>FR</span>
                                        <span style={{ fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Français</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Nom du vidéo</label>
                                            <input
                                                type="text" placeholder="Ex: Introduction"
                                                value={bulkTitles.fr} onChange={(e) => setBulkTitles({ ...bulkTitles, fr: e.target.value })}
                                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Lien du vidéo</label>
                                            <input
                                                type="text" placeholder="https://..."
                                                value={bulkUrls.fr} onChange={(e) => setBulkUrls({ ...bulkUrls, fr: e.target.value })}
                                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => openJsonModalForLang('fr')}
                                                style={{
                                                    marginTop: '8px', width: '100%', padding: '8px', borderRadius: '8px',
                                                    border: '1px solid rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.08)',
                                                    color: '#0284c7', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                                }}
                                            >
                                                <FaVideo size={11} /> اختر الرابط من مكتبة (videos.json)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Arabic Section --- */}
                            {activeLangs.ar && (
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1px solid #f1f5f9', position: 'relative' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveLangs(prev => ({ ...prev, ar: false }));
                                            setBulkTitles(prev => ({ ...prev, ar: '' }));
                                            setBulkUrls(prev => ({ ...prev, ar: '' }));
                                        }}
                                        style={{
                                            position: 'absolute', top: '15px', left: '15px', width: '24px', height: '24px',
                                            borderRadius: '50%', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px'
                                        }}
                                        title="حذف هذا الكارت"
                                    >
                                        <FaTimes />
                                    </button>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(34,197,94,0.1)', color: '#16a34a', fontSize: '0.7rem', fontWeight: 'bold' }}>AR</span>
                                        <span style={{ fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>العربية</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', display: 'block', textAlign: 'right' }}>اسم الفيديو</label>
                                            <input
                                                type="text" placeholder="مثال: مقدمة"
                                                value={bulkTitles.ar} onChange={(e) => setBulkTitles({ ...bulkTitles, ar: e.target.value })}
                                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', textAlign: 'right', direction: 'rtl' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', display: 'block', textAlign: 'right' }}>رابط الفيديو</label>
                                            <input
                                                type="text" placeholder="https://..."
                                                value={bulkUrls.ar} onChange={(e) => setBulkUrls({ ...bulkUrls, ar: e.target.value })}
                                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', textAlign: 'right', direction: 'rtl' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => openJsonModalForLang('ar')}
                                                style={{
                                                    marginTop: '8px', width: '100%', padding: '8px', borderRadius: '8px',
                                                    border: '1px solid rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.08)',
                                                    color: '#0284c7', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                                }}
                                            >
                                                <FaVideo size={11} /> اختر الرابط من مكتبة (videos.json)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Tunisian Section --- */}
                            {activeLangs.tn && (
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1px solid #f1f5f9', position: 'relative' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveLangs(prev => ({ ...prev, tn: false }));
                                            setBulkTitles(prev => ({ ...prev, tn: '' }));
                                            setBulkUrls(prev => ({ ...prev, tn: '' }));
                                        }}
                                        style={{
                                            position: 'absolute', top: '15px', right: '15px', width: '24px', height: '24px',
                                            borderRadius: '50%', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px'
                                        }}
                                        title="حذف هذا الكارت"
                                    >
                                        <FaTimes />
                                    </button>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(34,197,94,0.1)', color: '#16a34a', fontSize: '0.7rem', fontWeight: 'bold' }}>TN</span>
                                        <span style={{ fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Tounsi / EN</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Nom du vidéo (TN)</label>
                                            <input
                                                type="text" placeholder="Ex: Introduction"
                                                value={bulkTitles.tn} onChange={(e) => setBulkTitles({ ...bulkTitles, tn: e.target.value })}
                                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Lien du vidéo (TN)</label>
                                            <input
                                                type="text" placeholder="https://..."
                                                value={bulkUrls.tn} onChange={(e) => setBulkUrls({ ...bulkUrls, tn: e.target.value })}
                                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => openJsonModalForLang('tn')}
                                                style={{
                                                    marginTop: '8px', width: '100%', padding: '8px', borderRadius: '8px',
                                                    border: '1px solid rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.08)',
                                                    color: '#0284c7', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                                }}
                                            >
                                                <FaVideo size={11} /> اختر الرابط من مكتبة (videos.json)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setIsBulkEntryOpen(false)}
                                style={{ padding: '12px 25px', borderRadius: '12px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
                            >Annuler</button>
                            <button
                                onClick={handleSaveVideoMultiLang}
                                disabled={bulkLoading}
                                style={{
                                    padding: '12px 35px', borderRadius: '12px', border: 'none', background: '#D4AF37', color: '#fff', fontWeight: 'bold', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(212,175,55,0.3)'
                                }}
                            >
                                {bulkLoading ? <FaSpinner className="spinner" /> : (bulkModalMode === 'edit' ? <FaPencilAlt /> : <FaPlus />)}
                                {bulkModalMode === 'edit' ? 'Enregistrer les modifications' : 'Enregistrer Tout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ➕ ADD LESSON MODAL --- */}
            {isAddLessonOpen && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(10px)',
                        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                    }}
                    onClick={() => setIsAddLessonOpen(false)}
                >
                    <div
                        style={{
                            background: '#fff', width: '100%', maxWidth: '620px', borderRadius: '28px',
                            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)', position: 'relative', overflow: 'hidden'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                            padding: '28px 35px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #D4AF37, #b8860b)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 8px 20px rgba(212,175,55,0.35)'
                                }}>
                                    <FaBook size={20} color="#fff" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', margin: 0 }}>إضافة درس جديد</h2>
                                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                                        {courses.find(c => c._id === addLessonGroupId)?.vip_category || ''}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAddLessonOpen(false)}
                                style={{
                                    width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                                    background: 'rgba(255,255,255,0.1)', color: '#94a3b8',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}
                            ><FaTimes size={16} /></button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '35px' }}>

                            {/* Info notice */}
                            <div style={{
                                padding: '12px 16px', borderRadius: '12px',
                                background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)',
                                color: '#92600a', fontSize: '0.82rem', fontWeight: '600',
                                marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <FaLanguage size={14} />
                                أدخل اسم الدرس بالفرنسية أو العربية أو التونسية — يكفي لغة واحدة على الأقل
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                                {/* French */}
                                <div>
                                    <label style={{
                                        fontSize: '0.8rem', fontWeight: '800', color: '#475569',
                                        marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '7px'
                                    }}>
                                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: '0.72rem' }}>FR</span>
                                        Nom de la leçon en Français
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Coupe de base, Patron de chemise..."
                                        value={newLessonTitle.fr}
                                        onChange={e => setNewLessonTitle(prev => ({ ...prev, fr: e.target.value }))}
                                        style={{
                                            width: '100%', padding: '13px 16px', borderRadius: '12px',
                                            border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.95rem',
                                            transition: 'border-color 0.2s', boxSizing: 'border-box', color: '#1e293b'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#D4AF37'}
                                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>

                                {/* Arabic */}
                                <div>
                                    <label style={{
                                        fontSize: '0.8rem', fontWeight: '800', color: '#475569',
                                        marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '7px',
                                        flexDirection: 'row-reverse', justifyContent: 'flex-end'
                                    }}>
                                        اسم الدرس بالعربية
                                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(34,197,94,0.1)', color: '#16a34a', fontSize: '0.72rem' }}>AR</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="مثال: قص الأساسي، باترون القميص..."
                                        value={newLessonTitle.ar}
                                        onChange={e => setNewLessonTitle(prev => ({ ...prev, ar: e.target.value }))}
                                        dir="rtl"
                                        style={{
                                            width: '100%', padding: '13px 16px', borderRadius: '12px',
                                            border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.95rem',
                                            transition: 'border-color 0.2s', boxSizing: 'border-box', color: '#1e293b',
                                            textAlign: 'right', direction: 'rtl'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#D4AF37'}
                                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>

                                {/* Tunisian */}
                                <div>
                                    <label style={{
                                        fontSize: '0.8rem', fontWeight: '800', color: '#475569',
                                        marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '7px'
                                    }}>
                                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', color: '#d97706', fontSize: '0.72rem' }}>TN</span>
                                        Nom en Tounsi / Dialect
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Coupett, Patron Taounssi..."
                                        value={newLessonTitle.tn}
                                        onChange={e => setNewLessonTitle(prev => ({ ...prev, tn: e.target.value }))}
                                        style={{
                                            width: '100%', padding: '13px 16px', borderRadius: '12px',
                                            border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.95rem',
                                            transition: 'border-color 0.2s', boxSizing: 'border-box', color: '#1e293b'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#D4AF37'}
                                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '30px' }}>
                                <button
                                    onClick={() => setIsAddLessonOpen(false)}
                                    style={{
                                        padding: '12px 24px', borderRadius: '12px', border: 'none',
                                        background: '#f1f5f9', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem'
                                    }}
                                >إلغاء</button>
                                <button
                                    onClick={handleAddLesson}
                                    disabled={addLessonLoading}
                                    style={{
                                        padding: '12px 32px', borderRadius: '12px', border: 'none',
                                        background: 'linear-gradient(135deg, #D4AF37, #b8860b)',
                                        color: '#fff', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem',
                                        display: 'flex', alignItems: 'center', gap: '9px',
                                        boxShadow: '0 8px 20px rgba(212,175,55,0.35)',
                                        opacity: addLessonLoading ? 0.7 : 1
                                    }}
                                >
                                    {addLessonLoading ? <FaSpinner className="spinner" size={14} /> : <FaPlus size={13} />}
                                    {addLessonLoading ? 'جاري الحفظ...' : 'حفظ الدرس'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 🎬 FULL PAGE VIDEOS.JSON CLASSIFIED LIBRARY MODAL --- */}
            {isJsonModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: '#0f172a', zIndex: 9999, display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', color: '#f8fafc'
                }}>
                    {/* Modal Top Bar */}
                    <div style={{
                        padding: '20px 35px', background: '#1e293b', borderBottom: '1px solid #334155',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaVideo size={20} color="#fff" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#fff' }}>مكتبة الفيديوهات المسجلة (videos.json)</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                                    <span style={{ padding: '3px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700' }}>
                                        الإجمالي: {jsonVideos.length} فيديو
                                    </span>
                                    <span style={{ padding: '3px 10px', borderRadius: '8px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', fontSize: '0.78rem', fontWeight: '700' }}>
                                        الظاهرة: {jsonVideos.length - hiddenVideoGuids.length} فيديو
                                    </span>
                                    <span
                                        onClick={() => hiddenVideoGuids.length > 0 && setShowHiddenPanel(p => !p)}
                                        style={{
                                            padding: '3px 10px', borderRadius: '8px',
                                            background: showHiddenPanel ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.15)',
                                            color: '#f87171', border: '1px solid rgba(239,68,68,0.3)',
                                            fontSize: '0.78rem', fontWeight: '700',
                                            cursor: hiddenVideoGuids.length > 0 ? 'pointer' : 'default',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                        title="انقر لعرض / إخفاء الفيديوهات المخفية"
                                    >
                                        المخفية: {hiddenVideoGuids.length} فيديو
                                        {hiddenVideoGuids.length > 0 && (
                                            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{showHiddenPanel ? '▲' : '▼'}</span>
                                        )}
                                    </span>
                                    {hiddenVideoGuids.length > 0 && (
                                        <span
                                            onClick={() => setHiddenVideoGuids([])}
                                            style={{
                                                padding: '3px 10px', borderRadius: '8px',
                                                background: 'rgba(34,197,94,0.15)', color: '#4ade80',
                                                border: '1px solid rgba(34,197,94,0.3)',
                                                fontSize: '0.78rem', fontWeight: '700',
                                                cursor: 'pointer'
                                            }}
                                            title="استرجاع جميع الفيديوهات المخفية"
                                        >
                                            🔄 استرجاع الكل
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ position: 'relative', width: '320px' }}>
                                <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="text"
                                    className="json-search-input"
                                    placeholder="بحث باسم الفيديو..."
                                    value={jsonSearch}
                                    onChange={(e) => setJsonSearch(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px 15px 10px 42px', borderRadius: '12px',
                                        border: '1px solid #334155', background: '#0f172a', color: '#ffffff',
                                        outline: 'none', fontSize: '0.9rem', caretColor: '#ffffff'
                                    }}
                                />
                            </div>
                            <button
                                onClick={() => setIsJsonModalOpen(false)}
                                style={{
                                    padding: '10px 20px', borderRadius: '12px', border: 'none',
                                    background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444',
                                    fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <FaTimes size={16} /> إغلاق النافذة
                            </button>
                        </div>
                    </div>

                    {/* Modal Grid Content (4 Columns) */}
                    {(() => {
                        // Categorization logic based on name keywords & hide clicked ones
                        const filtered = jsonVideos.filter(v => 
                            !hiddenVideoGuids.includes(v.guid) &&
                            ((v.nom || '').toLowerCase().includes(jsonSearch.toLowerCase()) ||
                            (v.url || '').toLowerCase().includes(jsonSearch.toLowerCase()))
                        );

                        const classified = {
                            tn: [],
                            ar: [],
                            fr: [],
                            other: []
                        };

                        filtered.forEach(v => {
                            const nameUpper = (v.nom || '').toUpperCase();
                            if (nameUpper.includes('TUNISIEN') || nameUpper.includes(' TUN ') || nameUpper.startsWith('TUN ') || nameUpper.endsWith(' TUN')) {
                                classified.tn.push(v);
                            } else if (nameUpper.includes('ARABE') || nameUpper.includes(' ARAB ') || nameUpper.startsWith('ARAB ') || nameUpper.endsWith(' ARAB')) {
                                classified.ar.push(v);
                            } else if (nameUpper.includes('FRANCAIS') || nameUpper.includes('FRANÇAIS') || nameUpper.includes(' FRANC ') || nameUpper.startsWith('FRAN ') || nameUpper.includes(' FARN ')) {
                                classified.fr.push(v);
                            } else {
                                classified.other.push(v);
                            }
                        });

                        const columns = [
                            { key: 'tn', title: 'تونسية / Tounsi (TN)', count: classified.tn.length, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
                            { key: 'ar', title: 'عربية / Arabe (AR)', count: classified.ar.length, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
                            { key: 'fr', title: 'فرنسية / Français (FR)', count: classified.fr.length, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
                            { key: 'other', title: 'أخرى / Other', count: classified.other.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
                        ];

                        return (
                            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', padding: '25px' }}>
                                {/* 4-Column Grid */}
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(4, minmax(300px, 1fr))', gap: '20px'
                                }}>
                                    {columns.map(col => (
                                        <div key={col.key} style={{
                                            background: '#1e293b', borderRadius: '18px', border: '1px solid #334155',
                                            display: 'flex', flexDirection: 'column', overflow: 'hidden'
                                        }}>
                                            {/* Column Header */}
                                            <div style={{
                                                padding: '16px 20px', background: '#0f172a', borderBottom: '1px solid #334155',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{
                                                        padding: '4px 10px', borderRadius: '8px', background: col.bg,
                                                        color: col.color, fontWeight: '800', fontSize: '0.85rem'
                                                    }}>
                                                        {col.key.toUpperCase()}
                                                    </span>
                                                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#f1f5f9' }}>{col.title}</span>
                                                </div>
                                                <span style={{
                                                    padding: '2px 10px', borderRadius: '12px', background: '#334155',
                                                    color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold'
                                                }}>
                                                    {col.count}
                                                </span>
                                            </div>

                                            {/* Column Scrollable Cards */}
                                            <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {classified[col.key].length === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                                        لا توجد فيديوهات في هذا القسم
                                                    </div>
                                                ) : (
                                                    classified[col.key].map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => handleSelectJsonVideo(item)}
                                                            style={{
                                                                background: '#0f172a', borderRadius: '14px', border: '1px solid #334155',
                                                                padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px',
                                                                cursor: 'pointer', transition: 'transform 0.2s ease, border-color 0.2s ease',
                                                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)'
                                                            }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'none'; }}
                                                        >
                                                            {/* Video Player Embed — النقر داخله يشغّل الفيديو بدون اختياره */}
                                                            <div
                                                                onClick={(e) => e.stopPropagation()}
                                                                style={{
                                                                    position: 'relative', paddingTop: '56.25%',
                                                                    borderRadius: '10px', overflow: 'hidden',
                                                                    background: '#000', cursor: 'default'
                                                                }}
                                                            >
                                                                <iframe
                                                                    src={`${item.url}?autoplay=false&loop=false&muted=true&preload=false&responsive=true`}
                                                                    loading="lazy"
                                                                    style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                                                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen;"
                                                                    allowFullScreen={true}
                                                                />
                                                            </div>

                                                            {/* Video Title & Info */}
                                                            <div>
                                                                <div style={{
                                                                    fontWeight: '700', fontSize: '0.85rem', color: '#e2e8f0',
                                                                    lineHeight: '1.4', wordBreak: 'break-word'
                                                                }}>
                                                                    {item.nom}
                                                                </div>
                                                                <div style={{
                                                                    fontSize: '0.72rem', color: '#64748b', marginTop: '8px',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                                                }}>
                                                                    <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>👈 انقر لاختيار هذا الفيديو</span>
                                                                    <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>
                                                                        {(item.guid || '').substring(0, 6)}...
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Hidden Videos Panel */}
                                {showHiddenPanel && hiddenVideoGuids.length > 0 && (
                                    <div style={{
                                        background: '#1e293b', borderRadius: '18px',
                                        border: '1px solid rgba(239,68,68,0.3)', overflow: 'hidden', flexShrink: 0
                                    }}>
                                        <div style={{
                                            padding: '14px 20px', background: 'rgba(239,68,68,0.08)',
                                            borderBottom: '1px solid rgba(239,68,68,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                        }}>
                                            <span style={{ color: '#f87171', fontWeight: '800', fontSize: '0.95rem' }}>
                                                🙈 الفيديوهات المخفية — {hiddenVideoGuids.length} فيديو
                                            </span>
                                            <button
                                                onClick={() => setHiddenVideoGuids([])}
                                                style={{
                                                    padding: '6px 16px', borderRadius: '10px', border: 'none',
                                                    background: 'rgba(34,197,94,0.2)', color: '#4ade80',
                                                    fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem'
                                                }}
                                            >🔄 استرجاع الكل</button>
                                        </div>
                                        <div style={{
                                            padding: '15px', display: 'flex', flexWrap: 'wrap', gap: '12px'
                                        }}>
                                            {jsonVideos.filter(v => hiddenVideoGuids.includes(v.guid)).map((item, idx) => (
                                                <div key={idx} style={{
                                                    background: '#0f172a', borderRadius: '12px',
                                                    border: '1px solid rgba(239,68,68,0.25)',
                                                    padding: '12px', width: '220px', flexShrink: 0
                                                }}>
                                                    <div style={{
                                                        fontWeight: '700', fontSize: '0.82rem', color: '#94a3b8',
                                                        marginBottom: '10px', wordBreak: 'break-word', lineHeight: '1.4'
                                                    }}>
                                                        {item.nom}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => setHiddenVideoGuids(prev => prev.filter(g => g !== item.guid))}
                                                            style={{
                                                                flex: 1, padding: '6px', borderRadius: '8px', border: 'none',
                                                                background: 'rgba(34,197,94,0.2)', color: '#4ade80',
                                                                fontWeight: '700', cursor: 'pointer', fontSize: '0.78rem'
                                                            }}
                                                        >↩ استرجاع</button>
                                                        <button
                                                            onClick={() => handleSelectJsonVideo(item)}
                                                            style={{
                                                                flex: 1, padding: '6px', borderRadius: '8px', border: 'none',
                                                                background: 'rgba(14,165,233,0.2)', color: '#38bdf8',
                                                                fontWeight: '700', cursor: 'pointer', fontSize: '0.78rem'
                                                            }}
                                                        >✓ اختيار</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleThumbnailUpload} 
            />

            <input 
                type="file" 
                ref={categoryFileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleCategoryImageUpload} 
            />

            <input 
                type="file" 
                ref={videoThumbnailRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleVideoBulkThumbnailUpload} 
            />

            <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; } .json-search-input::placeholder { color: rgba(255,255,255,0.55) !important; } .json-search-input { color: #ffffff !important; }` }} />
        </div>
    );
}
