import mongoose from "mongoose";

const schema = mongoose.Schema({
    name: { type: String, required: true },
    tasksNumber: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    complete: { type: Boolean, default: false },
    workspaceId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Project", schema);