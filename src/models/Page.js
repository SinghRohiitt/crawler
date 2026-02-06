import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["internal", "external"],
      required: true
    }
  },
  { _id: false }
);

const pageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    html: {
      type: String
    },

    outgoingLinks: {
      type: [linkSchema],
      default: []
    },

    incomingLinks: {
      type: [String],
      default: []
    },

    outgoingCount: {
      type: Number,
      default: 0
    },

    incomingCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Page = mongoose.model("Page", pageSchema);
export default Page;
