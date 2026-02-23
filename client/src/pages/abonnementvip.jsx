import React, { useRef, useState, useEffect } from 'react';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import BASE_URL from '../apiConfig';
import {
    FaCheck, FaCrown, FaMobileAlt, FaUniversity, FaEnvelopeOpenText,
    FaTimes, FaCloudUploadAlt, FaRocket, FaGem, FaShieldAlt, FaEdit, FaSave
} from 'react-icons/fa';
import './abonnement_vip.css';

export default function Abonnementvip() {
    const paymentSectionRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ file: null });

    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditingBg, setIsEditingBg] = useState(false);
    const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop');
    const [newBgUrl, setNewBgUrl] = useState('');

    React.useEffect(() => {
        // Check Admin
        const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
        if (email && email.includes('admin')) setIsAdmin(true);

        // Load Background
        fetch(`${BASE_URL}/api/settings/vip-page-bg`)
            .then(res => res.ok ? res.json() : null)
            .then(data => data && setBgImage(data.value))
            .catch(() => { });
    }, []);

    const handleSaveBg = async () => {
        setBgImage(newBgUrl);
        setIsEditingBg(false);
        try {
            await fetch(`${BASE_URL}/api/settings/vip-page-bg`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: newBgUrl })
            });
        } catch (err) { }
    };

    const vipPlan = {
        name: 'Abonnement VIP Elite',
        price: '99',
        currency: 'DT',
        period: '/ mois',
        features: [
            'Accès illimité aux cours exclusifs',
            'Support prioritaire 24/7',
            'Téléchargement des ressources',
            'Qualité Ultra HD (4K)',
            'Certificat Master Atelier',
            'Accès aux nouveaux patrons'
        ],
    };

    const scrollToPayment = () => {
        paymentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
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
        <div className="vip-premium-container" style={{
            background: `linear-gradient(rgba(252, 252, 253, 0.95), rgba(252, 252, 253, 0.97)), url(${bgImage}) center/cover fixed`
        }}>
            <Navbar />

            {isAdmin && (
                <div style={{ position: 'fixed', top: '100px', right: '20px', zIndex: 1000 }}>
                    <button className="edit-btn-minimal-lux" onClick={() => { setIsEditingBg(true); setNewBgUrl(bgImage); }}>
                        <FaEdit /> Background
                    </button>
                </div>
            )}

            {/* --- HERO --- */}
            <header className="vip-hero-section">
                <div className="vip-hero-badge">
                    <FaCrown /> <span>Édition Limitée</span>
                </div>
                <h1 className="vip-title-reveal">
                    L'EXCELLENCE DE LA <span>COUTURE VIP</span>
                </h1>
                <p className="vip-subtitle-elegant">
                    Élevez votre savoir-faire avec notre programme exclusif Master Atelier.
                    L'élégance et la précision au service de votre passion.
                </p>
            </header>

            {/* --- PRICING --- */}
            <section className="vip-pricing-grid-luxury">
                <div className="luxury-card">
                    <h2 className="luxury-card-title">{vipPlan.name}</h2>
                    <div className="luxury-price-box">
                        <span className="currency">{vipPlan.currency}</span>
                        <span className="amount">{vipPlan.price}</span>
                        <span className="period">{vipPlan.period}</span>
                    </div>

                    <ul className="luxury-features-list">
                        {vipPlan.features.map((feature, index) => (
                            <li key={index} className="luxury-feature-item">
                                <FaCheck />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button className="luxury-cta-btn" onClick={scrollToPayment}>
                        <FaRocket /> Obtenir l'Accès Élite
                    </button>

                    <div style={{ marginTop: '25px', color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FaShieldAlt /> Paiement 100% Sécurisé
                    </div>
                </div>
            </section>

            {/* --- METHODS --- */}
            <section className="vip-methods-section-premium" ref={paymentSectionRef}>
                <h2 className="section-title-elegant">Modes de Règlement</h2>

                <div className="luxury-methods-grid">
                    {/* D17 / Flouci */}
                    <div className="method-luxury-card">
                        <div className="method-header-box">
                            <div className="method-icon-circle"><FaMobileAlt /></div>
                            <h3 className="method-name-label">Apps Mobiles (D17 & Flouci)</h3>
                        </div>
                        <div className="method-details-box">
                            Veuillez transférer <strong>{vipPlan.price} {vipPlan.currency}</strong> vers notre identifiant sécurisé.
                            <div className="highlight-id-luxury">+216 ** *** ***</div>
                        </div>
                        <button className="verify-luxury-btn" onClick={handleVerification}>
                            <FaCloudUploadAlt /> Envoyer la preuve
                        </button>
                    </div>

                    {/* RIB */}
                    <div className="method-luxury-card">
                        <div className="method-header-box">
                            <div className="method-icon-circle"><FaUniversity /></div>
                            <h3 className="method-name-label">Virement Bancaire (RIB)</h3>
                        </div>
                        <div className="method-details-box">
                            Utilisez les coordonnées ci-dessous pour votre virement bancaire.
                            <div className="highlight-id-luxury">RIB: 08 000 000...</div>
                            <p style={{ marginTop: '10px' }}><strong>Bénéficiaire :</strong> L'Atelier Sfax</p>
                        </div>
                        <button className="verify-luxury-btn" onClick={handleVerification}>
                            <FaCloudUploadAlt /> Envoyer la preuve
                        </button>
                    </div>

                    {/* Mandat */}
                    <div className="method-luxury-card">
                        <div className="method-header-box">
                            <div className="method-icon-circle"><FaEnvelopeOpenText /></div>
                            <h3 className="method-name-label">Mandat Postal</h3>
                        </div>
                        <div className="method-details-box">
                            Libellez votre mandat à l'ordre suivant et présentez-vous au bureau de poste.
                            <div className="highlight-id-luxury">Nom & Prénom Complet</div>
                            <p style={{ marginTop: '10px' }}><strong>Adresse :</strong> Rue Farhat Hached, Sfax</p>
                        </div>
                        <button className="verify-luxury-btn" onClick={handleVerification}>
                            <FaCloudUploadAlt /> Envoyer la preuve
                        </button>
                    </div>
                </div>
            </section>

            {/* SUCCESS SLIDE */}
            {showSuccess && (
                <div style={{
                    position: 'fixed', bottom: '40px', right: '40px',
                    background: '#10b981', color: '#fff', padding: '25px 40px',
                    borderRadius: '25px', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
                    zIndex: 10000, animation: 'luxuryModalIn 0.5s ease-out'
                }}>
                    <strong style={{ fontSize: '1.2rem', display: 'block' }}>Félicitations !</strong>
                    <span>Votre demande a été envoyée. Activation sous 2h.</span>
                </div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', transition: 'all 0.4s' }}>
                    <div className="luxury-modal-content">
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div className="method-icon-circle" style={{ margin: '0 auto 20px', background: 'rgba(197, 160, 40, 0.1)' }}>
                                <FaGem />
                            </div>
                            <h2 className="luxury-card-title" style={{ margin: 0 }}>Vérification VIP</h2>
                            <p style={{ color: '#64748b', marginTop: '10px' }}>Glissez votre preuve de paiement ci-dessous</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {errorMsg && (
                                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '15px', borderRadius: '15px', marginBottom: '20px', textAlign: 'center', border: '1px solid #fee2e2' }}>
                                    {errorMsg}
                                </div>
                            )}

                            <label style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                gap: '15px', padding: '40px', border: '2px dashed #e2e8f0',
                                borderRadius: '25px', cursor: 'pointer', transition: 'all 0.3s',
                                background: '#f8fafc'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c5a028'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                            >
                                <FaCloudUploadAlt style={{ fontSize: '3rem', color: '#94a3b8' }} />
                                <span style={{ fontWeight: '600', color: '#475569' }}>
                                    {formData.file ? formData.file.name : "Cliquez pour sélectionner un fichier"}
                                </span>
                                <input
                                    type="file"
                                    name="file"
                                    accept="image/*"
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                    required
                                />
                            </label>

                            <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
                                <button type="button" className="verify-luxury-btn" onClick={() => setShowModal(false)} disabled={isLoading}>
                                    Fermer
                                </button>
                                <button type="submit" className="luxury-cta-btn" style={{ padding: '15px' }} disabled={isLoading}>
                                    {isLoading ? 'Envoi...' : 'Confirmer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditingBg && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditingBg(false)}>
                    <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingBg(false)}><FaTimes /></button>
                        <h2 className="premium-modal-title">Changer l'image de fond</h2>
                        <div className="premium-form-group" style={{ marginBottom: '20px' }}>
                            <label>URL de l'image</label>
                            <input
                                type="text"
                                value={newBgUrl}
                                onChange={(e) => setNewBgUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="premium-btn-group">
                            <button className="premium-btn-cta secondary" onClick={() => setIsEditingBg(false)}>Annuler</button>
                            <button className="premium-btn-cta gold" onClick={handleSaveBg}><FaSave /> Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
