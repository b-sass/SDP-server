import { Router } from "express";
import db from "../service/db.js";
const router = Router();

router.get("/patients", async (req, res) => {
    res.contentType("json");
    // res.status(200).json(getAllPatients());
    let patients = await getAllPatients();
    res.json(patients);
    res.status(200);
});

router.get("/patients/:NHSNo", async (req, res) => {
    res.contentType("json");
    let patient = await getPatient(req.params.NHSNo);
    res.json(patient);
    res.status(200);
})

let getAllPatients = async () => {
    let patients = await db.collection("patient");
    let results = await patients.find().toArray();
    return results;
};

let getPatient = async (num) => {
    let patients = await db.collection("patient");
    console.log(num);
    let result = await patients.findOne({"NHSNo": num});
    console.log(result);
    return result;
}

let calculateEGFR = () => {
    
}

export default router;