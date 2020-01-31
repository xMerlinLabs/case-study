// @flow
// NODE_ENV is set to production explicitly, so this just makes identifying local environments easier
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_ENV = 'development';
}

const path = require('path');
const express = require('express');
const helmet = require('helmet');

const {
  PORT,
  forceHTTPS,
  interpolateAndServeFile,
  redirectToPrimaryDomain,
  setCustomCacheControl,
} = require('./helpers');

const app = express();


// Helps us accurately detect protocol in Heroku
app.enable('trust proxy')

// Provides some basic server hardening
app.use(helmet());

// Won't force HTTPS if in dev mode, or if explicitly disabled
app.use(forceHTTPS);

// Won't redirect on PR review apps
app.use(redirectToPrimaryDomain);

// We interpolate CSS and HTML files so that we can easily switch our static asset hosting
app.get('/main.css', interpolateAndServeFile('main.css', 'text/css'));

// Cache file in memory, interpolate urls, and serve
app.get('/', interpolateAndServeFile('index.html', 'text/html'));

// Serve all static file except index.html and set caching headers
app.use(express.static(
  path.resolve(__dirname, '..', 'public'),
  {
    setHeaders: setCustomCacheControl,
    // Not currently necessary because we serve index.html before this middleware runs
    // index: false
  }
));

// Start server
app.listen(PORT, () => console.log(`[SERVER] Listening on port ${PORT}!`));
