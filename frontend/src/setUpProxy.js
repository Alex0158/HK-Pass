const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://10.78.174.207:8000',
      changeOrigin: true,
    })
  );


  app.use(
    '/api2',
    createProxyMiddleware({
      target: 'http://10.77.80.1:8000',
      changeOrigin: true,
    })
  );

  
};