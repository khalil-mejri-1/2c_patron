const mongoose = require('mongoose');

const CommentaireSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true,
        maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    commentaire: {
        type: String,
        required: [true, 'Le commentaire est obligatoire'],
    },
    date_creation: {
        type: Date,
        default: Date.now,
    },
    statut: {
        type: String,
        enum: ['En attente', 'Approuvé', 'Rejeté'],
        default: 'En attente',
        set: v => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
    }

});

module.exports = mongoose.model('Commentaire', CommentaireSchema);

