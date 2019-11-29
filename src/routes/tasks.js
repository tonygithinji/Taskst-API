import express from "express";
import Task from "../models/Task";
import Project from "../models/Project";
import authenticate from "../middleware/authenticated";

const router = express.Router();
router.use(authenticate);

router.post("/", (req, res) => {
    const { task, projectId, workspaceId } = req.body.data;
    const newTask = new Task();
    newTask.task = task;
    newTask.projectId = projectId;
    newTask.workspaceId = workspaceId;
    newTask.save()
        .then((createdTask) => res.json({ status: "ok", task: createdTask }))
        .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
});

router.get("/:projectId", (req, res) => {
    const projectId = req.params.projectId;

    const projectPromise = Project.findById(projectId);
    const tasksPromise = Task.find({ projectId }).limit(10);

    Promise.all([projectPromise, tasksPromise])
        .then(([project, tasks]) => res.json({ status: "ok", tasks, project }));
});

export default router;