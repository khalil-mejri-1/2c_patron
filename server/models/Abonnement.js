// models/Abonnement.js
const mongoose = require('mongoose');

const abonnementSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, "Le nom de l'abonné est requis."],
        trim: true
    },
    
    mail: { 
        type: String,
        required: [true, "L'adresse email est requise."],
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Veuillez utiliser une adresse email valide.']
    },

    telephone: {
        type: String,
        required: [true, "Le numéro de téléphone est requis."],
        trim: true
    },
    
    preuve_paiement_url: { 
        type: String,
        required: false,
    },
    
    statut_abonnement: { 
        type: String,
        enum: ['en_attente', 'approuvé', 'refusé'],
        default: 'en_attente'
    },
    
    date_demande: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true 
});

abonnementSchema.index({ statut_abonnement: 1 });

const Abonnement = mongoose.model('Abonnement', abonnementSchema);

module.exports = Abonnement;