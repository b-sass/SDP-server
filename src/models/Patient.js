import mongoose from "mongoose";
import bcrypt from "bcrypt";

const AnswerSchema = new mongoose.Schema({
    resultId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Result",
        required: true,
    },
    "2-Age": {
        type: String,
        required: true
    },
    "3-Gender": {
        type: String,
        required: true
    },
    "4-SerumCreatinine": {
        type: String,
        required: true
    },
    "4-SC-Unit": {
        type: String,
        required: true
    },
    "5-Race": String,
    "6-Race": String,
    "7-Height": String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

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
    }
});

const PatientSchema = new mongoose.Schema({
    id: {
        type: String,
        minLength: 10,
        maxLength: 10,
        trim: true,
        uppercase: true,
        unique: true,
        required: [true, "NHS Number is required for all patients"],
    },
    password: {
        type: String,
        minLength: 8,
        maxLength: 40,
        trim: true,
        required: [true, "Password is required"],
    },
    fullname: {
        type: String,
        trim: true,
        required: [true, "Full name is required"],
    },
    dob: {
        type: Date,
        required: [true, "Date of birth is required"],
    },
    phone: {
        type: String,
        trim: true,
        required: [true, "Phone number is required"],
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
    results: [{ type: mongoose.Schema.Types.ObjectId, ref: "Result" }],
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answer" }],
    clinician: {
        type: String,
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

mongoose.model("Result", ResultSchema);
mongoose.model("Answer", AnswerSchema);
export default mongoose.model("patients", PatientSchema);