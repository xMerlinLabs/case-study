// NODE_ENV is set to production explicitly, so this just makes identifying local environments easier
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_ENV = 'development';
}


const express = require('express');
const helmet = require('helmet');

const app = express();

const PORT = process.env.PORT || 8080;

// Helps us accurately detect protocol in Heroku
app.enable('trust proxy')

// Provides some basic server hardening
app.use(helmet());

// Won't force HTTPS if in dev mode, or if explicitly disabled
app.use(forceHTTPS);

// Won't redirect on PR review apps
app.use(redirectToPrimaryDomain);

// Serve site
app.use(express.static('public'));

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));





//
// Helpers
//

const DOMAIN = process.env.DOMAIN || `localhost:${PORT}`;
const IN_PRODUCTION_MODE = process.env.NODE_ENV === 'production'
const IN_DEVELOPMENT_MODE = process.env.NODE_ENV === 'development'
const IS_PR = (process.env.IS_PR || '').toLowerCase() === 'true';
const DISABLE_FORCE_HTTPS = (process.env.DISABLE_FORCE_HTTPS || '').toLowerCase() === 'true';

// Leaving this in to help with any future debugging
console.log('env:', JSON.stringify({
  IS_PR,
  DOMAIN,
  DISABLE_FORCE_HTTPS,
  NODE_ENV: process.env.NODE_ENV
}));

function redirectToPrimaryDomain(request, response, next ) {
  if (request.headers.host.startsWith(DOMAIN) || IS_PR) return next();
  response.redirect(`${request.protocol}://${DOMAIN}${request.url}`);
}

function forceHTTPS(request, response, next ){
  if (request.secure || IN_DEVELOPMENT_MODE || DISABLE_FORCE_HTTPS) return next();
  response.redirect(`https://${request.headers.host}${request.url}`);
}
