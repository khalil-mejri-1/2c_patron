import React, { useState } from 'react';
import { FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaClock, FaPaperPlane, FaChevronRight } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';

// ** ⚠️ نقطة مهمة: تأكد من أن تطبيقك يعمل على نفس النطاق (Domain) أو أنك تستخدم CORS للسماح بالطلبات **

export default function Contact() {
    // 🌟 حالات النموذج 🌟
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(''); // حالة الرسالة ('success', 'error', 'loading', '')

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/api/messages', { // ← backend port
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: name,
                    email: email,
                    sujet: subject,
                    message: message,
                }),
            });


            if (!response.ok) throw new Error('Erreur lors de l\'envoi du message.');

            const data = await response.json();
            console.log('Message enregistré:', data);

            // إعادة تعيين الحقول وعرض رسالة النجاح
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }

        // مسح حالة الرسالة بعد 5 ثوانٍ
        setTimeout(() => setStatus(''), 6000);
    };


    // 🎨 عرض رسالة التحميل
    const renderStatusMessage = () => {
        if (status === 'loading') {
            return (
                <div className="status-message loading">
                    <FaPaperPlane /> Envoi en cours... Veuillez patienter.
                </div>
            );
        }
        if (status === 'success') {
            return (
                <div className="status-message success">
                    <FaPaperPlane /> Votre message a été envoyé avec succès et enregistré ! Nous vous répondrons bientôt.
                </div>
            );
        }
        if (status === 'error') {
            return (
                <div className="status-message error">
                    Une erreur s'est produite lors de l'envoi. Veuillez vérifier vos informations et réessayer.
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <Navbar />
            <section className="contact-section">

                {/* 1. رأس الصفحة */}
                <div className="contact-header">
                    <h1 className="contact-main-title">
                        Contactez <span className="contact-accent-text">l'Atelier</span>
                    </h1>
                    <p className="contact-sub-text">
                        Nous sommes là pour répondre à toutes vos questions concernant nos cours, patrons et services.
                    </p>
                </div>

                {/* 2. حاوية المحتوى الرئيسية (النموذج والمعلومات) */}
                <div className="contact-content-wrapper">

                    {/* A. نموذج الاتصال */}
                    <div className="contact-form-block">
                        <h2 className="form-title">Envoyez-nous un Message</h2>

                        {/* رسالة الحالة المُحدثة */}
                        {renderStatusMessage()}

                        <form onSubmit={handleSubmit} className="contact-form">

                            <div className="input-group">
                                <FaUser className="input-icon" />
                                <input type="text" placeholder="Votre Nom Complet" value={name} onChange={(e) => setName(e.target.value)} required disabled={status === 'loading'} />
                            </div>

                            <div className="input-group">
                                <FaEnvelope className="input-icon" />
                                <input type="email" placeholder="Votre E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={status === 'loading'} />
                            </div>

                            <div className="input-group">
                                <input type="text" placeholder="Sujet du Message" value={subject} onChange={(e) => setSubject(e.target.value)} required disabled={status === 'loading'} />
                            </div>

                            <div className="input-group">
                                <textarea placeholder="Votre Message..." rows="6" value={message} onChange={(e) => setMessage(e.target.value)} required disabled={status === 'loading'}></textarea>
                            </div>

                            <button type="submit" className="contact-submit-btn" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Envoi...' : 'Envoyer le Message'} <FaChevronRight />
                            </button>
                        </form>
                    </div>

                    {/* B. معلومات الاتصال الجانبية */}
                    <div className="contact-info-block">
                        <h2 className="info-title">Détails de Contact</h2>

                        <div className="contact-detail">
                            <FaMapMarkerAlt className="detail-icon" />
                            <div>
                                <h4>Adresse</h4>
                                <p>15, Rue de la Soie, Tunis, Tunisie</p>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <FaPhone className="detail-icon" />
                            <div>
                                <h4>Téléphone</h4>
                                <p>+216 22 123 456</p>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <FaEnvelope className="detail-icon" />
                            <div>
                                <h4>Email</h4>
                                <p>contact@atelier-couture.tn</p>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <FaClock className="detail-icon" />
                            <div>
                                <h4>Heures d'Ouverture</h4>
                                <p>Lun - Ven: 9h00 - 18h00</p>
                            </div>
                        </div>

                        {/* تضمين خريطة وهمية */}
                        <div className="map-placeholder">
                            [Image of map placeholder]
                        </div>
                    </div>

                </div>
            </section>
            <Footer />
        </>
    );
}