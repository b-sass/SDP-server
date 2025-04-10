import express from "express";
import { VerifyToken } from "../middleware/token.js";
import { Setup2FA, Verify2FA } from "../controller/mfa.js";
import { Register, Login } from "../controller/auth.js";
import Validate from "../middleware/validate.js";
import { check, body } from "express-validator";

const router = express.Router();

router.post(
    "/register",
    check("fullname")
        .notEmpty()
        .withMessage("Full name is required")
        .trim()
        .escape(),
    check("password")
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long.")
        .escape(),
    check("dob")
        .notEmpty()
        .withMessage("Date of birth is required")
        .isISO8601()
        .withMessage("Date of birth must be in YYYY-MM-DD format")
        .toDate(),
    check("phone")
        .notEmpty()
        .withMessage("Phone number is required")
        .isMobilePhone()
        .withMessage("Invalid phone number"),
    check("type")
        .notEmpty()
        .withMessage("Account type is required")
        .trim()
        .escape(),
    body("id")
        .if(body("type").equals("clinician"))
        .notEmpty()
        .withMessage("Clinician ID is required")
        .trim()
        .escape(),
    Validate,
    Register
);

router.post(
    "/login/:type",
    Login
);

router.get(
    "/mfa",
    VerifyToken,
    Setup2FA
)

router.post(
    "/mfa",
    Verify2FA
)


export default router;