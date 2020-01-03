import express from "express";
import moment from "moment";
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

    Task.findByIdAndUpdate(taskId, task, { new: true })
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

router.post("/graphdata", (req, res) => {
    const { period, periodStart, duration, workspaceId } = req.body.data;
    const promises = [];
    const periods = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < duration; i++) {
        let date;
        if (period === "week") {
            date = moment(periodStart).add(i, "days");
            periods.push(date.clone().format("ddd"));
        } else if (period === "month") {
            date = moment(periodStart).add(i, "days");
            periods.push(date.clone().format("D"));
        } else if (period === "year") {
            date = moment(periodStart).add(i, "months");
            periods.push(date.clone().format("MMM"))
        }
        const start = new Date(date.clone().startOf("day").toISOString(true));
        const end = new Date(date.clone().endOf("day").toISOString(true));

        promises.push(
            Task.aggregate([
                {
                    $match: {
                        createdAt: { $gte: start, $lte: end },
                        workspaceId
                    }
                },
                {
                    $group: {
                        _id: "$complete",
                        count: { $sum: 1 }
                    }
                }
            ])
        )
    }

    Promise.all(promises)
        .then(data => {
            const result = [];
            data.forEach((row, index) => {
                if (row.length > 0) {
                    const r = {};
                    if (row[0]) {
                        if (row[0]._id) {
                            r.complete = row[0].count;
                        } else {
                            r.incomplete = row[0].count;
                        }
                    }
                    if (row[1]) {
                        if (row[1]._id) {
                            r.complete = row[1].count;
                        } else {
                            r.incomplete = row[1].count;
                        }
                    }
                    if (!r.complete) r.complete = 0;
                    if (!r.incomplete) r.incomplete = 0;
                    r.day = periods[index];
                    result.push(r);
                } else {
                    result.push({ day: periods[index], complete: 0, incomplete: 0 });
                }
            });

            res.json({ status: "ok", data: result });
        });
});

router.get("/:workspaceId/starred", (req, res) => {
    const workspaceId = req.params.workspaceId;
    Task.find({ workspaceId, starred: true })
        .limit(50)
        .then(tasks => res.json({ status: "ok", tasks }));
});

export default router;