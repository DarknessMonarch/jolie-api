const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require('path');
const fs = require('fs');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

const newsletterSubscribe = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "[!] Email is required" });
  }

  const username = email.split('@')[0];
  const emailPath = path.join(__dirname, '../client/newsletter.html');
  const emailTemplate = fs.readFileSync(emailPath, 'utf-8');
  const personalizedTemplate = emailTemplate.replace('{{username}}', username);

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Thank you for subscribing!",
    html: personalizedTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "[+] Subscription email sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "[!] Failed to send email" });
  }
};

module.exports = {
  newsletterSubscribe,
};
