const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://hk-pass-2.onrender.com',
      changeOrigin: true,
    })
  );


};