// models/Product.js (النسخة المُعدَّلة لفصل الصورة الرئيسية)

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nom: {
        type: Object,
        required: [true, 'Le nom du produit est requis'],
        default: {}
    },
    
    // 💡 1. الحقل الجديد للصورة الرئيسية (إلزامي وسلسلة نصية واحدة)
    mainImage: {
        type: String,
        required: [true, 'رابط الصورة الرئيسية مطلوب.'],
        trim: true,
    },
    
    // 💡 2. حقل للصور الثانوية (مصفوفة من السلاسل النصية - اختياري)
    secondaryImages: {
        type: [String], // مصفوفة من الـ Strings
        required: false, // الصور الثانوية اختيارية
        default: [], // الافتراضي هو مصفوفة فارغة
        validate: {
            validator: function(v) {
                // التأكد من أن جميع العناصر في المصفوفة هي سلاسل نصية (URLs)
                return v.every(url => typeof url === 'string');
            },
            message: 'يجب أن تكون جميع الصور الثانوية روابط صحيحة.'
        }
    },
    
    // 💡 3. الصور المخصصة للنافذة الداخلية (Order Modal) - لا تظهر في الخارج
    innerImages: {
        type: [String],
        required: false,
        default: []
    },
    
    // 💡 4. حقل علامة منتج جديد
    isNewProduct: {
        type: Boolean,
        default: false
    },
    

    
    prix: {
        type: Number,
        required: [true, 'Le prix est requis'],
        min: [0, 'Le prix ne peut pas être سلبي']
    },
    categorie: {
        type: String,
        required: [true, 'La catégorie est requise'],
        default: 'Autres'
    },
    // Order for displaying the product
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;