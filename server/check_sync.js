const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        const vipCats = await db.collection('vipcategories').find({}).toArray();
        console.log('VIP Categories (Public Cards):');
        vipCats.forEach(c => console.log(`- ${c.title} (_id: ${c._id})`));

        const specCourses = await db.collection('specializedcourses').find({}).toArray();
        console.log('\nSpecialized Courses (Groups):');
        specCourses.forEach(c => console.log(`- ${c.vip_category} (_id: ${c._id})`));
        
        await mongoose.disconnect();
    } catch (e) {
        console.log('Error:', e);
    }
}

check();
