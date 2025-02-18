import Clinician from "../models/Clinician.js";
import Patient from "../models/Patient.js";

export async function Register(req, res) {
    const { type, id, email, password } = req.body;
    console.log(`My ID is: ${id}`);
    try {
        if (type === "patient") {
            var newUser = new Patient({
                id,
                email,
                password,
            });
            var existingUser = await Patient.findOne({ email })
        }
        else if (type === "clinician") {
            var newUser = new Clinician({
                id,
                email,
                password,
            });
            var existingUser = await Clinician.findOne({ email })
        }

        console.log(newUser)
        
        if (existingUser)
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "An account with this email address exists already, try to log in instead."
            });

        const savedUser = await newUser.save();
        console.log(`1: ${savedUser}`);
        const { ...user_data } = savedUser;
        
        console.log(`2: ${savedUser}`);
        res.status(200).json({
            status: "success",
            data: [user_data],
            message: "Registration complete."
        });
    } catch (err) {
        console.log("ERR:"+ err);
        res.status(500).json({
            status: "error",
            data: [err],
            message: "Internal Server Error",
        })
    }
    res.end();
}