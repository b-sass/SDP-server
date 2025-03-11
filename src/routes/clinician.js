import { Router } from "express";
import Clinician from "../models/Clinician.js";
import { VerifyToken } from "../middleware/token.js";
const router = Router();

router.get("/clinician",
    VerifyToken,
    async (req, res) => {
        let clinician = await getClinician(req.id);
        res.json(clinician).status(200);
});

let getClinician = async (num) => {
    let clinician = await Clinician.findOne({"id": num});
    return clinician;
}

export default router;