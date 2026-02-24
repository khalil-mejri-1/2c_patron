const mongoose = require('mongoose');

const courseItemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    duration: { type: String, required: false },
    image: { type: String, required: true },
    vip_category: { type: String, required: true },
    hero_content: { type: Object, default: {} }, // Multi-language object
    hero_bg: { type: String, required: false },
});

const specializedCourseSchema = new mongoose.Schema({
    video_link: { type: String, required: false },
    hero_bg: { type: String, required: false },
    hero_content: { type: Object, default: {} }, // Multi-language object
    vip_category: { type: String, required: false }, // Top-level category name
    courses: [courseItemSchema],
    createdAt: { type: Date, default: Date.now },
});

const SpecializedCourse = mongoose.model('SpecializedCourse', specializedCourseSchema);
module.exports = SpecializedCourse;
