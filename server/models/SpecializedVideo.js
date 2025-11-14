// models/SpecializedVideo.js
const mongoose = require('mongoose');

const specializedVideoSchema = new mongoose.Schema({
    url: { type: String, required: true }, // ⬅️ Stocke l'URL ou le chemin
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const SpecializedVideo = mongoose.model('SpecializedVideo', specializedVideoSchema);
module.exports = SpecializedVideo;