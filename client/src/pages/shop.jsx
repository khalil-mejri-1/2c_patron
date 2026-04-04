import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from 'react-router-dom';
import { FaShoppingCart, FaSearch, FaChevronDown, FaTimes, FaUser, FaMapMarkerAlt, FaPhoneAlt, FaMinusCircle, FaPlusCircle, FaSpinner, FaCheckCircle, FaCommentAlt, FaStar, FaRegStar, FaChevronLeft, FaChevronRight, FaEdit, FaSave, FaTrash, FaPlus, FaWhatsapp, FaFacebookMessenger, FaRobot, FaPaperPlane, FaCloudUploadAlt, FaLayerGroup, FaCheck, FaLongArrowAltRight, FaTags, FaHandPointer } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { useAlert } from '../context/AlertContext';
import './shop_redesign.css';

// 🚨 قائمة الفئات النهائية بناءً على طلبك
const categoriesFr = ['Tous', 'Homme', 'Famme', 'Enfant'];
const categoriesAr = ['الكل', 'رجال', 'نساء', 'أطفال'];
const categoriesEn = ['All', 'Men', 'Women', 'Children'];
import BASE_URL from '../apiConfig';

// ⚠️ Assurez-وا أن هذه URL صحيحة
const API_URL = `${BASE_URL}/api/products`;
const API_COMMAND_URL = `${BASE_URL}/api/commands`;
const API_COMMENTAIRE_URL = `${BASE_URL}/api/commentaires`;

// 🌐 كائن الترجمة - تم تحديث مفاتيح الأخطاء
const translations = {
    ar: {
        categories: categoriesAr,
        categoryMapping: { 'Tous': 'الكل', 'Homme': 'رجال', 'Famme': 'نساء', 'Enfant': 'أطفال' },
        unitPrice: "/ وحدة",
        modalTitleGuest: "إرسال طلبك (زائر)",
        modalTitleUser: "تأكيد طلبك",
        qtyLabel: "الكمية :",
        total: "الإجمالي :",
        contactInfo: "بيانات الاتصال الخاصة بك",
        namePlaceholder: "الاسم واللقب (إلزامي)",
        addressPlaceholder: "العنوان (إلزامي)",
        phonePlaceholder: "رقم الهاتف (إلزامي)",
        validationError: "يرجى ملء جميع معلومات الاتصال (الاسم، العنوان، الهاتف).",
        submitBtn: "تأكيد الطلب",
        submitBtnGuest: "إرسال الطلب",
        submitting: "جاري الإرسال...",
        cancelBtn: "إلغاء",
        loading: "جاري تحميل المنتجات...",
        loadingTitle: "تحميل",
        error: (err) => `❌ **خطأ :** ${err}`,
        collectionTitle: "مجموعة",
        collectionAccent: "حصرية",
        collectionSubtitle: "اكتشف أحدث منتجاتنا والأدوات الأساسية للخياطة الراقية.",
        toggleFiltersClose: "إغلاق الفلاتر",
        toggleFiltersShow: (cat) => `عرض الفلاتر (${cat})`,
        sidebarTitle: "تصفية",
        navTitle: "الفئات  ",
        searchPlaceholder: "البحث عن منتج...",
        filterCategory: (cat) => `${cat}`,
        resetFilters: "إعادة تعيين",
        infoBar: (filtered, total) => `عرض ${filtered} منتج(ات) من أصل ${total}`,
        addToCart: "شراء",
        noResultsTitle: "😞 **لم يتم العثور على أي منتج**",
        noResultsMsg: "للفلاتر المحددة.",
        successTitle: "تم إرسال الطلب بنجاح!",
        successMessage: (ref) => `تم تسجيل طلبك بنجاح. سيتصل بك مسؤول في أقرب وقت لتأكيد عملية الشراء.
        <br/><br/>
        **مرجع الطلب :** **${ref || 'N/A'}**`,
        feedbackBtn: "ترك تعليق على الخدمة",
        closeBtn: "إغلاق",
        feedbackModalTitle: "رأيك يهمنا كثيرًا! 📝",
        feedbackModalSubtitle: "شارك تجربتك مع خدمتنا. ما رأيك في عملية الشراء؟",
        feedbackModalSmallText: (name) => `سيتم تسجيل اسمك كـ : **${name || 'غير محدد'}**`,
        feedbackPlaceholder: "اكتب تعليقك هنا...",
        feedbackErrorName: "تعذر العثور على اسم العميل. يرجى محاولة الطلب مرة أخرى.",
        // 🛑 رسالة الخطأ الجديدة التي ستظهر أسفل التعليق
        feedbackErrorLength: "يجب عليك إما **إضافة تقييم بالنجوم** أو كتابة تعليق لا يقل عن **5 أحرف**.",
        feedbackErrorSubmit: (err) => `خطأ في التسجيل : ${err}`,
        feedbackSubmit: "إرسال التعليق",
        feedbackSuccessTitle: "شكرًا لك على رأيك الثمين! 🌟",
        feedbackSuccessMsg: "تم تسجيل تعليقك. رضاك هو أعظم مكافأة لنا ويساعدنا على التحسن المستمر.",
        backToShop: "العودة إلى المتجر",
        networkError: "خطأ في الشبكة. الرجاء المحاولة مرة أخرى.",
        ratingLabel: "تقييمك للخدمة:",
        commentFormTitle: "إضافة تقييم/تعليق",
        commentSuccessMsg: "تم إرسال تعليقك بنجاح. شكراً لك!",
        commentErrorMsg: "حدث خطأ أثناء إرسال التعليق. الرجاء المحاولة مجدداً.",
        sendCommentBtn: "إرسال التعليق",
        skipCommentBtn: "تخطي",

    },
    fr: {
        categories: categoriesFr,
        categoryMapping: { 'Tous': 'Tous', 'Homme': 'Homme', 'Famme': 'Famme', 'Enfant': 'Enfant' },
        unitPrice: "/ unité",
        navTitle: "catégorie  ",
        modalTitleGuest: "Passer votre commande (Visiteur)",
        modalTitleUser: "Confirmer votre commande ",
        qtyLabel: "Quantité :",
        total: "Total :",
        contactInfo: "Vos informations de contact",
        namePlaceholder: "Nom et Prénom (Obligatoire)",
        addressPlaceholder: "Adresse (Obligatoire)",
        phonePlaceholder: "Numéro de Téléphone (Obligatoire)",
        validationError: "Veuillez remplir toutes les informations de contact (Nom, Adresse, Téléphone).",
        submitBtn: "Confirmer la Commande",
        submitBtnGuest: "Soumettre la Demande",
        submitting: "Envoi...",
        cancelBtn: "Annuler",
        loading: "Chargement des produits...",
        loadingTitle: "Chargement",
        error: (err) => `❌ **Erreur :** ${err}`,
        collectionTitle: "Collection",
        collectionAccent: "Exclusive",
        collectionSubtitle: "Découvrez nos nouveautés et les outils essentiels pour la haute couture.",
        toggleFiltersClose: "Fermer les filtres",
        toggleFiltersShow: (cat) => `Afficher les filtres (${cat})`,
        sidebarTitle: "Filtrer",
        searchPlaceholder: "Rechercher un produit...",
        filterCategory: (cat) => `${cat} `,
        resetFilters: "Réinitialiser",
        infoBar: (filtered, total) => `Affichage de ${filtered} produit(s) sur ${total}`,
        addToCart: "Achat",
        noResultsTitle: "😞 **Aucun produit trouvé**",
        noResultsMsg: "pour les filtres sélectionnés.",
        successTitle: "Commande Envoyée avec Succès !",
        successMessage: (ref) => `Votre commande a été enregistrée avec succès. Un responsable vous contactera dans les plus brefs délais pour confirmer votre achat.
        <br/><br/>
        **Référence de la commande :** **${ref || 'N/A'}**`,
        feedbackBtn: "Laissez un Commentaire",
        closeBtn: "Fermer",
        feedbackModalTitle: "Votre Avis Compte Énormément ! 📝",
        feedbackModalSubtitle: "Partagez votre expérience avec notre service. Qu'avez-vous pensé de l'achat ?",
        feedbackModalSmallText: (name) => `Votre nom sera enregistré comme : **${name || 'Non spécifié'}**`,
        feedbackPlaceholder: "Écrivez votre commentaire ici...",
        feedbackErrorName: "Nom du client introuvable. Veuillez réessayer de commander.",
        // 🛑 رسالة الخطأ الجديدة التي ستظهر أسفل التعليق
        feedbackErrorLength: "Vous devez soit **ajouter une note en étoiles** ou écrire un commentaire d'au moins **5 caractères**.",
        feedbackErrorSubmit: (err) => `Erreur d'enregistrement : ${err}`,
        feedbackSubmit: "Soumettre le Commentaire",
        feedbackSuccessTitle: "Merci pour votre Avis Précieux ! 🌟",
        feedbackSuccessMsg: "Votre commentaire a été enregistré. Votre **satisfaction** est notre plus belle récompense et nous aide à nous améliorer continuellement.",
        backToShop: "Retour à la Boutique",
        networkError: "Erreur de réseau. Veuillez réessayer.",
        ratingLabel: "Votre note pour le service:",
        commentFormTitle: "Ajouter une note/un commentaire",
        commentSuccessMsg: "Votre commentaire a été soumis avec succès. Merci !",
        commentErrorMsg: "Une erreur est survenue lors de l'envoi du commentaire. Veuillez réessayer.",
        sendCommentBtn: "Soumettre le Commentaire",
        skipCommentBtn: "Ignorer",

    },
    en: {
        categories: categoriesEn,
        categoryMapping: { 'Tous': 'All', 'Homme': 'Men', 'Famme': 'Women', 'Enfant': 'Children' },
        unitPrice: "/ unit",
        modalTitleGuest: "Place Your Order (Guest)",
        modalTitleUser: "Confirm Your Order",
        qtyLabel: "Quantity :",
        total: "Total :",
        contactInfo: "Your Contact Information",
        namePlaceholder: "First and Last Name (Required)",
        addressPlaceholder: "Address (Required)",
        phonePlaceholder: "Phone Number (Required)",
        validationError: "Please fill in all contact information (Name, Address, Phone).",
        submitBtn: "Confirm Order",
        submitBtnGuest: "Submit Request",
        submitting: "Submitting...",
        navTitle: "category  ",
        cancelBtn: "Cancel",
        loading: "Loading products...",
        loadingTitle: "Loading",
        error: (err) => `❌ **Error:** ${err}`,
        collectionTitle: "Exclusive",
        collectionAccent: "Collection",
        collectionSubtitle: "Discover our new arrivals and essential tools for haute couture.",
        toggleFiltersClose: "Close filters",
        toggleFiltersShow: (cat) => `Show filters (${cat})`,
        sidebarTitle: "Filter",
        searchPlaceholder: "Search for a product...",
        filterCategory: (cat) => `${cat} `,
        resetFilters: "Reset",
        infoBar: (filtered, total) => `Displaying ${filtered} product(s) out of ${total}`,
        addToCart: "Purchase",
        noResultsTitle: "😞 **No products found**",
        noResultsMsg: "for the selected filters.",
        successTitle: "Order Submitted Successfully!",
        successMessage: (ref) => `Your order has been successfully recorded. A representative will contact you shortly to confirm your purchase.
        <br/><br/>
        **Order Reference:** **${ref || 'N/A'}**`,
        feedbackBtn: "Leave a Service Review",
        closeBtn: "Close",
        feedbackModalTitle: "Your Review Matters Hugely! 📝",
        feedbackModalSubtitle: "Share your experience with our service. What did you think of the purchase?",
        feedbackModalSmallText: (name) => `Your name will be registered as: **${name || 'Unspecified'}**`,
        feedbackPlaceholder: "Write your comment here...",
        feedbackErrorName: "Client name not found. Please try ordering again.",
        // 🛑 رسالة الخطأ الجديدة التي ستظهر أسفل التعليق
        feedbackErrorLength: "You must either **add a star rating** or write a comment of at least **5 characters**.",
        feedbackErrorSubmit: (err) => `Registration Error: ${err}`,
        feedbackSubmit: "Submit Review",
        feedbackSuccessTitle: "Thank You for Your Valuable Feedback! 🌟",
        feedbackSuccessMsg: "Your comment has been recorded. Your **satisfaction** is our greatest reward and helps us continually improve.",
        backToShop: "Return to Shop",
        networkError: "Network error. Please try again.",
        ratingLabel: "Your service rating:",
        commentFormTitle: "Add a Rating/Review",
        commentSuccessMsg: "Your comment has been submitted successfully. Thank you!",
        commentErrorMsg: "An error occurred while submitting the comment. Please try again.",
        sendCommentBtn: "Submit Review",
        skipCommentBtn: "Skip",
    }
};

