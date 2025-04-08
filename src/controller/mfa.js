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
    // Extract token and credentials from the request
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(" ")[1];
    const { id, password, code } = req.body;

    try {
        let user;

        if (token) {
            // Verify the JWT token
            jwt.verify(token, secret, async (err, decoded) => {
                if (err) {
                    return res.status(401).json({ message: "Invalid or expired token" });
                }
                // Fetch user based on decoded token
                user = decoded.type === "patient"
                    ? await Patient.findOne({ id: decoded.id })
                    : await Clinician.findOne({ id: decoded.id });

                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }

                // Proceed to validate MFA
                validateMFA(user, code, res);
            });
        } else {
            // Ensure both `id` and `password` are provided
            if (!id || !password) {
                return res.status(400).json({ message: "User credentials are required" });
            }

            // Fetch user based on credentials
            user = id.length === 10
                ? await Patient.findOne({ id })
                : await Clinician.findOne({ id });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Verify the password
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // Proceed to validate MFA
            validateMFA(user, code, res);
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

/**
 * Validates the MFA code and updates the user's MFA status if valid.
 * @param {Object} user - The user object.
 * @param {string} code - The MFA code to validate.
 * @param {Response} res - The response object.
 */
const validateMFA = async (user, code, res) => {
    if (!user.mfa) {
        return res.status(422).json({ message: "MFA not enabled" });
    }

    console.log(`"Verify" secret: ${user.mfa.secret}`);
    console.log(`"Verify" userToken: ${code}`);

    // Validate the MFA code
    const valid = mfa.confirm(code, user.mfa.secret);
    if (!valid) {
        return res.status(422).json({ message: "Invalid 2FA code" });
    }

    // Update MFA verification status if not already verified
    if (!user.mfa.verified) {
        user.mfa.verified = true;
        try {
            await user.save();
        } catch (err) {
            console.error(err);
            return res.status(422).json({ message: "Error saving MFA status" });
        }
    }

    // Return success response
    res.status(200).json({
        status: "success",
        userToken: token || createToken(user.id),
        message: "MFA verified and login successful",
    });
};

export { Setup2FA, Verify2FA };