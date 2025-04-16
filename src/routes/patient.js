import { Router } from "express";
import Patient from "../models/Patient.js";
import { VerifyToken } from "../middleware/token.js";
const router = Router();

// * Get patient details
router.get("/patient",
    VerifyToken,
    async (req, res) => {
        let patient = await getPatient(req.id);
        res.status(200).json(patient);
});

// * Add new answers for a patient
router.post("/patient/:id/answers",
    VerifyToken,
    async (req, res) => {
        try {
            let patient = await getPatient(req.params.id);
            if (!patient) {
                return res.status(404).json({
                    status: "error",
                    message: "Patient not found"
                });
            }

            const existingResultIds = patient.results.map(r => r.resultId || 1);

            // * Validate required fields
            const requiredFields = ["2-Age", "3-Gender", "4-SerumCreatinine", "4-SC-Unit"];
            for (const field of requiredFields) {
                if (!req.body[field]) {
                    return res.status(400).json({
                        status: "error",
                        message: `Missing required field: ${field}`
                    });
                }
            }

            // * Add timestamp automatically
            const answer = {
                resultId: existingResultIds,
                ...req.body,
                timestamp: new Date()
            };

            // * Add to answers array
            if (!patient.answers) {
                patient.answers = [];
            }
            patient.answers.push(answer);

            // * Update patient document
            await Patient.updateOne(
                { "id": patient.id },
                { $set: { "answers": patient.answers } }
            );

            res.status(200).json({
                status: "success",
                message: `Answers added for patient ${patient.fullname}`
            });
        } catch (err) {
            console.log("ERR:"+ err);
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
                error: err.message
            });
        }
    }
);

// * Add new results for a patient
router.post("/patient/:id/results",
    VerifyToken,
    async (req,res) => {
        const { creat, calcType, result } = req.body;
        try {
            let patient = await getPatient(req.id);

            const existingResultIds = patient.results.map(r => r.resultId || 0);
            const maxResultId = existingResultIds.length > 0 ? Math.max(...existingResultIds) : 0;

            patient.results.push({
                "resultId": maxResultId + 1,
                "creatine": creat,
                "calculationType": calcType,
                "eGFR": result
            });
        
            await Patient.updateOne(
                { "id": patient.id },
                { $set: { "results": patient.results } },
            )
            res.status(200).json({
                status: "success",
                message: `Results updated for patient ${patient.fullname}.`
            });
        } catch (err) {
            console.log("ERR:"+ err);
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
                error: [err]
            });
        }
    }
)

let getPatient = async (num) => {
    let patient = await Patient.findOne({"id": num});
    return patient;
}

export default router;
