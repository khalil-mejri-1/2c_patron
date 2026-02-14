import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
    FaArrowRight, FaShoppingCart, FaTimes, FaPlusCircle, FaMinusCircle,
    FaUser, FaMapMarkerAlt, FaPhoneAlt, FaSpinner, FaCheckCircle,
    FaStar, FaRegStar, FaCommentAlt, FaChevronLeft, FaChevronRight,
    FaEdit, FaSave, FaTachometerAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import BASE_URL from '../apiConfig';

// 🌟 Translation Data Object 🌟
const translations = {
    fr: {
        mainTitle1: "L'ATELIER",
        mainTitle2: "COUTURE",
        subline: "MAÎTRISER L'ART DU PATRONAGE",
        introText: "Accédez aux secrets du patronage et du moulage avec des cours vidéo exclusifs. Devenez l'artisan d'art que vous avez toujours rêvé d'être.",
        ctaButton: "Découvrir le Master Atelier",
        cartButton: "Achat",
        products: [
            { id: 1, name: 'Patron Robe d\'Élégance', alt: 'Robe élégante' },
            { id: 2, name: 'Gabarit Jupe Crayon', alt: 'Jupe Crayon' },
            { id: 3, name: 'Masterclass Tissus Fluides', alt: 'Masterclass Tissus' },
        ],
        modalTitleUser: "Confirmation de votre commande",
        modalTitleGuest: "Finaliser votre commande",
        qtyLabel: "Quantité:",
        unitPrice: "/unité",
        total: "Total:",
        contactInfo: "Vos informations de livraison",
        namePlaceholder: "Nom complet",
        addressPlaceholder: "Adresse de livraison",
        phonePlaceholder: "Numéro de téléphone",
        validationError: "Veuillez remplir tous les champs obligatoires (Nom, Adresse, Téléphone).",
        networkError: "Erreur réseau. Veuillez réessayer plus tard.",
        submitting: "Envoi...",
        submitBtn: "Confirmer la commande",
        submitBtnGuest: "Passer la commande",
        cancelBtn: "Annuler",
        // Nouveaux textes pour les Modals
        successTitle: "Commande Réussie !",
        successMessage: (id) => `Votre commande N° <strong>${id}</strong> a été enregistrée. Un email de confirmation vous sera envoyé sous peu.`,
        feedbackBtn: "Laisser un commentaire",
        closeBtn: "Fermer",
        commentPrompt: "Votre avis nous est précieux !",
        ratingLabel: "Votre note:",
        commentPlaceholder: "Tapez votre commentaire ici...",
        sendCommentBtn: "Envoyer le commentaire",
        skipCommentBtn: "Annuler",
        commentSuccessMsg: "🎉 Merci ! Votre commentaire a été envoyé avec succès.",
        commentErrorMsg: "❌ Désolé, une erreur s'est produite lors de l'envoi du commentaire.",
        commentFormTitle: "Votre avis nous importe beaucoup !",
    },
    ar: {
        mainTitle1: "الورشة",
        mainTitle2: "للخياطة",
        subline: "إتقان فن الباتروناج",
        introText: "اكتشف أسرار الباتروناج والقولبة من خلال دورات فيديو حصرية. كن الحرفي المبدع الذي طالما حلمت به.",
        ctaButton: "اكتشفوا الأتيليه الرئيسي",
        cartButton: "شراء",
        products: [
            { id: 1, name: 'باترون فستان الأناقة', alt: 'فستان أنيق' },
            { id: 2, name: 'نموذج تنورة القلم', alt: 'تنورة القلم' },
            { id: 3, name: 'دورة إتقان الأقمشة المنسدلة', alt: 'دورة الأقمشة' },
        ],
        modalTitleUser: "تأكيد طلبك",
        modalTitleGuest: "إتمام عملية الشراء",
        qtyLabel: "الكمية:",
        unitPrice: "/للوحدة",
        total: "المجموع:",
        contactInfo: "بيانات التوصيل الخاصة بك",
        namePlaceholder: "الاسم الكامل",
        addressPlaceholder: "عنوان التوصيل",
        phonePlaceholder: "رقم الهاتف",
        validationError: "الرجاء تعبئة جميع الحقول المطلوبة (الاسم، العنوان، الهاتف).",
        networkError: "خطأ في الشبكة. الرجاء المحاولة لاحقًا.",
        submitting: "إرسال...",
        submitBtn: "تأكيد الطلب",
        submitBtnGuest: "إرسال الطلب",
        cancelBtn: "إلغاء",
        successTitle: "تمت عملية الطلب بنجاح!",
        successMessage: (id) => `تم تسجيل طلبك رقم <strong>${id}</strong>. سيتم إرسال رسالة تأكيد عبر البريد الإلكتروني قريباً.`,
        feedbackBtn: "ترك تعليق على الخدمة",
        closeBtn: "إغلاق",
        commentPrompt: "رأيك يهمنا كثيرًا!",
        ratingLabel: "تقييمك:",
        commentPlaceholder: "اكتب تعليقك هنا...",
        sendCommentBtn: "إرسال التعليق",
        skipCommentBtn: "إلغاء",
        commentSuccessMsg: "🎉 شكراً لك! تم إرسال تعليقك بنجاح.",
        commentErrorMsg: "❌ عذراً، حدث خطأ أثناء إرسال التعليق.",
        commentFormTitle: "رأيك يهمنا كثيرًا!",
    },
    en: {
        mainTitle1: "THE SEWING",
        mainTitle2: "WORKSHOP",
        subline: "MASTERING THE ART OF PATTERN MAKING",
        introText: "Access the secrets of pattern making and draping with exclusive video courses. Become the master craftsman you've always dreamed of being.",
        ctaButton: "Discover the Master Workshop",
        cartButton: "Purchase",
        products: [
            { id: 1, name: 'Elegant Dress Pattern', alt: 'Elegant Dress' },
            { id: 2, name: 'Pencil Skirt Template', alt: 'Pencil Skirt' },
            { id: 3, name: 'Fluid Fabrics Masterclass', alt: 'Fabrics Masterclass' },
        ],
        modalTitleUser: "Confirm Your Order",
        modalTitleGuest: "Finalize Your Purchase",
        qtyLabel: "Quantity:",
        unitPrice: "/unit",
        total: "Total:",
        contactInfo: "Your Delivery Information",
        namePlaceholder: "Full Name",
        addressPlaceholder: "Shipping Address",
        phonePlaceholder: "Phone Number",
        validationError: "Please fill in all required fields (Name, Address, Phone).",
        networkError: "Network error. Please try again later.",
        submitting: "Submitting...",
        submitBtn: "Confirm Order",
        submitBtnGuest: "Place Order",
        cancelBtn: "Cancel",
        successTitle: "Order Placed Successfully!",
        successMessage: (id) => `Your order N° <strong>${id}</strong> has been registered. A confirmation email will be sent shortly.`,
        feedbackBtn: "Leave Feedback",
        closeBtn: "Close",
        commentPrompt: "Your opinion matters a lot to us!",
        ratingLabel: "Your Rating:",
        commentPlaceholder: "Type your comment here...",
        sendCommentBtn: "Submit Comment",
        skipCommentBtn: "Cancel",
        commentSuccessMsg: "🎉 Thank you! Your comment has been submitted successfully.",
        commentErrorMsg: "❌ Sorry, an error occurred while submitting the comment.",
        commentFormTitle: "Your opinion matters a lot to us!",
    },
};

