const qrcode = require('qrcode');

const otp = require('otplib');

const { authenticator } = otp;

async function generateTOTP(userName) {
  return new Promise((resolve, reject) => {
    try {
      const service = 'PITS SS20 Seminare';
      const secret = authenticator.generateSecret();
      console.log(secret);
      const otpauth = authenticator.keyuri(userName, service, secret);
      qrcode.toDataURL(otpauth, (err, imageUrl) => {
        if (err) {
          console.log('Error with QR');
          throw err;
        }
        resolve({ imageUrl, secret });
      });
    } catch (err) {
      reject(err);
    }
  });
}

function verifyTOTP(token, secret) {
  console.log(token, secret);
  try {
    const isValid = authenticator.verify({ token, secret });
    return isValid;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = { generateTOTP, verifyTOTP };
