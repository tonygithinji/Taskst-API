import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    color: { type: String, required: true },
    projectsNumber: { type: Number, default: 0 },
    tasksNumber: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    userId: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Workspace", schema);