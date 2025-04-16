import { Router } from "express";
import Clinician from "../models/Clinician.js";
import { VerifyToken } from "../middleware/token.js";
import Patient from "../models/Patient.js";
const router = Router();

// * Get clinician details
router.get("/clinician",
    VerifyToken,
    async (req, res) => {
        let clinician = await getClinician(req.id);
        res.status(200).json(clinician);
});

// //

// * Get all patients assigned to a clinician without details
router.get("/clinician/:id/patients",
    VerifyToken,
    async (req, res) => {
        let clinician = await getClinician(req.id);
        res.status(200).json(clinician.patients);
    }
)

// * Assign a patient to a clinician
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
            
            res.status(200).json({
                status: "success",
                message: `Patient ${patient.id} added to clinician ${clinician.fullname}.`
            });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
                error: [err]
            });
        }
    }
)

// * Remove a patient from a clinician
router.delete("/clinician/:id/patients",
    VerifyToken,
    async (req, res) => {
        try {
            const clinicianID = req.id;
            const { patientID } = req.body;

            let clinician = await Clinician.findOne({ "id": clinicianID });
            let patient = await Patient.findOne({ "id": patientID });

            if (!clinician || !patient) {
                return res.status(404).json({
                    status: "error",
                    message: "Clinician or patient not found."
                });
            }

            if (!clinician.patients.includes(patientID)) {
                return res.status(400).json({
                    status: "error",
                    message: "Patient is not assigned to this clinician."
                });
            }

            // Remove patient from clinician's list
            clinician.patients = clinician.patients.filter(id => id !== patientID);

            await Clinician.updateOne(
                { "id": clinicianID },
                { $set: { "patients": clinician.patients } }
            );

            res.status(200).json({
                status: "success",
                message: `Patient ${patientID} removed from clinician ${clinician.fullname}.`
            });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
                error: [err]
            });
        }
    }
);

// //

// * Get all patients assigned to a clinician with details
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

            res.status(200).json({
                status: "success",
                patients: patients,
            });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
                error: [err],
            });
        }
    }
);

// //

// * Get all appointments for a clinician
router.get('/clinician/:id/appointments',
    VerifyToken,
    async (req, res) => {
        const clinicianID = req.params.id;
        const clinician = await Clinician.findById(clinicianID);

        if (!clinician) {
            return res.status(404).json({
                status: "error",
                message: "Clinician not found."
            });
        }

        try {
            const appointments = clinician.appointments || [];
            res.status(200).json({
                status: "success",
                appointments: appointments
            });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
                error: [err]
            });
        }
    }
)

// * Add an appointment for a clinician and patient
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
            const maxAppointmentID = existingAppointmentIDs.length > 0 ? Math.max(...existingAppointmentIDs) : 0;

            const appointment = {
                appointmentID: maxAppointmentID + 1,
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
                appointmentID: maxAppointmentID + 1,
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

// * Remove an appointment for a clinician and patient
router.delete('/clinician/:id/appointments',
    VerifyToken,
    async (req, res) => {
        try {
            const clinicianID = req.id;
            const { appointmentID, patientID } = req.body;

            let clinician = await Clinician.findOne({ "id": clinicianID });
            let patient = await Patient.findOne({ "id": patientID });

            if (!clinician || !patient) {
                return res.status(404).json({
                    status: "error",
                    message: "Clinician or patient not found."
                });
            }

            // Check if the appointment exists for the clinician
            const clinicianAppointmentIndex = clinician.appointments.findIndex(
                (appointment) => appointment.appointmentID === appointmentID && appointment.patientID === patientID
            );

            if (clinicianAppointmentIndex === -1) {
                return res.status(400).json({
                    status: "error",
                    message: "Appointment not found for the clinician."
                });
            }

            // Check if the appointment exists for the patient
            const patientAppointmentIndex = patient.appointments.findIndex(
                (appointment) => appointment.appointmentID === appointmentID
            );

            if (patientAppointmentIndex === -1) {
                return res.status(400).json({
                    status: "error",
                    message: "Appointment not found for the patient."
                });
            }

            // Remove the appointment from the clinician's list
            clinician.appointments.splice(clinicianAppointmentIndex, 1);

            // Remove the appointment from the patient's list
            patient.appointments.splice(patientAppointmentIndex, 1);

            await Clinician.updateOne(
                { "id": clinicianID },
                { $set: { "appointments": clinician.appointments } }
            );

            await Patient.updateOne(
                { "id": patientID },
                { $set: { "appointments": patient.appointments } }
            );

            res.status(200).json({
                status: "success",
                message: `Appointment ${appointmentID} successfully removed.`
            });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
                error: [err]
            });
        }
    }
);

// //

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