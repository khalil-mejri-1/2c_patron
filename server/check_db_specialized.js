const mongoose = require('mongoose');
const SpecializedCourse = require('./models/SpecializedCourse');
const SpecializedVideo = require('./models/SpecializedVideo');

const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function check() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const courses = await SpecializedCourse.find({});
    console.log('Courses (Groups):');
    courses.forEach(c => {
        console.log(`- ${c.vip_category} (_id: ${c._id})`);
        (c.courses || []).forEach(l => console.log(`  * ${l.title}`));
    });

    const videos = await SpecializedVideo.find({});
    console.log('Videos:');
    videos.forEach(v => {
        console.log(`- Title: ${v.title}, Category: "${v.category}", Sub: "${v.subCategory}"`);
    });

    await mongoose.disconnect();
}

check();
