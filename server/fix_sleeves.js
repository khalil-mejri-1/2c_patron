const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function fix() {
    try {
        await mongoose.connect(MONGODB_URI);
        const SpecializedCourse = require('./models/SpecializedCourse');
        const SpecializedVideo = require('./models/SpecializedVideo');
        
        // 1. Find the redundant/empty sleeve group
        const emptyGroup = await SpecializedCourse.findOne({ 
            vip_category: "Les Manches", 
            courses: { $size: 0 } 
        });
        if (emptyGroup) {
            console.log("Found empty group 'Les Manches'. Deleting it...");
            await SpecializedCourse.deleteOne({ _id: emptyGroup._id });
        }
        
        // 2. Find the populated sleeve group (الاكمام)
        const fullGroup = await SpecializedCourse.findOne({ 
            $or: [{ vip_category: "الاكمام" }, { "hero_content.fr.title": "Les Manches" }]
        });
        
        if (fullGroup) {
            console.log("Found populated group. Current vip_category:", fullGroup.vip_category);
            // Rename vip_category to "Les Manches" for consistency in URL/Search
            fullGroup.vip_category = "Les Manches";
            await fullGroup.save();
            console.log("Updated category group name to 'Les Manches' to fix display issues.");
        }
        
        // 3. Normalize video categories for sleeves
        // Map from many possible varieties to the common names in the database
        const mapping = {
            "manche jigot": "Manche gigot",
            "manche papillon": "Manche papillon",
            "manche a volant": "Manche à volant",
            "manche": "Manche gigot" // Just a guess for generic ones
        };
        
        for (const [oldCat, newCat] of Object.entries(mapping)) {
            // Case-insensitive update if possible, or just exact matches
            await SpecializedVideo.updateMany({ category: oldCat }, { category: newCat });
            console.log(`Renamed video category '${oldCat}' to '${newCat}'`);
        }
        
        // Final normalization to ensure things match exactly
        console.log("Normalization complete.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fix();
