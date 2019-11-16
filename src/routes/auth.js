import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = express.Router();

router.post("/login", (req, res) => {
    const { credentials } = req.body;
    User.findOne({ email: credentials.email }).then(user => {
        if (user && user.isValidPassword(credentials.password)) {
            res.json({ status: "ok", user: user.toAuthJSON(), token: user.generateJWT() });
        } else {
            res.status(401).json({ errors: { global: "Wrong username or password" } });
        }
    });
});

router.post("/validatetoken", (req, res) => {
    const token = req.body.token;

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({});
        } else {
            User.findById(decoded.userId).then(user => {
                if (user) {
                    res.json({ status: "ok", user: user.toAuthJSON(), token: user.generateJWT() });
                } else {
                    res.status(401).json({});
                }
            });
        }
    });
});

export default router;