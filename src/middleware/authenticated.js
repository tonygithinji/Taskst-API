import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    let token;

    if (header) token = header.split(" ")[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(401).json({ status: "error", error: "Unauthorized" });
            } else {
                req.userId = decoded.userId;
                next();
            }
        });
    } else {
        res.status(401).json({ status: "error", error: "Unauthorized" });
    }
}

export default authenticate;