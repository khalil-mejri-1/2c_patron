// models/user.js

const mongoose = require('mongoose');

// Define the schema (structure) for a User document
const userSchema = new mongoose.Schema({
    nom: { 
        type: String, 
        required: true 
    },

    mail: { 
        type: String, 
        required: true, 
        unique: true // Ensures no two users have the same email
    },
    mot_de_pass: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String, 
        required: false 
    },
        statut: { 
        type: String, 
        required: false ,
        default: 'client'
    },
   
        abonne: { 
        type: String, 
        required: false ,
        default: 'non'
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the Model and export it
const User = mongoose.model('User', userSchema);
module.exports = User;