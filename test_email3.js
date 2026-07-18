import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds
});

async function test() {
  console.log("Attempting to send email with connectionTimeout 10s...");
  try {
    const info = await transporter.sendMail({
      from: `"Health App" <${process.env.SMTP_EMAIL}>`,
      to: "likithkrishnaj07@gmail.com",
      subject: "Verification Code",
      text: "Your verification code is 123456. Please use this code to verify your account.",
    });
    console.log("Email sent successfully: ", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

test();
 