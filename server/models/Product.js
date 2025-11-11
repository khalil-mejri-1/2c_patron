// models/Product.js (النسخة المصححة لـ CommonJS)

const mongoose = require('mongoose'); // 💡 استخدم require هنا

const productSchema = new mongoose.Schema({
    // ... (بقية الحقول كما هي) ...
    nom: {
        type: String,
        required: [true, 'Le nom du produit est requis'],
        trim: true,
        maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    image: {
        type: String,
        required: [true, 'L\'URL de l\'image est requise'],
        trim: true,
    },
    prix: {
        type: Number,
        required: [true, 'Le prix est requis'],
        min: [0, 'Le prix ne peut pas être négatif']
    },
    categorie: {
        type: String,
        required: [true, 'La catégorie est requise'],
        default: 'Autres'
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

// 🚨 التصحيح هنا: استخدم module.exports لتصدير النموذج مباشرة
module.exports = Product;