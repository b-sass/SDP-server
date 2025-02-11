import express from "express";
import patientRouter from "./routes/patient.js"
import clinitianRouter from "./routes/clinitian.js"
const app = express();
const port = process.env.PORT;

app.use("/", patientRouter)
app.use("/clinitians", clinitianRouter)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

