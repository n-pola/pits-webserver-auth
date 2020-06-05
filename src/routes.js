const router = require('express').Router()
const jwt = require('jsonwebtoken')
const verifyToken = require('../src/middlewares/verifyToken')

router.post("/register", (req, res) => {
    const mockUser = {
        name: "george",
        password: "password"
    }
    jwt.sign({ mockUser }, process.env.JWT_SECRET_KEY, (err, token) => {
        res.json(token)
        res.redirect(301, '/seminare')
    })
})

router.post("/login", (req, res) => {

})

router.get("/seminare", verifyToken, (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(401);
        } else {
            res.status(200).json("Post Created..")
        }
    })

})

router.post("/seminar/{id}", (req, res) => {

})

router.post("/settings/otp", (req, res) => {

})



module.exports = router