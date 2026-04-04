import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAlert } from '../context/AlertContext';
import {
    FaArrowRight, FaShoppingCart, FaTimes, FaPlusCircle, FaMinusCircle,
    FaUser, FaMapMarkerAlt, FaPhoneAlt, FaSpinner, FaCheckCircle,
    FaStar, FaRegStar, FaCommentAlt, FaChevronLeft, FaChevronRight,
    FaEdit, FaSave, FaTachometerAlt, FaTags, FaHandPointer
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import BASE_URL from '../apiConfig';
import '../pages/shop_redesign.css';

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
// ********* 1.5. مكون كاروسيل الصور (Carousel) ****
// **********************************************
const ImageCarousel = ({ images, direction, height = "280px" }) => {
    // Deduplicate images to avoid issues
    const uniqueImages = Array.from(new Set(images.filter(Boolean)));
    const [currentIndex, setCurrentIndex] = useState(0);

    if (uniqueImages.length === 0) return null;

    const goToNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prevIndex) => (prevIndex + 1) % uniqueImages.length);
    };

    const goToPrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prevIndex) => (prevIndex - 1 + uniqueImages.length) % uniqueImages.length);
    };

    return (
        <div className="image-carousel-container" style={{
            position: 'relative',
            width: '100%',
            height: height,
            backgroundColor: '#f8fafc',
            borderRadius: '24px',
            overflow: 'hidden',
            marginBottom: '25px',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.03)',
            border: '1px solid #f1f5f9'
        }}>
            <div className="carousel-inner" dir="ltr" style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: `translateX(-${currentIndex * 100}%)`
            }}>
                {uniqueImages.map((img, index) => (
                    <div key={index} style={{ 
                        flex: '0 0 100%', 
                        width: '100%', 
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#ffffff'
                    }}>
                        <img
                            src={img}
                            alt={`Product view ${index + 1}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                transition: 'transform 0.5s ease'
                            }}
                        />
                    </div>
                ))}
            </div>

            {uniqueImages.length > 1 && (
                <>
                    <button
                        onClick={(e) => goToPrev(e)}
                        className="carousel-control-btn prev"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            left: '15px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #e2e8f0',
                            color: '#1a1a1a',
                            width: '45px',
                            height: '45px',
                            cursor: 'pointer',
                            zIndex: 20,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <FaChevronLeft size={18} />
                    </button>
                    <button
                        onClick={(e) => goToNext(e)}
                        className="carousel-control-btn next"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            right: '15px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #e2e8f0',
                            color: '#1a1a1a',
                            width: '45px',
                            height: '45px',
                            cursor: 'pointer',
                            zIndex: 20,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <FaChevronRight size={18} />
                    </button>

                    <div className="carousel-dots-indicators" style={{ 
                        position: 'absolute', 
                        bottom: '20px', 
                        width: '100%', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        zIndex: 20 
                    }}>
                        {uniqueImages.map((_, index) => (
                            <span
                                key={index}
                                style={{
                                    display: 'inline-block',
                                    width: index === currentIndex ? '25px' : '8px',
                                    height: '8px',
                                    borderRadius: '10px',
                                    backgroundColor: index === currentIndex ? '#D4AF37' : 'rgba(0,0,0,0.15)',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s'
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
        <div className="premium-modal-backdrop" onClick={handleCloseModal}>
            <div className="premium-modal-content" onClick={(e) => e.stopPropagation()} dir={direction}>
                <button
                    className="premium-modal-close-icon"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                >
                    <FaTimes />
                </button>

                <h2 className="premium-modal-title">{t.commentFormTitle}</h2>

                {submitStatus === 'success' ? (
                    <div className="comment-status-message success" style={{ background: '#f0fdf4', color: '#166534', padding: '20px', borderRadius: '16px', marginTop: '20px' }}>
                        {t.commentSuccessMsg}
                    </div>
                ) : submitStatus === 'error' ? (
                    <div className="comment-status-message error" style={{ background: '#fef2f2', color: '#991b1b', padding: '20px', borderRadius: '16px', marginTop: '20px' }}>
                        {t.commentErrorMsg}
                    </div>
                ) : (
                    <form onSubmit={handleSubmitComment}>
                        <div className="rating-control-group" style={{ marginBottom: '25px' }}>
                            <p style={{ fontWeight: '700', color: '#64748b', marginBottom: '15px' }}>{t.ratingLabel}</p>
                            <div className="rating-stars" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className="star"
                                        onClick={() => handleRatingClick(star)}
                                        style={{ color: star <= rating ? '#ffc107' : '#e4e5e9', cursor: 'pointer', fontSize: '32px', transition: 'transform 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {star <= rating ? <FaStar /> : <FaRegStar />}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="premium-form-group">
                            <label>{t.commentPlaceholder}</label>
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
                                margin: '15px 0',
                                padding: '10px',
                                background: '#fff5f5',
                                border: '1px solid #feb2b2',
                                borderRadius: '12px',
                                textAlign: 'center',
                                fontSize: '0.9em'
                            }}>
                                {validationMessage}
                            </p>
                        )}

                        <div className="premium-btn-group">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="premium-btn-cta secondary"
                                disabled={isSubmitting}
                            >
                                {t.skipCommentBtn}
                            </button>
                            <button
                                type="submit"
                                className="premium-btn-cta gold"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <> <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> {t.submitting}</>
                                ) : (
                                    t.sendCommentBtn
                                )}
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
        <div className="premium-modal-backdrop" onClick={closeSuccessModal}>
            <div className="premium-modal-content" onClick={(e) => e.stopPropagation()} dir={direction}>
                <button className="premium-modal-close-icon" onClick={closeSuccessModal}><FaTimes /></button>

                <div className="vip-cert-icon-wrapper" style={{ margin: '0 auto 20px', background: '#f0fdf4', color: '#22c55e' }}>
                    <FaCheckCircle />
                </div>

                <h2 className="premium-modal-title">
                    {t.successTitle}
                </h2>

                <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '30px', fontSize: '1.1rem' }} dangerouslySetInnerHTML={{ __html: t.successMessage(lastCommandRef) }}></p>

                <div className="premium-btn-group">
                    <button
                        type="button"
                        onClick={handleFeedbackClick} // ينتقل لـ CommentModal
                        className="premium-btn-cta gold"
                    >
                        <FaCommentAlt /> {t.feedbackBtn}
                    </button>

                    <button
                        type="button"
                        onClick={closeSuccessModal}
                        className="premium-btn-cta secondary"
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
const OrderModalComponent = ({ selectedProduct, quantity, handleQuantityChange, closeOrderModal, isLoggedIn, currentUserEmail, onOrderSuccess, onCustomerDataUpdate, appLanguage, showAlert }) => {
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
            showAlert('warning', 'Validation', t.validationError);
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
                showAlert('error', t.networkError, result.message || 'Problème de connexion au serveur.');
            }

        } catch (error) {
            console.error("Erreur de réseau lors de la soumission:", error);
            showAlert('error', 'Erreur', t.networkError);
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

                {/* Image Carousel inside Modal */}
                <ImageCarousel 
                    images={[selectedProduct.url, ...(selectedProduct.secondaryImages || []), ...(selectedProduct.innerImages || [])].filter(Boolean)}
                    direction={direction}
                    height="400px"
                />

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
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions-order">
                        <button
                            type="submit"
                            className="confirm-order-btn"
                            disabled={isSubmittingOrder || !customerData.firstName || !customerData.adresse || !customerData.phone}
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
    const { showAlert } = useAlert();

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
    const [heroSecondaryCtaTexts, setHeroSecondaryCtaTexts] = useState({});

    const [isEditingHero, setIsEditingHero] = useState(false);
    const [editHeroData, setEditHeroData] = useState({
        titles: {},
        sublines: {},
        intros: {},
        ctaTexts: {},
        secondaryCtaTexts: {}
    });

    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [newProduct, setNewProduct] = useState({ nom: {}, prix: '', image: '' });

    useEffect(() => {
        // Check Admin
        // Check Admin
        const email = currentUserEmail || localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
        if (email) {
            fetch(`${BASE_URL}/api/users/${email}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data && data.statut === 'admin') setIsAdmin(true);
                })
                .catch(() => { });
        }

        const fetchHeroSettings = async () => {
            try {
                const [titles, sublines, intros, cta, secondaryCta] = await Promise.all([
                    fetch(`${BASE_URL}/api/settings/hero-titles`).then(res => res.ok ? res.json() : {}),
                    fetch(`${BASE_URL}/api/settings/hero-sublines`).then(res => res.ok ? res.json() : {}),
                    fetch(`${BASE_URL}/api/settings/hero-intros`).then(res => res.ok ? res.json() : {}),
                    fetch(`${BASE_URL}/api/settings/hero-cta`).then(res => res.ok ? res.json() : {}),
                    fetch(`${BASE_URL}/api/settings/hero-secondary-cta`).then(res => res.ok ? res.json() : {})
                ]);
                setHeroTitles(titles || {});
                setHeroSublines(sublines || {});
                setHeroIntros(intros || {});
                setHeroCtaTexts(cta || {});
                setHeroSecondaryCtaTexts(secondaryCta || {});

                // Pre-initialize edit data
                setEditHeroData({
                    titles: initializeAllLanguages(titles || {}, 'mainTitle1'),
                    sublines: initializeAllLanguages(sublines || {}, 'subline'),
                    intros: initializeAllLanguages(intros || {}, 'introText'),
                    ctaTexts: initializeAllLanguages(cta || {}, 'ctaButton'),
                    secondaryCtaTexts: initializeAllLanguages(secondaryCta || {}, 'secondaryCta')
                });
            } catch (err) { }
        };
        fetchHeroSettings();
    }, [currentUserEmail, languages]); // languages added to dependency

    // 🔧 دالة مساعدة لتهيئة جميع اللغات المتاحة
    const initializeAllLanguages = (currentValues, fallbackKey) => {
        const initialized = {};
        languages.forEach(lang => {
            const fallback = translations[lang.code] || translations.fr;
            let fallbackVal = fallback[fallbackKey] || '';
            if (fallbackKey === 'mainTitle1' && fallback.mainTitle1 && fallback.mainTitle2) {
                fallbackVal = `${fallback.mainTitle1} <br/> <span class="accent-text">${fallback.mainTitle2}</span>`;
            }
            if (fallbackKey === 'secondaryCta') {
                fallbackVal = lang.code === 'ar' ? 'اكتشف العروض' : 'Découvrir les Offres';
            }
            initialized[lang.code] = currentValues[lang.code] || fallbackVal;
        });
        return initialized;
    };

    const handleSaveHero = async () => {
        // Save everything
        setHeroTitles(editHeroData.titles);
        setHeroSublines(editHeroData.sublines);
        setHeroIntros(editHeroData.intros);
        setHeroCtaTexts(editHeroData.ctaTexts);
        setHeroSecondaryCtaTexts(editHeroData.secondaryCtaTexts);
        setIsEditingHero(false);

        try {
            // Parallel saves to maintain separate settings if needed, 
            // or we could have a single "hero-all" endpoint if the backend supports it.
            // For now, staying compatible with existing endpoints.
            await Promise.all([
                fetch(`${BASE_URL}/api/settings/hero-titles`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: editHeroData.titles })
                }),
                fetch(`${BASE_URL}/api/settings/hero-sublines`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: editHeroData.sublines })
                }),
                fetch(`${BASE_URL}/api/settings/hero-intros`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: editHeroData.intros })
                }),
                fetch(`${BASE_URL}/api/settings/hero-cta`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: editHeroData.ctaTexts })
                }),
                fetch(`${BASE_URL}/api/settings/hero-secondary-cta`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: editHeroData.secondaryCtaTexts })
                })
            ]);
            showAlert('success', appLanguage === 'ar' ? 'تم الحفظ' : 'Enregistré', appLanguage === 'ar' ? 'تم تحديث إعدادات الواجهة بنجاح' : 'Paramètres mis à jour');
        } catch (err) {
            console.error("Error saving hero settings:", err);
            showAlert('error', 'Error', 'Failed to save');
        }
    };

    const handleAddProduct = async () => {
        const hasNom = Object.values(newProduct.nom).some(v => v && v.trim() !== '');
        if (!hasNom || !newProduct.prix || !newProduct.image) {
            showAlert('warning', 'Validation', currentLanguage === 'ar' ? "يرجى ملء جميع الحقول" : "Please fill all fields");
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
                    secondaryImages: addedProduct.secondaryImages || [],
                    innerImages: addedProduct.innerImages || [],
                    currency: 'DT'
                };
                setProducts(prev => [...prev, mappedProduct]);
                setIsAddingProduct(false);
                setNewProduct({ nom: {}, prix: '', image: '' });
                showAlert('success', appLanguage === 'ar' ? 'تمت العملية' : 'Succès', appLanguage === 'ar' ? 'تم إضافة المنتج بنجاح' : 'Produit ajouté');
            } else {
                showAlert('error', 'Error', 'Failed to add product');
            }
        } catch (err) {
            console.error("Error adding product:", err);
            showAlert('error', 'Error', 'Connection error');
        }
    };

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/home-products`);
                if (!response.ok) throw new Error("Failed to fetch products.");
                const data = await response.json();
                const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
                const mappedProducts = sortedData.map((item) => ({
                    id: item._id,
                    price: item.prix,
                    name: typeof item.nom === 'object' ? (item.nom[currentLanguage] || item.nom.fr) : item.nom,
                    url: item.image,
                    alt: `${texts.products[0].alt} - ${typeof item.nom === 'object' ? (item.nom[currentLanguage] || item.nom.fr) : item.nom}`,
                    secondaryImages: item.secondaryImages || [],
                    innerImages: item.innerImages || [],
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
        else if (offset === 0) openOrderModal(products[index]);
    };

    // ********* Modals Logic *************
    const openOrderModal = async (product) => {
        const productId = product.id;
        
        // Modal initially with current info
        setSelectedProduct({
            ...product,
            secondaryImages: product.secondaryImages || [],
            innerImages: product.innerImages || []
        });
        setQuantity(1);
        setIsOrderModalOpen(true);
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);

        // Fetch deep details cross-referencing with the general Product collection
        try {
            // Because HomeProduct might not have secondaryImages populated correctly
            // we search the main Product collection by product name (nom)
            let response = await fetch(`${BASE_URL}/api/products`);
            
            if (response.ok) {
                const allProducts = await response.json();
                
                // Find matching product by name (in any language)
                const matchingProduct = allProducts.find(p => {
                    if (!p.nom) return false;
                    const searchName = product.name?.trim()?.toLowerCase();
                    const pNameFr = (typeof p.nom === 'object' ? p.nom.fr : p.nom)?.trim()?.toLowerCase();
                    const pNameAr = (typeof p.nom === 'object' ? p.nom.ar : p.nom)?.trim()?.toLowerCase();
                    const pNameEn = (typeof p.nom === 'object' ? p.nom.en : p.nom)?.trim()?.toLowerCase();
                    
                    return pNameFr === searchName || pNameAr === searchName || pNameEn === searchName;
                });

                if (matchingProduct) {
                    setSelectedProduct(prev => {
                        if (prev && prev.id === productId) {
                            return {
                                ...prev,
                                // Support both field naming conventions if they differ
                                secondaryImages: matchingProduct.secondaryImages || matchingProduct.images || [],
                                innerImages: matchingProduct.innerImages || []
                            };
                        }
                        return prev;
                    });
                }
            }
        } catch (err) {
            console.error("Error fetching full product details:", err);
        }
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
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setIsEditingHero(true);
                            }}
                            className="admin-edit-master-btn"
                            style={{
                                position: 'absolute',
                                top: '25px',
                                right: '35px',
                                zIndex: 100
                            }}
                        >
                            <FaEdit /> {currentLanguage === 'ar' ? 'تعديل الواجهة' : 'Modifier Hero'}
                        </button>
                    )}

                    <h1 className="hero-main-title">
                        {heroTitles[currentLanguage] ? (
                            <span dangerouslySetInnerHTML={{ __html: heroTitles[currentLanguage] }} />
                        ) : (
                            <>
                                <span>{texts.mainTitle1}</span>
                                <br />
                                <span className="accent-text">{texts.mainTitle2}</span>
                            </>
                        )}
                    </h1>

                    <span className="hero-subline">
                        {heroSublines[currentLanguage] || texts.subline}
                    </span>

                    <p className="hero-intro-text">
                        {heroIntros[currentLanguage] || texts.introText}
                    </p>

                    <div className="hero-cta-wrapper">
                        <Link to="/magasin" className="hero-cta-button">
                            {heroCtaTexts[currentLanguage] || texts.ctaButton}
                            {currentLanguage !== 'ar' && <FaArrowRight style={{ marginLeft: '10px' }} />}
                            {currentLanguage === 'ar' && <FaArrowRight style={{ transform: 'rotate(180deg)', marginRight: '10px' }} />}
                        </Link>

                        <Link to="/magasin?category=offre" className="hero-cta-button secondary-cta">
                            {heroSecondaryCtaTexts[currentLanguage] || (currentLanguage === 'ar' ? 'اكتشف العروض' : 'Découvrir les Offres')}
                            <FaTags style={{ marginLeft: '10px' }} />
                            <FaHandPointer className="pointing-finger-icon" />
                        </Link>
                    </div>
                </div>

                <div className="hero-3d-container">



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
                                        <div className="hero-card-image-wrapper">
                                            <img
                                                src={product.url}
                                                alt={product.alt}
                                                className="hero-card-image"
                                                style={{ height: '100%', objectFit: 'cover', cursor: isMain ? 'pointer' : 'default' }}
                                            />
                                        </div>

                                        {isMain && (
                                            <div className="hero-card-details-overlay">
                                                <h3 className="hero-card-title">{product.name}</h3>
                                                <div className="hero-card-footer">
                                                    <span className="hero-card-price">{product.price} {product.currency}</span>
                                                    <button 
                                                        className="hero-card-order-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openOrderModal(product);
                                                        }}
                                                    >
                                                        <FaShoppingCart /> {texts.cartButton}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }))}
                    </div>
                </div>
            </section>

            {isOrderModalOpen && selectedProduct && ReactDOM.createPortal(
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
                    showAlert={showAlert}
                />,
                document.body
            )}

            {isSuccessModalOpen && lastOrderId && ReactDOM.createPortal(
                <SuccessModalComponent
                    lastCommandRef={lastOrderId}
                    closeSuccessModal={closeSuccessModal}
                    handleFeedbackClick={handleFeedbackClick}
                    appLanguage={currentLanguage}
                />,
                document.body
            )}

            {isCommentModalOpen && selectedProduct && ReactDOM.createPortal(
                <CommentModalComponent
                    selectedProduct={selectedProduct}
                    closeCommentModal={closeCommentModal}
                    appLanguage={currentLanguage}
                    customerData={customerData}
                />,
                document.body
            )}
            {/* 🛑 Unified Hero Edit Modal */}
            {isEditingHero && ReactDOM.createPortal(
                <div className="premium-modal-backdrop" onClick={() => setIsEditingHero(false)}>
                    <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingHero(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">
                            {currentLanguage === 'ar' ? 'تعديل قسم الواجهة' : 'Modifier la Section Hero'}
                        </h2>

                        <div className="premium-form-grid">
                            {languages.filter(l => l.code === currentLanguage).map(lang => (
                                <div key={lang.code} className="premium-lang-section" style={{ border: 'none', background: 'none' }}>
                                    <h4 className="lang-indicator" style={{ background: '#d4af37' }}>{lang.label}</h4>
                                    <div className="premium-form-group">
                                        <label>Titre Principal</label>
                                        <input
                                            type="text"
                                            value={editHeroData.titles[lang.code] || ''}
                                            onChange={e => setEditHeroData({ ...editHeroData, titles: { ...editHeroData.titles, [lang.code]: e.target.value } })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Sous-Titre</label>
                                        <input
                                            type="text"
                                            value={editHeroData.sublines[lang.code] || ''}
                                            onChange={e => setEditHeroData({ ...editHeroData, sublines: { ...editHeroData.sublines, [lang.code]: e.target.value } })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Texte du Bouton (Principal)</label>
                                        <input
                                            type="text"
                                            value={editHeroData.ctaTexts[lang.code] || ''}
                                            onChange={e => setEditHeroData({ ...editHeroData, ctaTexts: { ...editHeroData.ctaTexts, [lang.code]: e.target.value } })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Texte du Bouton (Offres)</label>
                                        <input
                                            type="text"
                                            value={editHeroData.secondaryCtaTexts[lang.code] || ''}
                                            onChange={e => setEditHeroData({ ...editHeroData, secondaryCtaTexts: { ...editHeroData.secondaryCtaTexts, [lang.code]: e.target.value } })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Texte d'Introduction</label>
                                        <textarea
                                            value={editHeroData.intros[lang.code] || ''}
                                            onChange={e => setEditHeroData({ ...editHeroData, intros: { ...editHeroData.intros, [lang.code]: e.target.value } })}
                                            dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="premium-btn-group">
                            <button className="premium-btn-cta secondary" onClick={() => setIsEditingHero(false)}>
                                {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button className="premium-btn-cta gold" onClick={handleSaveHero}>
                                <FaSave /> {currentLanguage === 'ar' ? 'حفظ التغييرات' : 'Enregistrer tout'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {/* 🛑 Stylish Add Product Modal */}
            {isAddingProduct && ReactDOM.createPortal(
                <div className="premium-modal-backdrop" onClick={() => setIsAddingProduct(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsAddingProduct(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">
                            {currentLanguage === 'ar' ? 'إضافة منتج جديد' : 'Nouveau Produit'}
                        </h2>

                        {languages.filter(l => l.code === currentLanguage).map(lang => (
                            <div key={lang.code} className="premium-form-group">
                                <label>{currentLanguage === 'ar' ? 'اسم المنتج' : 'Nom du Produit'} ({lang.label})</label>
                                <input
                                    type="text"
                                    value={newProduct.nom[lang.code] || ''}
                                    onChange={e => setNewProduct({
                                        ...newProduct,
                                        nom: { ...newProduct.nom, [lang.code]: e.target.value }
                                    })}
                                    dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                />
                            </div>
                        ))}

                        <div className="premium-form-group">
                            <label>Prix de Vente (DT)</label>
                            <input
                                type="number"
                                value={newProduct.prix}
                                onChange={e => setNewProduct({ ...newProduct, prix: e.target.value })}
                            />
                        </div>

                        <div className="premium-form-group">
                            <label>Lien de l'Image</label>
                            <input
                                type="text"
                                value={newProduct.image}
                                onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                            />
                        </div>

                        <div className="premium-btn-group">
                            <button className="premium-btn-cta secondary" onClick={() => setIsAddingProduct(false)}>
                                {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button className="premium-btn-cta gold" onClick={handleAddProduct}>
                                <FaPlusCircle /> {currentLanguage === 'ar' ? 'إضافة المنتج' : 'Ajouter'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}