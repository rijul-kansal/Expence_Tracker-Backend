const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_FOR_SENDING_MAIL,
    pass: process.env.PASSWORD_FOR_SENDING_MAIL,
  },
});

const SendEmail = async (to, subject, text) => {
  const mailOption = {
    from: '"Rijul kansal" <kansalrijul@gmail.com>',
    to,
    subject,
    html: text,
  };

  await transporter.sendMail(mailOption);
};

module.exports = SendEmail;
