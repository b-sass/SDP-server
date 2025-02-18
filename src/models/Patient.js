import mongoose from "mongoose";
import bcrypt from "bcrypt";

const ResultSchema = new mongoose.Schema({
    creatine: {
        type: Number,
        min: 0,
        required: [true, "Creatine levels required"]
    },
    calculationType: {
        type: String,
        enum: ["mg", "umol"],
        required: [true, "Calculation type required"],
    },
    eGFR: {
        type: Number,
        min: 0,
        required: [true, "Calculation result required (eGFR)"]
    },
});

const PatientSchema = new mongoose.Schema({
    id: {
        type: String,
        minLength: 10,
        maxLength: 10,
        trim: true,
        uppercase: true,
        unique: true,
        require: [true, "NHS Number is required for all patients"],
    },
    email: {
        type: String,
        maxLength: 40,
        trim: true,
        unique: true,
        lowercase: true,
        require: [true, "Email is required"],
    },
    password: {
        type: String,
        minLength: 8,
        maxLength: 40,
        trim: true,
        require: [true, "Password is required"],
    },
    age: {
        type: Number,
        min: 0,
        max: 170,
    },
    sex: {
        type: String,
        enum: ["male", "female"],
    },
    race: {
        type: String,
        enum: ["asian", "black", "mixed", "white", "other"],
    },
    results: {
        type: [ResultSchema],
    }
});

// Duplicated code
// Password hashing
PatientSchema.pre("save", function (next) {
    const user = this;

    if (!user.isModified("password")) return next();
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

export default mongoose.model("patients", PatientSchema);