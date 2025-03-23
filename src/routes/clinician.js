import { Router } from "express";
import Clinician from "../models/Clinician.js";
import { VerifyToken } from "../middleware/token.js";
import Patient from "../models/Patient.js";
const router = Router();

router.get("/clinician/:id",
    VerifyToken,
    async (req, res) => {
        let clinician = await getClinician(req.id);
        res.json(clinician).status(200);
});

// router.get("/clinician/:id/patients",
//     VerifyToken,
//     async (req,res) => {
//         let clinician = await getClinician(req.id);
//         let patients = [];
//         clinician.patients.forEach(patient => {
//             patients.push(await Patient.findOne({"id": patient}))
//         });
//         res.json(patients).status(200);
//     }
// )

let getClinician = async (num) => {
    let clinician = await Clinician.findOne({"id": num});
    return clinician;
}

// let getPatients = async (patientIDs) => {
//     let patients = [];
//     patientIDs.forEach(id => {
//         let patient = await Patient.findOne({"id": id});
//         patients.push(patient);
//     });
//     return patients;
// }

export default router;