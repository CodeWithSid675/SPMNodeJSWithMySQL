var nodemailer = require('nodemailer');
var stringify = require('json-stringify-safe');

const sendMail = (user, callback) => {
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yourMailId',  // sender mail id
    pass: '******'     // password
  }
});

var mailOptions = {
  from: `<${user.senderAddress}>`,
  to: `<${user.mailAddress}>`,
  subject: `${user.data.subjectKeyword} - ${user.data.author} - ${user.data.date}`,
  text: `${user.data.speechContent}`
};

console.log("Mail option => "+stringify(mailOptions));
transporter.sendMail(mailOptions, callback);

}

module.exports = sendMail;