import React, { useState, useEffect, useCallback } from 'react';
import { FaTrashAlt, FaPlus, FaMinus, FaTimes } from 'react-icons/fa'; // Ajout de FaTimes pour les modales
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link } from 'react-router-dom';

// --------------------------------------------------------
// Fonction utilitaire pour lire le panier depuis localStorage
// --------------------------------------------------------
const getCartFromLocalStorage = () => {
    try {
        const storedCart = localStorage.getItem('cartItems');
        const parsedCart = storedCart ? JSON.parse(storedCart) : [];
        return parsedCart.map(item => ({
            ...item,
            // Assurez-vous que l'article a une URL et une quantité valide
            url: item.url || item.image,
            quantity: item.quantity > 0 ? item.quantity : 1
        }));
    } catch (error) {
        console.error("Erreur de lecture du panier localStorage:", error);
        return [];
    }
};

// --------------------------------------------------------

export default function CartPage() {
    const [cartItems, setCartItems] = useState(getCartFromLocalStorage);
    const [subtotal, setSubtotal] = useState(0);
    const shippingCost = 5.00;
    const taxRate = 0.20;

    // 🌟 Nouveaux états pour la gestion du paiement et de la connexion
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showGuestForm, setShowGuestForm] = useState(false);

    // --------------------------------------------------------
    // Gestion de la connexion (Lecture de localStorage)
    // --------------------------------------------------------
    useEffect(() => {
        const authStatus = localStorage.getItem('login') === 'true';
        setIsLoggedIn(authStatus);
    }, []);

    // --------------------------------------------------------
    // Logique de paiement
    // --------------------------------------------------------
    const handleCheckout = () => {
        if (isLoggedIn) {
            // Utilisateur connecté : Afficher la confirmation de commande
            setShowConfirmationModal(true);
        } else {
            // Utilisateur déconnecté : Afficher le formulaire invité
            setShowGuestForm(true);
        }
    };

    // Fonctions de synchronisation et de gestion du panier (inchangées)
    const saveCartToLocalStorage = useCallback((newItems) => {
        setCartItems(newItems);
        localStorage.setItem('cartItems', JSON.stringify(newItems));
        window.dispatchEvent(new Event('cartUpdated'));
    }, []);

    const handleQuantityChange = (id, delta) => {
        const newItems = cartItems.map(item =>
            item.id === id
                ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                : item
        );
        saveCartToLocalStorage(newItems);
    };

    const handleRemoveItem = (id) => {
        const newItems = cartItems.filter(item => item.id !== id);
        saveCartToLocalStorage(newItems);
    };

    useEffect(() => {
        const newSubtotal = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        setSubtotal(newSubtotal);
    }, [cartItems]);

    const taxAmount = subtotal * taxRate;
    const total = subtotal + shippingCost + taxAmount;

    // Empêcher le défilement du corps lorsque les modales sont ouvertes
    useEffect(() => {
        if (showConfirmationModal || showGuestForm) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [showConfirmationModal, showGuestForm]);

    // --------------------------------------------------------
    // Rendu du Panier Vide
    // --------------------------------------------------------

    if (cartItems.length === 0) {
        return (
            <>
                <Navbar />
                <div className="cart-page-wrapper">
                    <div className="cart-container empty-cart">
                        <h2 className="cart-title">Votre Panier est vide 😢</h2>
                        <p>Ajoutez des patrons ou des accès VIP pour commencer !</p>
                        <Link to="/magasin" className="continue-shopping-btn">
                            Continuer mes achats
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // --------------------------------------------------------
    // Rendu principal (avec les Modales)
    // --------------------------------------------------------

    return (
        <>
            <Navbar />
            <div className="cart-page-wrapper">
                <h2 className="cart-title">Mon <span style={{ color: "#d4af37" }} > Panier </span></h2>

                <div className="cart-content">

                    {/* 1. Liste des articles (inchangée) */}
                    <div className="cart-items-list">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <div>
                                    <img
                                        src={item.url}
                                        alt={item.name}
                                        className="item-image"
                                    />

                                    {/* Contrôle de quantité pour grand écran (desktop) */}
                                    <div className="item-quantity-control dasable_phone">
                                        <button
                                            onClick={() => handleQuantityChange(item.id, -1)}
                                            disabled={item.quantity <= 1}
                                            className="quantity-btn"
                                            aria-label="Diminuer la quantité"
                                        >
                                            <FaMinus />
                                        </button>
                                        <span className="item-quantity">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, 1)}
                                            className="quantity-btn"
                                            aria-label="Augmenter la quantité"
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>
                                </div>

                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p className="item-price-unit">{(item.price * item.quantity).toFixed(2)} DT</p>
                                </div>


                                <div className='bloc_button'>
                                    {/* Contrôle de quantité pour petit écran (mobile) */}
                                    <div className="item-quantity-control dasable_phoneono">
                                        <button
                                            onClick={() => handleQuantityChange(item.id, -1)}
                                            disabled={item.quantity <= 1}
                                            className="quantity-btn"
                                            aria-label="Diminuer la quantité"
                                        >
                                            <FaMinus />
                                        </button>
                                        <span className="item-quantity">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, 1)}
                                            className="quantity-btn"
                                            aria-label="Augmenter la quantité"
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="remove-item-btn"
                                        aria-label={`Supprimer ${item.name} du panier`}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 2. Résumé de la commande */}
                    <div className="cart-summary">
                        <h3>Résumé de la commande</h3>
                        <div className="summary-line">
                            <span>Sous-total (Hors taxes) :</span>
                            <span>{(subtotal / (1 + taxRate)).toFixed(2)} DT</span>
                        </div>
                        <div className="summary-line">
                            <span>Frais de livraison :</span>
                            <span>{shippingCost.toFixed(2)} DT</span>
                        </div>
                        <div className="summary-line tax-line">
                            <span>Taxes (TVA {taxRate * 100}%) :</span>
                            <span>{taxAmount.toFixed(2)} DT</span>
                        </div>
                        <div className="summary-line total-line">
                            <strong>Total à payer (TTC) :</strong>
                            <strong>{total.toFixed(2)} DT</strong>
                        </div>

                        {/* 🌟 Appel de la fonction de paiement au clic */}
                        <button
                            className="checkout-btn"
                            onClick={handleCheckout}
                        >
                            Procéder au Paiement
                        </button>

                        <br />
                        <br />
                        <Link to="/magasin" className="continue-shopping-btn button_Continuer">
                            Continuer mes achats
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />

            {/* ======================================= */}
            {/* 🌟 MODALES DE COMMANDE / CONNEXION 🌟 */}
            {/* ======================================= */}

            {/* 1. Modale de Confirmation de Commande (Si connecté) */}
            {showConfirmationModal && (
                <div className="premium-modal-backdrop" onClick={() => setShowConfirmationModal(false)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setShowConfirmationModal(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">✅ Confirmer votre Commande</h2>
                        <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '25px' }}>
                            Votre commande d'un montant total de **{total.toFixed(2)} DT** sera traitée avec votre compte.
                        </p>
                        <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '30px' }}>
                            Veuillez vérifier votre adresse de livraison et procéder au paiement sur la page suivante.
                        </p>
                        <div className="premium-btn-group">
                            <button
                                className="premium-btn-cta secondary"
                                onClick={() => setShowConfirmationModal(false)}
                            >
                                Annuler
                            </button>
                            <button
                                className="premium-btn-cta gold"
                                onClick={() => {
                                    alert("Redirection vers la page de paiement simulée...");
                                    setShowConfirmationModal(false);
                                }}
                            >
                                Aller au Paiement Sécurisé
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Modale de Formulaire Invité (Si déconnecté) */}
            {showGuestForm && (
                <div className="premium-modal-backdrop" onClick={() => setShowGuestForm(false)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setShowGuestForm(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">🔒 Identification</h2>

                        <div className="guest-options">
                            <p style={{ color: '#4b5563', marginBottom: '25px' }}>
                                Pour finaliser votre commande, veuillez vous connecter ou entrer vos informations.
                            </p>

                            <div className="login-prompt" style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '15px', marginBottom: '30px' }}>
                                <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>Déjà client ?</h4>
                                <Link to="/login" className="premium-btn-cta gold" style={{ display: 'inline-flex', padding: '12px 30px' }}>Se connecter</Link>
                            </div>

                            <div className="premium-divider" style={{ margin: '30px 0', borderTop: '1px solid #e2e8f0', position: 'relative' }}>
                                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '0 15px', color: '#94a3b8', fontSize: '0.85rem' }}>OU</span>
                            </div>

                            <div className="guest-checkout">
                                <h4 style={{ marginBottom: '5px', color: '#1e293b' }}>Commander en Invité</h4>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>Vos informations seront uniquement utilisées pour cette commande.</p>

                                <form onSubmit={(e) => { e.preventDefault(); alert("Formulaire invité soumis, redirection..."); setShowGuestForm(false); }} className="premium-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div className="premium-form-group">
                                        <input type="email" placeholder="Email *" required />
                                    </div>
                                    <div className="premium-form-group">
                                        <input type="text" placeholder="Nom Complet *" required />
                                    </div>
                                    <div className="premium-form-group">
                                        <input type="text" placeholder="Adresse de Livraison *" required />
                                    </div>
                                    <div className="premium-btn-group" style={{ marginTop: '10px' }}>
                                        <button type="submit" className="premium-btn-cta gold" style={{ width: '100%' }}>
                                            Poursuivre en tant qu'Invité
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}