// models/SpecializedVideo.js
const mongoose = require('mongoose');

const specializedVideoSchema = new mongoose.Schema({
    url: { type: String, required: true },
    url_lang: { type: Object, default: {} }, // Multi-language URLs or paths
    title: { type: String, required: true },
    title_lang: { type: Object, default: {} }, // Multi-language titles
    status_lang: { type: Object, default: {} }, // Multi-language status labels (Free/VIP)
    description: { type: String },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const SpecializedVideo = mongoose.model('SpecializedVideo', specializedVideoSchema);
module.exports = SpecializedVideo;