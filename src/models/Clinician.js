import mongoose from "mongoose";
import Patient from "./Patient.js";

const clinicianschema = new mongoose.Schema({
    id: {
        type: Number,
        // maxlength: 10,
        uppercase: true,
        trim: true,
        unique: true,
        required: [true, "id is required for all clinicians"],
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
    patients: {
        type: [String],
    },
});

// Duplicated code
// Password hashing
clinicianschema.pre("save", function (next) {
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

export default mongoose.model("clinician", clinicianschema);