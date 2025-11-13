const mongoose = require('mongoose');

const courseItemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    duration: { type: String, required: false },
    image: { type: String, required: true },
    vip_category: { type: String, required: true }, // الآن الاسم بدل المعرف
});

const specializedCourseSchema = new mongoose.Schema({
    video_link: { type: String, required: false }, 
    courses: [courseItemSchema], 
    createdAt: { type: Date, default: Date.now },
});

const SpecializedCourse = mongoose.model('SpecializedCourse', specializedCourseSchema);
module.exports = SpecializedCourse;
