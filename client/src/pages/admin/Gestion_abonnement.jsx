import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
// 💡 استيراد ملف CSS الجديد
import '../admin_css/GestionDeAbonnement.css';
import {
    FaUserCheck,
    FaUserTimes,
    FaSpinner,
    FaFileImage,
    FaExternalLinkAlt,
    FaTimesCircle,
    FaCheckCircle,
    FaTrashAlt
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// 🛠️ ثابت API Base URL لتجنب التكرار
const API_BASE_URL = 'http://localhost:3000/api/abonnement';

export default function Gestion_abonnement() {
    const [abonnements, setAbonnements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🌐 دالة جلب بيانات الاشتراكات من الخادم (تمت إزالة التصفية لعرض جميع الحالات)
    const fetchAbonnements = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Échec du chargement des abonnements.');
            }

            // 💡 التعديل هنا: تخزين جميع الاشتراكات التي تم جلبها
            setAbonnements(data);
        } catch (err) {
            console.error("Erreur de récupération des données:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 🚀 دالة تحديث حالة الاشتراك (Approuver/Refuser)
    const handleUpdateStatut = async (abonnementId, newStatut, email) => {
        const actionText = newStatut === 'approuvé' ? 'Approuver' : 'Refuser';
        const confirmTitle = `Confirmer l'action : ${actionText}`;

        const result = await MySwal.fire({
            title: confirmTitle,
            text: `Êtes-vous sûr de vouloir ${actionText.toLowerCase()} l'abonnement ID ${abonnementId} ?`,
            icon: newStatut === 'approuvé' ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonColor: newStatut === 'approuvé' ? '#28a745' : '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Oui, ${actionText}!`,
            cancelButtonText: 'Annuler',
        });

        if (!result.isConfirmed) return;

        try {
            // تحديث حالة الاشتراك في جدول Abonnement
            const response = await fetch(`${API_BASE_URL}/${abonnementId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statut_abonnement: newStatut }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Échec de la mise à jour du statut.`);
            }

            // تحديث القائمة محليًا
            setAbonnements(prev =>
                prev.map(abo =>
                    abo._id === abonnementId
                        ? { ...abo, statut_abonnement: newStatut }
                        : abo
                )
            );

            // ✅ إذا تمت الموافقة، إرسال البريد لتحديث جدول المستخدم
            if (newStatut === 'approuvé') {
                try {
                    const userResponse = await fetch('http://localhost:3000/api/user/abonne', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                    });

                    if (!userResponse.ok) {
                        const errorData = await userResponse.json();
                        throw new Error(errorData.error || 'Erreur lors de la mise à jour de l\'abonnement utilisateur.');
                    }

                    const userData = await userResponse.json();
                    console.log(userData.message);
                } catch (err) {
                    console.error("Erreur mise à jour utilisateur:", err);
                    MySwal.fire('Erreur!', `Erreur mise à jour utilisateur: ${err.message}`, 'error');
                }
            }

            MySwal.fire(
                'Succès!',
                `Abonnement ID **${abonnementId}** a été **${newStatut.toUpperCase()}** avec succès.`,
                'success'
            );

        } catch (err) {
            console.error("Erreur de mise à jour:", err);
            MySwal.fire('Erreur!', `Erreur: ${err.message}`, 'error');
        }
    };

    // 🗑️ دالة حذف الاشتراك نهائيًا
    const handleDeleteAbonnement = async (abonnementId) => {
        const result = await MySwal.fire({
            title: 'Confirmer la Suppression',
            text: `Êtes-vous متأكد من حذف الاشتراك ID ${abonnementId} نهائيًا؟ هذه العملية لا يمكن التراجع عنها.`,
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'نعم، قم بالحذف!',
            cancelButtonText: 'إلغاء',
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${abonnementId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Échec de la suppression de l'abonnement.`);
            }

            // ✅ تحديث القائمة: حذف الاشتراك من القائمة محليًا
            setAbonnements(prev => prev.filter(abo => abo._id !== abonnementId));

            MySwal.fire(
                'تم الحذف!',
                `Abonnement ID **${abonnementId}** تم حذفه بنجاح.`,
                'success'
            );

        } catch (err) {
            console.error("Erreur de suppression:", err);
            MySwal.fire(
                'خطأ!',
                `Erreur de suppression: ${err.message}`,
                'error'
            );
        }
    };

    // 🖼️ دالة عرض صورة الإثبات في نافذة منبثقة (SweetAlert2)
    const handleViewProof = (event, imageUrl) => {
        // منع السلوك الافتراضي للرابط (فتح في نافذة جديدة)
        event.preventDefault();

        MySwal.fire({
            title: 'Preuve de Paiement',
            imageUrl: imageUrl, // استخدام حقل imageUrl لعرض الصورة
            imageAlt: 'Image de preuve de paiement',
            showCloseButton: true,
            showConfirmButton: false, // لا حاجة لزر التأكيد
            customClass: {
                image: 'swal2-proof-image', // لتمكين التخصيص عبر CSS إذا لزم الأمر
            },
            width: '80vw', // عرض أكبر للمشاهدة
            padding: '1em',
        });
    };

    // 🔗 جلب البيانات عند تحميل المكون
    useEffect(() => {
        fetchAbonnements();
    }, []);

    // 🛑 حالات التحميل والخطأ
    if (loading) return (
        <>
            <NavbarAdmin />
            <div className="abonnement-container loading-state">
                <FaSpinner className="spinner" />
                <p>Chargement des demandes d'abonnement VIP...</p>
            </div>
        </>
    );

    if (error) return (
        <>
            <NavbarAdmin />
            <div className="abonnement-container error-state">
                <FaTimesCircle className="error-icon" />
                <p className="error-message">Erreur: {error}</p>
                <button className="retry-button" onClick={fetchAbonnements}>Réessayer</button>
            </div>
        </>
    );


    return (
        <>
            <NavbarAdmin />
            <div className="abonnement-container">
                <h2 className="client-title">Gérer les Abonnements VIP ({abonnements.length})</h2>

                {abonnements.length === 0 ? (
                    <div className="no-data-message">
                        <FaCheckCircle />
                        <p>Aucun abonnement trouvé.</p>
                    </div>
                ) : (
                    <div className="abonnement-list-wrapper">
                        {abonnements.map((abo) => (
                            <div className="abonnement-card" key={abo._id}>
                                <div className="card-header">
                                    <h3 className="card-title">{abo.nom}</h3>
                                    {/* عرض الحالة */}
                                    <span className={`status-badge ${abo.statut_abonnement}`}>
                                        {abo.statut_abonnement.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <p className="card-detail">ID Demande: {abo._id}</p>
                                    <p className="card-detail">Email: {abo.mail}</p>
                                    <p className="card-detail">Date de Demande: {new Date(abo.date_demande).toLocaleDateString()}</p>
                                </div>

                                <div className="card-proof-section">
                                    <FaFileImage className="proof-icon" />
                                    <p>Preuve de Paiement</p>
                                    <a
                                        href={`http://localhost:3000${abo.preuve_paiement_url}`}
                                        // 💡 التغيير هنا: استدعاء الدالة الجديدة لمنع الافتراضي وعرض الصورة في SweetAlert2
                                        onClick={(e) => handleViewProof(e, `http://localhost:3000${abo.preuve_paiement_url}`)}
                                        rel="noopener noreferrer"
                                        className="view-proof-button"
                                    >
                                        <FaExternalLinkAlt /> Voir l'Image
                                    </a>
                                </div>

                                {/* قسم الإجراءات */}
                                <div className="card-actions_abonemment">
                                    {/* زرا الموافقة والرفض متاحان فقط إذا كانت الحالة 'en_attente' */}
                                    <button
                                        onClick={() => handleUpdateStatut(abo._id, 'approuvé', abo.mail)}
                                        className="action-button_abonemment approve-button"
                                    >
                                        <FaUserCheck /> Approuver
                                    </button>

                                    <button
                                        onClick={() => handleUpdateStatut(abo._id, 'refusé')}
                                        className="action-button_abonemment reject-button"
                                    >
                                        <FaUserTimes /> Refuser
                                    </button>
                                    {/* زر الحذف الجديد متاح دائمًا */}
                                    <button
                                        onClick={() => handleDeleteAbonnement(abo._id)}
                                        className="action-button_abonemment delete-button"
                                    >
                                        <FaTrashAlt /> Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}