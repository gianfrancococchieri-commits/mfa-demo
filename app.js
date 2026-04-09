const express = require('express');
const bodyParser = = totp.check(otp, TOTP_SECRET);const bodyParser = require('body-parser');

  if (valid) {
    req.session.mfa = true;
    return res.redirect('/home');
  }

  res.send('Invalid OTP');
});

// === PROTECTED PAGE ===
app.get('/home', (req, res) => {
  if (!req.session.mfa) {
    return res.redirect('/login');
  }

  res.send('<h2>✅ Welcome – MFA success</h2>');
});

app.listen(3000, () => {
  console.log('MFA demo app listening on port 3000');
});
const session = require('express-session');
const { totp } = require('otplib');

const app = express();

// === CONFIG MFA ===
// Base32 secret (statico per demo)
const TOTP_SECRET = 'JBSWY3DPEHPK3PXP'; // demo secret
totp.options = { step: 30, digits: 6 };

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'demo-secret',
    resave: false,
    saveUninitialized: true
  })
);

// === LOGIN PAGE ===
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST">
      <input name="username" placeholder="username"/><br/>
      <input name="password" placeholder="password" type="password"/><br/>
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'demo' && password === 'demo123') {
    req.session.authenticated = true;
    return res.redirect('/mfa');
  }

  res.send('Invalid credentials');
});

// === MFA PAGE ===
app.get('/mfa', (req, res) => {
  if (!req.session.authenticated) {
    return res.redirect('/login');
  }

  res.send(`
    <h2>MFA</h2>
    <form method="POST">
      <input id="otp" name="otp" placeholder="OTP"/><br/>
      <button type="submit">Verify</button>
    </form>
  `);
});

app.post('/mfa', (req, res) => {
  const { otp } = req.body;

