import express from "express";
import Task from "../models/Task";
import Project from "../models/Project";
import Workspace from "../models/Workspace";
import authenticate from "../middleware/authenticated";

const router = express.Router();
router.use(authenticate);

// Create a new task
router.post("/", (req, res) => {
    const { task, projectId, workspaceId } = req.body.data;
    const newTask = new Task();
    newTask.task = task;
    newTask.projectId = projectId;
    newTask.workspaceId = workspaceId;
    newTask.save()
        .then((createdTask) => {
            const projectPromise = Project.findByIdAndUpdate(projectId, { $inc: { tasksNumber: 1 } });
            const workspacePromise = Workspace.findByIdAndUpdate(workspaceId, { $inc: { tasksNumber: 1 } });

            Promise.all([projectPromise, workspacePromise])
                .then(() => res.json({ status: "ok", task: createdTask }))
                .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
        })
        .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
});

// Fetch all tasks for a particular project
router.get("/:projectId", (req, res) => {
    const projectId = req.params.projectId;
    const complete = (req.query.complete === "true");

    const projectPromise = Project.findById(projectId);
    const tasksPromise = Task.find({ projectId, complete }).limit(10);

    Promise.all([projectPromise, tasksPromise])
        .then(([project, tasks]) => res.json({ status: "ok", tasks, project }));
});

// Update a task
router.post("/update", (req, res) => {
    const { task, taskId } = req.body.data;
    Task.findByIdAndUpdate(taskId, { task }, { new: true })
        .then(updatedTask => res.json({ status: "ok", task: updatedTask }))
        .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
});

// Delete a task
router.post("/delete", (req, res) => {
    const { taskId, projectId, workspaceId } = req.body.data;
    Task.findByIdAndDelete(taskId)
        .then(() => {
            const projectPromise = Project.findByIdAndUpdate(projectId, { $inc: { tasksNumber: -1 } });
            const workspacePromise = Workspace.findByIdAndUpdate(workspaceId, { $inc: { tasksNumber: -1 } });

            Promise.all([projectPromise, workspacePromise])
                .then(() => res.json({ status: "ok" }))
                .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
        })
        .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
});

// Toggle a task's complete status
router.post("/complete", (req, res) => {
    const { taskId, projectId, workspaceId, status } = req.body.data;
    Task.findByIdAndUpdate(taskId, { complete: status })
        .then(() => {
            const updateCount = status ? 1 : -1;
            const projectPromise = Project.findByIdAndUpdate(projectId, { $inc: { completedTasks: updateCount } });
            const workspacePromise = Workspace.findByIdAndUpdate(workspaceId, { $inc: { completedTasks: updateCount } });

            Promise.all([projectPromise, workspacePromise])
                .then(() => res.json({ status: "ok" }))
                .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
        })
        .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
});

export default router;