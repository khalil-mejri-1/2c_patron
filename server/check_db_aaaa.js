const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        const videosCount = await db.collection('specializedvideos').countDocuments({});
        console.log('Videos count:', videosCount);

        const coursesCount = await db.collection('specializedcourses').countDocuments({});
        console.log('Courses count:', coursesCount);

        const aaaaVideo = await db.collection('specializedvideos').findOne({ category: 'aaaa' });
        console.log('Video for aaaa:', aaaaVideo);

        const aaaaCourse = await db.collection('specializedcourses').findOne({ vip_category: 'aaaa' });
        console.log('Course for aaaa:', aaaaCourse);
        
        await mongoose.disconnect();
    } catch (e) {
        console.log('Error:', e);
    }
}

check();
