const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>Momentum Test Server</title></head>
      <body>
        <h1>🎉 Test Server Works!</h1>
        <p>If you can see this, the server is working properly.</p>
        <p>The issue might be with the Next.js setup.</p>
      </body>
    </html>
  `);
});

const PORT = 3002;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Also try: http://127.0.0.1:${PORT}`);
});