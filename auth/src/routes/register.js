const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");


router.post("/email",
    (req, res, _) => {
        setTimeout(() => {
            //res.status(400).json({ message: "custom error" });
            const { email } = req.body;
            const token = jwt.sign(
                { email: email },
                process.env.JWT_SECREAT_KEY,
                {
                    expiresIn: "2h",
                },
            )
            res.json({
                message: "success",
                token
            })

        }, 2000);


})

router.post("/token",
    (req, res, _) => {
        setTimeout(() => {
            res.status(400).json({ message: "custom error" });
        }, 2000);
    })
module.exports = router;
