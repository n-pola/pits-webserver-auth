const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongoose').Types;
const User = require('./models/userModel');
const seminar = require('./models/seminar');
const otp = require('./components/sKey');
const auth = require('./middlewares/auth');
const { verifyTOTP } = require('./components/totp');

router.post('/register', async (req, res) => {
  try {
    // find existing User
    const user = await User.findOne({ userName: req.body.userName });
    if (user) return res.status(400).send({ message: 'User already registered.' });

    const hash = await bcrypt.hash(req.body.password, 14);
    const newUser = new User({
      userName: req.body.userName,
      password: hash,
      mail: req.body.eMail,
      seminars: [],
      isAdmin: false,
    });
    await newUser.save((err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .send({ message: 'Internal Server Error' });
      }

      const token = newUser.generateAuthToken(false);
      const response = {
        name: newUser.userName,
        token,
      };

      res.send(response);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Error');
  }
});

router.post('/register/2fa', auth, async (req, res) => {
  let otpList;
  await User.findOne({ userName: req.user.name }, async (err, loginUser) => {
    otpList = await otp.generateOTP(req.body.userName, loginUser.password);
    User.updateOne(
      { userName: req.user.name },
      {
        $set: {
          currentOtp: otpList[otpList.length - 1],
          otpCount: otpList.length - 1,
          secret: req.body.secret,
        },
      }, (err, updateUser) => {
        if (err) {
          console.log(err);
          res.status(500).send({ message: 'Internal Error' });
        } else {
          const token = loginUser.generateAuthToken(true);
          otpList.pop();
          const response = {
            name: updateUser.userName,
            token,
            otpList,
            seminars: loginUser.seminars,
          };

          res.send(response);
        }
      },
    );
  });
});

router.post('/login', async (req, res) => {
  await User.findOne({ userName: req.body.userName }, (err, loginUser) => {
    if (err) {
      return res.status(500).send('Internal Error');
    }
    if (!loginUser) {
      return res.status(403).send({ message: 'Wrong Username or Password' });
    }
    if (bcrypt.compareSync(req.body.password, loginUser.password)) {
      const token = loginUser.generateAuthToken(false);
      const response = {
        name: loginUser.userName,
        token,
      };

      res.send(response);
    } else {
      res.status(403).send({ message: 'Wrong Username or Password' });
    }
  });
});

router.post('/login/2fa', auth, async (req, res) => {
  await User.findOne({ userName: req.user.name }, (err, loginUser) => {
    const isValid = verifyTOTP(req.body.token, loginUser.secret);
    if (isValid) {
      const token = loginUser.generateAuthToken(true);
      const response = {
        name: loginUser.userName,
        token,
        seminars: loginUser.seminars,
      };

      res.send(response);
    } else {
      res.status(403);
      res.json({ message: 'Wrong 2FA' });
    }
  });
});

router.get('/seminare', auth, async (req, res) => {
  seminar.find({}, (err, seminars) => {
    if (err) return res.status(500).send('Internal Error');
    res.send(seminars);
  });
});

router.post('/seminare', auth, async (req, res) => {
  if (req.user.isAdmin === true) {
    try {
      const findSeminar = await seminar.findOne(
        { title: req.body.title },
        (err) => {
          if (err) { console.log(err); }
        },
      );
      if (findSeminar) {
        res.send('Error! Seminar already exsists.');
      } else {
        const newSeminar = new seminar({
          title: req.body.title,
          date: req.body.date,
          description: req.body.description,
        });
        await newSeminar.save((err) => { if (err) return console.log(err); });
        res.status(201).send(newSeminar);
      }
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal Error');
    }
  } else {
    res.status(401).send('Youre not allowed to be here!');
  }
});

router.post('/seminare/:id', auth, async (req, res) => {
  if (!req.body.token) return res.status(403).send({ message: 'No tan provided!' });
  const id = new ObjectId(req.params.id);
  console.log(id);
  const seminarEntry = await seminar.findOne({ _id: id });
  if (!seminarEntry) return res.status(404).send({ message: 'Seminar not found' });

  await User.findOne({ userName: req.user.name }, (err, loginUser) => {
    if (loginUser.seminars.includes(req.params.id)) {
      return res.status(400).send({ message: 'Already attending the Seminar!' });
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
        }, (err) => {
          if (err) {
            console.log(err);
            res.status(500).send({ message: 'Internal Error' });
          }
        },
      );
      res.send({ message: 'Successfully entered Seminar', id: req.params.id });
    } else {
      res.status(403).send({ message: 'OTP invalid!' });
    }
  });
});

router.post('/settings/otp', auth, async (req, res) => {
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
    },
  );
});

module.exports = router;
