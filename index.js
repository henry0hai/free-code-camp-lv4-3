require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const shortid = require('shortid');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// short url
const urlMap = new Map();
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  const parsedUrl = new URL(originalUrl);
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      const shortUrl = shortid.generate();
      urlMap.set(shortUrl, originalUrl);
      res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

// redirect to short url
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlMap.get(shortUrl);
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'invalid short url' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
