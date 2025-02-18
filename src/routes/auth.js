import express from "express";
import { Register } from "../controller/auth.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";

const router = express.Router();

router.post(
    "/register",
    check("type")
        .notEmpty()
        .withMessage("Account type required")
        .trim()
        .escape(),
    check("id")
        .notEmpty()
        // .isLength({ min: 8 })
        .withMessage("ID required")
        .escape(),
    check("email")
        .isEmail()
        .withMessage("Email is required")
        .normalizeEmail()
        .escape(),
    check("password")
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage("Must be at least 8 characters long.")
        .escape(),
    Validate,
    Register
);

export default router;