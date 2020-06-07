const otp = require('otplib');

const { hotp } = otp;

function verifyOTP(savedOTP, newOTP, counter) {
  const isValid = hotp.check(savedOTP, newOTP, counter);
  if (isValid) return true;
  return false;
}

async function generateOTP(userName, hashedPW) {
  const pwList = [];
  const current_date = new Date();
  const secret = `${
    userName + hashedPW + current_date.getMilliseconds() + Math.random() * 10
  }sgsadrgsgsa987dr6gy87fg`;
  pwList[0] = hotp.generate(secret, 0);
  console.log(secret);
  for (let i = 0; i < 49; i++) {
    const newEntry = await hotp.generate(pwList[i], i + 1);
    pwList.push(newEntry);
  }
  console.log(pwList);
  return pwList;
}

module.exports = { generateOTP, verifyOTP };
