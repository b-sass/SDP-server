import bcrypt from "bcrypt";
import * as mfa from "../middleware/mfa.js";
import Clinician from "../models/Clinician.js";
import Patient from "../models/Patient.js";
import { createToken } from "../middleware/token.js";

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
const Setup2FA = async (req, res) => { 
    // get user
    try {
        console.log(`type: ${req.type}`);
        switch (req.type) {
            case "patient":
                var user = await Patient.findOne({ id: req.id });
                break;
        
            case "clinician":
                var user = await Clinician.findOne({ id: req.id });
                break;

            default:
                console.log("Invalid user type");
                return res.status(422).json({ message: "Invalid user type" });
        }

        // check if user has mfa enabled
        console.log(`user: ${user}`);
        if (user.mfa?.verified) {
            console.log("User already has MFA enabled");
            return res.status(422).json({ message: "MFA already enabled" });
        }
        // generate secret
        let secret = mfa.generateKey();
        // convert to base32
        let base32 = mfa.hexToBase32(secret);
        // update user object in database with secret
        user.mfa = {
            secret: base32,
            verified: false
        };

        try {
            await user.save();
            return res.status(201).json({ message: "MFA secret saved", secret: base32 });
        } catch(err) {
            console.log(err);
            return res.status(422).json({ message: "Error saving MFA secret" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
const Verify2FA = async (req, res) => {
    const type = req.params.type;
    const id = req.body.id;
    const password = req.body.password;
    const code = req.body.code;

    try {
        // get user
        switch (type) {
            case "patient":
                var user = await Patient.findOne({ id: id });
                break;
        
            case "clinician":
                var user = await Clinician.findOne({ id: id });
                break;
            
            default:
                res.status(422).json({ message: "Invalid user type" });
                break;
        }
        // error if user does not exist
        if (!user) {
            return res.status(400).json({
                status: "failed",
                userToken: [],
                message: "User does not exist"
            });
        }

        // math passwords
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({
                status: "failed",
                userToken: [],
                message: "Incorrect password"
            });
        }

        if (!user.mfa) {
            return res.status(422).json({ message: "MFA not enabled" });
        }

        // Validate 2FA code
        console.log(`"Verify" secret: ${user.mfa.secret}`);
        console.log(`"Verify" userToken: ${code}`);
        const valid = mfa.confirm(code, user.mfa.secret);
        if (!valid) {
            return res.status(422).json({ message: "Invalid 2FA code" });
        }

        // update user object in database with verified if not already verified
        if (!user.mfa.verified) {
            user.mfa.verified = true;
            try {
                await user.save();
                // return res.status(201).json({ message: "MFA verified" });
            } catch(err) {
                console.log(err);
                return res.status(422).json({ message: "Error saving MFA secret" });
            }
        }

        // Return user token
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
    }
}

export { Setup2FA, Verify2FA };