const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function fix() {
    try {
        await mongoose.connect(MONGODB_URI);
        const SpecializedCourse = require('./models/SpecializedCourse');
        const SpecializedVideo = require('./models/SpecializedVideo');

        // Find the "Les coles" category
        const categoryGroup = await SpecializedCourse.findOne({ vip_category: "Les coles" });
        if (!categoryGroup) {
            console.log("Category 'Les coles' not found. Creating it...");
            // ... (optional, but it should exist if they saw it)
        } else {
            console.log("Found category 'Les coles'. Current courses:", categoryGroup.courses);

            // Define the collar lessons based on the videos found
            const collarLessons = [
                { fr: "Col plat", ar: "ياقة منبسطة", TN: "Col plat" },
                { fr: "Col châle", ar: "ياقة شال", TN: "Col châle" },
                { fr: "Col et pied de col", ar: "ياقة وقاعدة ياقة", TN: "Col et pied de col" },
                { fr: "Col claudine", ar: "ياقة كلودين", TN: "Col claudine" },
                { fr: "Col officier", ar: "ياقة ضابط", TN: "Col officier" },
                { fr: "Col tailleur", ar: "ياقة تايير", TN: "Col tailleur" },
                { fr: "Col polo", ar: "ياقة بولو", TN: "Col polo" }
            ];

            const newCourses = collarLessons.map(lesson => ({
                title: lesson,
                duration: { fr: "Access complet", ar: "عرض كامل", TN: "Access complet" },
                image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2670&auto=format&fit=crop",
                vip_category: "Les coles"
            }));

            categoryGroup.courses = newCourses;
            await categoryGroup.save();
            console.log("Updated 'Les coles' with lessons.");
        }

        // Also normalize the categories in SpecializedVideo to match the new lessons
        // (e.g. "Cole châle" -> "Col châle", "col plat" -> "Col plat")
        const mapping = {
            "Cole châle": "Col châle",
            "Cole et pied du col": "Col et pied de col",
            "col plat": "Col plat",
            "Cole": "Col plat" // Just a guess for some of them
        };

        for (const [oldCat, newCat] of Object.entries(mapping)) {
            await SpecializedVideo.updateMany({ category: oldCat }, { category: newCat });
            console.log(`Renamed video category '${oldCat}' to '${newCat}'`);
        }

        // Also try to fix [object Object] categories
        // We can't know for sure, but maybe we can check the video titles
        const brokenVideos = await SpecializedVideo.find({ category: "[object Object]" });
        for (const video of brokenVideos) {
            // Check if title mentions a collar
            const titleStr = JSON.stringify(video.title_lang).toLowerCase() + (video.title || "").toLowerCase();
            if (titleStr.includes("plat")) video.category = "Col plat";
            else if (titleStr.includes("chale") || titleStr.includes("châle")) video.category = "Col châle";
            else if (titleStr.includes("officier")) video.category = "Col officier";
            else if (titleStr.includes("claudine")) video.category = "Col claudine";
            else if (titleStr.includes("tailleur")) video.category = "Col tailleur";
            else if (titleStr.includes("pied")) video.category = "Col et pied de col";
            else if (titleStr.includes("polo")) video.category = "Col polo";

            if (video.category !== "[object Object]") {
                await video.save();
                console.log(`Fixed video ID ${video._id} from title match.`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fix();
