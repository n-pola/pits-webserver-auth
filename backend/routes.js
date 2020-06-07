const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongoose').Types;
const getToken = require('./middlewares/getToken');
const User = require('./models/userModel');
const seminar = require('./models/seminar');
const otp = require('./components/sKey');
const auth = require('./middlewares/auth');

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
      otpCount: otpList.length,
      seminars: []
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

router.get('/seminare', auth, async (req, res) => {
  seminar.find({}, (err, seminars) => {
    if (err) return res.status(500).send('Internal Error');
    res.send(seminars);
  });
});

router.post('/seminare/:id', auth, async (req, res) => {
  const id = new ObjectId(req.params.id);
  console.log(id);
  const seminarEntry = await seminar.findOne({ _id: id });
  if (!seminarEntry) return res.status(404).send('Seminar not found');

  await User.findOne({ userName: req.user.name }, (err, loginUser) => {
    if (loginUser.seminars.includes(req.params.id)) {
      return res.status(400).send('Already attending the Seminar!');
    }
    const currentOtp = String(loginUser.currentOtp);
    const otpValid = otp.verifyOTP(
      currentOtp,
      req.body.token,
      parseInt(loginUser.otpCount, 10)
    );

    if (otpValid) {
      const { seminars } = loginUser;
      seminars.push(req.params.id);
      User.updateOne(
        { userName: req.user.name },
        {
          $set: {
            currentOtp: req.body.token,
            otpCount: loginUser.otpCount - 1,
            seminars
          }
        }
      );
      res.send('Successfull entered Seminar');
    } else {
      res.status(401).send('OTP invalid!');
    }
  });
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
