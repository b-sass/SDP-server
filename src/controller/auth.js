import Clinician from "../models/Clinician.js";
import Patient from "../models/Patient.js";
import { createToken } from "../middleware/token.js";
import bcrypt from "bcrypt";

async function Register(req, res) {
    const { type, id, password, fullname, dob, phone } = req.body;
    console.log(`My ID is: ${id}`);
    try {
        if (type === "patient") {
            var newUser = new Patient({
                id,
                password,
                fullname,
                dob,
                phone
            });
            var existingUser = await Patient.findOne({ "id": id })
        }
        else if (type === "clinician") {
            var newUser = new Clinician({
                id,
                password,
                fullname,
                dob,
                phone
            });
            var existingUser = await Clinician.findOne({ "id": id })
        }

        console.log(newUser)
        
        if (existingUser)
            return res.status(400).json({
                status: "failed",
                message: "An account with this ID exists already, try to log in instead."
            });

        const savedUser = await newUser.save();
        console.log(`1: ${savedUser}`);
        const { ...user_data } = savedUser;
        
        console.log(`2: ${savedUser}`);
        res.status(200).json({
            status: "success",
            message: "Registration complete."
        });
    } catch (err) {
        console.log("ERR:"+ err);
        res.status(500).json({
            status: "error",
            error: [err],
            message: "Internal Server Error",
        })
    }
    res.end();
}

async function Login(req, res) {
    const password = req.body.password;
    const type = req.params.type; 
    const id = req.body.id;

    try {
        if (type === "patient") {
            var user = await Patient.findOne({ "id": id });
        }
        if (type === "clinician") {
            var user = await Clinician.findOne({ "id": id });
        }
        if (!user) {
            return res.status(400).json({
                status: "failed",
                userToken: [],
                message: "User does not exist"
            });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({
                status: "failed",
                userToken: [],
                message: "Incorrect password"
            });
        }
        res.status(200).json({
            status: "success",
            userToken: createToken(user.id),
            message: "Login successful"
        });
    } catch (err) {
        console.log("ERR:"+ err);
        res.status(500).json({
            status: "error",
            error: [err],
            message: "Internal Server Error",
        })
    };
    res.end();
}

export { Register, Login };