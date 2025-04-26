import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupImage: {
      type: String,
      default: "/group-avatar.png",
    },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

export default Group; 