import mongoose from "mongoose";

const schema = mongoose.Schema({
    name: { type: String, required: true },
    complete: { type: Boolean, default: false },
    projectId: { type: String, required: true },
    workspaceId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Task", schema);