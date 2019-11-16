import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    color: { type: String, required: true },
    projects_num: { type: Number, default: 0 },
    tasks_num: { type: Number, default: 0 },
    completed_projects: { type: Number, default: 0 },
    completed_tasks: { type: Number, default: 0 },
    userId: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Workspace", schema);