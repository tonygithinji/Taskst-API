import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import auth from "./routes/auth";
import users from "./routes/users";
import workspaces from "./routes/workspaces";
import projects from "./routes/projects";
import tasks from "./routes/tasks";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/workspaces", workspaces);
app.use("/api/projects", projects);
app.use("/api/tasks", tasks);

app.listen(process.env.PORT, () => console.log(`App started on port ${process.env.PORT}`));