import mongoose from "mongoose";

const schema = mongoose.Schema({
    name: { type: String, required: true },
    tasks_num: { type: Number, default: 0 },
    completed_tasks: { type: Number, default: 0 },
    workspaceId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Project", schema);