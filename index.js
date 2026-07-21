const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DB_PATH = path.join(__dirname, 'data', 'db.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.get('/', (req, res) => {
  const db = readDB();
  res.render('index', { data: db });
});

app.get('/highlights', (req, res) => {
  const db = readDB();
  res.render('highlights', { data: db });
});

app.get('/admin', (req, res) => {
  res.render('admin', { data: null, error: null, success: null, authed: false });
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password !== 'admin0123') {
    return res.render('admin', { data: null, error: 'Incorrect password.', success: null, authed: false });
  }
  const db = readDB();
  res.render('admin', { data: db, error: null, success: null, authed: true });
});

app.post('/admin/save', (req, res) => {
  const { password, siteTitle, heading, description, countdownTarget, eventDate, eventTime, eventVenue, buttonText } = req.body;
  if (password !== 'admin0123') {
    return res.render('admin', { data: null, error: 'Unauthorized.', success: null, authed: false });
  }
  const db = {
    siteTitle,
    heading,
    description,
    countdownTarget,
    eventDate,
    eventTime,
    eventVenue,
    buttonText
  };
  writeDB(db);
  res.render('admin', { data: db, error: null, success: 'Changes saved successfully.', authed: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
