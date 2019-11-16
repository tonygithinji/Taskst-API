import express from "express";
import User from "../models/User";
import parseErrors from "../utils/parseErrors";

const router = express.Router();

router.post("/", (req, res) => {
    if (req.body.data) {
        const { firstName, lastName, email, password } = req.body.data;
        const user = new User({ firstName, lastName, email });
        user.setPassword(password);
        user.save()
            .then(newUser => {
                res.json({ status: "ok", user: newUser.toAuthJSON(), token: user.generateJWT() });
            })
            .catch(err => res.status(400).json({ status: "error", errors: parseErrors(err.errors) }));
    } else {
        res.status(400).json({ status: "error", errors: { global: "Empty fields are not permitted" } });
    }
});

export default router;