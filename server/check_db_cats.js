const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        const courses = await db.collection('specializedcourses').find({}).toArray();
        console.log('Course Categories (in specializedcourses):');
        courses.forEach(c => console.log(`- ${c.vip_category} (_id: ${c._id})`));
        
        await mongoose.disconnect();
    } catch (e) {
        console.log('Error:', e);
    }
}

check();
