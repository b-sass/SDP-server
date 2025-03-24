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

router.post("/patient/:id/results",
    VerifyToken,
    async (req,res) => {
        const { creat, calcType, result } = req.body;
        try {
            let patient = await getPatient(req.params.id);
            patient.results.push({
                "creatine": creat,
                "calculationType": calcType,
                "eGFR": result
            });
        
            await Patient.updateOne(
                { "id": patient.id },
                { $set: { "results": patient.results } },
            )
            res.json({
                status: "success",
                message: `Results updated for patient ${patient.fullname}.`
            }).status(200);
        } catch (err) {
            res.json({
                status: "error",
                message: "Internal Server Error",
                error: [err]
            }).status(500);
        }
    }
)

let getPatient = async (num) => {
    let patient = await Patient.findOne({"id": num});
    return patient;
}

export default router;