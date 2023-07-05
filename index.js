const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const receiver_email = process.env.receiver_email;
const sender_email = process.env.sender_email;
const sender_pass = process.env.sender_pass;

const app = express();

// Store OTPs and corresponding form data
const otpData = {};

// Parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


// Set up a route to handle the form submission
app.post('/send3', async (req, res) => {
  // Extract form data and OTP from the request body
  const { name, regNo, date, location,email, mobileNo, otp } = req.body;
  console.log(email);

  // Check if the received OTP matches the stored OTP for the given email
 

  // Create a transporter for sending emails
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: sender_email,
      pass: sender_pass,
    },
  });

  // Configure the email details
  const mailOptions = {
    from: sender_email,
    to: sender_email,
    subject: 'New Form Submission',
    text: `
    Name:${name}
    Registration No:${regNo}
    Email:${email}
    Location:${location}
    Date:${date}
    `,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
   res.status(200).send('Email sent successfully');



    // Remove the OTP data after successful submission
    delete otpData[regNo];
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while sending the email');
  }
});

// Generate and store OTP for a given email
app.post('/generate-otp', async(req, res) => {
  const { regNo } = req.body;

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Store the OTP for the given email
  otpData[regNo] = {
    otp,
    timestamp: Date.now(),
  };

  const { name,date, location, email} = req.body;
  console.log(regNo);

  // Check if the received OTP matches the stored OTP for the given registration number
  

  // Create a transporter for sending emails
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: sender_email,
      pass: sender_pass,
    },
  });

  // Configure the email details
  const mailOptions = {
    from: sender_email,
    to: email, // Send the email to the person filling the form
    subject: 'OTP for Form Submission',
    text: `Your OTP is: ${otp}`,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    res.status(200).json({ otp: otp });

    // Remove the OTP data after successful submission
    delete otpData[regNo];
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while sending the email');
  }
});

// Start the server
app.listen(3001, () => {
  console.log('Server listening on port 3000');
});
