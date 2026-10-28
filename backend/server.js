const express = require("express");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

app.post("/test/hash", async (req, res) => {
    try {
        const { password } = req.body;

        if (typeof password !== "string" || !password) {
            return res.status(400).json({
                message: "Password is required",
            });
        }

        const hash = await bcrypt.hash(password, 12);

        res.json({
            message: "Hash generated successfully",
            hash,
        });
    } catch {
        res.status(500).json({
            message: "Hashing failed",
        });
    }
});

app.listen(3000, () => {
    console.log("Backend running at http://localhost:3000");
});