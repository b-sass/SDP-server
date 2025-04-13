import { Router } from "express";
import Clinician from "../models/Clinician.js";
import { VerifyToken } from "../middleware/token.js";
import Patient from "../models/Patient.js";
const router = Router();

router.get("/clinician",
    VerifyToken,
    async (req, res) => {
        let clinician = await getClinician(req.id);
        res.json(clinician).status(200);
});

router.get("/clinician/:id/patients",
    VerifyToken,
    async (req,res) => {
        let clinician = await getClinician(req.id);
        res.json(clinician.patients).status(200);
    }
)

router.post("/clinician/:id/patients",
    VerifyToken,
    async (req,res) => {
        try {
            const { id } = req.body;
            const clinicianID = req.id;

            let clinician = await Clinician.findOne({"id": clinicianID});
            let patient = await Patient.findOne({"id": id});

            if (clinician.patients.includes(patient.id)) {
                res.status(401).json({
                    status: "error",
                    message: "Patient already assigned to this clinician.",
                })
            }

            clinician.patients.push(patient.id);
            
            await Clinician.updateOne(
                { "id": clinicianID },
                { $set: { "patients": clinician.patients } },
            )
            
            res.json({
                status: "success",
                message: `Patient ${patient.id} added to clinician ${clinician.fullname}.`
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

router.get("/clinician/:id/patients/details",
    VerifyToken,
    async (req, res) => {
        try {
            const clinicianID = req.id;
            let clinician = await Clinician.findOne({ "id": clinicianID });

            if (!clinician) {
                return res.status(404).json({
                    status: "error",
                    message: "Clinician not found.",
                });
            }

            let patients = await getPatients(clinician.patients);

            res.json({
                status: "success",
                patients: patients,
            }).status(200);
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
                error: [err],
            });
        }
    }
);

let getClinician = async (num) => {
    let clinician = await Clinician.findOne({"id": num});
    return clinician;
}

let getPatients = async (patientIDs) => {
    let patients = await Patient.find({ "id": { $in: patientIDs } });
    return patients;
};

// let getPatients = async (patientIDs) => {
//     let patients = [];
//     patientIDs.forEach(id => {
//         let patient = await Patient.findOne({"id": id});
//         patients.push(patient);
//     });
//     return patients;
// }


export default router;