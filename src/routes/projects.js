import express from "express";
import Project from "../models/Project";
import Task from "../models/Task";
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

router.post("/delete", (req, res) => {
    const { projectId, workspaceId } = req.body.data;
    Task.find({ projectId }).countDocuments((err, count) => {
        Project.findByIdAndDelete(projectId)
            .then(() => {
                Workspace.findByIdAndUpdate(workspaceId)
                    .update({ $inc: { projectsNumber: -1, tasksNumber: -count } })
                    .then(() => {
                        Task.deleteMany({ projectId }, (error, result) => {
                            if (err) {
                                console.log("ERROR", error);
                            } else {
                                console.log("RESULT", result);
                            }
                        });
                        res.json({ status: "ok" });
                    })
                    .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
            })
            .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
    });
});

router.get("/recent/:workspaceId", (req, res) => {
    const workspaceId = req.params.workspaceId;

    Project.find({ workspaceId })
        .limit(5)
        .sort({ updatedAt: "desc" })
        .then(lists => res.json({ status: "ok", lists }))
});

export default router;
