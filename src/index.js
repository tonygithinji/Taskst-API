import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import auth from "./routes/auth";
import users from "./routes/users";

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

app.use("/api/auth", auth);
app.use("/api/users", users);

app.listen(process.env.PORT, () => console.log(`App started on port ${process.env.PORT}`));