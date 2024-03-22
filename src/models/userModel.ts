import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    isVerified: { type: Boolean, default: false },
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    profilePhoto: String,
    verificationToken: { type: String, select: false },
    verificationTokenExpiry: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetTokenExpiry: { type: Date, select: false },
});

const User = mongoose.model("users", userSchema);
export default User;
