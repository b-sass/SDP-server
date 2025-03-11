import { Router } from "express";
const router = Router();

router.put("/calculate", (req, res) => {
    const calculations = req.body;
    let results = calculateEGFR(calculations);
    res.json(results).status(200);
});

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