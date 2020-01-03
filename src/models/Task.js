import mongoose from "mongoose";

const schema = mongoose.Schema({
    task: { type: String, required: true },
    complete: { type: Boolean, default: false },
    projectId: { type: String, required: true },
    workspaceId: { type: String, required: true },
    starred: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Task", schema);