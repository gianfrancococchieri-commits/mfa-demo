const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { totp } = require('otplib');

const app = express();

// === MFA CONFIG ===
const TOTP_SECRET = 'JBSWY3DPEHPK3PXP';
totp.options = { step: 30, digits: 6 };

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'demo-secret',
    resave: false,
    saveUninitialized: true
  })
);

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST">
      <input name="username" /><br/>
      <input name="password" type="password" /><br/>
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'demo' && password === 'demo123') {
    req.session.loggedIn = true;
    return res.redirect('/mfa');
  }

  res.send('Invalid credentials');
});

app.get('/mfa', (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/login');

  res.send(`
    <h2>MFA</h2>
    <form method="POST">
      <input id="otp" name="otp" /><br/>
      <button type="submit">Verify</button>
    </form>
  `);
});

app.post('/mfa', (req, res) => {
  const { otp } = req.body;

  if (totp.check(otp, TOTP_SECRET)) {
    req.session.mfa = true;
    return res.redirect('/home');
  }

  res.send('Invalid OTP');
});

app.get('/home', (req, res) => {
  if (!req.session.mfa) return res.redirect('/login');
  res.send('<h2>✅ MFA success</h2>');
});

app.listen(3000, () => {
  console.log('MFA demo app listening on port 3000');
});
