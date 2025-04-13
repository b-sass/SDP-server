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
    patients: {
        type: [String],
    },
    mfa: {
        type: mfa,
    },
    appointments: {
        type: [
            {
                patientId: {
                    type: String,
                    required: [true, "Patient ID is required for an appointment"],
                },
                date: {
                    type: Date,
                    required: [true, "Appointment date is required"],
                },
                notes: {
                    type: String,
                    trim: true,
                },
            },
        ],
        default: [],
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

export default mongoose.model("clinicians", clinicianSchema);