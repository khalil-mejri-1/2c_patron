import React, { useRef, useState } from 'react';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import BASE_URL from '../apiConfig';
import {
    FaCheck, FaCrown, FaMobileAlt, FaUniversity, FaEnvelopeOpenText,
    FaTimes, FaCloudUploadAlt, FaRocket, FaRegGem, FaAward
} from 'react-icons/fa';

const PaymentMethodCard = ({ icon, name, details, onVerifyClick }) => (
    <div className="payment-method-premium-card">
        <div className="method-icon-wrapper">{icon}</div>
        <h3 className="method-name-title">{name}</h3>
        <div className="method-details-text">{details}</div>
        <button className="verify-proof-button" onClick={onVerifyClick}>
            <FaCloudUploadAlt style={{ marginRight: '8px' }} /> Envoyer la preuve
        </button>
    </div>
);

const FileUploadField = ({ file, onChange, hasError }) => {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length) {
            onChange({ target: { name: 'file', files: files } });
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div
            className={`premium-dropzone ${isDragging ? 'is-dragging' : ''} ${hasError ? 'has-error' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                type="file"
                name="file"
                accept="image/*"
                onChange={onChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
            />
            {file ? (
                <div className="file-selected-status">
                    <span className="file-icon-check">✅</span>
                    <p className="file-name-text"><strong>Fichier :</strong> {file.name}</p>
                </div>
            ) : (
                <div className="dropzone-empty-prompt">
                    <FaCloudUploadAlt className="upload-icon-pulse" />
                    <p className="main-prompt"><strong>Cliquez ici</strong> ou glissez votre preuve</p>
                    <p className="sub-prompt">Image JPG/PNG (Max 5MB)</p>
                </div>
            )}
        </div>
    );
};

export default function Abonnementvip() {
    const paymentSectionRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ file: null });

    const vipPlan = {
        name: 'Abonnement VIP Gold',
        price: '99',
        currency: 'DT',
        period: '/ mois',
        features: [
            'Accès illimité à tout le contenu exclusif',
            'Support technique prioritaire 24/7',
            'Téléchargement illimité du contenu',
            'Qualité de visionnage Ultra HD (4K)',
            'Certification de complétion Master Atelier',
        ],
    };

    const scrollToPayment = () => {
        paymentSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleVerification = () => {
        setErrorMsg('');
        setFormData({ file: null });
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, files } = e.target;
        setErrorMsg('');

        if (files && files.length > 0) {
            const file = files[0];
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > 5) {
                setErrorMsg("Le fichier est trop volumineux (max 5 Mo).");
                setFormData((prev) => ({ ...prev, file: null }));
                return;
            }
        }

        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : e.target.value,
        }));
    };

    const IMGBB_API_KEY = 'd9eb76a38b59f5fb253a8be1456c90c0';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.file) {
            setErrorMsg("Veuillez sélectionner une image de preuve de paiement.");
            return;
        }

        setIsLoading(true);

        try {
            const email = localStorage.getItem('currentUserEmail');
            if (!email) {
                setErrorMsg("Utilisateur non connecté. Veuillez vous reconnecter.");
                setIsLoading(false);
                return;
            }

            const imgBbFormData = new FormData();
            imgBbFormData.append('image', formData.file);

            const imgBbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: imgBbFormData,
            });

            if (!imgBbRes.ok) {
                const errorData = await imgBbRes.json();
                setErrorMsg(`Erreur upload image: ${errorData.error.message || 'Inconnue'}`);
                setIsLoading(false);
                return;
            }

            const imgBbData = await imgBbRes.json();
            const preuve_paiement_url = imgBbData.data.url;

            const userRes = await fetch(`${BASE_URL}/api/users?email=${email}`);
            const userData = await userRes.json();
            const username = userData.nom;

            const dataToSend = {
                nom: username,
                mail: email,
                preuve_paiement_url: preuve_paiement_url
            };

            const res = await fetch(`${BASE_URL}/api/abonnement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (res.ok) {
                setShowModal(false);
                setShowSuccess(true);
                setFormData({ file: null });
                setTimeout(() => setShowSuccess(false), 5000);
            } else {
                const errorData = await res.json();
                setErrorMsg(errorData.message || "Erreur d'envoi. Réessayez.");
            }

        } catch (error) {
            setErrorMsg("Erreur de connexion. Vérifiez votre réseau.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="vip-page-wrapper">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="vip-hero-header">
                <div className="vip-hero-bg-overlay"></div>
                <div className="vip-hero-content-reveal">
                    <div className="vip-badge-float">
                        <FaCrown />
                    </div>
                    <h1 className="vip-main-glow-title">
                        DEVENIR <span className="gold-accent-text">VIP GOLD</span>
                    </h1>
                    <p className="vip-hero-subtitle">
                        Rejoignez l'élite de la couture et accédez à tout l'univers Master Atelier.
                    </p>
                </div>
            </div>

            <div className="vip-main-content-container">

                {/* --- PRICING CARD --- */}
                <div className="vip-premium-pricing-card">
                    <div className="vip-card-header-accent">
                        <FaRegGem /> <span>PREMIUM ACCESS</span>
                    </div>
                    <h2 className="vip-plan-name-label">{vipPlan.name}</h2>

                    <div className="vip-price-tag-wrapper">
                        <span className="currency">{vipPlan.currency}</span>
                        <span className="amount">{vipPlan.price}</span>
                        <span className="period">{vipPlan.period}</span>
                    </div>

                    <div className="vip-features-grid-list">
                        {vipPlan.features.map((f, i) => (
                            <div key={i} className="vip-feature-row-item">
                                <div className="feature-check-circle"><FaCheck /></div>
                                <span className="feature-text-label">{f}</span>
                            </div>
                        ))}
                    </div>

                    <button className="vip-cta-gold-button" onClick={scrollToPayment}>
                        <FaRocket style={{ marginRight: '10px' }} /> Souscrire maintenant
                    </button>

                    <p className="secure-payment-hint">🛡️ Paiement sécurisé & Vérification garantie</p>
                </div>

                {/* --- PAYMENT METHODS --- */}
                <div className="vip-payment-methods-section" ref={paymentSectionRef}>
                    <div className="section-divider-header">
                        <div className="line"></div>
                        <h2 className="methods-title-label">Modes de Paiement</h2>
                        <div className="line"></div>
                    </div>

                    <div className="payment-grid-layout">
                        <PaymentMethodCard
                            icon={<FaMobileAlt />}
                            name="Applications Mobiles (D17 & Flouci)"
                            onVerifyClick={handleVerification}
                            details={
                                <>
                                    Transférez <strong>{vipPlan.price} {vipPlan.currency}</strong> au numéro suivant via
                                    <strong> D17 </strong> ou <strong> Flouci </strong>:
                                    <div className="payment-id-highlight">+216 ** *** ***</div>
                                </>
                            }
                        />

                        <PaymentMethodCard
                            icon={<FaUniversity />}
                            name="Virement Bancaire (RIB)"
                            onVerifyClick={handleVerification}
                            details={
                                <>
                                    RIB: <strong>08 000 000 0000 0000 00 00</strong>
                                    <p className="beneficiary-label">Titulaire : L'Atelier Sfax</p>
                                </>
                            }
                        />

                        <PaymentMethodCard
                            icon={<FaEnvelopeOpenText />}
                            name="Mandat Postal Classique"
                            onVerifyClick={handleVerification}
                            details={
                                <>
                                    À l'ordre de : <strong>Nom Prénom Complet</strong>
                                    <p className="postal-address-label">Adresse : Rue Farhat Hached, Sfax</p>
                                </>
                            }
                        />
                    </div>
                </div>
            </div>

            {/* --- UPLOAD MODAL --- */}
            {showModal && (
                <div className="premium-modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setShowModal(false)} disabled={isLoading}>
                            <FaTimes />
                        </button>

                        <div className="premium-modal-header">
                            <div className="vip-cert-icon-wrapper" style={{ margin: '0 auto 15px', background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37' }}>
                                <FaAward />
                            </div>
                            <h2 className="premium-modal-title">Preuve de Paiement</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="premium-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '1rem', lineHeight: '1.6' }}>
                                Veuillez nous envoyer une photo ou capture d'écran claire de votre transaction.
                            </div>

                            {errorMsg && <div className="premium-error-alert" style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '12px', textAlign: 'center', fontSize: '0.9rem', border: '1px solid #fee2e2' }}>⚠️ {errorMsg}</div>}

                            <div className="premium-form-group">
                                <FileUploadField
                                    file={formData.file}
                                    onChange={handleChange}
                                    hasError={!!errorMsg}
                                />
                            </div>

                            <div className="premium-btn-group">
                                <button type="button" onClick={() => setShowModal(false)} className="premium-btn-cta secondary" disabled={isLoading}>
                                    Annuler
                                </button>
                                <button type="submit" className="premium-btn-cta gold" disabled={isLoading || !formData.file}>
                                    {isLoading ? 'Envoi en cours...' : 'Confirmer l\'Abonnement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- SUCCESS MODAL --- */}
            {showSuccess && (
                <div className="vip-success-toast-overlay">
                    <div className="vip-success-toast-box">
                        <div className="toast-icon-check"><FaCheck /></div>
                        <div className="toast-content-text">
                            <h3>Demande Envoyée !</h3>
                            <p>Votre preuve est en cours de vérification. Activation prévue sous 1 à 2 heures.</p>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
