import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import uniqueValidator from "mongoose-unique-validator";

const schema = new mongoose.Schema({
    firstName: { type: String, required: true, lowercase: true },
    lastName: { type: String, required: true, lowercase: true },
    email: { type: String, required: true, lowercase: true, index: true, unique: true },
    password: { type: String, required: true },
    confirmed: { type: Boolean, default: false },
    confirmationToken: { type: String, default: "" },
    passwordResetToken: { type: String, default: "" }
}, { timestamps: true });

schema.methods.isValidPassword = function isValidPassword(password) {
    return bcrypt.compareSync(password, this.password);
}

schema.methods.setPassword = function setPassword(password) {
    this.password = bcrypt.hashSync(password, 10);
}

schema.methods.generateJWT = function generateJWT() {
    return jwt.sign({
        userId: this._id
    }, process.env.JWT_SECRET);
}

schema.methods.toAuthJSON = function toAuthJSON() {
    return {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email
    };
}

schema.plugin(uniqueValidator, { message: "Email isn't available" });

export default mongoose.model("User", schema);