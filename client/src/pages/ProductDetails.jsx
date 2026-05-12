import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    FaShoppingCart, FaArrowLeft, FaCheckCircle, FaStar,
    FaWhatsapp, FaClipboardList, FaEdit, FaTrash, FaBolt,
    FaChevronLeft, FaChevronRight, FaPlus, FaMinus, FaCommentAlt, FaTimes, FaRegStar, FaThLarge
} from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { useLanguage } from '../context/LanguageContext';
import { useAlert } from '../context/AlertContext';
import BASE_URL from '../apiConfig';
import './shop_redesign.css'; // Reuse existing shop styles

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { appLanguage, getTranslated } = useLanguage();
    const { showAlert } = useAlert();

    const [product, setProduct] = useState(null);
    const [shopCategories, setShopCategories] = useState([]);
    const [customerDetailsTitle, setCustomerDetailsTitle] = useState({ fr: 'COORDONNÉES DU CLIENT', ar: 'معلومات العميل', TN: 'معلومات العميل' });
    const [customerFormLabels, setCustomerFormLabels] = useState({
        name: { fr: 'NOM COMPLET', ar: 'الاسم الكامل', TN: 'الاسم الكامل' },
        whatsapp: { fr: 'NUMÉRO WHATSAPP', ar: 'رقم الواتساب', TN: 'رقم الواتساب' },
        address: { fr: 'ADRESSE', ar: 'العنوان', TN: 'العنوان' },
        note: { fr: 'NOTES SUPPLÉMENTAIRES', ar: 'ملاحظات إضافية', TN: 'ملاحظات إضافية' }
    });
    const [descriptionTitle, setDescriptionTitle] = useState({ fr: 'DESCRIPTION', ar: 'الوصف', TN: 'الوصف' });
    const [bundleTitle, setBundleTitle] = useState({ fr: 'PRODUITS INCLUS', ar: 'المنتجات المشمولة في العرض', TN: 'المنتجات المشمولة في العرض' });
    const [freeDeliveryText, setFreeDeliveryText] = useState({ fr: 'Livraison gratuite sur tout le territoire de la République', ar: 'التوصيل مجاني لكامل تراب الجمهورية', TN: 'التوصيل مجاني لكامل تراب الجمهورية' });
    const [editingKey, setEditingKey] = useState('customer-details-title');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showTitleEditModal, setShowTitleEditModal] = useState(false);
    const [editSettingObj, setEditSettingObj] = useState({ fr: '', ar: '', TN: '' });
    const [isSavingSetting, setIsSavingSetting] = useState(false);
    const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
    const [showImageGallery, setShowImageGallery] = useState(false);
    const [selectedImgIndices, setSelectedImgIndices] = useState(null); // null = all selected
    const [pendingSelection, setPendingSelection] = useState(null); // working copy inside modal
    const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
    const [lastOrderId, setLastOrderId] = useState('');
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentRating, setCommentRating] = useState(5);
    const [commentText, setCommentText] = useState('');
    const [clientNameForComment, setClientNameForComment] = useState('');
    const [editForm, setEditForm] = useState({
        nom: {},
        prix: 0,
        categorie: {},
        description: {}
    });
    const fileInputRef = useRef(null);

    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        whatsapp: '',
        note: '',
        address: ''
    });

    const t = {
        ar: {
            back: "العودة للمتجر",
            buy: "تأكيد الطلب",
            whatsapp: "رقم الواتساب",
            note: "ملاحظات إضافية",
            name: "الاسم الكامل",
            address: "العنوان",
            quantity: "الكمية",
            total: "الإجمالي",
            stock: "متوفر",
            adminPanel: "لوحة التحكم",
            edit: "تعديل",
            delete: "حذف",
            success: "تم إرسال طلبك بنجاح! سنتواصل معك قريباً.",
            error: "حدث خطأ ما، يرجى المحاولة لاحقاً.",
            loading: "جاري التحميل...",
            confirmDelete: "هل أنت متأكد من حذف هذا المنتج؟",
            categoryMapping: { 'Tous': 'الكل', 'Homme': 'رجال', 'Famme': 'نساء', 'Enfant': 'أطفال' }
        },
        fr: {
            back: "Retour au magasin",
            buy: "Confirmer la commande",
            whatsapp: "Numéro WhatsApp",
            note: "Notes supplémentaires",
            name: "Nom complet",
            address: "Adresse",
            quantity: "Quantité",
            total: "Total",
            stock: "Disponible",
            adminPanel: "PANEL ADMIN",
            edit: "MODIFIER",
            delete: "SUPPRIMER",
            success: "Commande envoyée avec succès ! Nous vous contacterons bientôt.",
            error: "Une erreur est survenue, veuillez réessayer.",
            loading: "Chargement...",
            confirmDelete: "Supprimer ce produit ?",
            categoryMapping: { 'Tous': 'Tous', 'Homme': 'Homme', 'Famme': 'Famme', 'Enfant': 'Enfant' }
        }
    }[appLanguage] || {
        back: "Back to shop",
        buy: "Confirm Order",
        whatsapp: "WhatsApp Number",
        note: "Additional Notes",
        name: "Full Name",
        address: "Address",
        quantity: "Quantity",
        total: "Total",
        stock: "In Stock",
        adminPanel: "ADMIN PANEL",
        edit: "EDIT",
        delete: "DELETE",
        success: "Order sent successfully! We will contact you soon.",
        error: "Something went wrong, please try again.",
        loading: "Loading...",
        confirmDelete: "Delete this product?",
        categoryMapping: { 'Tous': 'All', 'Homme': 'Men', 'Famme': 'Women', 'Enfant': 'Children' }
    };

    useEffect(() => {
        // Fetch Categories to ensure consistent badge rendering
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/shop-categories`);
                if (res.ok) {
                    const data = await res.json();
                    setShopCategories(data);
                }
            } catch (err) { }
        };
        fetchCategories();

        const fetchSettings = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/settings/customer-details-title`);
                if (res.ok) {
                    const data = await res.json();
                    if (data) setCustomerDetailsTitle(data);
                }
            } catch (err) { }
            try {
                const res = await fetch(`${BASE_URL}/api/settings/customer-form-labels`);
                if (res.ok) {
                    const data = await res.json();
                    if (data) setCustomerFormLabels(data);
                }
            } catch (err) { }
            try {
                const res = await fetch(`${BASE_URL}/api/settings/product-description-title`);
                if (res.ok) {
                    const data = await res.json();
                    if (data) setDescriptionTitle(data);
                }
            } catch (err) { }
            try {
                const res = await fetch(`${BASE_URL}/api/settings/free-delivery-text`);
                if (res.ok) {
                    const data = await res.json();
                    if (data) setFreeDeliveryText(data);
                }
            } catch (err) { }
            try {
                const res = await fetch(`${BASE_URL}/api/settings/bundle-title`);
                if (res.ok) {
                    const data = await res.json();
                    if (data) setBundleTitle(data);
                }
            } catch (err) { }
        };
        fetchSettings();

        const fetchData = async () => {
            try {
                // Use the unified catalog endpoint to avoid trial-and-error 404s
                const catalogRes = await fetch(`${BASE_URL}/api/catalog/${id}`);
                
                if (!catalogRes.ok) {
                    throw new Error('Item not found');
                }

                const catalogResult = await catalogRes.json();
                const isOfferFetched = catalogResult.type === 'offer';
                let data = catalogResult.data;
                
                // Ensure isOffer is set correctly on the product object
                if (data) {
                    data.isOffer = isOfferFetched;
                }

                const [userRes] = await Promise.all([
                    (async () => {
                        const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
                        if (email) {
                            const res = await fetch(`${BASE_URL}/api/users/${email}`);
                            return res.ok ? res.json() : null;
                        }
                        return null;
                    })()
                ]);

                if (data) {
                    if (isOfferFetched) {
                        const combinedImages = data.productIds?.flatMap(p => [p.mainImage, p.image, ...(p.secondaryImages || [])]).filter(Boolean) || [];
                        const mainImg = data.productIds?.[0]?.mainImage || data.productIds?.[0]?.image || combinedImages[0];

                        data = {
                            ...data,
                            _id: data._id,
                            nom: data.title,
                            prix: data.newPrice,
                            oldPrix: data.productIds?.reduce((acc, p) => acc + (p.prix || 0), 0) || 0,
                            categorie: { fr: 'Offre Spéciale', ar: 'عرض خاص' },
                            description: data.description || { fr: '', ar: '' },
                            mainImage: mainImg,
                            secondaryImages: combinedImages.filter(img => img !== mainImg),
                            isOffer: true,
                            bundleProducts: data.productIds
                        };
                    }

                    setProduct(data);

                    // Restore carousel filter from DB (visibleCarouselImages)
                    const vcImages = data.visibleCarouselImages || [];
                    if (vcImages.length > 0) {
                        // Build allImages for this product to derive indices from URLs
                        const imgs = [data.mainImage || data.image, ...(data.secondaryImages || []), ...(data.innerImages || [])].filter(Boolean);
                        const savedSet = new Set(
                            imgs.reduce((acc, img, idx) => {
                                if (vcImages.includes(img)) acc.push(idx);
                                return acc;
                            }, [])
                        );
                        setSelectedImgIndices(savedSet.size === imgs.length ? null : savedSet);
                    } else {
                        setSelectedImgIndices(null); // show all by default
                    }

                    // Populate initial edit form values
                    setEditForm({
                        nom: data.nom || {},
                        prix: data.prix || 0,
                        categorie: typeof data.categorie === 'object' ? data.categorie : { fr: data.categorie || 'Autres', ar: '' },
                        description: data.description || {}
                    });
                } else {
                    setError("Produit introuvable");
                }

                if (userRes && userRes.statut === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (err) {
                console.error(err);
                setError("Erreur de chargement");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    // Carousel Auto-play
    useEffect(() => {
        if (!product || !isAutoPlayEnabled) return;
        const allImages = [product.mainImage || product.image, ...(product.secondaryImages || [])].filter(Boolean);
        if (allImages.length > 1) {
            const interval = setInterval(() => {
                setActiveImageIndex((prev) => (prev + 1) % allImages.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [product, isAutoPlayEnabled]);

    const handlePurchase = async (e) => {
        e.preventDefault();
        if (!customerDetails.name || !customerDetails.whatsapp || !customerDetails.address) {
            showAlert('warning', 'Validation', appLanguage === 'ar' ? 'يرجى ملء جميع الخانات المطلوبة' : 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        setIsSubmitting(true);
        try {
            const orderData = {
                totalAmount: product.prix * quantity,
                items: [{
                    productId: product._id,
                    productName: typeof product.nom === 'object' ? (product.nom[appLanguage] || product.nom.fr) : product.nom,
                    productImage: product.mainImage || product.image,
                    quantity: quantity,
                    price: product.prix
                }],
                clientName: customerDetails.name,
                clientPhone: customerDetails.whatsapp,
                clientEmail: localStorage.getItem('loggedInUserEmail') || localStorage.getItem('currentUserEmail') || '',
                shippingAddress: customerDetails.address,
                note: customerDetails.note
            };

            const res = await fetch(`${BASE_URL}/api/commands`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                setLastOrderId(data.commandId || data._id || data.id || '---');
                setClientNameForComment(customerDetails.name);
                setShowOrderSuccessModal(true);

                // Add to local storage "panier"
                try {
                    const currentPanier = JSON.parse(localStorage.getItem('panier_items') || '[]');
                    const orderDate = new Date().toISOString();
                    const newItem = {
                        id: product._id,
                        commandId: data.commandId || data._id || data.id,
                        name: typeof product.nom === 'object' ? product.nom : { fr: product.nom, ar: product.nom },
                        image: product.mainImage || product.image,
                        price: product.prix,
                        quantity: quantity,
                        orderDate: orderDate,
                        totalAmount: product.prix * quantity,
                        status: 'pending'
                    };
                    localStorage.setItem('panier_items', JSON.stringify([newItem, ...currentPanier]));
                    // Dispatch an event to update any listening Panier badge
                    window.dispatchEvent(new Event('panierUpdated'));
                } catch (e) {
                    console.error("Could not save to panier", e);
                }

                // Clear form
                setCustomerDetails({
                    name: '',
                    whatsapp: '',
                    note: '',
                    address: ''
                });
            } else {
                showAlert('error', 'Erreur', t.error);
            }
        } catch (err) {
            showAlert('error', 'Erreur', t.error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendComment = async () => {
        if (!commentText.trim()) {
            showAlert('warning', 'Validation', appLanguage === 'ar' ? 'يرجى كتابة تعليق' : 'Veuillez écrire un commentaire');
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/commentaires`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: clientNameForComment || 'Client',
                    commentaire: commentText,
                    rating: commentRating,
                    productId: product._id
                })
            });

            if (res.ok) {
                showAlert('success', 'Merci !', appLanguage === 'ar' ? 'شكراً لتعليقكم' : 'Merci pour votre avis !');
                setShowCommentModal(false);
                setCommentText('');
                setCommentRating(5);
            } else {
                showAlert('error', 'Erreur', 'Échec de l\'envoi');
            }
        } catch (err) {
            showAlert('error', 'Erreur', 'Erreur serveur');
        }
    };

    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) {
                const updatedInnerImages = [...(product.innerImages || []), data.url];
                const endpoint = product.isOffer ? 'offers' : 'products';
                const updateRes = await fetch(`${BASE_URL}/api/${endpoint}/${product._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ innerImages: updatedInnerImages })
                });

                if (updateRes.ok) {
                    setProduct({ ...product, innerImages: updatedInnerImages });
                    showAlert('success', 'Succès', 'Image ajoutée aux détails');
                }
            } else {
                showAlert('error', 'Erreur', 'Échec de l\'upload');
            }
        } catch (err) {
            console.error(err);
            showAlert('error', 'Erreur', 'Erreur lors de l\'upload');
        } finally {
            setUploadingImage(false);
        }
    };

    const removeImage = async (imgUrl) => {
        if (!window.confirm("Supprimer cette image ?")) return;

        // Check if it's in secondaryImages or innerImages
        const isSecondary = product.secondaryImages?.includes(imgUrl);
        const isInner = product.innerImages?.includes(imgUrl);

        let updateBody = {};
        if (isSecondary) {
            updateBody.secondaryImages = product.secondaryImages.filter(img => img !== imgUrl);
        } else if (isInner) {
            updateBody.innerImages = product.innerImages.filter(img => img !== imgUrl);
        } else {
            return; // Cannot delete main image here
        }

        try {
            const endpoint = product.isOffer ? 'offers' : 'products';
            const res = await fetch(`${BASE_URL}/api/${endpoint}/${product._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateBody)
            });
            if (res.ok) {
                setProduct({ ...product, ...updateBody });
                setActiveImageIndex(0);
                showAlert('success', 'Succès', 'Image supprimée');
            }
        } catch (err) {
            showAlert('error', 'Erreur', 'Erreur lors de la suppression');
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            const endpoint = product.isOffer ? 'offers' : 'products';
            const res = await fetch(`${BASE_URL}/api/${endpoint}/${product._id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showAlert('success', 'Succès', 'Produit supprimé');
                navigate('/magasin');
            } else {
                showAlert('error', 'Erreur', 'Échec de la suppression');
                setIsSubmitting(false);
                setShowDeleteConfirm(false);
            }
        } catch (err) {
            showAlert('error', 'Erreur', 'Erreur lors de la suppression');
            setIsSubmitting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const endpoint = product.isOffer ? 'offers' : 'products';
        try {
            const res = await fetch(`${BASE_URL}/api/${endpoint}/${product._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                setProduct({ ...product, ...editForm });
                setShowEditModal(false);
                showAlert('success', 'Succès', 'Produit mis à jour');
            } else {
                showAlert('error', 'Erreur', 'Échec de la mise à jour');
            }
        } catch (err) {
            showAlert('error', 'Erreur', 'Erreur serveur');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveTitle = async () => {
        setIsSavingSetting(true);
        try {
            // Save the main title
            const res = await fetch(`${BASE_URL}/api/settings/${editingKey}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editSettingObj })
            });

            // If we are editing the customer section, also save the field labels
            if (res.ok && editingKey === 'customer-details-title') {
                await fetch(`${BASE_URL}/api/settings/customer-form-labels`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: customerFormLabels })
                });
            }

            if (res.ok) {
                if (editingKey === 'customer-details-title') {
                    setCustomerDetailsTitle(editSettingObj);
                } else if (editingKey === 'free-delivery-text') {
                    setFreeDeliveryText(editSettingObj);
                } else if (editingKey === 'bundle-title') {
                    setBundleTitle(editSettingObj);
                } else {
                    setDescriptionTitle(editSettingObj);
                }
                setShowTitleEditModal(false);
                showAlert(appLanguage === 'ar' ? 'تم الحفظ بنجاح' : 'Enregistré avec succès', 'success');
            }
        } catch (err) {
            showAlert('Error saving settings', 'error');
        } finally {
            setIsSavingSetting(false);
        }
    };

    if (loading) return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }} dir="ltr">
            <Navbar />
            <div className="product-details-container" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
                <div className="product-details-layout skeleton-pulse" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '50px', marginTop: '150px', marginBottom: '50px' }}>

                    {/* Left Column Skeleton */}
                    <div className="media-section" style={{ display: 'flex', gap: '15px', height: '700px' }}>
                        <div style={{ flex: 1, borderRadius: '24px', background: '#e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}></div>
                        <div style={{ width: '100px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{ width: '100%', height: '90px', borderRadius: '12px', background: '#e2e8f0' }}></div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="info-section">
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ width: '100px', height: '30px', borderRadius: '30px', background: '#e2e8f0', marginBottom: '20px' }}></div>
                            <div style={{ width: '90%', height: '40px', borderRadius: '12px', background: '#e2e8f0', marginBottom: '20px' }}></div>
                            <div style={{ width: '40%', height: '40px', borderRadius: '12px', background: '#e2e8f0', marginBottom: '40px' }}></div>

                            <div style={{ width: '150px', height: '24px', borderRadius: '8px', background: '#e2e8f0', marginBottom: '15px' }}></div>
                            <div style={{ width: '100%', height: '150px', borderRadius: '20px', background: '#e2e8f0', marginBottom: '40px' }}></div>
                        </div>

                        <div style={{ background: '#fff', padding: '30px', borderRadius: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '50%', height: '24px', borderRadius: '8px', background: '#e2e8f0', marginBottom: '30px' }}></div>

                            <div className="pd-inputs-grid" style={{ marginBottom: '15px' }}>
                                <div style={{ height: '55px', borderRadius: '14px', background: '#f8fafc', border: '2px solid #f1f5f9' }}></div>
                                <div style={{ height: '55px', borderRadius: '14px', background: '#f8fafc', border: '2px solid #f1f5f9' }}></div>
                            </div>
                            <div style={{ height: '55px', borderRadius: '14px', background: '#f8fafc', border: '2px solid #f1f5f9', marginBottom: '30px' }}></div>

                            <div style={{ height: '70px', borderRadius: '20px', background: '#f8fafc', marginBottom: '30px' }}></div>

                            <div style={{ height: '65px', width: '100%', borderRadius: '20px', background: '#e2e8f0' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .skeleton-pulse .media-section > div, 
                .skeleton-pulse .info-section > div > div,
                .skeleton-pulse .info-section .pd-inputs-grid > div {
                    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
                    background-size: 200% 100%;
                    animation: pdSkeletonLoading 1.5s infinite linear;
                }
                @keyframes pdSkeletonLoading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @media (max-width: 992px) {
                    .skeleton-pulse { grid-template-columns: 1fr !important; }
                    .skeleton-pulse .media-section { height: 400px !important; flex-direction: column !important; }
                    .skeleton-pulse .media-section > div:last-child { width: 100% !important; flex-direction: row !important; height: 80px !important; }
                    .skeleton-pulse .media-section > div:last-child > div { width: 80px !important; height: 100% !important; }
                }
            `}</style>
            <Footer />
        </div>
    );
    if (error || !product) return <div className="error-container" style={{ textAlign: 'center', padding: '100px' }}><p>{error}</p><button onClick={() => navigate('/magasin')}>{t.back}</button></div>;



    const currentProductName = getTranslated(product.nom);
    const currentCategory = getTranslated(product.categorie);
    const currentDescription = getTranslated(product.description);
    const allImages = [product.mainImage || product.image, ...(product.secondaryImages || []), ...(product.innerImages || [])].filter(Boolean);
    // Displayed images = filtered subset chosen by admin (null = show all)
    const displayedImages = selectedImgIndices === null
        ? allImages
        : allImages.filter((_, idx) => selectedImgIndices.has(idx));

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }} dir="ltr">
            <Navbar />

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleUploadImage}
            />

            <div className="product-details-container" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
                <div className="product-details-layout" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '50px', marginTop: '150px' }}>

                    {/* Left Column: Carousel & Side Gallery */}
                    <div className="media-section" style={{ display: 'flex', gap: '15px', height: '700px' }}>

                        {/* Main Carousel Area */}
                        <div className="main-carousel" style={{ flex: 1, position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', background: '#fff' }}>

                            {/* 🖼️ Gallery Picker Button */}
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        // Pre-load current selection into pending
                                        if (selectedImgIndices === null) {
                                            setPendingSelection(null);
                                        } else {
                                            setPendingSelection(new Set(selectedImgIndices));
                                        }
                                        setShowImageGallery(true);
                                    }}
                                    title={appLanguage === 'ar' ? 'عرض جميع الصور' : 'Voir toutes les images'}
                                    style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        zIndex: 10,
                                        background: 'rgba(255,255,255,0.92)',
                                        backdropFilter: 'blur(6px)',
                                        border: '1px solid rgba(212,175,55,0.3)',
                                        borderRadius: '12px',
                                        padding: '8px 14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '7px',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        color: '#1e293b',
                                        letterSpacing: '0.5px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        transition: 'all 0.25s',
                                    }}
                                    className="pd-gallery-btn"
                                >
                                    <FaThLarge style={{ color: '#D4AF37', fontSize: '0.9rem' }} />
                                    <span>
                                        {displayedImages.length === allImages.length
                                            ? `${allImages.length} ${appLanguage === 'ar' ? 'صورة' : 'Photos'}`
                                            : `${displayedImages.length}/${allImages.length} ${appLanguage === 'ar' ? 'صورة' : 'Photos'}`
                                        }
                                    </span>
                                </button>
                            )}
                            <div className="carousel-track" style={{ height: '100%', display: 'flex', transition: 'transform 0.5s ease', transform: `translateX(-${activeImageIndex * 100}%)` }}>
                                {displayedImages.map((img, idx) => (
                                    <img key={idx} src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', flexShrink: 0 }} />
                                ))}
                            </div>

                            {/* Controls */}
                            <button onClick={() => { setActiveImageIndex(prev => (prev === 0 ? displayedImages.length - 1 : prev - 1)); setIsAutoPlayEnabled(false); }} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}><FaChevronLeft /></button>
                            <button onClick={() => { setActiveImageIndex(prev => (prev === displayedImages.length - 1 ? 0 : prev + 1)); setIsAutoPlayEnabled(false); }} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}><FaChevronRight /></button>

                            {/* Indicators */}
                            <div style={{ position: 'absolute', bottom: '20px', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 5 }}>
                                {displayedImages.map((_, idx) => (
                                    <div key={idx} onClick={() => { setActiveImageIndex(idx); setIsAutoPlayEnabled(false); }} style={{ width: idx === activeImageIndex ? '20px' : '8px', height: '8px', borderRadius: '4px', background: idx === activeImageIndex ? '#D4AF37' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s', cursor: 'pointer' }}></div>
                                ))}
                            </div>
                        </div>

                        {/* Right Gallery (Thumbnails) */}
                        <div className="side-gallery" style={{ width: '100px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingInlineEnd: '5px' }}>
                            {displayedImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    style={{ position: 'relative' }}
                                >
                                    <div
                                        onClick={() => { setActiveImageIndex(idx); setIsAutoPlayEnabled(false); }}
                                        style={{
                                            width: '100%',
                                            height: '90px',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: idx === activeImageIndex ? '2px solid #D4AF37' : '2px solid transparent',
                                            transition: 'all 0.2s',
                                            flexShrink: 0,
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    {isAdmin && idx > 0 && ( // Don't delete main image here (idx 0 is main)
                                        <button
                                            className="pd-delete-img-btn"
                                            onClick={(e) => { e.stopPropagation(); removeImage(img); }}
                                            style={{
                                                position: 'absolute',
                                                top: '-5px',
                                                insetInlineEnd: '-5px',
                                                background: '#ef4444',
                                                color: '#fff',
                                                border: 'none',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.6rem',
                                                cursor: 'pointer',
                                                zIndex: 10,
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Add Image Button for Admin */}
                            {isAdmin && (
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={uploadingImage}
                                    style={{
                                        width: '100%',
                                        height: '90px',
                                        borderRadius: '16px',
                                        border: '2px dashed #D4AF37',
                                        background: 'rgba(212, 175, 55, 0.08)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        color: '#D4AF37',
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        transition: 'all 0.3s',
                                        padding: '10px'
                                    }}
                                    className="pd-add-img-btn"
                                >
                                    {uploadingImage ? (
                                        <div className="loader small" style={{ borderTopColor: '#D4AF37' }}></div>
                                    ) : (
                                        <>
                                            <FaPlus style={{ fontSize: '1.2rem' }} />
                                            <span style={{ fontSize: '0.65rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                                                {appLanguage === 'ar' ? 'إضافة' : 'AJOUTER'}
                                            </span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Info & Purchase */}
                    <div className="info-section">
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                <span className="category-badge-pd" style={{ padding: '6px 14px', background: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', borderRadius: '30px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    {(() => {
                                        // Try to find in dynamic shopCategories first
                                        const catKey = typeof product.categorie === 'string' ? product.categorie : (product.categorie?.fr || '');
                                        const cat = shopCategories.find(c => c.key === catKey);
                                        if (cat) return getTranslated(cat.name);

                                        // Fallback to hardcoded categoryMapping or direct value
                                        return t.categoryMapping?.[catKey] || getTranslated(product.categorie);
                                    })()}
                                </span>
                                <div style={{ display: 'flex', color: '#ffc107', fontSize: '0.8rem' }}><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                gap: '20px',
                                marginBottom: '25px'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <h1 style={{ 
                                        fontSize: 'clamp(1.1rem, 4vw, 1.7rem)', 
                                        fontWeight: '800', 
                                        color: '#0f172a', 
                                        lineHeight: '1.2',
                                        fontFamily: "'Lora', serif",
                                        letterSpacing: '-0.01em',
                                        margin: 0,
                                        textShadow: '0 1px 1px rgba(0,0,0,0.01)'
                                    }}>
                                        {currentProductName}
                                    </h1>
                                    <div style={{ 
                                        height: '3px', 
                                        width: '45px', 
                                        background: 'linear-gradient(90deg, #D4AF37 0%, rgba(212, 175, 55, 0.4) 100%)', 
                                        marginTop: '10px', 
                                        borderRadius: '2px' 
                                    }}></div>
                                </div>

                                {isAdmin && (
                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginTop: '5px' }}>
                                        <button 
                                            onClick={() => setShowEditModal(true)} 
                                            style={{ 
                                                background: '#f1f5f9', 
                                                border: 'none', 
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px', 
                                                cursor: 'pointer', 
                                                color: '#64748b',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }} 
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                            title={t.edit}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            onClick={() => setShowDeleteConfirm(true)} 
                                            style={{ 
                                                background: '#fef2f2', 
                                                border: 'none', 
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px', 
                                                cursor: 'pointer', 
                                                color: '#ef4444',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }} 
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
                                            title={t.delete}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="pd-pricing-row" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                                <div className="price-stack" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: '900', color: '#D4AF37' }}>{product.prix.toFixed(2)} DT</span>
                                    {product.isOffer && product.oldPrix > 0 && (
                                        <span className="old-price-pd" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#94a3b8', textDecoration: 'line-through' }}>{product.oldPrix.toFixed(2)} DT</span>
                                    )}
                                </div>
                                <span style={{ color: '#22c55e', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', marginInlineStart: 'auto' }}><FaCheckCircle /> {t.stock}</span>
                            </div>

                            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                                    {getTranslated(descriptionTitle).toUpperCase()}
                                </h3>
                                {isAdmin && (
                                    <button
                                        onClick={() => {
                                            setEditSettingObj(descriptionTitle);
                                            setEditingKey('product-description-title');
                                            setShowTitleEditModal(true);
                                        }}
                                        style={{ background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', display: 'flex' }}
                                    >
                                        <FaEdit size={12} />
                                    </button>
                                )}
                            </div>

                            {currentDescription && (
                                <div style={{
                                    padding: '20px',
                                    background: 'rgba(0,0,0,0.02)',
                                    borderRadius: '20px',
                                    borderInlineStart: '4px solid #D4AF37',
                                    marginBottom: '30px',
                                    fontSize: '0.95rem',
                                    color: '#475569',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-line'
                                }}>
                                    {currentDescription}
                                </div>
                            )}

                            {product.isOffer && product.bundleProducts && product.bundleProducts.length > 0 && (
                                <div style={{ marginBottom: '30px' }}>
                                    <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                                            {getTranslated(bundleTitle).toUpperCase()}
                                        </h3>
                                        {isAdmin && (
                                            <button
                                                onClick={() => {
                                                    setEditSettingObj(bundleTitle);
                                                    setEditingKey('bundle-title');
                                                    setShowTitleEditModal(true);
                                                }}
                                                style={{ background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', display: 'flex' }}
                                            >
                                                <FaEdit size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {product.bundleProducts.map((p, idx) => (
                                            <div 
                                                key={idx} 
                                                className="bundle-item-clickable"
                                                onClick={() => navigate(`/product/${p._id || p.id}`)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '15px',
                                                    background: '#fff',
                                                    padding: '10px',
                                                    borderRadius: '16px',
                                                    border: '1px solid #f1f5f9',
                                                    boxShadow: '0 4px 66px rgba(0,0,0,0.02)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                <div style={{ width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '1px solid #e2e8f0' }}>
                                                    <img src={p.mainImage || p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>{typeof p.nom === 'object' ? (p.nom[appLanguage] || p.nom.fr) : p.nom}</h4>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{p.prix?.toFixed(2)} DT</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Confirmation Window */}
                        <div style={{ background: '#fff', padding: '30px', borderRadius: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.02)' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaClipboardList style={{ color: '#D4AF37' }} />
                                {getTranslated(customerDetailsTitle).toUpperCase()}
                                {isAdmin && (
                                    <button
                                        onClick={() => {
                                            setEditSettingObj(customerDetailsTitle);
                                            setEditingKey('customer-details-title');
                                            setShowTitleEditModal(true);
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem', padding: '5px' }}
                                    >
                                        <FaEdit />
                                    </button>
                                )}
                            </h3>

                            <form onSubmit={handlePurchase}>
                                <div className="pd-inputs-grid">
                                    <div className="pd-input-group">
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                                            {(getTranslated(customerFormLabels.name) || t.name).toUpperCase()}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="..."
                                            style={{ width: '100%', padding: '14px 20px', borderRadius: '14px', border: '2px solid #000000', background: '#f8fafc', outline: 'none' }}
                                            value={customerDetails.name}
                                            onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="pd-input-group">
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                                            {(getTranslated(customerFormLabels.whatsapp) || t.whatsapp).toUpperCase()}
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="+216..."
                                            style={{ width: '100%', padding: '14px 20px', borderRadius: '14px', border: '2px solid #000000', background: '#f8fafc', outline: 'none' }}
                                            value={customerDetails.whatsapp}
                                            onChange={e => setCustomerDetails({ ...customerDetails, whatsapp: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pd-input-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                                        {(getTranslated(customerFormLabels.address) || t.address).toUpperCase()}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="..."
                                        style={{ width: '100%', padding: '14px 20px', borderRadius: '14px', border: '2px solid #000000', background: '#f8fafc', outline: 'none' }}
                                        value={customerDetails.address}
                                        onChange={e => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                                        required
                                    />
                                </div>



                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', padding: '15px 25px', background: '#f8fafc', borderRadius: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}><FaMinus size={10} /></button>
                                        <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>{quantity}</span>
                                        <button type="button" onClick={() => setQuantity(q => q + 1)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}><FaPlus size={10} /></button>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800' }}>TOTAL À PAYER</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>{(product.prix * quantity).toFixed(2)} DT</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px', marginTop: '-15px' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#22c55e', textAlign: 'center' }}>{getTranslated(freeDeliveryText)}</span>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setEditSettingObj(freeDeliveryText);
                                                setEditingKey('free-delivery-text');
                                                setShowTitleEditModal(true);
                                            }}
                                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', padding: '2px', display: 'flex', alignItems: 'center' }}
                                        >
                                            <FaEdit />
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="creative-pulsing-btn"
                                    disabled={isSubmitting}
                                    style={{
                                        width: '100%',
                                        padding: '20px',
                                        borderRadius: '20px',
                                        background: 'linear-gradient(135deg, #D4AF37, #B48A1B)',
                                        color: '#fff',
                                        border: 'none',
                                        fontSize: '1.1rem',
                                        fontWeight: '900',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        boxShadow: '0 15px 35px rgba(212, 175, 55, 0.3)'
                                    }}
                                >
                                    {isSubmitting ? <div className="loader small"></div> : <><FaShoppingCart /> {t.buy}</>}
                                </button>

                                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                    <a
                                        href={`https://wa.me/+216XXXXXXXX?text=Je suis intéressé par le produit: ${currentProductName}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: '#22c55e', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <FaWhatsapp /> Commander via WhatsApp
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Edit Modal */}
            {showEditModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: '600px', borderRadius: '32px', padding: '40px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b' }}>Modifier le produit</h2>
                            <button onClick={() => setShowEditModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}>×</button>
                        </div>

                        <form onSubmit={handleUpdateProduct}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div className="pd-input-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '8px' }}>PRIX (DT)</label>
                                    <input type="number" step="0.01" value={editForm.prix} onChange={e => setEditForm({ ...editForm, prix: parseFloat(e.target.value) })} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9' }} />
                                </div>
                                <div className="pd-input-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '8px' }}>CATÉGORIE (FR)</label>
                                    <input type="text" value={editForm.categorie.fr} onChange={e => setEditForm({ ...editForm, categorie: { ...editForm.categorie, fr: e.target.value } })} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9' }} />
                                </div>
                            </div>

                            <div className="pd-input-group" style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                                    {appLanguage === 'ar' ? 'اسم المنتج' : 'NOM DU PRODUIT'} ({appLanguage.toUpperCase()})
                                </label>
                                <input
                                    type="text"
                                    dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                                    value={editForm.nom[appLanguage] || ''}
                                    onChange={e => setEditForm({ ...editForm, nom: { ...editForm.nom, [appLanguage]: e.target.value } })}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9' }}
                                />
                            </div>

                            <div className="pd-input-group" style={{ marginBottom: '30px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                                    {appLanguage === 'ar' ? 'الوصف' : 'DESCRIPTION'} ({appLanguage.toUpperCase()})
                                </label>
                                <textarea
                                    dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                                    value={editForm.description[appLanguage] || ''}
                                    onChange={e => setEditForm({ ...editForm, description: { ...editForm.description, [appLanguage]: e.target.value } })}
                                    style={{ width: '100%', height: '150px', padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9', resize: 'none' }}
                                />
                            </div>

                            <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '18px', borderRadius: '18px', background: '#D4AF37', color: '#fff', border: 'none', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 25px rgba(212, 175, 55, 0.3)' }}>
                                {isSubmitting ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '32px', padding: '40px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ width: '80px', height: '80px', background: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', fontSize: '2rem' }}>
                            <FaTrash />
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e293b', marginBottom: '15px' }}>
                            {appLanguage === 'ar' ? 'هل أنت متأكد؟' : 'Êtes-vous sûr ?'}
                        </h2>
                        <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '30px' }}>
                            {appLanguage === 'ar' ? 'سيتم حذف هذا المنتج نهائياً من المتجر.' : 'Ce produit sera définitivement supprimé de la boutique.'}
                        </p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#fff', color: '#64748b', fontWeight: '800', cursor: 'pointer' }}
                            >
                                {appLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)' }}
                            >
                                {isSubmitting ? '...' : (appLanguage === 'ar' ? 'حذف' : 'Supprimer')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Gallery Picker Modal */}
            {showImageGallery && (() => {
                // pendingSelection: null means "all selected"; otherwise a Set of chosen global indices
                const pending = pendingSelection === null
                    ? new Set(allImages.map((_, i) => i))
                    : pendingSelection;
                const allSelected = pending.size === allImages.length;
                const noneSelected = pending.size === 0;

                const toggleIdx = (idx) => {
                    const next = new Set(pending);
                    if (next.has(idx)) { next.delete(idx); } else { next.add(idx); }
                    setPendingSelection(next);
                };

                const applySelection = async () => {
                    const isAll = pending.size === allImages.length;
                    const newSelection = isAll ? null : new Set(pending);
                    setSelectedImgIndices(newSelection);

                    // Save to DB via PATCH /api/products/:id/carousel-filter
                    try {
                        const urlsToSave = isAll
                            ? [] // empty = show all
                            : allImages.filter((_, idx) => pending.has(idx));
                        const endpoint = product.isOffer ? 'offers' : 'products';
                        await fetch(`${BASE_URL}/api/${endpoint}/${product._id || id}/carousel-filter`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ visibleCarouselImages: urlsToSave })
                        });
                    } catch (e) {
                        console.error('Failed to save carousel filter:', e);
                    }

                    setActiveImageIndex(0);
                    setIsAutoPlayEnabled(false);
                    setShowImageGallery(false);
                    setPendingSelection(null);
                };

                const cancelModal = () => {
                    setShowImageGallery(false);
                    setPendingSelection(null);
                };

                return (
                    <div
                        onClick={cancelModal}
                        style={{
                            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(15, 23, 42, 0.78)', zIndex: 30000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '20px', backdropFilter: 'blur(12px)',
                            animation: 'pdGalleryFadeIn 0.35s ease'
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#fff', width: '100%', maxWidth: '860px',
                                maxHeight: '90vh', borderRadius: '32px',
                                boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
                                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                                animation: 'pdGallerySlideUp 0.4s cubic-bezier(0.16,1,0.3,1)'
                            }}
                        >
                            {/* ── Header ── */}
                            <div style={{
                                padding: '20px 28px', display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9',
                                flexShrink: 0, gap: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: 'rgba(212,175,55,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#D4AF37', fontSize: '1.1rem', flexShrink: 0
                                    }}>
                                        <FaThLarge />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.05rem', color: '#0f172a' }}>
                                            {appLanguage === 'ar' ? 'اختر الصور للكاروسال' : 'Sélectionner les photos du carousel'}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                                            {pending.size} / {allImages.length} {appLanguage === 'ar' ? 'صورة محددة' : 'photo(s) sélectionnée(s)'}
                                        </p>
                                    </div>
                                </div>

                                {/* Select All / Deselect All */}
                                <div style={{ display: 'flex', gap: '8px', marginInlineStart: 'auto', flexShrink: 0 }}>
                                    <button
                                        onClick={() => setPendingSelection(new Set(allImages.map((_, i) => i)))}
                                        disabled={allSelected}
                                        style={{
                                            padding: '7px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
                                            background: allSelected ? '#f8fafc' : '#fff', color: allSelected ? '#cbd5e1' : '#0f172a',
                                            fontWeight: '700', fontSize: '0.75rem', cursor: allSelected ? 'default' : 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {appLanguage === 'ar' ? 'الكل' : 'Tout sélect.'}
                                    </button>
                                    <button
                                        onClick={() => setPendingSelection(new Set())}
                                        disabled={noneSelected}
                                        style={{
                                            padding: '7px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
                                            background: noneSelected ? '#f8fafc' : '#fff', color: noneSelected ? '#cbd5e1' : '#ef4444',
                                            fontWeight: '700', fontSize: '0.75rem', cursor: noneSelected ? 'default' : 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {appLanguage === 'ar' ? 'إلغاء الكل' : 'Tout désél.'}
                                    </button>
                                </div>

                                <button
                                    onClick={cancelModal}
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: '#f8fafc', border: '1px solid #e2e8f0',
                                        color: '#64748b', cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1rem', transition: 'all 0.25s', flexShrink: 0
                                    }}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* ── Image Grid ── */}
                            <div style={{
                                overflowY: 'auto', padding: '20px 24px', flexGrow: 1,
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
                                gap: '14px', alignContent: 'start'
                            }}>
                                {allImages.map((img, idx) => {
                                    const isChecked = pending.has(idx);
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => toggleIdx(idx)}
                                            style={{
                                                borderRadius: '16px', overflow: 'hidden',
                                                cursor: 'pointer', position: 'relative',
                                                border: isChecked ? '2.5px solid #D4AF37' : '2.5px solid #e2e8f0',
                                                boxShadow: isChecked
                                                    ? '0 0 0 4px rgba(212,175,55,0.18), 0 8px 20px rgba(0,0,0,0.08)'
                                                    : '0 4px 10px rgba(0,0,0,0.05)',
                                                transition: 'all 0.22s',
                                                aspectRatio: '1 / 1',
                                                opacity: isChecked ? 1 : 0.55,
                                            }}
                                        >
                                            <img
                                                src={img} alt={`Photo ${idx + 1}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                            />

                                            {/* Checkbox indicator */}
                                            <div style={{
                                                position: 'absolute', top: '10px', right: '10px',
                                                width: '26px', height: '26px', borderRadius: '8px',
                                                background: isChecked ? '#D4AF37' : 'rgba(255,255,255,0.85)',
                                                border: isChecked ? '2px solid #D4AF37' : '2px solid rgba(0,0,0,0.12)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                                            }}>
                                                {isChecked && (
                                                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                                                        <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Number badge */}
                                            <div style={{
                                                position: 'absolute', bottom: '8px', left: '8px',
                                                background: 'rgba(15,23,42,0.6)', color: '#fff',
                                                borderRadius: '7px', padding: '2px 8px',
                                                fontSize: '0.62rem', fontWeight: '800',
                                                backdropFilter: 'blur(4px)'
                                            }}>
                                                {idx + 1}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── Footer / Apply ── */}
                            <div style={{
                                padding: '16px 28px', borderTop: '1px solid #f1f5f9',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                flexShrink: 0, gap: '12px', background: '#fafbfc'
                            }}>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>
                                    {pending.size === 0
                                        ? (appLanguage === 'ar' ? '⚠️ حدد صورة واحدة على الأقل' : '⚠️ Sélectionnez au moins 1 photo')
                                        : (appLanguage === 'ar'
                                            ? `${pending.size} صورة ستظهر في الكاروسال`
                                            : `${pending.size} photo(s) affichée(s) dans le carousel`)
                                    }
                                </p>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={cancelModal}
                                        style={{
                                            padding: '11px 22px', borderRadius: '14px',
                                            border: '1px solid #e2e8f0', background: '#fff',
                                            color: '#64748b', fontWeight: '700', fontSize: '0.85rem',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        {appLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                                    </button>
                                    <button
                                        onClick={applySelection}
                                        disabled={pending.size === 0}
                                        style={{
                                            padding: '11px 28px', borderRadius: '14px', border: 'none',
                                            background: pending.size === 0 ? '#e2e8f0' : '#D4AF37',
                                            color: pending.size === 0 ? '#94a3b8' : '#fff',
                                            fontWeight: '900', fontSize: '0.85rem',
                                            cursor: pending.size === 0 ? 'not-allowed' : 'pointer',
                                            boxShadow: pending.size > 0 ? '0 8px 20px rgba(212,175,55,0.3)' : 'none',
                                            transition: 'all 0.25s',
                                            display: 'flex', alignItems: 'center', gap: '8px'
                                        }}
                                    >
                                        <FaCheckCircle style={{ fontSize: '0.9rem' }} />
                                        {appLanguage === 'ar' ? 'تطبيق الاختيار' : 'Appliquer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <style>{`
                            @keyframes pdGalleryFadeIn { from { opacity: 0; } to { opacity: 1; } }
                            @keyframes pdGallerySlideUp { from { opacity: 0; transform: scale(0.96) translateY(24px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                            .pd-gallery-btn:hover { background: rgba(255,255,255,1) !important; box-shadow: 0 6px 20px rgba(212,175,55,0.2) !important; transform: scale(1.03) !important; }
                        `}</style>
                    </div>
                );
            })()}


            {/* Order Success Modal */}
            {showOrderSuccessModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '40px', padding: '50px 40px', position: 'relative', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', animation: 'modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <button
                            onClick={() => setShowOrderSuccessModal(false)}
                            style={{ position: 'absolute', top: '25px', right: '25px', width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: 'all 0.2s' }}
                        >
                            <FaTimes />
                        </button>

                        <div style={{ width: '90px', height: '90px', background: '#f0fdf4', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', fontSize: '2.5rem', boxShadow: '0 10px 20px rgba(34, 197, 94, 0.1)' }}>
                            <FaCheckCircle />
                        </div>

                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '2.2rem', color: '#D4AF37', marginBottom: '20px', fontWeight: '700' }}>
                            {appLanguage === 'ar' ? 'تم الطلب بنجاح!' : 'Commande Réussie !'}
                        </h2>

                        <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '40px', maxWidth: '380px', margin: '0 auto 40px' }}>
                            {appLanguage === 'ar' ? (
                                <>لقد تم تسجيل طلبكم رقم <strong style={{ color: '#0f172a' }}>{lastOrderId}</strong> بنجاح. سنرسل لكم تأكيداً قريباً.</>
                            ) : (
                                <>Votre commande N° <strong style={{ color: '#0f172a' }}>{lastOrderId}</strong> a été enregistrée. Un email de confirmation vous sera envoyé sous peu.</>
                            )}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                style={{ width: '100%', padding: '18px', borderRadius: '20px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.2)', transition: 'transform 0.2s' }}
                                onClick={() => {
                                    setShowOrderSuccessModal(false);
                                    setShowCommentModal(true);
                                }}
                            >
                                <FaCommentAlt /> {appLanguage === 'ar' ? 'ترك تعليق' : 'LAISSER UN COMMENTAIRE'}
                            </button>

                            <button
                                onClick={() => setShowOrderSuccessModal(false)}
                                style={{ width: '100%', padding: '18px', borderRadius: '20px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}
                            >
                                {appLanguage === 'ar' ? 'إغلاق' : 'FERMER'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Commentary Modal */}
            {showCommentModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: '520px', borderRadius: '40px', padding: '50px 40px', position: 'relative', textAlign: 'center', boxShadow: '0 40px 80px rgba(0,0,0,0.2)', animation: 'modalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <button
                            onClick={() => setShowCommentModal(false)}
                            style={{ position: 'absolute', top: '25px', right: '25px', width: '45px', height: '45px', borderRadius: '50%', background: '#f8fafc', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}
                        >
                            <FaTimes />
                        </button>

                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '2.2rem', color: '#D4AF37', marginBottom: '10px', fontWeight: '700' }}>
                            {appLanguage === 'ar' ? 'رأيكم يهمنا كثيراً !' : 'Votre avis nous importe beaucoup !'}
                        </h2>

                        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px' }}>
                            {appLanguage === 'ar' ? 'تقييمكم:' : 'Votre note:'}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '35px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setCommentRating(star)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '2.4rem', color: star <= commentRating ? '#D4AF37' : '#e2e8f0', transition: 'all 0.2s transform', transform: star <= commentRating ? 'scale(1.1)' : 'scale(1)' }}
                                >
                                    {star <= commentRating ? <FaStar /> : <FaRegStar />}
                                </button>
                            ))}
                        </div>

                        <p style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                            {appLanguage === 'ar' ? 'اكتب تعليقك هنا...' : 'TAPEZ VOTRE COMMENTAIRE ICI...'}
                        </p>

                        <textarea
                            placeholder={appLanguage === 'ar' ? 'اكتب تعليقك هنا...' : 'Tapez votre commentaire ici...'}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            style={{ width: '100%', height: '150px', borderRadius: '24px', padding: '20px', border: '2px solid #f1f5f9', background: '#f8fafc', fontSize: '1.05rem', color: '#334155', outline: 'none', resize: 'none', marginBottom: '35px', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <button
                                onClick={handleSendComment}
                                style={{ width: '100%', padding: '20px', borderRadius: '24px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 15px 30px rgba(15, 23, 42, 0.2)' }}
                            >
                                {appLanguage === 'ar' ? 'إرسال التعليق' : 'ENVOYER LE COMMENTAIRE'}
                            </button>

                            <button
                                onClick={() => setShowCommentModal(false)}
                                style={{ width: '100%', padding: '20px', borderRadius: '24px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer' }}
                            >
                                {appLanguage === 'ar' ? 'إلغاء' : 'ANNULER'}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <style>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

            {showTitleEditModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: '450px', borderRadius: '32px', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e293b', marginBottom: '25px', textAlign: 'center' }}>
                            {appLanguage === 'ar' ? 'تعديل عنوان القسم' : 'Modifier le titre du section'}
                        </h3>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#64748b', marginBottom: '8px', textAlign: appLanguage === 'ar' ? 'right' : 'left' }}>
                                {appLanguage === 'ar' ? 'العنوان' : 'TITRE'} ({appLanguage.toUpperCase()})
                            </label>
                            <input
                                type="text"
                                value={editSettingObj[appLanguage] || ''}
                                onChange={e => setEditSettingObj({ ...editSettingObj, [appLanguage]: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '14px 20px',
                                    borderRadius: '14px',
                                    border: '2px solid #f1f5f9',
                                    background: '#f8fafc',
                                    outline: 'none',
                                    textAlign: appLanguage === 'ar' ? 'right' : 'left',
                                    dir: appLanguage === 'ar' ? 'rtl' : 'ltr'
                                }}
                                placeholder={editingKey === 'customer-details-title'
                                    ? (appLanguage === 'ar' ? 'معلومات العميل' : 'COORDONNÉES DU CLIENT')
                                    : editingKey === 'free-delivery-text'
                                        ? (appLanguage === 'ar' ? 'نص التوصيل' : 'Texte de livraison')
                                        : (appLanguage === 'ar' ? 'وصف المنتج' : 'DESCRIPTION')}
                            />
                        </div>

                        {editingKey === 'customer-details-title' && (
                            <div style={{ padding: '20px', background: '#fefce8', borderRadius: '20px', border: '1px dashed #fcd34d', marginBottom: '25px' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#854d0e', marginBottom: '15px', fontWeight: '800' }}>
                                    {appLanguage === 'ar' ? 'تعديل أسماء الخانات' : 'EDIT FIELD LABELS'}
                                </h4>

                                <div style={{ display: 'grid', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#a16207', display: 'block', marginBottom: '5px' }}>{appLanguage === 'ar' ? 'الاسم' : 'NAME'}</label>
                                        <input
                                            type="text"
                                            value={customerFormLabels.name[appLanguage] || ''}
                                            onChange={e => {
                                                const newLabels = { ...customerFormLabels };
                                                newLabels.name[appLanguage] = e.target.value;
                                                setCustomerFormLabels(newLabels);
                                            }}
                                            style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', border: '1px solid #fde68a', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#a16207', display: 'block', marginBottom: '5px' }}>WHATSAPP</label>
                                        <input
                                            type="text"
                                            value={customerFormLabels.whatsapp[appLanguage] || ''}
                                            onChange={e => {
                                                const newLabels = { ...customerFormLabels };
                                                newLabels.whatsapp[appLanguage] = e.target.value;
                                                setCustomerFormLabels(newLabels);
                                            }}
                                            style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', border: '1px solid #fde68a', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#a16207', display: 'block', marginBottom: '5px' }}>{appLanguage === 'ar' ? 'العنوان' : 'ADDRESS'}</label>
                                        <input
                                            type="text"
                                            value={customerFormLabels.address[appLanguage] || ''}
                                            onChange={e => {
                                                const newLabels = { ...customerFormLabels };
                                                newLabels.address[appLanguage] = e.target.value;
                                                setCustomerFormLabels(newLabels);
                                            }}
                                            style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', border: '1px solid #fde68a', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const res = await fetch(`${BASE_URL}/api/settings/customer-form-labels`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ value: customerFormLabels })
                                                });
                                                if (res.ok) showAlert(appLanguage === 'ar' ? 'تم حفظ الأسماء' : 'Libellés enregistrés', 'success');
                                            } catch (err) { }
                                        }}
                                        style={{ fontSize: '0.75rem', fontWeight: '800', color: '#854d0e', background: '#fef9c3', border: '1px solid #fde68a', padding: '5px 15px', borderRadius: '14px', cursor: 'pointer' }}
                                    >
                                        {appLanguage === 'ar' ? 'حفظ الأسماء فقط' : 'SAVE LABELS ONLY'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={() => setShowTitleEditModal(false)}
                                style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '800', cursor: 'pointer' }}
                            >
                                {appLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button
                                onClick={handleSaveTitle}
                                disabled={isSavingSetting}
                                style={{ flex: 1.5, padding: '16px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #D4AF37, #B48A1B)', color: '#fff', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                {isSavingSetting ? <div className="loader small"></div> : (appLanguage === 'ar' ? 'حفظ التعديلات' : 'Enregistrer')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .product-details-container {
                    padding: 40px 5%;
                    margin: 0 auto;
                    max-width: 1400px;
                    width: 100%;
                }
                .pd-inputs-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 20px;
                }
                @media (max-width: 768px) {
                    .pd-inputs-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (min-width: 1024px) {
                    .product-details-container {
                        width: 92%;
                        padding: 40px 0;
                    }
                }
                .pd-input-group input:focus, .pd-input-group textarea:focus {
                    border-color: #D4AF37 !important;
                    background: #fff !important;
                }
                @media (max-width: 992px) {
                    .product-details-layout { 
                        grid-template-columns: 1fr !important; 
                        margin-top: 100px !important; 
                        gap: 30px !important;
                    }
                    .media-section { 
                        height: auto !important; 
                        flex-direction: column-reverse !important; 
                        gap: 20px !important;
                    }
                    .main-carousel {
                        height: 500px !important;
                        order: 2;
                    }
                    .side-gallery { 
                        width: 100% !important; 
                        flex-direction: row !important; 
                        height: auto !important; 
                        overflow-x: auto !important; 
                        padding: 10px 0 !important;
                        order: 1;
                        justify-content: flex-start;
                        border-bottom: 1px solid rgba(0,0,0,0.05);
                        margin-bottom: 10px;
                        -webkit-overflow-scrolling: touch;
                    }
                    .side-gallery::-webkit-scrollbar {
                        height: 3px;
                    }
                    .side-gallery::-webkit-scrollbar-thumb {
                        background: #D4AF37;
                        border-radius: 10px;
                    }
                    .side-gallery > div { 
                        width: 85px !important; 
                        height: 110px !important; 
                        flex-shrink: 0 !important; 
                    }
                    .side-gallery .pd-add-img-btn {
                        width: 85px !important;
                        height: 110px !important;
                        flex-shrink: 0 !important;
                    }
                    .price-stack {
                        display: flex;
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 4px !important;
                    }
                    .old-price-pd {
                        font-size: 1rem !important;
                    }
                }
                @media (max-width: 480px) {
                    .main-carousel { height: 320px !important; }
                    .product-details-layout { margin-top: 80px !important; }
                    .side-gallery > div, .side-gallery .pd-add-img-btn { 
                        width: 70px !important; 
                        height: 65px !important; 
                    }
                }
                @media (max-width: 425px) {
                    .media-section { flex-direction: column !important; }
                    .main-carousel { order: 1; height: 380px !important; }
                    .side-gallery { 
                        order: 2; 
                        margin-top: 10px; 
                        border-bottom: none; 
                        border-top: 1px solid rgba(0,0,0,0.05); 
                        padding: 15px 0 !important;
                        flex-wrap: wrap !important;
                        overflow-x: visible !important;
                        gap: 12px !important;
                        justify-content: center !important;
                    }
                    .side-gallery > div, .side-gallery .pd-add-img-btn { 
                        width: calc(33.33% - 10px) !important; 
                        min-width: 70px;
                        height: 100px !important; 
                    }
                    .info-section h1 { font-size: 1.4rem !important; }
                    .pd-delete-img-btn { width: 22px !important; height: 22px !important; font-size: 0.6rem !important; }
                }
                @media (max-width: 360px) {
                    .main-carousel { height: 280px !important; }
                    .side-gallery > div, .side-gallery .pd-add-img-btn { 
                        width: 60px !important; 
                        height: 80px !important; 
                    }
                    .info-section h1 { font-size: 1.15rem !important; }
                    .product-details-container { padding: 20px 3% !important; }
                }
                .loader.small {
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top: 3px solid #fff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .bundle-item-clickable:hover {
                    border-color: #D4AF37 !important;
                    box-shadow: 0 10px 20px rgba(212, 175, 55, 0.1) !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
};

export default ProductDetails;
