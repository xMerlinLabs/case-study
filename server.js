const express = require('express');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 3000;

// Provides some basic server hardening
app.use(helmet());

app.use(express.static('public'));

app.listen(port, () => console.log(`Listening on port ${port}!`));
