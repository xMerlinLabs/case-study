// @flow

module.exports = {
  apps: [
    {
      name: 'site',
      script: './server.js',
      instances: Number(process.env.WEB_CONCURRENCY) || 1,
      exec_mode: 'cluster',
    },
  ],
};
