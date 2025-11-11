// models/Abonnement.js
const mongoose = require('mongoose');

const abonnementSchema = new mongoose.Schema({
    // 💡 Champ pour le nom de l'utilisateur qui demande l'abonnement
    nom: {
        type: String,
        required: [true, "Le nom de l'abonné est requis."],
        trim: true
    },
    
    // 💡 Champ pour l'email de l'utilisateur
    mail: { // 'mail' pour correspondre à votre frontend (abo.mail)
        type: String,
        required: [true, "L'adresse email est requise."],
        unique: true, // Assurez-vous qu'un email n'a qu'une seule demande en attente
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Veuillez utiliser une adresse email valide.']
    },
    
    // 💡 URL de l'image de preuve de paiement (à stocker sur un service cloud comme Cloudinary ou S3)
    preuve_paiement_url: { // 'preuve_paiement_url' pour correspondre à votre frontend
        type: String,
        required: [true, "L'URL de la preuve de paiement est requise."],
    },
    
    // 💡 Statut de la demande d'abonnement (en_attente, approuvé, refusé)
    statut_abonnement: { // 'statut_abonnement' pour correspondre à votre frontend
        type: String,
        enum: ['en_attente', 'approuvé', 'refusé'],
        default: 'en_attente'
    },
    
    // 💡 Date de la demande (pour le tri et l'affichage)
    date_demande: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Crée un index pour accélérer la recherche par statut
abonnementSchema.index({ statut_abonnement: 1 });

const Abonnement = mongoose.model('Abonnement', abonnementSchema);

module.exports = Abonnement;