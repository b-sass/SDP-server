import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
    res.send("clinicians");
});

let getAllclinicians = () => {

};

let getClinician = (num) => {

};

let getClinicianPatients = (num) => {
    
}

export default router;