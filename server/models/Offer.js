const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: Object, // { fr: '', ar: '', en: '' }
        required: true,
        default: {}
    },
    productIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }],
    newPrice: {
        type: Number,
        required: true
    },
    duration: {
        type: Date, // End date/time
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Optional: store images or just use product images
    banner: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;
