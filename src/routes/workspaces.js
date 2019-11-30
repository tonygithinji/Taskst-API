import express from "express";
import Workspace from "../models/Workspace";
import authenticate from "../middleware/authenticated";

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

export default router;