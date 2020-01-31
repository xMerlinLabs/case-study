const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');

const app = express();

//
// Redirects
//
const PORT = process.env.PORT || 8080;
const DOMAIN = process.env.DOMAIN || `localhost:${PORT}`;
const IN_DEVELOPMENT_MODE = process.env.NODE_ENV === 'development'
const IS_PR = (process.env.IS_PR || '').toLowerCase() === 'true';
const DISABLE_FORCE_HTTPS = (process.env.DISABLE_FORCE_HTTPS || '').toLowerCase() === 'true';
const VERBOSE_LOGS = (process.env.VERBOSE_LOGS || '').toLowerCase() === 'true';

// Leaving this in to help with any future debugging
console.log('[SERVER] env:', JSON.stringify({
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


//
// Caching
//
const videoFileExtensions = ['.mp4', '.mov','.gif', '.ogg'];
const VIDEO_CACHE_AGE = process.env.VIDEO_CACHE_AGE || 60 * 60 * 3;

// Not caching svgs or icons for now, they are pretty small and we are billed by request and bandwidth
const imageFileExtensions = ['.png', '.jpg', '.jpeg'];
const IMAGE_CACHE_AGE = process.env.VIDEO_CACHE_AGE || 60 * 60 * 3;;

function setCustomCacheControl(res, url) {
  let age = null;
  if (videoFileExtensions.some(extension => url.endsWith(extension))) {
    res.setHeader('Cache-Control', `public, max-age=${VIDEO_CACHE_AGE}`)
    age = VIDEO_CACHE_AGE;
  } else if (imageFileExtensions.some(extension => url.endsWith(extension))) {
    res.setHeader('Cache-Control', `public, max-age=${IMAGE_CACHE_AGE}`)
    age = IMAGE_CACHE_AGE;
  } else {
    res.setHeader('Cache-Control', `public, max-age=0`)
    age = 0;
  }

  if (VERBOSE_LOGS) console.log(`Caching: age=${age} url=${url}`);
}


//
// Interpolate and serve files from memory
//

// These variables allow us to easily transition between using a CDN and the source server for assets
// without needing any additional tooling or rebuilding the site
const ENABLE_VIDEO_CDN = (process.env.ENABLE_CDN || '').toLowerCase() === 'true';
const ENABLE_IMAGE_CDN = (process.env.ENABLE_CDN || '').toLowerCase() === 'true';
const relativeAssetPath = '.';
const CDN_URL = process.env.CDN_URL || relativeAssetPath;

function interpolateAndServeFile(fileName, mimeType) {
  // Keeping all these variables in memory
  const filePath = path.resolve(__dirname, '..', 'public', fileName);
  const fileContents = String(fs.readFileSync(filePath))
    .replace(/<<<IMAGE_HOST>>>/g, ENABLE_IMAGE_CDN ? CDN_URL : relativeAssetPath)
    .replace(/<<<VIDEO_HOST>>>/g, ENABLE_VIDEO_CDN ? CDN_URL : relativeAssetPath);

  const { mtime } = fs.statSync(filePath);
  const lastModified = (new Date(mtime)).toGMTString();

  return function (req, res) {
    res.setHeader('Cache-Control', `public, max-age=0`);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Last-Modified', lastModified);
    res.status(200).send(fileContents);
  }
}

module.exports = {
  PORT,
  interpolateAndServeFile,
  setCustomCacheControl,
  forceHTTPS,
  redirectToPrimaryDomain,
}
