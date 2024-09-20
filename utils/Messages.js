const welcomeMessage = (name) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Expense Tracer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #4CAF50;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
        }
        .cta {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            color: #fff;
            background-color: #4CAF50;
            text-decoration: none;
            border-radius: 5px;
        }
        .cta:hover {
            background-color: #45a049;
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Expense Tracer!</h1>
        <p>Dear ${name},</p>
        <p>Thank you for registering with Expense Tracer. We are thrilled to have you on board!</p>
        <p>Expense Tracer is your ultimate companion for managing your finances effortlessly. Track your expenses, set budgets, and gain insights into your spending habits—all in one place.</p>
        <p>Get started by logging into your account and exploring the features we have designed to help you take control of your finances.</p>
        <p class="footer">If you have any questions, feel free to reach out to our support team at kansalrijul@gmail.com.</p>
        <p class="footer">Happy Tracking!<br>The Expense Tracer Team</p>
    </div>
</body>
</html>
`;
const OTPMessage = (name, otp) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP for Expense Tracer</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            border: 2px solid #4CAF50;
        }
        .header-image {
            width: 100%;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            height: auto;
        }
        h1 {
            color: #4CAF50;
            text-align: center;
            margin-top: 20px;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .otp {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 25px;
            color: #fff;
            background-color: #4CAF50;
            text-decoration: none;
            border-radius: 5px;
            font-size: 20px;
            text-align: center;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #888;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://via.placeholder.com/600x200.png?text=Expense+Tracer" alt="Expense Tracer" class="header-image">
        <h1>Your OTP Code</h1>
        <p>Dear ${name},</p>
        <p>Thank you for signing up with Expense Tracer! To complete your registration, please use the following One-Time Password (OTP):</p>
        <div class="otp">${otp}</div>
        <p>This OTP is valid for the next 5 minutes. Please do not share this code with anyone.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p class="footer">If you have any questions, feel free to reach out to our support team at kansalrijul@gmail.com</p>
        <p class="footer">Thank you,<br>The Expense Tracer Team</p>
    </div>
</body>
</html>
`;
const OTPMessageForForgottenPassword = (name, otp) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Expense Tracer</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            border: 2px solid #4CAF50;
        }
        .header-image {
            width: 100%;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            height: auto;
        }
        h1 {
            color: #4CAF50;
            text-align: center;
            margin-top: 20px;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .otp {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 25px;
            color: #fff;
            background-color: #4CAF50;
            text-decoration: none;
            border-radius: 5px;
            font-size: 20px;
            text-align: center;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #888;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://via.placeholder.com/600x200.png?text=Expense+Tracer" alt="Expense Tracer" class="header-image">
        <h1>Reset Your Password</h1>
        <p>Dear ${name},</p>
        <p>We received a request to reset your password for your Expense Tracer account. Please use the following One-Time Password (OTP) to reset your password:</p>
        <div class="otp">${otp}</div>
        <p>This OTP is valid for the next 5 minutes. Please do not share this code with anyone.</p>
        <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
        <p class="footer">If you have any questions, feel free to reach out to our support team at support@expencetracer.com.</p>
        <p class="footer">Thank you,<br>The Expense Tracer Team</p>
    </div>
</body>
</html>
`;

module.exports = {
  welcomeMessage,
  OTPMessage,
  OTPMessageForForgottenPassword,
};
