const mongoose = require("mongoose");

const homeProductSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    image: { type: String, required: true },
    prix: { type: Number, required: true },
    categorie: { type: String, default: 'General' },
    isFeatured: { type: Boolean, default: false },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomeProduct", homeProductSchema);
