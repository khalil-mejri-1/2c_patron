import React, { useRef, useState } from 'react';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
// Importation d'icônes, supposons que vous utilisez quelque chose comme Font Awesome ou des icônes de réaction
// J'utilise des émojis pour la démo, mais dans un environnement réel, vous devriez utiliser des composants d'icônes (ex: FaUpload, FaTimes)

const PaymentMethodCard = ({ icon, name, details, onVerifyClick }) => (
    <div className="payment-card">
        <div className="method-icon">{icon}</div>
        <h3 className="method-name">{name}</h3>
        <div className="method-details">{details}</div>
        <button className="verify-button" onClick={onVerifyClick}>
            Envoyer la preuve
        </button>
    </div>
);

// ✅ NOUVEAU COMPOSANT POUR LE CHAMP D'UPLOAD ÉLÉGANT
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
            // Créer un événement de changement synthétique pour le composant parent
            onChange({ target: { name: 'file', files: files } });
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const dropzoneClass = `dropzone ${isDragging ? 'is-dragging' : ''} ${hasError ? 'has-error' : ''}`;

    return (
        <div 
            className={dropzoneClass}
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
                style={{ display: 'none' }} // Masquer l'input par défaut
            />
            {file ? (
                <p className="file-name-display">
                    🖼️ **Fichier sélectionné :** {file.name}
                </p>
            ) : (
                <div className="dropzone-prompt">
                    <span className="upload-icon">⬆️</span>
                    <p>
                        **Cliquez pour sélectionner** ou **Glissez & déposez** votre preuve de paiement (image).
                    </p>
                    <p className="small-text">Formats acceptés : JPG, PNG | Taille max : 5MB</p>
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
    // Nous avons besoin de l'état de chargement pour un aspect plus professionnel
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ file: null });

    const vipPlan = {
        name: 'Abonnement VIP Gold',
        price: '99 DT / mois',
        features: [
            'Accès illimité à tout le contenu',
            'Support technique prioritaire 24/7',
            'Téléchargement du contenu pour visionnage hors ligne',
            'Qualité de visionnage Ultra HD (4K)',
        ],
    };

    const scrollToPayment = () => {
        paymentSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleVerification = () => {
        setErrorMsg('');
        setFormData({ file: null }); // Réinitialiser le fichier à l'ouverture
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setErrorMsg('');
        
        // Validation simple de fichier
        if (files && files.length > 0) {
            const file = files[0];
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > 5) { // Limite de 5MB
                setErrorMsg("Le fichier est trop volumineux (max 5 Mo).");
                setFormData((prev) => ({ ...prev, file: null }));
                return;
            }
        }

        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.file) {
            setErrorMsg("Veuillez sélectionner une image de preuve de paiement.");
            return;
        }

        setIsLoading(true); // Démarrer le chargement

        try {
            const email = localStorage.getItem('currentUserEmail');
            if (!email) {
                setErrorMsg("Utilisateur non connecté. Veuillez vous reconnecter.");
                setIsLoading(false);
                return;
            }

            // 1. Récupérer le nom de l'utilisateur
            const userRes = await fetch(`https://2c-patron.vercel.app/api/users?email=${email}`);
            if (!userRes.ok) {
                setErrorMsg("Impossible de récupérer les informations de l'utilisateur.");
                setIsLoading(false);
                return;
            }
            const userData = await userRes.json();
            const username = userData.nom; 

            // 2. Préparer et envoyer FormData
            const data = new FormData();
            data.append('nom', username);
            data.append('mail', email);
            data.append('preuve_paiement', formData.file);

            const res = await fetch('http://localhost:3000/api/abonnement', {
                method: 'POST',
                body: data,
            });

            if (res.ok) {
                setShowModal(false);
                setShowSuccess(true);
                setFormData({ file: null });
                setTimeout(() => setShowSuccess(false), 4000);
            } else {
                const errorData = await res.json();
                setErrorMsg(errorData.message || "Erreur lors de l’envoi de la preuve. Réessayez.");
            }

        } catch (error) {
            console.error("Erreur:", error);
            setErrorMsg("Erreur de connexion au serveur. Vérifiez votre connexion.");
        } finally {
            setIsLoading(false); // Arrêter le chargement
        }
    };



    return (
        <>
            <Navbar />

            <div className="page-container">
                <h1 className="title">
                    ABONNEMENT VIP <span style={{ color: '#D4AF37' }}>GOLD</span>
                </h1>

                <div className="pricing-card">
                    <h2 className="card-title_vip">{vipPlan.name}</h2>
                    <div className="price">{vipPlan.price}</div>

                    <ul className="features-list">
                        {vipPlan.features.map((f, i) => (
                            <li key={i} className="feature-item">
                                <span className="check-icon">✔</span>
                                {f}
                            </li>
                        ))}
                    </ul>

                    <button className="cta-button" onClick={scrollToPayment}>
                        S'abonner maintenant
                    </button>
                </div>

                <div className="payment-section" ref={paymentSectionRef}>
                    <h2 className="payment-title">Choisissez votre mode de paiement</h2>

                    <div className="payment-card-grid">
                        <PaymentMethodCard
                            icon="📱"
                            name="Applications de Paiement Rapide (D17 & Flouci)"
                            onVerifyClick={handleVerification}
                            details={
                                <>
                                    Veuillez envoyer le montant requis ({vipPlan.price.split(' ')[0]}) au numéro suivant via
                                    <b> D17 </b> ou <b> Flouci </b> :
                                    <p className="highlight-box">+216 ** *** ***</p>
                                </>
                            }
                        />

                        <PaymentMethodCard
                            icon="🏦"
                            name="Virement Bancaire (RIB)"
                            onVerifyClick={handleVerification}
                            details={
                                <>
                                    RIB: **** (Insérez ici le RIB complet)
                                    <p>Nom du bénéficiaire : Le Nom Ici</p>
                                </>
                            }
                        />

                        <PaymentMethodCard
                            icon="📬"
                            name="Mandat Postal"
                            onVerifyClick={handleVerification}
                            details={
                                <>
                                    À l'ordre de : <b>Nom complet</b>
                                    <p>Adresse Postale : L'adresse complète</p>
                                </>
                            }
                        />
                    </div>
                </div>
            </div>

            {/* ✅ MODALE AMÉLIORÉE (Pro, Chic, Friendly) */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content pro-modal">
                        <button className="close-button" onClick={() => setShowModal(false)} disabled={isLoading}>
                            &times;
                        </button>
                        
                        <div className="modal-header">
                            <span className="header-icon">💳</span>
                            <h2>Vérification de Paiement VIP</h2>
                            <p className="modal-subtitle">
                                Veuillez télécharger une photo ou capture d'écran de votre transaction pour validation.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="upload-form">

                            {errorMsg && <div className="error-message shake-animation">⚠️ {errorMsg}</div>}
                            
                            <FileUploadField 
                                file={formData.file}
                                onChange={handleChange}
                                hasError={!!errorMsg}
                            />
                            
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} disabled={isLoading} className="cancel-button">
                                    Annuler
                                </button>
                                <button type="submit" className="send-button" disabled={isLoading || !formData.file}>
                                    {isLoading ? '⏳ Envoi en cours...' : '🚀 Confirmer & Envoyer la Preuve'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* ✅ Fenêtre de confirmation après l'envoi */}
            {showSuccess && (
                <div className="success-modal">
                    <div className="success-box">
                        <span className="success-icon">🎉</span>
                        <p>
                            **Félicitations !** Votre demande d’abonnement a bien été reçue.
                        </p>
                        <p className="small-text">
                            Veuillez patienter 1 à 2 heures ouvrables pour la vérification de votre preuve de paiement et l'activation de votre compte VIP.
                        </p>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}