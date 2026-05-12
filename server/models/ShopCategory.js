const mongoose = require('mongoose');

const shopCategorySchema = new mongoose.Schema({
    name: {
        type: Object, // { fr: '...', ar: '...', en: '...' }
        required: true
    },
    key: {
        type: String, // 'homme', 'femme', etc.
        unique: true,
        required: true
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('ShopCategory', shopCategorySchema);
