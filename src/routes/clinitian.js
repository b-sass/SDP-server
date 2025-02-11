import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
    res.send("clinitians");
});

let getAllClinitians = () => {

};

let getClinitian = (num) => {

};

let getClinitianPatients = (num) => {
    
}

export default router;