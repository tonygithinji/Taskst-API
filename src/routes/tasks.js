import express from "express";
import Task from "../models/Task";
import authenticate from "../middleware/authenticated";

const router = express.Router();
router.use(authenticate);

router.post("/", (req, res) => {
    const { name, projectId, workspaceId } = req.body.data;
    const task = new Task();
    task.name = name;
    task.projectId = projectId;
    task.workspaceId = workspaceId;
    task.save()
        .then((newTask) => res.json({ status: "ok", task: newTask }))
        .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
});

router.get("/:projectId", (req, res) => {
    const projectId = req.params.projectId;

    Task.find({ projectId })
        .limit(10)
        .then(tasks => res.json({ status: "ok", tasks }));
});

export default router;