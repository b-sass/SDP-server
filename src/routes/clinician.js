import { Router } from "express";
import Clinician from "../models/Clinician.js";
import { VerifyToken } from "../middleware/token.js";
import Patient from "../models/Patient.js";
import mongoose from "mongoose";
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

router.post("/clinician/:id/appointments",
    VerifyToken,
    async (req, res) => {
        try {
            const clinicianID = req.id;
            const { patientID, appointmentDetails } = req.body;

            let clinician = await Clinician.findOne({ "id": clinicianID });
            let patient = await Patient.findOne({ "id": patientID });

            if (!clinician || !patient) {
                return res.status(404).json({
                    status: "error",
                    message: "Clinician or patient not found."
                });
            }

            // Generate a unique appointment ID
            const existingAppointmentIDs = patient.appointments?.map(r => r.appointmentID || 0) || [];
            const maxAppointmentID = existingAppointmentIDs.length > 0 ? Math.max(...existingAppointmentIDs) : 1;

            const appointment = {
                appointmentID: maxAppointmentID,
                date: appointmentDetails.date,
                time: appointmentDetails.time,
                notes: appointmentDetails.notes
            };

            // Add appointment to clinician
            if (!clinician.appointments) clinician.appointments = [];
            clinician.appointments.push({ patientID, ...appointment });

            // Add appointment to patient
            if (!patient.appointments) patient.appointments = [];
            patient.appointments.push({
                appointmentID: maxAppointmentID,
                date: appointmentDetails.date,
                time: appointmentDetails.time,
                clinician: clinician.fullname,
                notes: appointmentDetails.notes
            });

            await Clinician.updateOne(
                { "id": clinicianID },
                { $set: { "appointments": clinician.appointments } }
            );

            await Patient.updateOne(
                { "id": patientID },
                { $set: { "appointments": patient.appointments } }
            );

            return res.status(200).json({
                status: "success",
                message: "Appointment successfully added."
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
                error: [err]
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