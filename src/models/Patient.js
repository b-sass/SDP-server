import mongoose from "mongoose";
import bcrypt from "bcrypt";

const mfa = new mongoose.Schema({
    secret: {
        type: String,
        default: "",
    },
    verified: {
        type: Boolean,
        default: false,
    },
});

const AnswerSchema = new mongoose.Schema({
    resultId: {
        type: Number,
        unique: true,
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
    resultId: {
        type: Number,
        unique: true,
        required: true,
    },
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

const AppointmentSchema = new mongoose.Schema({
    appointmentID: {
        type: String,
        unique: true,
        required: [true, "Appointment ID is required"],
    },
    date: {
        type: Date,
        required: [true, "Appointment date is required"],
    },
    time: {
        type: String,
        required: [true, "Appointment time is required"],
    },
    clinician: {
        type: String,
        required: [true, "Clinician name is required"],
    },
    notes: {
        type: String,
        trim: true,
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
    password: {
        type: String,
        minLength: 8,
        maxLength: 60,
        trim: true,
        require: [true, "Password is required"],
    },
    fullname: {
        type: String,
        trim: true,
        require: [true, "Full name is required"],
    },
    dob: {
        type: Date,
        require: [true, "Date of birth is required"],
    },
    phone: {
        type: String,
        trim: true,
        require: [true, "Phone number is required"],
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
    },
    answers: {
        type: [AnswerSchema],
    },
    clinitian: {
        type: String,
    },
    mfa: {
        type: mfa
    },
    appointments: {
        type: [AppointmentSchema],
    },
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