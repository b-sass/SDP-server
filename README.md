<h1 align=center>
   SDP Server
</h1> 
A JavaScript-based server application designed to [describe the purpose of the project briefly].

---

<p align=center>
   Website Repo: https://github.com/JayNightmare/SDP-Website
</p>

---

## Equation
Adult Equation:
eGFR = $186 \cdot (Creat / 88.4)^{-1.154} \cdot (Age)^{-0.203} \cdot (0.742 \text{ if female}) \cdot (1.210 \text{ if black})$

Child Equation:
eGFR = $\frac{\text{Height} \cdot k}{\text{Creat} / 88.4}$

## Features

1. **MongoDB Integration**:
   - The server requires a MongoDB URI (`DB_URI`) and database name (`DB_NAME`), indicating it supports database operations.

2. **Configurable Server Port**:
   - You can configure the server's port using the `PORT` variable.

3. **JWT Authentication**:
   - The presence of `JWT_SECRET` suggests features related to user authentication using JSON Web Tokens.

## Installation

Follow these steps to set up the project locally:

```bash
# Clone the repository
git clone https://github.com/[b-sass or JayNightmare]/SDP-server.git

# Navigate into the project directory
cd SDP-server

# Install dependencies
npm install
```

## Usage

To start the server:

```bash
npm start
```

Or, if you have nodemon installed:

```bash
nodemon index.js
```

## Configuration

Explain how to configure the server, e.g., environment variables:

- `PORT`: The port the server will listen to (default: `3000`).
- `DATABASE_URL`: Your database connection string.

## License

This project is licensed under the [CC0 1.0 License](LICENSE).
