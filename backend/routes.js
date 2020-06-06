const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const getToken = require('./middlewares/getToken');
const User = require('./models/userModel');
const otp = require('./components/sKey');

router.post('/register', async (req, res) => {
  try {
    // find existing User
    const user = await User.findOne({ userName: req.body.userName });
    if (user) return res.status(400).send('User already registered.');

    const hash = bcrypt.hash(req.body.password, 14);
    const otpList = await otp.generateOTP(req.body.userName, hash);
    const newUser = new User({
      userName: req.body.userName,
      password: await hash,
      currentOtp: otpList[otpList.length - 1],
      otpCount: otpList.length - 1
    });
    await newUser.save((err) => {
      if (err) {
        return res
          .status(400)
          .send('Upsie Whoopise something went wrong while saving.');
      }
    });

    // User soll mit voletzem Element aus liste anfangen
    otpList.pop();

    const token = newUser.generateAuthToken();
    const response = {
      name: newUser.userName,
      token,
      otpList
    };

    res.send(response);
  } catch (error) {
    res.send({ error });
  }
});

router.post('/login', async (req, res) => {
  await User.findOne({ userName: req.body.userName }, (err, loginUser) => {
    if (
      err ||
      !User ||
      !bcrypt.compareSync(req.body.password, loginUser.password)
    ) {
      res.status(403);
      res.json('You shouldnt be here.');
    } else {
      const token = loginUser.generateAuthToken();
      const response = {
        name: loginUser.userName,
        token
      };

      res.send(response);
    }
  });
});

router.get('/seminare', getToken, async (req, res) => {
  await jwt.verify(
    req.token,
    process.env.JWT_SECRET_KEY,
    { expiresIn: '10s' },
    (err, authData) => {
      if (err || req.token == undefined) {
        console.log(err.message);
        res.sendStatus(401);
      } else {
        res.json(authData);
      }
    }
  );
});

router.post('/seminare/:id', getToken, async (req, res) => {
  await jwt.verify(
    req.token,
    process.env.JWT_SECRET_KEY,
    { expiresIn: '10s' },
    (err, authData) => {
      if (err || req.token == undefined) {
        res.sendStatus(401);
      } else {
        res.json(authData);
      }
    }
  );
});

router.post('/settings/otp', getToken, async (req, res) => {
  await jwt.verify(
    req.token,
    process.env.JWT_SECRET_KEY,
    { expiresIn: '10s' },
    (err, authData) => {
      if (err || req.token == undefined) {
        res.sendStatus(401);
      } else {
        res.json(authData);
      }
    }
  );
});

module.exports = router;
