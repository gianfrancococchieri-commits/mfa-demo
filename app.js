const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { totp } = require('otplib');

const app = express();

// ===== MFA CONFIG =====
const TOTP_SECRET = 'JBSWY3DPEHPK3PXP';
totp.options = { step: 30, digits: 6 };

// ===== MIDDLEWARE =====
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'demo-secret',
    resave: false,
    saveUninitialized: true
  })
);

// ===== ROUTES =====

// Root
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Login page
app.get('/login', (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST" action="/login">
      <input name="username" placeholder="username" /><br/>
      <input name="password" type="password" placeholder="password" /><br/>
      <button type="submit">Login</button>
    </form>
  `);
});

// Login submit
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'demo' && password === 'demo123') {
    req.session.loggedIn = true;
    return res.redirect('/mfa');
  }

  res.send('Invalid credentials');
});

// MFA page
app.get('/mfa', (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect('/login');
  }

  res.send(`
    <h2>MFA</h2>
    <form method="POST" action="/mfa">
      <input name="otp" placeholder="OTP code" /><br/>
      <button type="submit">Verify</button>
    </form>
  `);
});

// MFA submit
app.post('/mfa', (req, res) => {
  const { otp } = req.body;

  if (totp.check(otp, TOTP_SECRET)) {
    req.session.mfa = true;
    return res.redirect('/home');
  }

  res.send('Invalid OTP');
});

// Protected page
app.get('/home', (req, res) => {
  if (!req.session.mfa) {
    return res.redirect('/login');
  }

  res.send('<h2>✅ MFA success</h2>');
});

// ===== START SERVER =====
app.listen(3000, () => {
  console.log('MFA demo app listening on port 3000');
});
