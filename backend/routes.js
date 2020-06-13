/* eslint-disable consistent-return */
/* eslint-disable no-console */
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongoose').Types;
const { authenticator } = require('otplib');
const User = require('./models/userModel');
const seminar = require('./models/seminar');
const otp = require('./components/sKey');
const auth = require('./middlewares/auth');

router.post('/register', async (req, res) => {
  try {
    // find existing User
    const user = await User.findOne({ userName: req.body.userName });
    if (user) return res.status(400).send('User already registered.');
    const secretKey = authenticator.generateSecret();
    const hash = bcrypt.hash(req.body.password, 14);
    const otpList = await otp.generateOTP(req.body.userName, hash);
    const newUser = new User({
      userName: req.body.userName,
      password: await hash,
      currentOtp: otpList[otpList.length - 1],
      otpCount: otpList.length,
      seminars: [],
      isAdmin: false,
      secret: secretKey,
    });
    await newUser.save((err) => {
      if (err) {
        console.log(err);
      }
    });

    // User soll mit voletzem Element aus liste anfangen
    otpList.pop();

    const token = newUser.generateAuthToken();
    const faToken = authenticator.generate(secretKey);
    const response = {
      name: newUser.userName,
      otpList,
      token,
      secretKey,
      faToken,
    };

    res.send(response);
  } catch (error) {
    res.send({ error });
  }
});

router.post('/login', async (req, res) => {
  await User.findOne({ userName: req.body.userName }, (err, loginUser) => {
    if (
      err
      || !User
      || !bcrypt.compareSync(req.body.password, loginUser.password)
    ) {
      res.status(403);
      res.json('You are not allowed to visit this page.');
    } else {
      const token = loginUser.generateAuthToken();
      const response = {
        name: loginUser.userName,
        token,
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
  const seminarEntry = await User.findOne({ _id: id });
  if (seminarEntry) return res.status(404).send('Seminar not found');

  await User.findOne({ userName: req.user.name }, (err, loginUser) => {
    if (loginUser.seminars.includes(req.params.id)) {
      return res.status(400).send('Already attending the Seminar!');
    }
    const currentOtp = String(loginUser.currentOtp);
    const otpValid = otp.verifyOTP(
      currentOtp,
      req.body.token,
      parseInt(loginUser.otpCount, 10),
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
            seminars,
          },
        },
      );
      res.send('Successfull entered Seminar');
    } else {
      res.status(401).send('OTP invalid!');
    }
  });
});

router.post('/settings/otp', auth, async (req, res) => {
  // working on it.
});


router.post('/seminare-add', auth, async (req, res) => {
  if (req.user.isAdmin === true) {
    try {
      console.log(req.user);
      const findSeminar = await User.findOne({ title: req.body.title }, (err) => { console.log(err); });
      if (findSeminar) {
        res.send('Error! Seminar already exsists.');
      } else {
        // eslint-disable-next-line new-cap
        const newSeminar = new seminar({
          title: req.body.title,
          date: req.body.date,
          description: req.body.description,
        });
        await newSeminar.save((err) => { if (err) console.log(err); });
        res.send(newSeminar);
      }
    } catch (error) {
      res.send('Internal Server Error');
    }
  } else {
    res.status(401).send('Youre not allowed to be here!');
  }
});

router.post('/login/2fa', (req, res) => {
  const otpToken = req.body.token;
  try {
    const isValid = authenticator.check(otpToken, req.body.secret);
    if (isValid) {
      res.status(200).send('Authorized');
    } else {
      res.status(401).send('Unauthorized!');
    }
  } catch (error) {
    console.error(error);
  }
});
module.exports = router;
