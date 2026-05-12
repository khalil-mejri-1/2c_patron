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
        required: false,
        lowercase: true,
    },

    telephone: {
        type: String,
        required: [true, "Le numéro de téléphone est requis."],
        trim: true
    },
    
    generated_mail: { 
        type: String,
        required: false,
    },
    
    generated_password: { 
        type: String,
        required: false,
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