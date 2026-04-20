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
    
    // ✅ حقل جديد: رقم تعريف المنتج
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'L\'ID du produit est obligatoire'],
        ref: 'Product' // افتراض وجود موديل باسم 'Product'
    },
    
    // ✅ حقل جديد: التقييم بالنجوم
    rating: {
        type: Number,
        min: [1, 'Le rating minimum est 1'],
        max: [5, 'Le rating maximum est 5'],
        required: false,
        default: 5
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