import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },
  image: [String],
  filterAttributes: [
    {
      name: { type: String, required: true },    
      type: { type: String, enum: ["enum", "string", "number"], default: "enum" },
      options: [String] 
    }
  ]
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);
