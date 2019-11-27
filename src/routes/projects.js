import express from "express";
import Project from "../models/Project";
import authenticate from "../middleware/authenticated";

const router = express.Router();
router.use(authenticate);

router.post("/", (req, res) => {
    const { name, workspaceId } = req.body.data;

    const project = new Project();
    project.name = name;
    project.workspaceId = workspaceId;
    project.save()
        .then(doc => res.json({ status: "ok", project: doc }))
        .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
});

router.get("/:workspaceId", (req, res) => {
    const workspaceId = req.params.workspaceId;

    Project.find({ workspaceId })
        .limit(10)
        .then(projects => res.json({ status: "ok", projects }))
});

export default router;