// ====================================================================
// مُكوِّن شريحة الصور (Image Carousel Component)
// ====================================================================

const ImageCarousel = ({ images, direction, height = '320px' }) => {
    // يجب التحقق من أن images هي مصفوفة وتحتوي على عناصر
    if (!images || images.length === 0) return null;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const goToPrevious = (e) => {
        e.stopPropagation();
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = (e) => {
        if (e) e.stopPropagation();
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    /* 
    // تأثير للانتقال التلقائي كل 4 ثوانٍ (تم إيقافه بناءً على طلب المستخدم)
    useEffect(() => {
        if (isHovered) return; // Pause on hover

        const interval = setInterval(() => {
            goToNext();
        }, 4000);
        return () => clearInterval(interval);
    }, [currentIndex, images.length, isHovered]);
    */

    const directionClass = direction === 'ar' ? 'rtl' : 'ltr';

    return (
        <div
            className="image-carousel-container"
            dir="ltr"
            style={{ height, width: '100%', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="carousel-inner"
                style={{
                    display: 'flex',
                    transition: 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    transform: `translateX(-${currentIndex * 100}%)`,
                    height: '100%',
                    width: '100%',
                    borderRadius: '16px'
                }}
            >
                {images.map((url, index) => (
                    <div key={index} className="carousel-item" style={{ width: '100%', height: '100%', flexShrink: 0 }}>
                        <img
                            src={url}
                            alt={`Slide ${index + 1}`}
                            className='product-grid-image'
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* أزرار التحكم في الكاروسيل - تظهر فقط إذا كان هناك أكثر من صورة */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="carousel-control-btn prev"
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            left: '12px',
                            background: 'rgba(0, 0, 0, 0.4)',
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)',
                            border: 'none',
                            color: '#fff',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            zIndex: 15,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <FaChevronLeft size={18} style={{ marginRight: '2px' }} />
                    </button>
                    <button
                        onClick={(e) => goToNext(e)}
                        className="carousel-control-btn next"
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            right: '12px',
                            background: 'rgba(0, 0, 0, 0.4)',
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)',
                            border: 'none',
                            color: '#fff',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            zIndex: 15,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <FaChevronRight size={18} style={{ marginLeft: '2px' }} />
                    </button>

                    <div className="carousel-dots-indicators" style={{ position: 'absolute', bottom: '15px', width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '6px', zIndex: 15 }}>
                        {images.map((_, index) => (
                            <span
                                key={index}
                                style={{
                                    display: 'inline-block',
                                    width: index === currentIndex ? '24px' : '8px',
                                    height: '8px',
                                    borderRadius: '10px',
                                    backgroundColor: index === currentIndex ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                                }}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                            ></span>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};


// ====================================================================
// OrderModalComponent (المعدل)
// ====================================================================

const OrderModalComponent = ({ selectedProduct, quantity, handleQuantityChange, closeOrderModal, isLoggedIn, currentUserEmail, onOrderSuccess, onCustomerDataUpdate, appLanguage, showAlert, isAdmin }) => {
    const t = translations[appLanguage] || translations.fr;

    const [customerData, setCustomerData] = useState({
        firstName: '',
        adresse: '',
        phone: ''
    });
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    // 💡 Add state for inner images to update UI instantly without full refresh
    const [innerImages, setInnerImages] = useState(selectedProduct.innerImages || []);
    const [isUploading, setIsUploading] = useState(false);

    const handleCustomerDataChange = (e) => {
        const { name, value } = e.target;
        const newData = { ...customerData, [name]: value };
        setCustomerData(newData);
        onCustomerDataUpdate(newData);
    };


    const handleConfirmOrder = async (e) => {
        e.preventDefault();

        if (!selectedProduct) return;

        const calculatedTotal = selectedProduct.price * quantity;

        const clientName = customerData.firstName;
        const clientPhone = customerData.phone;
        const shippingAddress = customerData.adresse;

        if (!clientName || clientName.trim() === '' || !shippingAddress || !clientPhone) {
            showAlert('warning', 'Validation', t.validationError);
            return;
        }

        setIsSubmittingOrder(true);

        const orderData = {
            totalAmount: calculatedTotal,
            items: [{
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                // 💡 يستخدم selectedProduct.url الذي يحمل mainImage أو image القديم
                productImage: selectedProduct.url,
                quantity: quantity,
                price: selectedProduct.price,
            }],
            clientName: clientName,
            clientPhone: clientPhone,
            shippingAddress: shippingAddress,
            ...(isLoggedIn && { clientEmail: currentUserEmail }),
        };

        try {
            const response = await fetch(API_COMMAND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (response.ok) {
                onOrderSuccess(result.commandId);
            } else {
                console.error("Échec de l'enregistrement de la commande:", result);
                showAlert('error', 'Erreur serveur', result.message || t.networkError);
            }

        } catch (error) {
            console.error("Erreur de réseau lors de la soumission:", error);
            showAlert('error', 'Erreur de réseau', t.networkError);
        } finally {
            setIsSubmittingOrder(false);
        }
    };


    const totalPrice = (selectedProduct.price * quantity).toFixed(2);
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    return (
        <div className="modal-overlay">
            <div className="order-modal-content" dir={direction}>
                <button className="modal-close-btn" onClick={closeOrderModal} disabled={isSubmittingOrder}><FaTimes /></button>

                <h2 className="modal-title">
                    {isLoggedIn ? t.modalTitleUser : t.modalTitleGuest}
                </h2>

                <div className="product-summary">
                    <img src={selectedProduct.url} alt={selectedProduct.alt} className="summary-image" />
                    <div className="summary-details">
                        <p className="summary-name">{selectedProduct.name}</p>
                        <p className="summary-price">{selectedProduct.price.toFixed(2)} {selectedProduct.currency} {t.unitPrice}</p>
                    </div>
                </div>

                {/* 🆕 المكان الجديد للكاروسيل المتحرك */}
                {/* 💡 تم التعديل هنا: دمج الصورة الرئيسية مع الصور الثانوية والصور الداخلية المخصصة في الكاروسيل */}
                <ImageCarousel
                    images={selectedProduct.isOffer
                        ? selectedProduct.offerImages
                        : [selectedProduct.url, ...(selectedProduct.secondaryImages || []), ...innerImages].filter(Boolean)
                    }
                    direction={direction}
                    height="400px"
                />

                {/* 💡 Upload button for Inner Images (Visible to Admin Only) */}
                {isAdmin && !selectedProduct.isOffer && (
                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            id="premiumInnerUpload"
                            disabled={isUploading}
                            onChange={async (e) => {
                                const files = Array.from(e.target.files);
                                if (!files || files.length === 0) return;

                                setIsUploading(true);
                                try {
                                    const uploadedUrls = [];
                                    for (const file of files) {
                                        const formData = new FormData();
                                        formData.append('image', file);
                                        const res = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: formData });
                                        if (res.ok) {
                                            const data = await res.json();
                                            uploadedUrls.push(data.url);
                                        }
                                    }

                                    if (uploadedUrls.length > 0) {
                                        const newInnerImages = [...innerImages, ...uploadedUrls];
                                        setInnerImages(newInnerImages);
                                        // Save to DB
                                        fetch(`${BASE_URL}/api/products/${selectedProduct.id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ innerImages: newInnerImages })
                                        }).catch(err => console.error(err));

                                        // Update selected product object directly to persist before closing
                                        selectedProduct.innerImages = newInnerImages;

                                        showAlert('success', 'Succès', appLanguage === 'ar' ? `تم إضافة ${uploadedUrls.length} صور بنجاح` : `${uploadedUrls.length} images ajoutées avec succès`);
                                    }
                                } catch (err) {
                                    showAlert('error', 'Erreur', 'Erreur de connexion lors du téléchargement');
                                } finally {
                                    setIsUploading(false);
                                    e.target.value = null; // reset
                                }
                            }}
                            style={{ display: 'none' }}
                        />
                        <label
                            htmlFor="premiumInnerUpload"
                            style={{
                                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                color: '#D4AF37',
                                padding: '12px 24px',
                                borderRadius: '30px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: isUploading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                opacity: isUploading ? 0.7 : 1
                            }}
                        >
                            <FaCloudUploadAlt size={20} className={isUploading ? "spin-animation" : ""} />
                            {appLanguage === 'ar' ? (isUploading ? 'جاري الرفع...' : ' إضافة صور لمعرض هذه النافذة فقط (Admin)') : (isUploading ? 'Téléchargement...' : ' Ajouter des photos pour ce produit (Admin)')}
                        </label>
                    </div>
                )}

                {/* 💡 Exhibition of Inner Images for Admin to Delete/Manage */}
                {isAdmin && !selectedProduct.isOffer && innerImages.length > 0 && (
                    <div style={{ marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '10px' }}>
                            {appLanguage === 'ar' ? 'الصور الداخلية الحالية (يمكنك حذفها):' : 'Images internes actuelles (gestion):'}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {innerImages.map((url, idx) => (
                                <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                                    <img src={url} alt={`Inner ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!window.confirm(appLanguage === 'ar' ? 'هل أنت متأكد من حذف هذه الصورة؟' : 'Supprimer cette image?')) return;
                                            const newInnerImages = innerImages.filter((_, i) => i !== idx);
                                            setInnerImages(newInnerImages);
                                            // Save to DB
                                            fetch(`${BASE_URL}/api/products/${selectedProduct.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ innerImages: newInnerImages })
                                            }).catch(err => console.error(err));
                                            selectedProduct.innerImages = newInnerImages;
                                            showAlert('success', 'Succès', appLanguage === 'ar' ? 'تم حذف الصورة' : 'Image supprimée');
                                        }}
                                        style={{
                                            position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* 🔚 نهاية مربع رفع وإدارة الصور الداخلية */}

                <div className="quantity-control-group">
                    <div className="quantity-selector-mobile-row">
                        <label>{t.qtyLabel}</label>
                        <div className="quantity-controls">
                            <button type="button" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1 || isSubmittingOrder}>
                                <FaMinusCircle />
                            </button>
                            <span className="current-qty">{quantity}</span>
                            <button type="button" onClick={() => handleQuantityChange(1)} disabled={isSubmittingOrder}>
                                <FaPlusCircle />
                            </button>
                        </div>
                    </div>
                    <p className="total-price-display">
                        {t.total} <strong>{totalPrice} {selectedProduct.currency}</strong>
                    </p>
                </div>

                <form onSubmit={handleConfirmOrder}>
                    <div className="customer-form-group">
                        <h4 className="form-subtitle">{t.contactInfo}</h4>

                        <div className="input-row">
                            <div className="input-group">
                                <FaUser className="input-icon" />
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder={t.namePlaceholder}
                                    value={customerData.firstName}
                                    onChange={handleCustomerDataChange}
                                    required
                                    disabled={isSubmittingOrder}
                                    dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                                />
                            </div>

                            <div className="input-group">
                                <FaMapMarkerAlt className="input-icon" />
                                <input
                                    type="text"
                                    name="adresse"
                                    placeholder={t.addressPlaceholder}
                                    value={customerData.adresse}
                                    onChange={handleCustomerDataChange}
                                    required
                                    disabled={isSubmittingOrder}
                                    dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                                />
                            </div>

                            <div className="input-group">
                                <FaPhoneAlt className="input-icon" />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder={t.phonePlaceholder}
                                    value={customerData.phone}
                                    onChange={handleCustomerDataChange}
                                    required
                                    disabled={isSubmittingOrder}
                                    dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions-order">
                        <button
                            type="submit"
                            className="confirm-order-btn"
                            disabled={!customerData.firstName || !customerData.adresse || !customerData.phone || isSubmittingOrder}
                        >
                            {isSubmittingOrder ? (
                                <> <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> {t.submitting}</>
                            ) : (
                                isLoggedIn ? t.submitBtn : t.submitBtnGuest
                            )}
                        </button>
                        <button type="button" onClick={closeOrderModal} className="cancel-order-btn" disabled={isSubmittingOrder}>
                            {t.cancelBtn}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ====================================================================
// المكون الرئيسي: ProductGrid (المصحح)
// ====================================================================

export default function ProductGrid() {
    const location = useLocation();
    const { appLanguage, languages } = useLanguage();
    const { showAlert } = useAlert();



    const t = translations[appLanguage] || translations.fr;
    const currentCategories = t.categories;

    const [fetchedProducts, setFetchedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState(1000);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastCommandRef, setLastCommandRef] = useState(null);

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const [finalCustomerData, setFinalCustomerData] = useState({ firstName: '', adresse: '', phone: '' });

    const [isAdmin, setIsAdmin] = useState(false);
    const [homeItems, setHomeItems] = useState([]);
    const [productOrders, setProductOrders] = useState({}); // Tracking order input per product
    const [isEditingField, setIsEditingField] = useState(null); // 'title', 'subtitle', 'sidebar', 'reset', 'info', 'navTitle', 'cartBtn'
    // Default structure for content
    const defaultStructure = {
        colTitle: '', colAccent: '',
        sidebar: '', reset: '', navTitle: '', searchPlaceholder: '',
        info: '', cartBtn: '', heroImage: '',
        offerCta: ''
    };

    const [shopContent, setShopContent] = useState({});
    const [editShopContent, setEditShopContent] = useState({});
    const [shopCategories, setShopCategories] = useState([]);
    const [isManagingCategory, setIsManagingCategory] = useState(false); // false or 'add' or 'edit'
    const [showAllCatLangs, setShowAllCatLangs] = useState(false);
    const [categoryForm, setCategoryForm] = useState({ id: '', name: { fr: '', ar: '', en: '' }, key: '', order: 0 });

    // 📱 Contact Buttons Setting
    const [contactSettings, setContactSettings] = useState({ whatsapp: '', messenger: '' });
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [editContactForm, setEditContactForm] = useState({ whatsapp: '', messenger: '' });

    // 🎁 Offer States
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [editingOfferId, setEditingOfferId] = useState(null);
    const [offerForm, setOfferForm] = useState({
        title: { fr: '', ar: '', en: '' },
        newPrice: '',
        durationHours: '24'
    });
    const [activeOffers, setActiveOffers] = useState([]);
    const [offersLoading, setOffersLoading] = useState(false);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/shop-categories`);
            if (res.ok) {
                const data = await res.json();
                setShopCategories(data);
            }
        } catch (err) { }
    };

    const fetchHomeItems = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/home-products`);
            if (res.ok) {
                const data = await res.json();
                setHomeItems(data);
            }
        } catch (err) { }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const data = await response.json();

            const mappedProducts = data.map(p => ({
                id: p._id,
                name: typeof p.nom === 'object' ? (p.nom[appLanguage] || p.nom.fr) : p.nom,
                fullNom: p.nom,
                price: p.prix,
                currency: 'DT',
                // ✅ التصحيح الأساسي: يختار mainImage (الجديد) أو image (القديم) كصورة رئيسية.
                url: p.mainImage || p.image,
                secondaryImages: p.secondaryImages || [],
                innerImages: p.innerImages || [], // 💡 Added to support images exclusively in the Order Modal carousel
                alt: typeof p.nom === 'object' ? (p.nom[appLanguage] || p.nom.fr) : p.nom,
                category: p.categorie,
                order: p.order || 0,
                isNewProduct: p.isNewProduct || false
            }));

            const sortedProducts = mappedProducts.sort((a, b) => {
                if (a.isNewProduct && !b.isNewProduct) return -1;
                if (!a.isNewProduct && b.isNewProduct) return 1;
                return 0;
            });

            setFetchedProducts(sortedProducts);

        } catch (err) {
            console.error("Échec de la récupération des produits :", err);
            setError("Impossible de charger les produits. Veuillez vérifier الـ API.");
        } finally {
            setLoading(false);
        }
    };

    const fetchOffers = async () => {
        setOffersLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/offers`);
            if (res.ok) {
                const data = await res.json();
                setActiveOffers(data);
            }
        } catch (err) {
            console.error("Error fetching offers:", err);
        } finally {
            setOffersLoading(false);
        }
    };

    useEffect(() => {
        // Check Admin
        const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
        if (email) {
            fetch(`${BASE_URL}/api/users/${email}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data && data.statut === 'admin') setIsAdmin(true);
                })
                .catch(() => { });
        }

        // Load content
        fetch(`${BASE_URL}/api/settings/shop-content`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setShopContent(data);
                    setEditShopContent(initializeAllLanguages(data));
                }
            })
            .catch(() => { });

        fetchProducts();
        fetchHomeItems();
        fetchCategories();
        fetchOffers();
    }, [appLanguage]); // Re-fetch on lang change and check if products are in hero carousel 

    // ✅ Handle Category from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cat = params.get('category');
        if (cat) {
            setSelectedCategory(cat);
            // Scroll to top or grid? Maybe just ensure it's selected
        }
    }, [location]);

    // ✅ Match and Sync orders whenever fetchedProducts or homeItems change
    useEffect(() => {
        if (fetchedProducts.length > 0 && homeItems.length > 0) {
            const syncOrders = {};
            homeItems.forEach(h => {
                const sp = fetchedProducts.find(p => p.url === h.image);
                if (sp) syncOrders[sp.id] = h.order || 0;
            });
            setProductOrders(prev => ({ ...prev, ...syncOrders }));
        }
    }, [fetchedProducts, homeItems]);



    const handleSaveShopContent = async () => {
        localStorage.setItem('shop_content_backup', JSON.stringify(editShopContent));
        setShopContent(editShopContent);
        setIsEditingField(null);
        try {
            await fetch(`${BASE_URL}/api/settings/shop-content`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editShopContent })
            });
        } catch (err) { }
    };

    // 🔧 دالة مساعدة لتهيئة جميع اللغات المتاحة
    const initializeAllLanguages = (currentValues) => {
        const initialized = {};
        languages.forEach(lang => {
            initialized[lang.code] = {
                ...defaultStructure,
                ...(currentValues[lang.code] || {})
            };
        });
        return initialized;
    };

    const getT = (key, defaultVal) => {
        return (shopContent[appLanguage] && shopContent[appLanguage][key]) || defaultVal;
    };

    const EditBtn = ({ field, label, style = {} }) => {
        const getLabel = () => {
            if (label) return label;
            if (field === 'hero') return appLanguage === 'ar' ? 'تعديل العنوان' : 'Modifier En-tête';
            if (field === 'heroImage') return appLanguage === 'ar' ? 'تعديل الصورة' : 'Modifier Image';
            if (field === 'filters') return appLanguage === 'ar' ? 'تعديل الفلترة' : 'Modifier Filtres';
            if (field === 'productsInfo') return appLanguage === 'ar' ? 'تعديل المعلومات' : 'Modifier Infos';
            return appLanguage === 'ar' ? 'تعديل' : 'Modifier';
        };

        return (
            isAdmin && (
                <button
                    onClick={() => { setIsEditingField(field); }}
                    className="edit-btn-minimal-lux"
                    style={style}
                >
                    <FaEdit size={14} />
                    <span style={{
                        marginLeft: appLanguage === 'ar' ? '0' : '8px',
                        marginRight: appLanguage === 'ar' ? '8px' : '0'
                    }}>
                        {getLabel()}
                    </span>
                </button>
            )
        );
    };

    // 📦 Product Management State
    const [isManagingProduct, setIsManagingProduct] = useState(false); // false or 'add' or 'edit'
    const [productForm, setProductForm] = useState({ id: '', nom: '', prix: '', categorie: '', mainImage: '', secondaryImages: [], order: 0 });

    const handleDeleteProduct = async (id) => {
        if (!window.confirm(appLanguage === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Supprimer ce produit ?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setFetchedProducts(prev => prev.filter(p => p.id !== id));
            }
        } catch (err) { }
    };

    const handleOpenAddProduct = () => {
        const cat = selectedCategoryKey === 'Tous' ? 'Homme' : selectedCategoryKey;
        const nom = {};
        languages.forEach(l => nom[l.code] = '');
        setProductForm({ id: '', nom, prix: '', categorie: cat, mainImage: '', secondaryImages: [], order: 0 });
        setIsManagingProduct('add');
    };

    const handleOpenEditProduct = (p) => {
        const nom = typeof p.fullNom === 'object' ? { ...p.fullNom } : { fr: p.name || '' };
        languages.forEach(l => {
            if (!nom[l.code]) nom[l.code] = nom.fr || '';
        });
        setProductForm({
            id: p.id,
            nom,
            prix: p.price,
            categorie: p.category,
            mainImage: p.url,
            secondaryImages: p.secondaryImages || [],
            order: p.order || 0
        });
        setIsManagingProduct('edit');
    };

    const handleSaveProduct = async () => {
        const method = isManagingProduct === 'edit' ? 'PUT' : 'POST';
        const url = isManagingProduct === 'edit' ? `${API_URL}/${productForm.id}` : API_URL;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productForm)
            });
            if (res.ok) {
                const updated = await res.json();
                // Refresh list or optimistic update
                window.location.reload();
            }
        } catch (err) { }
    };

    // 🏷️ Category Management Code
    const handleOpenAddCategory = () => {
        const name = {};
        languages.forEach(l => name[l.code] = '');
        setCategoryForm({ id: '', name, key: '', order: 0 });
        setShowAllCatLangs(false);
        setIsManagingCategory('add');
    };

    const handleOpenEditCategory = (cat) => {
        setCategoryForm({
            id: cat._id,
            name: { ...cat.name },
            key: cat.key,
            order: cat.order || 0
        });
        setShowAllCatLangs(false);
        setIsManagingCategory('edit');
    };

    const handleSaveCategory = async () => {
        const method = isManagingCategory === 'edit' ? 'PUT' : 'POST';
        const url = isManagingCategory === 'edit' ? `${BASE_URL}/api/shop-categories/${categoryForm.id}` : `${BASE_URL}/api/shop-categories`;

        // Validation & Auto-fill
        const currentName = categoryForm.name[appLanguage];
        if (!currentName) {
            showAlert('warning', 'Validation', appLanguage === 'ar' ? 'يرجى إدخال اسم الفئة' : 'Veuillez entrer le nom');
            return;
        }

        const finalForm = { ...categoryForm };
        // If adding, fill other languages with current name if empty
        if (isManagingCategory === 'add') {
            languages.forEach(l => {
                if (!finalForm.name[l.code]) finalForm.name[l.code] = currentName;
            });
            // Auto generate key if empty (very basic slugify)
            if (!finalForm.key) {
                finalForm.key = currentName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            }
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalForm)
            });
            if (res.ok) {
                fetchCategories();
                setIsManagingCategory(false);
            }
        } catch (err) { }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm(appLanguage === 'ar' ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Supprimer cette catégorie ?')) return;
        try {
            const res = await fetch(`${BASE_URL}/api/shop-categories/${id}`, { method: 'DELETE' });
            if (res.ok) fetchCategories();
        } catch (err) { }
    };


    useEffect(() => {
        // Logique d'authentification والبيانات الأساسية
        const status = localStorage.getItem('login') === 'true';
        const userEmail = localStorage.getItem('currentUserEmail') || '';

        setIsLoggedIn(status);
        setCurrentUserEmail(userEmail);

        // 🌟 LOGIQUE DE RÉCUPÉRATION DES PRODUجTS DEPUIS L'API
        // ProductGrid.js

        // Contact Settings Fetch
        const fetchContactSettings = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/settings/shop-contacts`);
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setContactSettings(data.value || data);
                    }
                }
            } catch (err) { }
        };
        fetchContactSettings();
    }, []);

    useEffect(() => {
        // No longer auto-switching to first category on lang change to avoid jumping to 'الكل' if 'Tous' was active
    }, [appLanguage]);


    useEffect(() => {
        const body = document.body;
        if (showOrderModal || showSuccessModal || showFeedbackModal) {
            body.classList.add('no-scroll');
        } else {
            body.classList.remove('no-scroll');
        }

        return () => {
            body.classList.remove('no-scroll');
        };
    }, [showOrderModal, showSuccessModal, showFeedbackModal]);


    const handleOrderClick = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setShowOrderModal(true);
    };

    const closeOrderModal = () => {
        setShowOrderModal(false);
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const closeFeedbackModal = () => {
        setShowFeedbackModal(false);
        // ✅ Clear data after the cycle
        setSelectedProduct(null);
        setLastCommandRef(null);
        setFinalCustomerData({ firstName: '', adresse: '', phone: '' });
    };


    const handleQuantityChange = (change) => {
        setQuantity(prev => {
            const newQty = prev + change;
            return Math.max(1, newQty);
        });
    };

    const handleOrderSuccessCallback = (commandId) => {
        setLastCommandRef(commandId);
        closeOrderModal();
        setShowSuccessModal(true);
    };

    const handleCustomerDataUpdate = (data) => {
        setFinalCustomerData(data);
    };

    // 🎁 Offer Management Logic
    const handleToggleSelect = (id) => {
        if (selectedProductIds.includes(id)) {
            setSelectedProductIds(prev => prev.filter(pid => pid !== id));
        } else {
            setSelectedProductIds(prev => [...prev, id]);
        }
    };

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + parseInt(offerForm.durationHours));

        const offerData = {
            title: offerForm.title,
            productIds: selectedProductIds,
            newPrice: parseFloat(offerForm.newPrice),
            duration: expiration
        };

        try {
            const method = editingOfferId ? 'PUT' : 'POST';
            const url = editingOfferId ? `${BASE_URL}/api/offers/${editingOfferId}` : `${BASE_URL}/api/offers`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(offerData)
            });

            if (res.ok) {
                showAlert('success', 'Succès', editingOfferId ? (appLanguage === 'ar' ? 'تم تحديث العرض بنجاح!' : 'Offre mise à jour !') : (appLanguage === 'ar' ? 'تم إنشاء العرض بنجاح!' : 'Offre créée avec succès !'));
                setIsOfferModalOpen(false);
                setEditingOfferId(null);
                setIsSelectionMode(false);
                setSelectedProductIds([]);
                fetchOffers();
            } else {
                const err = await res.json();
                showAlert('error', 'Erreur', err.message);
            }
        } catch (error) {
            showAlert('error', 'Erreur', editingOfferId ? 'Impossible de modifier l\'offre.' : 'Impossible de créer l\'offre.');
        }
    };

    const handleOpenEditOffer = (offer) => {
        setOfferForm({
            title: offer.title,
            newPrice: offer.newPrice,
            durationHours: '24' 
        });
        setSelectedProductIds(offer.productIds.map(p => p._id || p.id));
        setEditingOfferId(offer._id);
        setIsOfferModalOpen(true);
    };

    const deleteOffer = async (id) => {
        showAlert('confirm', 'Supprimer', 'Voulez-vous supprimer cette offre ?', async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/offers/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setActiveOffers(prev => prev.filter(o => o._id !== id));
                    showAlert('success', 'Succès', 'Offre supprimée.');
                }
            } catch (err) { }
        });
    };


    const handleToggleHero = async (product) => {
        const existingHeroItem = homeItems.find(item => item.image === product.url);

        if (existingHeroItem) {
            // REMOVE (OFF)
            const confirmMsg = appLanguage === 'ar'
                ? `هل أنت متأكد من إزالة "${product.name}" من الصفحة الرئيسية؟`
                : `Voulez-vous vraiment retirer "${product.name}" de la page d'accueil ?`;

            if (!window.confirm(confirmMsg)) return;

            try {
                const res = await fetch(`${BASE_URL}/api/home-products/${existingHeroItem._id}`, { method: 'DELETE' });
                if (res.ok) {
                    showAlert('success', 'Succès', appLanguage === 'ar' ? 'تمت الإزالة' : 'Produit retiré');
                    fetchHomeItems();
                }
            } catch (err) {
                showAlert('error', 'Error', err.message);
            }
        } else {
            // ADD (ON)
            const orderValue = productOrders[product.id] || 0;

            try {
                const postData = {
                    nom: product.fullNom || product.name,
                    prix: product.price,
                    image: product.url,
                    order: Number(orderValue)
                };

                const postRes = await fetch(`${BASE_URL}/api/home-products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(postData)
                });

                if (postRes.ok) {
                    showAlert('success', 'Succès',
                        appLanguage === 'ar' ? 'تمت الإضافة بنجاح' : 'Produit ajouté avec succès'
                    );
                    fetchHomeItems();
                } else {
                    throw new Error("Failed to add hero product");
                }
            } catch (err) {
                console.error(err);
                showAlert('error', 'Error', err.message);
            }
        }
    };

    const handleUpdateHeroOrder = async (product) => {
        const existingHeroItem = homeItems.find(item => item.image === product.url);
        if (!existingHeroItem) return;

        const newOrder = Number(productOrders[product.id] || 0);

        try {
            const res = await fetch(`${BASE_URL}/api/home-products/${existingHeroItem._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: newOrder })
            });

            if (res.ok) {
                showAlert('success', 'Succès', appLanguage === 'ar' ? 'تم تحديث الترتيب' : 'Ordre mis à jour');
                fetchHomeItems();
            }
        } catch (err) {
            showAlert('error', 'Error', err.message);
        }
    };

    const handleToggleNewBadge = async (product) => {
        const newValue = !product.isNewProduct;
        try {
            const res = await fetch(`${API_URL}/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isNewProduct: newValue })
            });

            if (res.ok) {
                setFetchedProducts(prev => prev.map(p => p.id === product.id ? { ...p, isNewProduct: newValue } : p));
                showAlert('success', 'Succès', appLanguage === 'ar' ? 'تم تحديث حالة المنتج (جديد)' : 'Statut du badge "Nouveau" mis à jour');
            } else {
                const data = await res.json();
                throw new Error(data.message || 'Error updating product');
            }
        } catch (err) {
            showAlert('error', 'Error', err.message);
        }
    };



    const productsToFilter = fetchedProducts;
    const lowerSearchTerm = searchTerm.toLowerCase();
    const selectedCategoryKey = selectedCategory;

    const filteredProducts = productsToFilter
        .filter(product => {
            const isCategoryMatch = selectedCategoryKey === 'Tous' || product.category === selectedCategoryKey;
            if (!lowerSearchTerm) {
                return isCategoryMatch;
            } else {
                const isNameMatch = product.name.toLowerCase().includes(lowerSearchTerm);
                const isSearchCategoryMatch = product.category.toLowerCase().includes(lowerSearchTerm);

                if (selectedCategoryKey !== 'Tous') {
                    return isCategoryMatch && (isNameMatch || isSearchCategoryMatch);
                } else {
                    return isNameMatch || isSearchCategoryMatch;
                }
            }
        })
        .filter(product =>
            product.price <= priceRange
        );

    const resetFilters = () => {
        setSelectedCategory(currentCategories[0]);
        setSearchTerm('');
        setPriceRange(1000);
        setIsFilterOpen(false);
    };

    // 5. NOUVEAU Composant du Modal de Succès 
    const OrderSuccessModal = () => {
        if (!showSuccessModal) return null;
        const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

        const handleFeedbackClick = () => {
            closeSuccessModal();
            setShowFeedbackModal(true);
        };

        return (
            <div className="premium-modal-backdrop" onClick={closeSuccessModal}>
                <div className="premium-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', textAlign: 'center' }}>
                    <button className="premium-modal-close-icon" onClick={closeSuccessModal}><FaTimes /></button>

                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        margin: '0 auto 25px'
                    }}>
                        <FaCheckCircle />
                    </div>

                    <h2 className="premium-modal-title" style={{ marginBottom: '15px' }}>
                        {t.successTitle}
                    </h2>

                    <p style={{
                        color: '#64748b',
                        lineHeight: '1.6',
                        fontSize: '1rem',
                        marginBottom: '30px',
                        padding: '0 10px'
                    }} dangerouslySetInnerHTML={{ __html: t.successMessage(lastCommandRef) }}></p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={handleFeedbackClick}
                            className="premium-btn-cta gold"
                            style={{ padding: '14px' }}
                        >
                            <FaCommentAlt /> {t.feedbackBtn}
                        </button>

                        <button
                            type="button"
                            onClick={closeSuccessModal}
                            className="premium-btn-cancel"
                            style={{ margin: 0, padding: '12px' }}
                        >
                            {t.closeBtn}
                        </button>
                    </div>

                </div>
            </div>
        );
    };

    // 🆕 6. NOUVEAU Composant du Modal de Commentaire (Feedback Modal) (معدل)
    const FeedbackModal = () => {
        const [reviewText, setReviewText] = useState('');
        const [rating, setRating] = useState(5);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [submitStatus, setSubmitStatus] = useState(null); // 'loading', 'success', 'error'
        // 🚨 حالة جديدة لخطأ التحقق في النموذج
        const [validationError, setValidationError] = useState(null);
        const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

        const customerName = finalCustomerData.firstName || 'Guest';
        const productRefId = selectedProduct?.id;

        const handleRatingClick = (newRating) => {
            setRating(newRating);
            // 💡 مسح خطأ التحقق عند اختيار نجمة
            setValidationError(null);
        };

        const handleTextChange = (e) => {
            setReviewText(e.target.value);
            // 💡 مسح خطأ التحقق عند بدء الكتابة
            setValidationError(null);
        };

        const handleSubmitComment = async (e) => {
            e.preventDefault();
            setValidationError(null); // مسح الأخطاء السابقة
            setSubmitStatus(null); // مسح حالة الإرسال السابقة

            if (!productRefId) {
                setValidationError(t.feedbackErrorName);
                return;
            }

            // 🛑 شرط التحقق الجديد: يجب أن يكون هناك إما تقييم (rating > 0) أو تعليق لا يقل عن 5 أحرف
            if (reviewText.trim().length < 5 && rating === 0) {
                setValidationError(t.feedbackErrorLength); // عرض رسالة الخطأ المترجمة
                // 🛑 تم إزالة setSubmitStatus('error');
                return; // إيقاف العملية هنا
            }

            setIsSubmitting(true);
            setSubmitStatus('loading');

            const commentData = {
                nom: customerName,
                commentaire: reviewText.trim(),
                rating: rating,
                productId: productRefId,
            };

            try {
                const response = await fetch(API_COMMENTAIRE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(commentData),
                });

                if (response.ok) {
                    setSubmitStatus('success');
                    setTimeout(closeFeedbackModal, 2000);
                } else {
                    const result = await response.json();
                    setSubmitStatus(null); // لا تعرض رسالة النجاح/الخطأ العامة في حالة فشل الخادم
                    console.error("Échec de l'enregistrement du commentaire:", result);
                    setValidationError(t.feedbackErrorSubmit(result.message || 'Server error')); // عرض الخطأ أسفل النموذج
                }

            } catch (error) {
                console.error("Erreur de réseau lors de l'envoi du commentaire:", error);
                setSubmitStatus(null); // لا تعرض رسالة النجاح/الخطأ العامة في حالة فشل الشبكة
                setValidationError(t.networkError); // عرض الخطأ أسفل النموذج
            } finally {
                setIsSubmitting(false);
            }
        };

        if (!showFeedbackModal) return null;

        return (
            <div className="premium-modal-backdrop" onClick={closeFeedbackModal}>
                <div className="premium-modal-content" onClick={(e) => e.stopPropagation()} dir={direction} style={{ maxWidth: '600px' }}>

                    <button
                        className="premium-modal-close-icon"
                        onClick={closeFeedbackModal}
                        disabled={isSubmitting}
                    >
                        <FaTimes />
                    </button>

                    <h2 className="premium-modal-title" style={{ marginBottom: '20px' }}>{t.feedbackModalTitle}</h2>

                    {/* تم حذف شرط submitStatus === 'error' هنا لعدم عرض رسالة الخطأ العامة */}
                    {submitStatus === 'success' ? (
                        <div className="comment-status-message success" style={{ padding: '40px', textAlign: 'center' }}>
                            <FaCheckCircle className="check-icon-small" style={{ fontSize: '40px', color: '#22c55e', marginBottom: '15px', display: 'block', margin: '0 auto' }} />
                            <p style={{ color: '#1e293b', fontWeight: '600' }}>{t.feedbackSuccessMsg}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitComment}>
                            <div className="rating-control-group">
                                <p>{t.ratingLabel}</p>
                                <br /><br />
                                <div className="rating-stars">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className="star"
                                            onClick={() => handleRatingClick(star)}
                                            style={{ color: star <= rating ? '#ffc107' : '#e4e5e9', cursor: 'pointer', fontSize: '24px' }}
                                        >
                                            {star <= rating ? <FaStar /> : <FaRegStar />}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="comment-input-group">
                                <textarea
                                    name="comment"
                                    placeholder={t.feedbackPlaceholder}
                                    value={reviewText}
                                    onChange={handleTextChange}
                                    disabled={isSubmitting}
                                    rows="4"
                                    dir={direction}
                                />
                                {/* 🚨 عرض رسالة خطأ التحقق أسفل حقل التعليق (تظهر لأخطاء التحقق الأولية وأخطاء الخادم/الشبكة) */}
                                {validationError && (
                                    <p className="validation-error-text"
                                        style={{ color: '#d9534f', marginTop: '5px', fontSize: '14px', fontWeight: 'bold' }}
                                        dangerouslySetInnerHTML={{ __html: validationError }}
                                    ></p>
                                )}
                            </div>

                            <div className="modal-actions-comment">
                                <button
                                    type="submit"
                                    className="send-comment-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <> <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> {t.submitting}</>
                                    ) : (
                                        t.sendCommentBtn
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeFeedbackModal}
                                    className="skip-comment-btn"
                                    disabled={isSubmitting}
                                >
                                    {t.skipCommentBtn}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    };

    // 7. Rendu Principal 
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="product-grid-section" dir={direction}>
                    <div className="vip-hero-premium skeleton-item" style={{ height: '60vh', minHeight: '520px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="container" style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="skeleton-item" style={{ width: '120px', height: '35px', borderRadius: '50px', marginBottom: '25px', opacity: 0.2 }}></div>
                            <div className="skeleton-item" style={{ width: '60%', height: '60px', borderRadius: '12px', marginBottom: '20px', opacity: 0.2 }}></div>
                            <div className="skeleton-item" style={{ width: '40%', height: '25px', borderRadius: '6px', opacity: 0.2 }}></div>
                        </div>
                    </div>

                    <div className="shop-content-wrapper">
                        <aside className="filter-sidebar skeleton-item" style={{ height: '600px', borderRadius: '24px', opacity: 0.1 }}></aside>

                        <div className="product-grid-main">
                            <div className="skeleton-grid">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="skeleton-card">
                                        <div className="skeleton-image skeleton-item"></div>
                                        <div className="skeleton-content">
                                            <div className="skeleton-title skeleton-item"></div>
                                            <div className="skeleton-row">
                                                <div className="skeleton-price skeleton-item"></div>
                                                <div className="skeleton-btn skeleton-item"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <div className="error-state" style={{ textAlign: 'center', padding: '100px', color: 'red', fontSize: '18px' }} dir={direction}>
                <p>{t.error(error)}</p>
            </div>
        );
    }

    return (
        <>
            <Navbar />

            <section className="product-grid-section" dir={direction}>

                <header
                    className="vip-hero-premium"
                    style={{
                        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.4)), url(${getT('heroImage', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop')})`
                    }}
                >
                    <div className="vip-hero-overlay"></div>

                    <div className="container shop_cont" style={{ position: 'relative', zIndex: 10 }}>
                        <h1 className="vip-main-title-premium">
                            {appLanguage === 'en' ? getT('colAccent', t.collectionAccent) : getT('colTitle', t.collectionTitle)}
                            <span className="accent-text"> {appLanguage === 'en' ? getT('colTitle', t.collectionTitle) : getT('colAccent', t.collectionAccent)}</span>
                        </h1>

                        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', gap: '20px', position: 'relative', zIndex: 20, flexWrap: 'wrap' }}>
                            <EditBtn field="hero" />
                            {isAdmin && (
                                <>
                                    <button
                                        onClick={handleOpenAddProduct}
                                        className="edit-btn-minimal-lux"
                                    >
                                        <FaPlusCircle size={14} /> {appLanguage === 'ar' ? 'إضافة منتج' : 'Nouveau'}
                                    </button>
                                    <button
                                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                                        className={`edit-btn-minimal-lux ${isSelectionMode ? 'active-selection' : ''}`}
                                        style={{ background: isSelectionMode ? '#ef4444' : '#D4AF37', border: 'none', color: '#fff' }}
                                    >
                                        <FaLayerGroup size={14} /> {appLanguage === 'ar' ? (isSelectionMode ? 'إلغاء التحديد' : 'إنشاء عرض') : (isSelectionMode ? 'Annuler' : 'Ajouter Offre')}
                                    </button>
                                    {isSelectionMode && selectedProductIds.length > 0 && (
                                        <button
                                            onClick={() => {
                                                const selectedProds = productsToFilter.filter(p => selectedProductIds.includes(p.id));
                                                const combinedTitle = selectedProds.map(p => p.name).join(' + ');
                                                setEditingOfferId(null);
                                                setOfferForm({
                                                    title: { fr: combinedTitle, ar: combinedTitle, en: combinedTitle },
                                                    newPrice: '',
                                                    durationHours: '24'
                                                });
                                                setIsOfferModalOpen(true);
                                            }}
                                            className="edit-btn-minimal-lux"
                                            style={{ background: '#10b981', color: '#fff', border: 'none' }}
                                        >
                                            <FaCheck /> {appLanguage === 'ar' ? 'تأكيد العرض' : 'Confirmer l\'offre'}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {activeOffers.length > 0 && (
                            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                                <button
                                    className="vip-cta-gold-button creative-pulsing-btn"
                                    onClick={() => setSelectedCategory('offre')}
                                    style={{
                                        padding: '15px 35px',
                                        fontSize: '1.2rem',
                                        borderRadius: '50px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    {shopContent[appLanguage]?.offerCta || (appLanguage === 'ar' ? '🔥 عرض محدود ' : '🔥 OFFRE LIMITÉE')}
                                    <FaHandPointer className="pointing-finger-icon" />
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="shop-content-wrapper">

                    {/* 1. Bouton bascule Filtres */}
                    <button
                        className={`toggle-filters-button ${appLanguage === 'ar' ? 'rtl-align-text' : ''}`}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        {isFilterOpen ? (
                            <> <FaTimes /> {t.toggleFiltersClose}</>
                        ) : (
                            <> <FaSearch /> {t.toggleFiltersShow(selectedCategory)}</>
                        )}
                    </button>


                    {/* 2. Barre latérale des filtres */}
                    <aside className={`filter-sidebar ${isFilterOpen ? 'is-open' : ''} ${appLanguage === 'ar' ? 'rtl-sidebar' : ''}`}>
                        <button className="sidebar-close-btn-mobile" onClick={() => setIsFilterOpen(false)} aria-label="Close filters">
                            <FaTimes />
                        </button>
                        <EditBtn field="filters" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }} />
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 className="sidebar-title" style={{ margin: 0 }}>{getT('sidebar', t.sidebarTitle)}</h3>
                        </div>

                        <div className="filter-group search-filter">
                            <input
                                type="text"
                                placeholder={getT('searchPlaceholder', t.searchPlaceholder)}
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                            />
                            <FaSearch className="search-icon" />
                        </div>

                        <div className="filter-group">
                            <h4 className="filter-group-title" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {getT('navTitle', t.filterCategory(t.navTitle))}
                                <FaChevronDown className="dropdown-icon" />
                            </h4>
                            <ul className="category-list">
                                <li
                                    className={`category-item ${selectedCategory === 'Tous' ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory('Tous')}
                                >
                                    {appLanguage === 'ar' ? 'الكل' : 'Tous'}
                                </li>
                                {activeOffers.length > 0 && (
                                    <li
                                        className={`category-item special-offer-item ${selectedCategory === 'offre' ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedCategory('offre');
                                            if (window.innerWidth <= 992) setIsFilterOpen(false);
                                        }}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 'bold' }}
                                    >
                                        🎁 {appLanguage === 'ar' ? 'العروض الحالية' : 'Offres Spéciales'} ({activeOffers.length})
                                    </li>
                                )}
                                {shopCategories.map((cat, index) => {
                                    const catName = cat.name[appLanguage] || cat.name.fr || cat.key;
                                    const count = productsToFilter.filter(p => p.category === cat.key).length;

                                    return (
                                        <li
                                            key={cat._id}
                                            className={`category-item ${cat.key === selectedCategory ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedCategory(cat.key);
                                                if (window.innerWidth <= 992) setIsFilterOpen(false);
                                            }}
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        >
                                            <span>{catName} ({count})</span>
                                            {isAdmin && (
                                                <div className="cat-admin-btns" style={{ display: 'flex', gap: '8px' }}>
                                                    <FaEdit
                                                        style={{ cursor: 'pointer', color: '#007bff' }}
                                                        onClick={(e) => { e.stopPropagation(); handleOpenEditCategory(cat); }}
                                                    />
                                                    <FaTrash
                                                        style={{ cursor: 'pointer', color: '#dc3545' }}
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id); }}
                                                    />
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                                {isAdmin && (
                                    <li
                                        className="category-item add-cat-btn"
                                        onClick={handleOpenAddCategory}
                                        style={{ borderTop: '1px dashed #ccc', marginTop: '10px', color: '#10b981', fontWeight: 'bold' }}
                                    >
                                        <FaPlus /> {appLanguage === 'ar' ? 'إضافة فئة' : 'Ajouter une catégorie'}
                                    </li>
                                )}
                            </ul>
                        </div>


                    </aside>

                    {/* 3. Grille des منتجات */}
                    <main className="product-grid-main">
                        <div className="grid-info-bar" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <p className="info-text" style={{ margin: 0 }}>
                                {(() => {
                                    const custom = getT('info', '');
                                    if (custom) {
                                        return custom
                                            .replace('{f}', filteredProducts.length)
                                            .replace('{t}', productsToFilter.length);
                                    }
                                    return t.infoBar(filteredProducts.length, productsToFilter.length);
                                })()}
                            </p>
                            <EditBtn field="productsInfo" />
                        </div>

                        <div className="product-grid-container">
                            {selectedCategory === 'offre' ? (
                                activeOffers.map(offer => (
                                    <div key={offer._id} className="product-card premium-offer-card">
                                        {isAdmin && (
                                            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                                                <button
                                                    className="edit-offer-mini-btn"
                                                    onClick={() => handleOpenEditOffer(offer)}
                                                    style={{
                                                        background: '#fff',
                                                        color: '#D4AF37',
                                                        border: '1px solid #D4AF37',
                                                        width: '30px',
                                                        height: '30px',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                                <button
                                                    className="delete-offer-mini-btn"
                                                    onClick={() => deleteOffer(offer._id)}
                                                    style={{
                                                        background: '#fff',
                                                        color: '#ef4444',
                                                        border: '1px solid #ef4444',
                                                        width: '30px',
                                                        height: '30px',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    <FaTimes size={14} />
                                                </button>
                                            </div>
                                        )}
                                        <div className="offer-badge-container"><img src="https://cdn-icons-png.flaticon.com/512/726/726454.png" className="promo-badge-img" alt="Promo" /></div>
                                        <h4 className="offer-main-title">{offer.title[appLanguage] || offer.title.fr}</h4>
                                        <div className="offer-image-bundle">
                                            {offer.productIds.slice(0, 3).map((p, i) => (
                                                <div key={i} className={`bundle-img-wrapper item-${i}`}><img src={p.mainImage || p.image || p.url} alt="" /></div>
                                            ))}
                                            {offer.productIds.length > 3 && <div className="bundle-count">+{offer.productIds.length - 3}</div>}
                                        </div>
                                        <CountdownTimer expirationDate={offer.duration} appLanguage={appLanguage} />
                                        <div className="offer-price-footer">
                                            <div>
                                                <span className="old-price-total">{offer.productIds.reduce((acc, p) => acc + (p.prix || 0), 0).toFixed(2)} DT</span>
                                                <span className="new-price-highlight">{offer.newPrice.toFixed(2)} DT</span>
                                            </div>
                                            <button className="offer-cta-btn" onClick={() => {
                                                const combinedTitle = offer.title[appLanguage] || offer.title.fr;
                                                const productForModal = {
                                                    id: offer._id,
                                                    name: combinedTitle,
                                                    price: offer.newPrice,
                                                    url: offer.productIds[0]?.mainImage || offer.productIds[0]?.image || '',
                                                    offerImages: offer.productIds.map(p => p.mainImage || p.image || p.url).filter(Boolean),
                                                    isOffer: true,
                                                    currency: 'DT'
                                                };
                                                handleOrderClick(productForModal);
                                            }}>{appLanguage === 'ar' ? 'اطلب الآن ' : 'Commander '} <FaLongArrowAltRight /></button>
                                        </div>
                                    </div>
                                ))
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <div key={product.id} className={`product-card ${isSelectionMode && selectedProductIds.includes(product.id) ? 'is-selected-for-offer' : ''}`} onClick={() => {
                                        if (isSelectionMode) {
                                            if (selectedProductIds.includes(product.id)) {
                                                setSelectedProductIds(prev => prev.filter(pid => pid !== product.id));
                                            } else {
                                                setSelectedProductIds(prev => [...prev, product.id]);
                                            }
                                        }
                                    }}>
                                        <div className="product-image-wrapper">
                                            <ImageCarousel
                                                images={[product.url, ...(product.secondaryImages || [])].filter(Boolean)}
                                                direction={direction}
                                                height="100%"
                                            />
                                            {isAdmin && (
                                                <div className="admin-product-actions" style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                    zIndex: 10
                                                }}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleOpenEditProduct(product); }}
                                                        className="hero-edit-title-btn-premium"
                                                        style={{
                                                            width: 'auto',
                                                            height: 'auto',
                                                            padding: '10px 18px',
                                                            borderRadius: '12px',
                                                            background: '#ffffff',
                                                            color: '#007bff',
                                                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            fontWeight: '700',
                                                            fontSize: '0.85rem',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s'
                                                        }}
                                                        title="Modifier"
                                                    >
                                                        <FaEdit size={14} />
                                                        {appLanguage === 'ar' ? 'تعديل' : 'Modifier'}
                                                    </button>

                                                    {/* Toggle Hero (Home Carousel) */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        background: '#ffffff',
                                                        padding: '8px 12px',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                                        zIndex: 11
                                                    }}>
                                                        <input
                                                            type="number"
                                                            placeholder="#"
                                                            value={productOrders[product.id] || ''}
                                                            onChange={(e) => setProductOrders({ ...productOrders, [product.id]: e.target.value })}
                                                            style={{
                                                                width: '45px',
                                                                padding: '6px',
                                                                borderRadius: '8px',
                                                                border: '2px solid #f1f5f9',
                                                                fontSize: '0.8rem',
                                                                textAlign: 'center',
                                                                outline: 'none',
                                                                background: '#f8fafc'
                                                            }}
                                                            title={appLanguage === 'ar' ? 'الترتيب' : 'Ordre'}
                                                        />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleToggleHero(product); }}
                                                            style={{
                                                                padding: '8px 14px',
                                                                borderRadius: '10px',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '800',
                                                                transition: 'all 0.3s',
                                                                background: homeItems.some(item => item.image === product.url) ? '#10b981' : '#64748b',
                                                                color: 'white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}
                                                        >
                                                            {homeItems.some(item => item.image === product.url) ? 'ON' : 'OFF'}
                                                            <FaPaperPlane size={10} />
                                                        </button>

                                                        {homeItems.some(item => item.image === product.url) && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleUpdateHeroOrder(product); }}
                                                                style={{
                                                                    padding: '10px',
                                                                    borderRadius: '10px',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    background: '#f8fafc',
                                                                    color: '#D4AF37',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                                                    border: '1px solid #e2e8f0'
                                                                }}
                                                                title={appLanguage === 'ar' ? 'حفظ الترتيب' : 'Sauvegarder l\'ordre'}
                                                            >
                                                                <FaSave size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                                                        className="hero-edit-title-btn-premium"
                                                        style={{
                                                            width: 'auto',
                                                            height: 'auto',
                                                            padding: '10px 18px',
                                                            borderRadius: '12px',
                                                            background: '#ffffff',
                                                            color: '#dc3545',
                                                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            fontWeight: '700',
                                                            fontSize: '0.85rem',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s'
                                                        }}
                                                        title="Supprimer"
                                                    >
                                                        <FaTrash size={14} />
                                                        {appLanguage === 'ar' ? 'حذف' : 'Supprimer'}
                                                    </button>

                                                    {/* Toggle New Badge Button */}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleToggleNewBadge(product); }}
                                                        className="hero-edit-title-btn-premium"
                                                        style={{
                                                            width: 'auto',
                                                            height: 'auto',
                                                            padding: '10px 18px',
                                                            borderRadius: '12px',
                                                            background: product.isNewProduct ? '#10b981' : '#ffffff',
                                                            color: product.isNewProduct ? '#ffffff' : '#f59e0b',
                                                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            fontWeight: '700',
                                                            fontSize: '0.85rem',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s'
                                                        }}
                                                        title="New Badge"
                                                    >
                                                        <FaStar size={14} />
                                                        {appLanguage === 'ar' ? (product.isNewProduct ? 'اخفاء NEW' : 'اظهار NEW') : (product.isNewProduct ? 'Cacher NEW' : 'Afficher NEW')}
                                                    </button>
                                                </div>
                                            )}
                                            <div className="category-badge">
                                                {(() => {
                                                    const cat = shopCategories.find(c => c.key === product.category);
                                                    if (cat) return cat.name[appLanguage] || cat.name.fr || cat.key;
                                                    return t.categoryMapping[product.category] || product.category;
                                                })()}
                                            </div>
                                            {product.isNewProduct && (
                                                <img
                                                    src="https://png.pngtree.com/png-vector/20220823/ourmid/pngtree-new-icon-logo-stamp-novelty-star-seal-thin-line-symbol-on-png-image_6120851.png"
                                                    alt="New Badge"
                                                    className="new-product-badge"
                                                />
                                            )}
                                        </div>

                                        <div className="product-details-grid">
                                            <h3 className="product-name-grid">{product.name}</h3>
                                            <div className="product-info-row-grid">
                                                <span className="product-price-grid">
                                                    {product.price.toFixed(2)} {product.currency}
                                                </span>
                                                <button
                                                    className="add-to-cart-button-grid"
                                                    onClick={() => handleOrderClick(product)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    <FaShoppingCart />
                                                    {getT('cartBtn', t.addToCart)}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <p>{t.noResultsTitle} {t.noResultsMsg}</p>
                                    <button className="reset-filters-button" onClick={resetFilters}>
                                        {t.resetFilters}
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>

                </div>

            </section>

            {/* 4. Rendu du modal de commande */}
            {
                showOrderModal && selectedProduct && ReactDOM.createPortal(
                    <OrderModalComponent
                        selectedProduct={selectedProduct}
                        quantity={quantity}
                        handleQuantityChange={handleQuantityChange}
                        closeOrderModal={closeOrderModal}
                        isLoggedIn={isLoggedIn}
                        currentUserEmail={currentUserEmail}
                        onOrderSuccess={handleOrderSuccessCallback}
                        onCustomerDataUpdate={handleCustomerDataUpdate}
                        appLanguage={appLanguage}
                        showAlert={showAlert}
                        isAdmin={isAdmin}
                    />,
                    document.body
                )
            }

            {/* 5. Rendu du modal de succès */}
            {showSuccessModal && ReactDOM.createPortal(<OrderSuccessModal />, document.body)}

            {/* 6. Rendu du modal de commentaire */}
            {showFeedbackModal && ReactDOM.createPortal(<FeedbackModal />, document.body)}

            {/* 🛑 Admin Editing Modal */}
            {
                isEditingField && ReactDOM.createPortal(
                    <div className="premium-modal-backdrop" onClick={() => setIsEditingField(null)}>
                        <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                            <button className="premium-modal-close-icon" onClick={() => setIsEditingField(null)}><FaTimes /></button>
                            <h2 className="premium-modal-title premium-modal-title-shop">
                                Modifier: {
                                    isEditingField === 'hero' ? 'En-tête (Hero)' :
                                        isEditingField === 'filters' ? 'Filtres & Sidebar' :
                                            isEditingField === 'productsInfo' ? 'Infos Produits & Bouton' :
                                                isEditingField
                                }
                            </h2>

                            <div className="premium-form-grid">
                                {languages.filter(l => l.code === appLanguage).map(lang => (
                                    <div key={lang.code} className="premium-lang-section" style={{ border: 'none', background: 'none' }}>
                                        <h4 className="lang-indicator" style={{ background: '#d4af37' }}>{lang.label}</h4>

                                        {isEditingField === 'hero' && (
                                            <>
                                                <div className="premium-form-group">
                                                    <label>Titre Principal</label>
                                                    <input
                                                        type="text"
                                                        value={editShopContent[lang.code]?.colTitle || ''}
                                                        onChange={e => setEditShopContent({ ...editShopContent, [lang.code]: { ...editShopContent[lang.code], colTitle: e.target.value } })}
                                                    />
                                                </div>
                                                <div className="premium-form-group">
                                                    <label>Accent (Or)</label>
                                                    <input
                                                        type="text"
                                                        value={editShopContent[lang.code]?.colAccent || ''}
                                                        onChange={e => setEditShopContent({ ...editShopContent, [lang.code]: { ...editShopContent[lang.code], colAccent: e.target.value } })}
                                                    />
                                                </div>
                                                <div className="premium-form-group">
                                                    <label>Badge (Vip Style)</label>
                                                    <input
                                                        type="text"
                                                        value={editShopContent[lang.code]?.badge || ''}
                                                        onChange={e => setEditShopContent({ ...editShopContent, [lang.code]: { ...editShopContent[lang.code], badge: e.target.value } })}
                                                    />
                                                </div>
                                                <div className="premium-form-group">
                                                    <label>URL Image de Fond (Hero)</label>
                                                    <input
                                                        type="text"
                                                        value={editShopContent[lang.code]?.heroImage || ''}
                                                        onChange={e => setEditShopContent({ ...editShopContent, [lang.code]: { ...editShopContent[lang.code], heroImage: e.target.value } })}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                <div className="premium-form-group">
                                                    <label>Texte Bouton Offre</label>
                                                    <input
                                                        type="text"
                                                        value={editShopContent[lang.code]?.offerCta || ''}
                                                        onChange={e => setEditShopContent({ ...editShopContent, [lang.code]: { ...editShopContent[lang.code], offerCta: e.target.value } })}
                                                        placeholder="Ex: 🔥 OFFRE LIMITÉE"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {isEditingField === 'filters' && (
                                            <>
                                                <div className="premium-form-group">
                                                    <label>Titre Sidebar</label>
                                                    <input
                                                        type="text"
                                                        value={editShopContent[lang.code]?.sidebar || ''}
                                                        onChange={e => setEditShopContent({ ...editShopContent, [lang.code]: { ...editShopContent[lang.code], sidebar: e.target.value } })}
                                                    />
                                                </div>
                                                <div className="premium-form-group">
                                                    <label>Titre Catégories</label>
                                                    <input
                                                        type="text"
                                                        value={editShopContent[lang.code]?.navTitle || ''}
                                                        onChange={e => setEditShopContent({ ...editShopContent, [lang.code]: { ...editShopContent[lang.code], navTitle: e.target.value } })}
                                                    />
                                                </div>
                                                <div className="premium-form-group">
                                                    <label>Placeholder Recherche</label>
                                                    <input
                                                        type="text"
                                                        value={editShopContent[lang.code]?.searchPlaceholder || ''}
                                                        onChange={e => setEditShopContent({ ...editShopContent, [lang.code]: { ...editShopContent[lang.code], searchPlaceholder: e.target.value } })}
                                                    />
                                                </div>
                                                <div className="premium-form-group">
                                                    <label>Bouton Reset</label>
                                                    <input
                                                        type="text"
                                                        value={editShopContent[lang.code]?.reset || ''}
                                                        onChange={e => setEditShopContent({ ...editShopContent, [lang.code]: { ...editShopContent[lang.code], reset: e.target.value } })}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {isEditingField === 'productsInfo' && (
                                            <>
                                                <div className="premium-form-group">
                                                    <label>Barre Info (Utilisez {'{f}'} pour le nombre filtré et {'{t}'} pour le total)</label>
                                                    <input
                                                        type="text"
                                                        value={editShopContent[lang.code]?.info || ''}
                                                        onChange={e => setEditShopContent({ ...editShopContent, [lang.code]: { ...editShopContent[lang.code], info: e.target.value } })}
                                                        placeholder="Ex: Affichage de {f} sur {t} produits"
                                                    />
                                                </div>
                                                <div className="premium-form-group">
                                                    <label>Bouton d'achat</label>
                                                    <input
                                                        type="text"
                                                        value={editShopContent[lang.code]?.cartBtn || ''}
                                                        onChange={e => setEditShopContent({ ...editShopContent, [lang.code]: { ...editShopContent[lang.code], cartBtn: e.target.value } })}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
                                <button onClick={() => setIsEditingField(null)} className="premium-btn-cancel">
                                    {appLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                                </button>
                                <button onClick={handleSaveShopContent} className="premium-btn-save">
                                    <FaSave /> {appLanguage === 'ar' ? 'حفظ' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }

            {/* 🛑 Product Management Modal (Add/Edit) */}
            {isManagingProduct && ReactDOM.createPortal(
                <div className="premium-modal-backdrop" onClick={() => setIsManagingProduct(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'left' }}>
                        <button
                            className="premium-modal-close-icon"
                            onClick={() => setIsManagingProduct(false)}
                        >
                            <FaTimes size={18} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                            <h3 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '12px', fontWeight: '800', letterSpacing: '-0.02em' }}>
                                {isManagingProduct === 'add'
                                    ? (appLanguage === 'ar' ? 'إضافة منتج استثنائي' : 'Nouveau Chef-d\'œuvre')
                                    : (appLanguage === 'ar' ? 'تحديث التفاصيل' : 'Édition du Produit')}
                            </h3>
                            <div style={{ height: '4px', width: '40px', background: '#D4AF37', margin: '0 auto', borderRadius: '10px' }}></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {languages.filter(l => l.code === appLanguage).map(lang => (
                                <div key={lang.code} className="input-field-group">
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {appLanguage === 'ar' ? 'اسم المنتج' : 'Nom du Produit'} ({lang.label})
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Kaftan Silk Or"
                                        value={productForm.nom[lang.code] || ''}
                                        onChange={e => {
                                            const newNom = { ...productForm.nom, [lang.code]: e.target.value };
                                            setProductForm({ ...productForm, nom: newNom });
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '16px 20px',
                                            borderRadius: '16px',
                                            border: '2px solid #f1f5f9',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s',
                                            outline: 'none',
                                            background: '#f8fafc'
                                        }}
                                        dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                    />
                                </div>
                            ))}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="input-field-group">
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {appLanguage === 'ar' ? 'السعر (DT)' : 'Prix (DT)'}
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={productForm.prix}
                                        onChange={e => setProductForm({ ...productForm, prix: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '16px 20px',
                                            borderRadius: '16px',
                                            border: '2px solid #f1f5f9',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            background: '#f8fafc'
                                        }}
                                    />
                                </div>

                                <div className="input-field-group">
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {appLanguage === 'ar' ? 'الفئة' : 'Catégorie'}
                                    </label>
                                    <select
                                        value={productForm.categorie}
                                        onChange={e => setProductForm({ ...productForm, categorie: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '16px 20px',
                                            borderRadius: '16px',
                                            border: '2px solid #f1f5f9',
                                            fontSize: '1rem',
                                            background: '#f8fafc',
                                            cursor: 'pointer',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="">Sélectionner</option>
                                        {shopCategories.map(c => (
                                            <option key={c.key} value={c.key}>{c.name[appLanguage] || c.name.fr || c.key}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-field-group">
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {appLanguage === 'ar' ? 'الترتيب' : 'Ordre'}
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={productForm.order}
                                        onChange={e => setProductForm({ ...productForm, order: Number(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '16px 20px',
                                            borderRadius: '16px',
                                            border: '2px solid #f1f5f9',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            background: '#f8fafc'
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="input-field-group">
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {appLanguage === 'ar' ? 'الصورة الرئيسية (تُرفع إلى Cloudinary)' : 'Image Principale (Fichier vers Cloudinary)'}
                                </label>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const formData = new FormData();
                                                formData.append('image', file);
                                                try {
                                                    const res = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: formData });
                                                    const data = await res.json();
                                                    if (res.ok) {
                                                        setProductForm({ ...productForm, mainImage: data.url });
                                                        showAlert('success', 'Succès', appLanguage === 'ar' ? 'تم الرفع بنجاح' : 'Image téléchargée avec succès');
                                                    } else {
                                                        showAlert('error', 'Erreur', data.message || 'Échec de l\'upload');
                                                    }
                                                } catch (err) {
                                                    showAlert('error', 'Erreur', 'Erreur lors de l\'upload');
                                                }
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '16px',
                                            border: '2px solid #f1f5f9',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            background: '#f8fafc',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    {productForm.mainImage && (
                                        <div style={{ width: '60px', height: '60px', borderRadius: '14px', overflow: 'hidden', border: '2px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                            <img src={productForm.mainImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="input-field-group">
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {appLanguage === 'ar' ? 'الصور الثانوية (تُرفع إلى Cloudinary)' : 'Images Secondaires (Fichiers)'}
                                </label>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const formData = new FormData();
                                                formData.append('image', file);
                                                try {
                                                    const res = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: formData });
                                                    const data = await res.json();
                                                    if (res.ok) {
                                                        setProductForm({ ...productForm, secondaryImages: [...productForm.secondaryImages, data.url] });
                                                        e.target.value = null; // إعادة تعيين الحقل بعد الرفع
                                                        showAlert('success', 'Succès', appLanguage === 'ar' ? 'تم رفع الصورة' : 'Image téléchargée');
                                                    } else {
                                                        showAlert('error', 'Erreur', data.message || 'Échec de l\'upload');
                                                    }
                                                } catch (err) {
                                                    showAlert('error', 'Erreur', 'Erreur lors de l\'upload');
                                                }
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '10px 15px',
                                            borderRadius: '12px',
                                            border: '1px solid #f1f5f9',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            background: '#f8fafc',
                                            cursor: 'pointer'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '15px' }}>
                                    {productForm.secondaryImages.map((img, idx) => (
                                        <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button
                                                onClick={() => {
                                                    const updated = [...productForm.secondaryImages];
                                                    updated.splice(idx, 1);
                                                    setProductForm({ ...productForm, secondaryImages: updated });
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '5px',
                                                    right: '5px',
                                                    background: 'rgba(239, 68, 68, 0.9)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: '10px'
                                                }}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '15px', marginTop: '10px' }}>
                                <button
                                    onClick={() => setIsManagingProduct(false)}
                                    className="premium-btn-cancel"
                                >
                                    {appLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                                </button>
                                <button
                                    onClick={handleSaveProduct}
                                    className="premium-btn-save"
                                >
                                    <FaSave /> {appLanguage === 'ar' ? 'حفظ البيانات' : 'Confirmer les Modifications'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 📱 Contact Floating Buttons */}
            <div className={`contact-floating-container ${appLanguage === 'ar' ? 'rtl-floating' : ''}`} style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
            }}>
                {contactSettings.whatsapp && (
                    <a href={`https://wa.me/${contactSettings.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="floating-btn whatsapp-btn">
                        <FaWhatsapp />
                    </a>
                )}
                {contactSettings.messenger && (
                    <a href={contactSettings.messenger} target="_blank" rel="noopener noreferrer" className="floating-btn messenger-btn">
                        <FaFacebookMessenger />
                    </a>
                )}
                {isAdmin && (
                    <button onClick={() => { setEditContactForm(contactSettings); setIsEditingContact(true); }} className="floating-btn admin-btn">
                        <FaEdit />
                    </button>
                )}
            </div>

            {/* Admin Edit Contact Modal */}
            {isEditingContact && ReactDOM.createPortal(
                <div className="premium-modal-backdrop" onClick={() => setIsEditingContact(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'left' }}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingContact(false)}><FaTimes size={18} /></button>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
                            {appLanguage === 'ar' ? 'أزرار التواصل' : 'Boutons de Contact'}
                        </h3>
                        <div className="input-field-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>WhatsApp (e.g. 216...)</label>
                            <input
                                type="text"
                                value={editContactForm.whatsapp}
                                onChange={e => setEditContactForm({ ...editContactForm, whatsapp: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div className="input-field-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Messenger Link</label>
                            <input
                                type="text"
                                placeholder="https://m.me/..."
                                value={editContactForm.messenger}
                                onChange={e => setEditContactForm({ ...editContactForm, messenger: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setIsEditingContact(false)} className="premium-btn-cancel" style={{ flex: 1 }}>Annuler</button>
                            <button onClick={async () => {
                                try {
                                    const res = await fetch(`${BASE_URL}/api/settings/shop-contacts`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ value: editContactForm })
                                    });
                                    if (res.ok) {
                                        setContactSettings(editContactForm);
                                        setIsEditingContact(false);
                                    }
                                } catch (err) {
                                    console.error("Failed to save contact settings:", err);
                                }
                            }} className="premium-btn-save" style={{ flex: 1 }}><FaSave /> Enregistrer</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 🏷️ Category Management Modal */}
            {isManagingCategory && ReactDOM.createPortal(
                <div className="premium-modal-backdrop" onClick={() => setIsManagingCategory(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <button className="premium-modal-close-icon" onClick={() => setIsManagingCategory(false)}><FaTimes size={18} /></button>

                        <header style={{ marginBottom: '30px', textAlign: 'center' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontSize: '24px' }}>
                                <FaPlus />
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fafafaff' }}>
                                {isManagingCategory === 'edit'
                                    ? (appLanguage === 'ar' ? 'تعديل الفئة' : 'Modifier la Catégorie')
                                    : (appLanguage === 'ar' ? 'إضافة فئة جديدة' : 'Ajouter une Fille')}
                            </h2>
                        </header>

                        <div className="premium-form-layout" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Prioritized Current Language */}
                            <div className="input-field-group">
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: '#ffffffff', textTransform: 'uppercase' }}>
                                    {appLanguage === 'ar' ? `اسم الفئة (${languages.find(l => l.code === appLanguage)?.label || appLanguage})` : `Nom de Catégorie (${languages.find(l => l.code === appLanguage)?.label || appLanguage})`}
                                </label>
                                <input
                                    type="text"
                                    placeholder="..."
                                    value={categoryForm.name[appLanguage] || ''}
                                    onChange={e => {
                                        const updatedName = { ...categoryForm.name, [appLanguage]: e.target.value };
                                        setCategoryForm({ ...categoryForm, name: updatedName });
                                    }}
                                    style={{ width: '100%', padding: '18px 22px', borderRadius: '18px', border: '2px solid #D4AF37', fontSize: '1.1rem', outline: 'none', background: '#fff', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.05)' }}
                                    dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                                    autoFocus
                                />
                            </div>

                            {/* Show More Button */}
                            <button
                                onClick={() => setShowAllCatLangs(!showAllCatLangs)}
                                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <FaChevronDown style={{ transform: showAllCatLangs ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                                {appLanguage === 'ar' ? 'ترجمات أخرى' : 'Autres langues (Traductions)'}
                            </button>

                            {showAllCatLangs && languages.filter(l => l.code !== appLanguage).map(lang => (
                                <div key={lang.code} className="input-field-group" style={{ background: '#f8fafc', padding: '15px', borderRadius: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                                        {lang.label}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="..."
                                        value={categoryForm.name[lang.code] || ''}
                                        onChange={e => {
                                            const updatedName = { ...categoryForm.name, [lang.code]: e.target.value };
                                            setCategoryForm({ ...categoryForm, name: updatedName });
                                        }}
                                        style={{ width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
                                        dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                    />
                                </div>
                            ))}

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                                <div className="input-field-group">
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {appLanguage === 'ar' ? 'المفتاح (Key)' : 'Clé (ID unique)'}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="ex: homme, enfant..."
                                        value={categoryForm.key}
                                        onChange={e => setCategoryForm({ ...categoryForm, key: e.target.value.toLowerCase().trim() })}
                                        disabled={isManagingCategory === 'edit'}
                                        style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #f1f5f9', fontSize: '1rem', outline: 'none', background: '#f8fafc' }}
                                    />
                                </div>
                                <div className="input-field-group">
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {appLanguage === 'ar' ? 'الترتيب' : 'Ordre'}
                                    </label>
                                    <input
                                        type="number"
                                        value={categoryForm.order}
                                        onChange={e => setCategoryForm({ ...categoryForm, order: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #f1f5f9', fontSize: '1rem', outline: 'none', background: '#f8fafc' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '15px', marginTop: '10px' }}>
                                <button onClick={() => setIsManagingCategory(false)} className="premium-btn-cancel">
                                    {appLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                                </button>
                                <button onClick={handleSaveCategory} className="premium-btn-save">
                                    <FaSave /> {appLanguage === 'ar' ? 'حفظ الفئة' : 'Confirmer la Catégorie'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
            {/* 🎁 Offer Creation Modal */}
            {isOfferModalOpen && ReactDOM.createPortal(
                <div className="premium-modal-backdrop" onClick={() => { setIsOfferModalOpen(false); setEditingOfferId(null); }}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="premium-modal-header">
                            <h2 className="premium-modal-title">
                                {editingOfferId 
                                    ? (appLanguage === 'ar' ? 'تعديل تفاصيل العرض' : 'Modifier les détails de l\'offre')
                                    : (appLanguage === 'ar' ? 'تفاصيل العرض الجديد' : 'Détails de la nouvelle offre')
                                }
                            </h2>
                            <button className="premium-modal-close-icon" onClick={() => { setIsOfferModalOpen(false); setEditingOfferId(null); }}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOffer} className="premium-form-grid" style={{ marginTop: '20px' }}>
                            <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                                <label>{appLanguage === 'ar' ? 'اسم العرض' : 'Nom de l\'offre'}</label>
                                <input
                                    type="text"
                                    value={offerForm.title[appLanguage] || ''}
                                    onChange={e => setOfferForm({ ...offerForm, title: { ...offerForm.title, [appLanguage]: e.target.value } })}
                                    required
                                />
                            </div>

                            <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                                <label>{appLanguage === 'ar' ? 'السعر المخفض (DT)' : 'Prix Promo (DT)'}</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={offerForm.newPrice}
                                    onChange={e => setOfferForm({ ...offerForm, newPrice: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                                <label>{appLanguage === 'ar' ? 'المدة (ساعات)' : 'Durée (Heures)'}</label>
                                <input
                                    type="number"
                                    value={offerForm.durationHours}
                                    onChange={e => setOfferForm({ ...offerForm, durationHours: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ gridColumn: 'span 4', marginTop: '20px' }}>
                                <button type="submit" className="premium-btn-cta gold" style={{ width: '100%', padding: '15px' }}>
                                    {appLanguage === 'ar' ? 'تأكيد ونشر العرض' : 'Confirmer et Publier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                .is-selected-for-offer {
                    border: 3px solid #D4AF37 !important;
                    transform: scale(0.95);
                    box-shadow: 0 0 20px rgba(212, 175, 55, 0.4) !important;
                }
                .active-selection {
                    animation: pulse-red 2s infinite;
                }
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .premium-offer-card {
                    padding: 20px !important;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    border: 1px solid rgba(212, 175, 55, 0.2);
                    background: linear-gradient(135deg, #ffffff 0%, #fff9e6 100%) !important;
                }
                .offer-badge-container {
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    width: 60px;
                    height: 60px;
                    z-index: 5;
                }
                .promo-badge-img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
                }
                .delete-offer-mini-btn {
                    position: absolute;
                    top: 10px;
                    right: -10px;
                    background: #fef2f2;
                    color: #ef4444;
                    border: 1px solid #fee2e2;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    cursor: pointer;
                    z-index: 10;
                }
                .offer-image-bundle {
                    height: 180px;
                    position: relative;
                    margin-top: 10px;
                }
                .bundle-img-wrapper {
                    position: absolute;
                    width: 110px;
                    height: 110px;
                    border-radius: 15px;
                    overflow: hidden;
                    border: 3px solid #fff;
                    box-shadow: 0 8px 15px rgba(0,0,0,0.1);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .bundle-img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
                .item-0 { z-index: 3; top: 10px; left: 10px; transform: rotate(-5deg); }
                .item-1 { z-index: 2; top: 40px; left: 60px; transform: rotate(5deg); }
                .item-2 { z-index: 1; top: 20px; left: 110px; transform: rotate(-2deg); }
                .bundle-count {
                    position: absolute;
                    bottom: 0px;
                    right: 0px;
                    background: #D4AF37;
                    color: #fff;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 1px;
                }
                .offer-main-title {
                    font-size: 0.9rem;
                    color: #1e293b;
                    font-weight: 800;
                    margin-bottom: 10px;
                    text-align: center;
                }
                .timer-unit-glam {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: #fff;
                    padding: 5px 8px;
                    border-radius: 8px;
                    min-width: 45px;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
                }
                .unit-val { font-size: 1rem; font-weight: 800; color: #ef4444; }
                .unit-lab { font-size: 0.5rem; color: #94a3b8; text-transform: uppercase; }
                .offer-price-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #fff;
                    padding: 10px;
                    border-radius: 12px;
                    border: 1px dashed #D4AF37;
                }
                .old-price-total {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    text-decoration: line-through;
                    display: block;
                }
                .new-price-highlight {
                    font-size: 1.3rem;
                    color: #ef4444;
                    font-weight: 900;
                }
                .offer-cta-btn {
                    background: #D4AF37;
                    color: #fff;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s;
                }
                .offer-cta-btn:hover { transform: translateX(5px); box-shadow: 0 4px 10px rgba(212,175,55,0.3); }

                .creative-pulsing-btn {
                    background: linear-gradient(135deg, #ef4444 0%, #D4AF37 100%);
                    color: white;
                    border: none;
                    box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);
                    animation: creative-pulse 2s infinite;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .creative-pulsing-btn:hover {
                    transform: scale(1.05) translateY(-3px);
                    box-shadow: 0 15px 40px rgba(239, 68, 68, 0.6);
                }
                @keyframes creative-pulse {
                    0% { transform: scale(1); box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4); }
                    50% { transform: scale(1.03); box-shadow: 0 15px 45px rgba(239, 68, 68, 0.6); }
                    100% { transform: scale(1); box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4); }
                }

                .ripple-effect {
                    position: relative;
                    overflow: hidden;
                }
                .ripple-effect::after {
                    content: "";
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                    transform: rotate(45deg);
                    animation: shimmer-glass 3s infinite;
                }
                @keyframes shimmer-glass {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
            `}</style>
        </>
    );
}

// ⏱️ Premium Countdown Component
const CountdownTimer = ({ expirationDate, appLanguage }) => {
    const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(expirationDate).getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                return;
            }

            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({
                h: h.toString().padStart(2, '0'),
                m: m.toString().padStart(2, '0'),
                s: s.toString().padStart(2, '0')
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [expirationDate]);

    return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <div className="timer-unit-glam"><span className="unit-val">{timeLeft.h}</span><span className="unit-lab">{appLanguage === 'ar' ? 'ساعة' : 'Hrs'}</span></div>
            <div className="timer-unit-glam"><span className="unit-val">{timeLeft.m}</span><span className="unit-lab">{appLanguage === 'ar' ? 'دقيقة' : 'Min'}</span></div>
            <div className="timer-unit-glam"><span className="unit-val">{timeLeft.s}</span><span className="unit-lab">{appLanguage === 'ar' ? 'ثانية' : 'Sec'}</span></div>
        </div>
    );
};