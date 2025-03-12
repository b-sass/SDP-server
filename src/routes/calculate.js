import { Router } from "express";
const router = Router();

router.put("/calculate", (req, res) => {
    const calculations = req.body;
    let results = [];

    calculations.forEach(c => {
        if (c.height == null) {
            results.push(
                { eGFR: calculateEGFR(c) }
            );
        } else {
            results.push(
                { eGFR: calculateChildEGFR(c) }
            );
        }
    });
    res.json(results).status(200);
});

let calculateEGFR = (patientStats) => {
    let sex = 1; let race = 1;
    if(patientStats.sex === "female") { sex = 0.742 };
    if(patientStats.race === "black") { race = 1.210 };
    
    console.log("Adult eGFR calculation");
    return 186 * Math.pow((patientStats.creat / 88.4), -1.154) * Math.pow(patientStats.age, -0.203) * sex * race;
}

let calculateChildEGFR = (patientStats) => {
    let k = 0.55;
    if (patientStats.age < 1) k = 0.45;
    if (patientStats.age >= 13 
        && patientStats.sex == "male") k = 0.7;
    
    console.log("Child eGFR calculation");
    return (patientStats.height * k) / (patientStats.creat / 88.4);
}

export default router;