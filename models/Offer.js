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
    banner: {
        type: String,
        default: ''
    },
    description: {
        type: Object, // { fr: '', ar: '', en: '' }
        default: { fr: '', ar: '', en: '' }
    },
    visibleCarouselImages: {
        type: [String], // Array of image URLs
        default: []
    }
}, {
    timestamps: true
});

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;
