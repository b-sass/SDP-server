import * as mfa from "../middleware/mfa.js";
import Clinician from "../models/Clinician.js";
import Patient from "../models/Patient.js";

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
const Setup = async (req, res) => { 
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
        if (user.mfa || user.mfa?.verified) {
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

export { Setup };