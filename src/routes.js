const router = require('express').Router()
const jwt = require('jsonwebtoken')
const getToken = require('./middlewares/getToken')
const User = require('./Usermodel/userModel')
const bcrypt = require('bcrypt')


router.post("/register", async (req, res) => {
    try {
        let hash = bcrypt.hash(req.body.password, 14)
        const toRegister = new User({
            userName: req.body.userName,
            password: await hash
        })

        jwt.sign({ toRegister }, process.env.JWT_SECRET_KEY, async (err, token) => {
            await toRegister.save((err) => {
                if (err) {
                    let err = "Upsie Whoopise something went wrong while saving."
                    res.Status(500)
                    res.json(err)
                } else {
                    res.json(toRegister)
                }

            })
        })
    } catch (error) {
        res.send({ error })
    }
})

router.post("/login", async (req, res) => {

    let loginUser = {
        userName: req.body.username,
        password: req.body.password
    }

    await User.findOne({ userName: req.body.userName }, (err, User) => {


        if (err || !User || !bcrypt.compareSync(req.body.password, User.password)) {
            res.status(403)
            res.json("You shouldnt be here.")

        } else {
            jwt.sign({ loginUser }, process.env.JWT_SECRET_KEY, { expiresIn: '180s' }, async (err, token) => {
                res.status(200)
                res.json(`Welcome  ${User.userName} with the key ${token}`)
            })
        }
    })
})


router.get("/seminare", getToken, async (req, res) => {
    await jwt.verify(req.token, process.env.JWT_SECRET_KEY, { expiresIn: '10s' }, (err, authData) => {
        if (err || req.token == undefined) {
            res.sendStatus(401);
        } else {
            res.json(authData)
        }
    })

})

router.post('/seminare/:id', getToken, async (req, res) => {
    await jwt.verify(req.token, process.env.JWT_SECRET_KEY, { expiresIn: '10s' }, (err, authData) => {
        if (err || req.token == undefined) {
            res.sendStatus(401);
        } else {
            res.json(authData)
        }
    })
})

router.post("/settings/otp", getToken, async (req, res) => {
    await jwt.verify(req.token, process.env.JWT_SECRET_KEY, { expiresIn: '10s' }, (err, authData) => {
        if (err || req.token == undefined) {
            res.sendStatus(401);
        } else {
            res.json(authData)
        }
    })
})



module.exports = router