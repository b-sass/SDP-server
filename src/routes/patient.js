import { Router } from "express";
import Patient from "../models/Patient.js";
import { VerifyToken } from "../middleware/token.js";
const router = Router();

router.get("/patient",
    VerifyToken,
    async (req, res) => {
        let patient = await getPatient(req.id);
        res.json(patient).status(200);
});

let getPatient = async (num) => {
    let patient = await Patient.findOne({"id": num});
    return patient;
}

export default router;