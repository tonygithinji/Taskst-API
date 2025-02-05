import express from "express";
import Workspace from "../models/Workspace";
import authenticate from "../middleware/authenticated";
import Project from "../models/Project";
import Task from "../models/Task";

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
    Workspace.find({ userId: req.userId }).then(workspaces => res.json({ status: "ok", workspaces }));
});

router.post("/", (req, res) => {
    const { name, description, color } = req.body.data;
    const workspace = new Workspace({ name, description, color, userId: req.userId });
    workspace.save()
        .then(newWorkspace => res.json({ status: "ok", workspace: newWorkspace }))
        .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
});

router.get("/:workspaceId", (req, res) => {
    const workspaceId = req.params.workspaceId;

    Workspace.findById(workspaceId).then(workspace => res.json({ status: "ok", workspace }));
});

router.post("/update", (req, res) => {
    const { name, description, color, workspaceId } = req.body.data;
    Workspace.findByIdAndUpdate(workspaceId, { name, description, color })
        .then(() => res.json({ status: "ok" }))
        .catch(() => res.status(400).json({ errors: { global: "An unexpected error occurred" } }));
});

router.post("/delete", (req, res) => {
    const { workspaceId } = req.body.data;

    Workspace.findByIdAndDelete(workspaceId)
        .then(() => {
            Project.deleteMany({ workspaceId }).then(() => { });
            Task.deleteMany({ workspaceId }).then(() => { });
            res.json({ status: "ok" });
        })
});

export default router;