const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        const SpecializedCourse = require('./models/SpecializedCourse');
        const SpecializedVideo = require('./models/SpecializedVideo');
        
        console.log('--- COURSES ---');
        const courses = await SpecializedCourse.find({});
        console.log(JSON.stringify(courses, null, 2));
        
        console.log('--- VIDEOS ---');
        const videos = await SpecializedVideo.find({});
        console.log(JSON.stringify(videos, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
