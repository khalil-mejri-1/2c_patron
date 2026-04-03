// models/Command.js
const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema({
    // 🔑 Informations Client
    clientName: {
        type: String,
        required: true,
        trim: true,
    },
    clientPhone: {
        type: String,
        required: true, // Requis dans tous les cas par le frontend
        trim: true,
    },
    clientEmail: {
        type: String,
        required: false, // 💡 Changé à false pour permettre les commandes des invités
        trim: true,
        lowercase: true,
    },
    shippingAddress: {
        type: String,
        required: true, // Requis dans tous les cas par le frontend
        trim: true,
    },

    // 📦 Détails de la Commande
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    items: [ // Liste des produits commandés
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            productName: {
                type: String,
                required: true
            },
            // 🖼️ NOUVEAU: Champ pour l'URL de l'image du produit
            productImage: {
                type: String,
                required: false, // Rendre ce champ facultatif, au cas où une image ne serait pas disponible.
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true,
                min: 0,
            }
        }
    ],

    // ⏳ Statut et Dates
    status: {
        type: String,
        required: true,
        default: 'En attente',
        enum: ['En attente', 'En cours de traitement', 'Expédiée', 'Livrée', 'Annulée'],
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },

}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

// 🚀 Optionnel mais recommandé : Ajout d'un champ de référence unique (comme un numéro de commande)
// Si vous utilisez un plugin d'auto-incrémentation (comme mongoose-sequence), vous pouvez l'ajouter ici.
// Sinon, vous pouvez utiliser l'_id généré par MongoDB ou générer une référence côté serveur.

// Exemple d'ajout d'une référence lisible basée sur _id
commandSchema.virtual('commandId').get(function () {
    // Utiliser une partie de l'ObjectID ou un système de numérotation externe
    return this._id.toString().slice(-8).toUpperCase();
});


const Command = mongoose.model('Command', commandSchema);
module.exports = Command;