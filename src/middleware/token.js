import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

const createToken = (userID) => {
    // Check user type
    let type = "";
    if (userID.length === 10) {
        type = "patient";
    } else { type = "clinician"; }

    // Create token
    const token = jwt.sign({ id: userID, type }, secret, {
        expiresIn: "1h",
    });
    return token;
};

const VerifyToken = (req, res, next) => {
    let tokenHeader = req.headers.authorization;
    let token = tokenHeader && tokenHeader.split(" ")[1];
    if (token === null) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    console.log(token);

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            return res.status(422).json({ err })
        }
        req.id = user.id;
        next();
    });
};

export { createToken, VerifyToken };