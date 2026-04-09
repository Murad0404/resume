module.exports = {
  apps: [
    {
      name: 'resume-frontend',
      script: 'server.cjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'resume-bot',
      script: 'telegram-bot-local.js',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
