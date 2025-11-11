import React, { useRef, useState } from 'react';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';

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

export default function Abonnementvip() {
    const paymentSectionRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    // ✅ Nouvel état pour gérer les messages d'erreur dans la modale
    const [errorMsg, setErrorMsg] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', file: null });

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

    // ✅ Réinitialiser errorMsg lors de l'ouverture de la modale
    const handleVerification = () => {
        setErrorMsg('');
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        // ✅ Réinitialiser l'erreur lorsqu'un champ est modifié
        setErrorMsg('');
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.file) {
            setErrorMsg("Veuillez sélectionner une image !");
            return;
        }

        try {
            // جلب البريد من localStorage
            const email = localStorage.getItem('currentUserEmail');
            if (!email) {
                setErrorMsg("Utilisateur non connecté.");
                return;
            }

            // جلب اسم المستخدم من قاعدة البيانات
            const userRes = await fetch(`http://localhost:3000/api/users?email=${email}`);
            if (!userRes.ok) {
                setErrorMsg("Impossible de récupérer les informations de l'utilisateur.");
                return;
            }
            const userData = await userRes.json();
            const username = userData.nom; // الحقل الموجود في قاعدة البيانات

            // تجهيز FormData
            const data = new FormData();
            data.append('nom', username);
            data.append('mail', email);
            data.append('preuve_paiement', formData.file);

            // إرسال الاشتراك
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
                setErrorMsg(errorData.message || "Erreur lors de l’envoi de la preuve.");
            }

        } catch (error) {
            console.error("Erreur:", error);
            setErrorMsg("Erreur de connexion au serveur.");
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

            {/* ✅ نافذة رفع الإثبات */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Envoyer la preuve de paiement</h2>
                        {errorMsg && <div className="error-message">❌ {errorMsg}</div>}
                        <form onSubmit={handleSubmit}>
                            <label>
                                Image de la preuve :
                                <input type="file" name="file" accept="image/*" onChange={handleChange} required />
                            </label>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="send-button">Envoyer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* ✅ نافذة تأكيد بعد الإرسال */}
            {showSuccess && (
                <div className="success-modal">
                    <div className="success-box">
                        ✅ Votre demande d’abonnement a bien été reçue.<br />
                        Veuillez patienter pendant la vérification de votre preuve de paiement.
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}