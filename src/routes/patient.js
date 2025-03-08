import { Router } from "express";
import Patient from "../models/Patient.js";
// import db from "../service/db.js";
const router = Router();

router.get("/patients", async (req, res) => {
    res.contentType("json");
    // res.status(200).json(getAllPatients());
    let patients = await getAllPatients();
    res.json(patients).status(200);
    console.log(patients)
});

router.get("/patients/:id", async (req, res) => {
    res.contentType("json");
    let patient = await getPatient(req.params.id);
    res.json(patient).status(200);
});

router.put("/calculate/", (req, res) => {
    res.contentType("json");
    let results = calculateEGFR(req.body.patients);
    req.body
    res.json(results).status(200);
});

let getAllPatients = async () => {
    // let patients = db.collection("patients");
    let patients = await Patient.find();
    return patients;
};

let getPatient = async (num) => {
    let result = await Patient.findOne({"id": num});
    console.log(result);
    return result;
}

/**
 * 
 * @param {Object[]} patientStats 
 * @param {string} patientStats[].id
 * @param {number} pateintStats[].creat normal values between 50 - 120
 * @param {number} pateintStats[].age
 * @param {string} pateintStats[].sex
 * @param {string} pateintStats[].race
 * 
 * @returns {Object[]}
 * 
 */

let calculateEGFR = (patientStats) => {
    let results = [];
    patientStats.forEach(stats => {
        let sex = 1; let race = 1;
        if(stats.sex === "female") { sex = 0.742 };
        if(stats.race === "black") { race = 1.210 };
        let eGFR = 186 * Math.pow((stats.creat / 88.4), -1.154) * Math.pow(stats.age, -0.203) * sex * race;
        results.push({
            NSHID: stats.id,
            eGFR: eGFR,
        });
    });
    return results;
}

export default router;