import express from "express";
import Project from "../models/Project";
import authenticate from "../middleware/authenticated";
import Workspace from "../models/Workspace";

const router = express.Router();
router.use(authenticate);

router.post("/", (req, res) => {
    const { name, workspaceId } = req.body.data;

    const project = new Project();
    project.name = name;
    project.workspaceId = workspaceId;
    project.save()
        .then(doc => {
            Workspace.findByIdAndUpdate(workspaceId).update({ $inc: { projectsNumber: 1 } })
                .then(() => res.json({ status: "ok", project: doc }))
                .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
        })
        .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
});

router.get("/:workspaceId", (req, res) => {
    const workspaceId = req.params.workspaceId;

    Project.find({ workspaceId })
        .limit(10)
        .then(projects => res.json({ status: "ok", projects }))
});

router.post("/update", (req, res) => {
    const { projectName, projectId } = req.body.data;
    Project.findByIdAndUpdate(projectId, { name: projectName }, { new: true })
        .then(project => res.json({ status: "ok", project }))
        .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
});

export default router;
