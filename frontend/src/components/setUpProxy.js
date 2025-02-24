const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 將以 /api 開頭的請求代理到 10.159.136.165
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://10.159.136.165:8000',
      changeOrigin: true,
    })
  );

  // 將以 /api2 開頭的請求代理到 10.159.128.1
  app.use(
    '/api2',
    createProxyMiddleware({
      target: 'http://10.159.128.1:8000',
      changeOrigin: true,
    })
  );

  // 將以 /api3 開頭的請求代理到 10.159.137.199
  app.use(
    '/api3',
    createProxyMiddleware({
      target: 'http://10.159.137.199:8000',
      changeOrigin: true,
    })
  );
};