import mongoose from "mongoose";
import bcrypt from "bcrypt";

const clinicianSchema = new mongoose.Schema({
    id: {
        type: String,
        maxlength: 9,
        uppercase: true,
        trim: true,
        unique: true,
        required: [true, "id is required for all clinicians"],
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
clinicianSchema.pre("save", function (next) {
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

export default mongoose.model("clinician", clinicianSchema);