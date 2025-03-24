import express from "express";
import patientRouter from "./routes/patient.js";
import clinicianRouter from "./routes/clinician.js";
import authRouter from "./routes/auth.js";
import calculateRouter from "./routes/calculate.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import Router from "express";

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose.promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose
    .connect(process.env.DB_URI)
    .then(console.log("Connected to database."))
    .catch((err) => console.log(err));

// Routes
app.use("/", patientRouter)
app.use("/", clinicianRouter)
app.use("/auth", authRouter)
app.use("/", calculateRouter)

Router(app)

app.listen(port, () => {
  console.log(`SDP Server listening on port ${port}`)
})