const API_COMMAND_URL = `${BASE_URL}/api/commands`;
const API_COMMENTAIRE_URL = `${BASE_URL}/api/commentaires`;


// **********************************************
// ********* 1. مكون نافذة التعليق *****************
// **********************************************

const CommentModalComponent = ({
    selectedProduct,
    closeCommentModal,
    appLanguage,
    customerData
}) => {
    const t = translations[appLanguage] || translations.fr;
    const [rating, setRating] = useState(5);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [validationMessage, setValidationMessage] = useState('');

    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    const handleRatingClick = (newRating) => {
        setRating(newRating);
        if (validationMessage) setValidationMessage('');
    };

    const handleCommentChange = (e) => {
        setCommentText(e.target.value);
        if (validationMessage) setValidationMessage('');
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        setValidationMessage('');

        if (rating === 0 && commentText.trim() === '') {
            setValidationMessage(t.commentRequiredError || (appLanguage === 'ar' ? "الرجاء إدخال تقييم أو تعليق قبل الإرسال." : "Please enter a rating or a comment before submitting."));
            return;
        }

        setIsSubmitting(true);

        const clientNameForComment = customerData.firstName && customerData.firstName.trim() !== ''
            ? customerData.firstName
            : `Guest/Product: ${selectedProduct.name}`;

        const commentData = {
            nom: clientNameForComment,
            commentaire: commentText.trim(),
            rating: rating,
            productId: selectedProduct.id,
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
                setTimeout(closeCommentModal, 2000);
            } else {
                const errorResult = await response.json();
                console.error("Échec de l'enregistrement du commentaire:", errorResult);
                setSubmitStatus('error');
            }

        } catch (error) {
            console.error("Erreur de réseau lors de l'envoi du commentaire:", error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setValidationMessage('');
        setSubmitStatus(null);
        closeCommentModal();
    };


    return (
        <div className="modal-overlay">
            <div className="comment-modal-content" dir={direction}>
                <button
                    className="modal-close-btn"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                >
                    <FaTimes />
                </button>

                <h4 className="form-subtitle">{t.commentFormTitle}</h4>

                {submitStatus === 'success' ? (
                    <div className="comment-status-message success">
                        {t.commentSuccessMsg}
                    </div>
                ) : submitStatus === 'error' ? (
                    <div className="comment-status-message error">
                        {t.commentErrorMsg}
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
                                placeholder={t.commentPlaceholder}
                                value={commentText}
                                onChange={handleCommentChange}
                                disabled={isSubmitting}
                                rows="4"
                                dir={direction}
                            />
                        </div>

                        {validationMessage && (
                            <p className="validation-error-text" style={{
                                color: '#dc3545',
                                margin: '10px 0',
                                padding: '5px',
                                border: '1px solid #dc3545',
                                borderRadius: '4px',
                                textAlign: 'center',
                                fontSize: '0.9em'
                            }}>
                                {validationMessage}
                            </p>
                        )}

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
                                onClick={handleCloseModal}
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

// **********************************************
// ********* 2. المكون الجديد لتأكيد النجاح *******
// **********************************************
const SuccessModalComponent = ({ lastCommandRef, closeSuccessModal, handleFeedbackClick, appLanguage }) => {
    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    return (
        <div className="custom-modal-backdrop-success">
            <div className="modern-modal-content-success" dir={direction}>
                <button className="close-btn-success" onClick={closeSuccessModal}><FaTimes /></button>

                <div className="success-icon-section">
                    <FaCheckCircle className="check-icon-large" />
                </div>

                <h2 className="success-modal-title">
                    {t.successTitle}
                </h2>

                <p className="success-message-text" dangerouslySetInnerHTML={{ __html: t.successMessage(lastCommandRef) }}></p>

                <div className="modal-action-buttons-success">
                    <button
                        type="button"
                        onClick={handleFeedbackClick} // ينتقل لـ CommentModal
                        className="feedback-button-success"
                    >
                        <FaCommentAlt /> {t.feedbackBtn}
                    </button>

                    <button
                        type="button"
                        onClick={closeSuccessModal}
                        className="return-button-success"
                    >
                        {t.closeBtn}
                    </button>
                </div>
            </div>
        </div>
    );
};


// **********************************************
// ********* 3. مكون نافذة الطلب (OrderModal) ****
// **********************************************
const OrderModalComponent = ({ selectedProduct, quantity, handleQuantityChange, closeOrderModal, isLoggedIn, currentUserEmail, onOrderSuccess, onCustomerDataUpdate, appLanguage }) => {
    const t = translations[appLanguage] || translations.fr;

    const [customerData, setCustomerData] = useState({
        firstName: '',
        adresse: '',
        phone: ''
    });

    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

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

        if (!clientName || clientName.trim() === '' || !shippingAddress || shippingAddress.trim() === '' || !clientPhone || clientPhone.trim() === '') {
            alert(t.validationError);
            return;
        }

        setIsSubmittingOrder(true);

        const orderData = {
            totalAmount: calculatedTotal,
            items: [{
                productId: selectedProduct.id,
                productName: selectedProduct.name,
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
                alert(`❌ ${t.networkError} : ${result.message || 'Problème de connexion au serveur.'}`);
            }

        } catch (error) {
            console.error("Erreur de réseau lors de la soumission:", error);
            alert(`❌ ${t.networkError}`);
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    const currency = selectedProduct.currency || 'DT';
    const totalPrice = (selectedProduct.price * quantity).toFixed(2);
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    return (
        <div className="modal-overlay">
            <div className="order-modal-content" dir={direction}>
                <button className="modal-close-btn" onClick={closeOrderModal} disabled={isSubmittingOrder}>
                    <FaTimes />
                </button>

                <h2 className="modal-title">
                    {isLoggedIn ? t.modalTitleUser : t.modalTitleGuest}
                </h2>

                <div className="product-summary">
                    <img src={selectedProduct.url} alt={selectedProduct.alt} className="summary-image" />
                    <div className="summary-details">
                        <p className="summary-name">{selectedProduct.name}</p>
                        <p className="summary-price">{selectedProduct.price.toFixed(2)} {currency} {t.unitPrice}</p>
                    </div>
                </div>

                <div className="quantity-control-group">
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
                    <p className="total-price-display">
                        {t.total} <strong>{totalPrice} {currency}</strong>
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
                            disabled={isSubmittingOrder}
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


// **********************************************
// ********* 4. مكون HeroSection الرئيسي ************
// **********************************************
export default function HeroSection({ isLoggedIn = false, currentUserEmail = '' }) {
    const { appLanguage, languages } = useLanguage();

    const currentLanguage = appLanguage;
    const texts = translations[currentLanguage] || translations.fr;

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [lastOrderId, setLastOrderId] = useState(null);
    const [customerData, setCustomerData] = useState({});

    // 🛑 Admin & Settings State
    const [isAdmin, setIsAdmin] = useState(false);
    const [heroTitles, setHeroTitles] = useState({});
    const [heroSublines, setHeroSublines] = useState({});
    const [heroIntros, setHeroIntros] = useState({});
    const [heroCtaTexts, setHeroCtaTexts] = useState({});

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitles, setEditTitles] = useState({ fr: '', ar: '', en: '' });

    const [isEditingSubline, setIsEditingSubline] = useState(false);
    const [editSublines, setEditSublines] = useState({ fr: '', ar: '', en: '' });

    const [isEditingIntro, setIsEditingIntro] = useState(false);
    const [editIntros, setEditIntros] = useState({ fr: '', ar: '', en: '' });

    const [isEditingCta, setIsEditingCta] = useState(false);
    const [editCtaTexts, setEditCtaTexts] = useState({ fr: '', ar: '', en: '' });

    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [newProduct, setNewProduct] = useState({ nom: '', prix: '', image: '' });

    // Fetch Admin Status & Settings
    useEffect(() => {
        // Check Admin
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const email = currentUserEmail || localStorage.getItem('currentUserEmail');
        const currentUser = users.find(u => u.email === email);
        if (currentUser?.statut === 'admin') setIsAdmin(true);

        // Fetch Titles (Local + Remote)
        const titleBackup = localStorage.getItem('hero_titles_backup');
        if (titleBackup) setHeroTitles(JSON.parse(titleBackup));

        const sublineBackup = localStorage.getItem('hero_sublines_backup');
        if (sublineBackup) setHeroSublines(JSON.parse(sublineBackup));

        const introBackup = localStorage.getItem('hero_intros_backup');
        if (introBackup) setHeroIntros(JSON.parse(introBackup));

        const ctaBackup = localStorage.getItem('hero_cta_backup');
        if (ctaBackup) setHeroCtaTexts(JSON.parse(ctaBackup));

        fetch(`${BASE_URL}/api/settings/hero-titles`)
            .then(res => res.ok ? res.json() : null)
            .then(data => data && setHeroTitles(data))
            .catch(() => { });

        fetch(`${BASE_URL}/api/settings/hero-sublines`)
            .then(res => res.ok ? res.json() : null)
            .then(data => data && setHeroSublines(data))
            .catch(() => { });

        fetch(`${BASE_URL}/api/settings/hero-intros`)
            .then(res => res.ok ? res.json() : null)
            .then(data => data && setHeroIntros(data))
            .catch(() => { });

        fetch(`${BASE_URL}/api/settings/hero-cta`)
            .then(res => res.ok ? res.json() : null)
            .then(data => data && setHeroCtaTexts(data))
            .catch(() => { });
    }, [currentUserEmail]);

    // 🔧 دالة مساعدة لتهيئة جميع اللغات المتاحة
    const initializeAllLanguages = (currentValues) => {
        const initialized = {};
        languages.forEach(lang => {
            initialized[lang.code] = currentValues[lang.code] || '';
        });
        return initialized;
    };

    const handleSaveTitles = async () => {
        localStorage.setItem('hero_titles_backup', JSON.stringify(editTitles));
        setHeroTitles(editTitles);
        setIsEditingTitle(false);
        try {
            await fetch(`${BASE_URL}/api/settings/hero-titles`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editTitles })
            });
        } catch (err) { }
    };

    const handleSaveCta = async () => {
        localStorage.setItem('hero_cta_backup', JSON.stringify(editCtaTexts));
        setHeroCtaTexts(editCtaTexts);
        setIsEditingCta(false);
        try {
            await fetch(`${BASE_URL}/api/settings/hero-cta`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editCtaTexts })
            });
        } catch (err) { }
    };

    const handleSaveSublines = async () => {
        localStorage.setItem('hero_sublines_backup', JSON.stringify(editSublines));
        setHeroSublines(editSublines);
        setIsEditingSubline(false);
        try {
            await fetch(`${BASE_URL}/api/settings/hero-sublines`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editSublines })
            });
        } catch (err) { }
    };

    const handleSaveIntros = async () => {
        localStorage.setItem('hero_intros_backup', JSON.stringify(editIntros));
        setHeroIntros(editIntros);
        setIsEditingIntro(false);
        try {
            await fetch(`${BASE_URL}/api/settings/hero-intros`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editIntros })
            });
        } catch (err) { }
    };

    const handleAddProduct = async () => {
        if (!newProduct.nom || !newProduct.prix || !newProduct.image) {
            alert(currentLanguage === 'ar' ? "يرجى ملء جميع الحقول" : "Please fill all fields");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/home-products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });

            if (response.ok) {
                const addedProduct = await response.json();
                const mappedProduct = {
                    id: addedProduct._id,
                    price: addedProduct.prix,
                    name: addedProduct.nom,
                    url: addedProduct.image,
                    alt: `${addedProduct.nom}`,
                    currency: 'DT'
                };
                setProducts(prev => [...prev, mappedProduct]);
                setIsAddingProduct(false);
                setNewProduct({ nom: '', prix: '', image: '' });
                alert(currentLanguage === 'ar' ? "تمت إضافة المنتج بنجاح" : "Product added successfully");
            } else {
                alert("Failed to add product");
            }
        } catch (err) {
            console.error("Error adding product:", err);
            alert("Error connecting to server");
        }
    };

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/home-products`);
                if (!response.ok) throw new Error("Failed to fetch products.");
                const data = await response.json();
                const mappedProducts = data.map((item) => ({
                    id: item._id,
                    price: item.prix,
                    name: item.nom,
                    url: item.image,
                    alt: `${texts.products[0].alt} - ${item.nom}`,
                    currency: 'DT'
                }));
                setProducts(mappedProducts);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError(texts.introText);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [currentLanguage]);

    // ********* 3D Rotation Logic *************
    const [currentIndex, setCurrentIndex] = useState(0);
    const autoPlayRef = useRef(null);

    const startAutoPlay = () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length);
        }, 6000);
    };

    useEffect(() => {
        if (products.length > 1) {
            startAutoPlay();
            return () => clearInterval(autoPlayRef.current);
        }
    }, [products.length]);

    const handleNext = () => {
        if (products.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % products.length);
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        startAutoPlay();
    };

    const handlePrev = () => {
        if (products.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        startAutoPlay();
    };

    // Calculate class based on index
    const getCardClass = (index) => {
        const len = products.length;
        if (len === 0) return 'hero-card hidden-card';
        // Calculate offset: 0=Main, 1=Second, 2=Tertiary/Last
        const offset = (index - currentIndex + len) % len;

        if (offset === 0) return 'hero-card main-card';
        if (offset === 1) return 'hero-card secondary-card';
        if (offset === 2) return 'hero-card tertiary-card'; // Or maybe offset === len-1 for "previous"
        // But the user liked the "stack" look (Center, Right 1, Right 2 maybe?)
        // Let's stick to the visual logic:
        // Position 0: Front
        // Position 1: Right Behind
        // Position 2: Right Further Behind (or Left if we want balanced)

        // Hiding others
        return 'hero-card hidden-card';
    };

    const handleCardClick = (index) => {
        const len = products.length;
        const offset = (index - currentIndex + len) % len;
        if (offset === 1) handleNext();
        else if (offset === 2 || offset === len - 1) handlePrev();
    };

    // ********* Modals Logic *************
    const openOrderModal = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setIsOrderModalOpen(true);
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };

    const closeOrderModal = () => {
        setIsOrderModalOpen(false);
        startAutoPlay();
    };

    const handleQuantityChange = (change) => {
        setQuantity(prevQty => Math.max(1, prevQty + change));
    };

    const handleOrderSuccess = (commandId) => {
        setLastOrderId(commandId);
        closeOrderModal();
        setIsSuccessModalOpen(true);
    };

    const closeSuccessModal = () => {
        setIsSuccessModalOpen(false);
        startAutoPlay();
    };

    const handleFeedbackClick = () => {
        setIsSuccessModalOpen(false);
        setIsCommentModalOpen(true);
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };

    const closeCommentModal = () => {
        setIsCommentModalOpen(false);
        setSelectedProduct(null);
        setLastOrderId(null);
        startAutoPlay();
    };

    const handleCustomerDataUpdate = (newData) => {
        setCustomerData(newData);
    };

    const sectionDirection = currentLanguage === 'ar' ? 'rtl' : 'ltr';



    return (
        <>
            <section className="modern-hero-section" dir={sectionDirection}>

                <div className="hero-content-block">


                    <h1 className="hero-main-title">
                        {heroTitles[currentLanguage] ? (
                            <span dangerouslySetInnerHTML={{ __html: heroTitles[currentLanguage] }} />
                        ) : (
                            <>
                                <span style={{ color: "#222" }}>{texts.mainTitle1}</span>
                                <br />
                                <span className="accent-text">{texts.mainTitle2}</span>
                            </>
                        )}

                        {isAdmin && (
                            <button
                                onClick={() => { setEditTitles(initializeAllLanguages(heroTitles)); setIsEditingTitle(true); }}
                                className="hero-edit-title-btn"
                                title="Modifier le titre"
                            >
                                <FaEdit />
                            </button>
                        )}
                        <span className="hero-subline">
                            {heroSublines[currentLanguage] || texts.subline}
                            {isAdmin && (
                                <button
                                    onClick={() => { setEditSublines(initializeAllLanguages(heroSublines)); setIsEditingSubline(true); }}
                                    className="hero-edit-title-btn small-edit-btn"
                                    title="Modifier le sous-titre"
                                >
                                    <FaEdit />
                                </button>
                            )}
                        </span>
                    </h1>
                    <p className="hero-intro-text">
                        {heroIntros[currentLanguage] || texts.introText}
                        {isAdmin && (
                            <button
                                onClick={() => { setEditIntros(initializeAllLanguages(heroIntros)); setIsEditingIntro(true); }}
                                className="hero-edit-title-btn small-edit-btn"
                                title="Modifier le texte d'introduction"
                            >
                                <FaEdit />
                            </button>
                        )}
                    </p>
                    <Link to="/magasin" className="hero-cta-button">
                        {heroCtaTexts[currentLanguage] || texts.ctaButton}
                        {currentLanguage !== 'ar' && <FaArrowRight style={{ marginLeft: '10px' }} />}
                        {currentLanguage === 'ar' && <FaArrowRight style={{ transform: 'rotate(180deg)', marginRight: '10px' }} />}
                    </Link>
                    {isAdmin && (
                        <button
                            onClick={() => { setEditCtaTexts(initializeAllLanguages(heroCtaTexts)); setIsEditingCta(true); }}
                            className="hero-edit-title-btn small-edit-btn"
                            style={{ verticalAlign: 'middle', marginTop: '-5px' }}
                            title="Modifier le texte du bouton CTA"
                        >
                            <FaEdit />
                        </button>
                    )}
                </div>

                <div className="hero-3d-container">

                    {isAdmin && (
                        <button
                            onClick={() => setIsAddingProduct(true)}
                            className="hero-edit-title-btn"
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                zIndex: 100,
                                background: '#28a745',
                                borderColor: '#28a745',
                                color: '#fff'
                            }}
                            title="Ajouter un produit"
                        >
                            <FaPlusCircle />
                        </button>
                    )}

                    {/* Display buttons only if we have products and are not loading */}
                    {!isLoading && products.length > 0 && (
                        <>
                            <button className="hero-nav-btn prev" onClick={handlePrev} aria-label="Previous Product">
                                <FaChevronLeft />
                            </button>
                            <button className="hero-nav-btn next" onClick={handleNext} aria-label="Next Product">
                                <FaChevronRight />
                            </button>
                        </>
                    )}

                    <div className="hero-cards-wrapper floating-animation">
                        {isLoading ? (
                            <>
                                {/* Skeleton Main Card */}
                                <div className="hero-card main-card skeleton-loading">
                                    <div className="hero-card-image-container skeleton-box"></div>
                                    <div className="hero-card-details">
                                        <div className="skeleton-text" style={{ width: '60%' }}></div>
                                        <div className="hero-card-meta">
                                            <div className="skeleton-price"></div>
                                            <div className="skeleton-btn"></div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (error || products.length === 0) ? (
                            <div style={{ color: 'red', marginTop: '20px', background: 'rgba(255,255,255,0.9)', padding: '20px', borderRadius: '10px' }}>
                                {currentLanguage === 'ar' ? '❌ عذراً، لا يمكن عرض المنتجات حالياً. ' : '❌ Sorry, products cannot be displayed currently.'}
                            </div>
                        ) : (
                            products.map((product, index) => {
                                const cardClass = getCardClass(index);
                                const isMain = cardClass.includes('main-card');

                                return (
                                    <div
                                        key={product.id}
                                        className={`${cardClass}`}
                                        onClick={() => handleCardClick(index)}
                                    >
                                        {isMain ? (
                                            <>
                                                <div className="hero-card-image-container">
                                                    <img
                                                        src={product.url}
                                                        alt={product.alt}
                                                        className="hero-card-image"
                                                    />
                                                </div>
                                                <div className="hero-card-details">
                                                    <h3 className="hero-card-title">{product.name}</h3>
                                                    <div className="hero-card-meta">
                                                        <span className="hero-card-price">{product.price} {product.currency}</span>
                                                        <button
                                                            className="hero-card-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openOrderModal(product);
                                                            }}
                                                        >
                                                            <FaShoppingCart />
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <img
                                                src={product.url}
                                                alt={product.alt}
                                                className="hero-card-image"
                                                style={{ height: '100%', objectFit: 'cover' }}
                                            />
                                        )}
                                    </div>
                                );
                            }))}
                    </div>
                </div>
            </section>

            {isOrderModalOpen && selectedProduct && (
                <OrderModalComponent
                    selectedProduct={selectedProduct}
                    quantity={quantity}
                    handleQuantityChange={handleQuantityChange}
                    closeOrderModal={closeOrderModal}
                    isLoggedIn={isLoggedIn}
                    currentUserEmail={currentUserEmail}
                    onOrderSuccess={handleOrderSuccess}
                    onCustomerDataUpdate={handleCustomerDataUpdate}
                    appLanguage={currentLanguage}
                />
            )}

            {isSuccessModalOpen && lastOrderId && (
                <SuccessModalComponent
                    lastCommandRef={lastOrderId}
                    closeSuccessModal={closeSuccessModal}
                    handleFeedbackClick={handleFeedbackClick}
                    appLanguage={currentLanguage}
                />
            )}

            {isCommentModalOpen && selectedProduct && (
                <CommentModalComponent
                    selectedProduct={selectedProduct}
                    closeCommentModal={closeCommentModal}
                    appLanguage={currentLanguage}
                    customerData={customerData}
                />
            )}
            {/* 🛑 Title Edit Modal */}
            {isEditingTitle && (
                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                    <div className="modal-content" style={{
                        background: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>Modifier le Titre Principal</h3>

                        {languages.map(lang => (
                            <div key={lang.code} style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                                    {lang.label}
                                </label>
                                <input
                                    type="text"
                                    value={editTitles[lang.code] || ''}
                                    onChange={e => setEditTitles({ ...editTitles, [lang.code]: e.target.value })}
                                    dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                    style={{
                                        width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd',
                                        fontSize: '16px'
                                    }}
                                    placeholder={`Titre en ${lang.label}...`}
                                />
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsEditingTitle(false)} style={{
                                padding: '10px 20px', background: '#f8f9fa', color: '#333',
                                border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer'
                            }}>
                                Annuler
                            </button>
                            <button onClick={handleSaveTitles} style={{
                                padding: '10px 20px', background: '#28a745', color: '#fff',
                                border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <FaSave /> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* 🛑 Subline Edit Modal */}
            {isEditingSubline && (
                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                    <div className="modal-content" style={{
                        background: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>Modifier le Sous-Titre</h3>

                        {languages.map(lang => (
                            <div key={lang.code} style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                                    {lang.label}
                                </label>
                                <input
                                    type="text"
                                    value={editSublines[lang.code] || ''}
                                    onChange={e => setEditSublines({ ...editSublines, [lang.code]: e.target.value })}
                                    dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                    style={{
                                        width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd',
                                        fontSize: '16px'
                                    }}
                                    placeholder={`Subline en ${lang.label}...`}
                                />
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsEditingSubline(false)} style={{
                                padding: '10px 20px', background: '#f8f9fa', color: '#333',
                                border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer'
                            }}>
                                Annuler
                            </button>
                            <button onClick={handleSaveSublines} style={{
                                padding: '10px 20px', background: '#28a745', color: '#fff',
                                border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <FaSave /> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🛑 Intro Edit Modal */}
            {isEditingIntro && (
                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                    <div className="modal-content" style={{
                        background: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>Modifier le Texte d'Introduction</h3>

                        {languages.map(lang => (
                            <div key={lang.code} style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                                    {lang.label}
                                </label>
                                <textarea
                                    value={editIntros[lang.code] || ''}
                                    onChange={e => setEditIntros({ ...editIntros, [lang.code]: e.target.value })}
                                    dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                    rows="4"
                                    style={{
                                        width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd',
                                        fontSize: '16px', resize: 'vertical'
                                    }}
                                    placeholder={`Texte d'introduction en ${lang.label}...`}
                                />
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsEditingIntro(false)} style={{
                                padding: '10px 20px', background: '#f8f9fa', color: '#333',
                                border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer'
                            }}>
                                Annuler
                            </button>
                            <button onClick={handleSaveIntros} style={{
                                padding: '10px 20px', background: '#28a745', color: '#fff',
                                border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <FaSave /> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* 🛑 CTA Edit Modal */}
            {isEditingCta && (
                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                    <div className="modal-content" style={{
                        background: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>Modifier le Texte du Bouton CTA</h3>

                        {languages.map(lang => (
                            <div key={lang.code} style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                                    {lang.label}
                                </label>
                                <input
                                    type="text"
                                    value={editCtaTexts[lang.code] || ''}
                                    onChange={e => setEditCtaTexts({ ...editCtaTexts, [lang.code]: e.target.value })}
                                    dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                    style={{
                                        width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd',
                                        fontSize: '16px'
                                    }}
                                    placeholder={`Bouton en ${lang.label}...`}
                                />
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsEditingCta(false)} style={{
                                padding: '10px 20px', background: '#f8f9fa', color: '#333',
                                border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer'
                            }}>
                                Annuler
                            </button>
                            <button onClick={handleSaveCta} style={{
                                padding: '10px 20px', background: '#28a745', color: '#fff',
                                border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <FaSave /> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* 🛑 Add Product Modal */}
            {isAddingProduct && (
                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                    <div className="modal-content" style={{
                        background: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '450px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>
                            {currentLanguage === 'ar' ? 'إضافة منتج جديد' : 'Ajouter un Nouveau Produit'}
                        </h3>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nom du produit</label>
                            <input
                                type="text"
                                value={newProduct.nom}
                                onChange={e => setNewProduct({ ...newProduct, nom: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                placeholder="Ex: Patron Robe..."
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Prix (DT)</label>
                            <input
                                type="number"
                                value={newProduct.prix}
                                onChange={e => setNewProduct({ ...newProduct, prix: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                placeholder="29.90"
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>URL de l'image</label>
                            <input
                                type="text"
                                value={newProduct.image}
                                onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setIsAddingProduct(false)}
                                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddProduct}
                                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#28a745', color: '#fff', cursor: 'pointer' }}
                            >
                                <FaPlusCircle /> Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}