const http = require('http');
const url = require('url');
const fs= require('fs');

const data = fs.readFileSync('./data.json');
let logs = JSON.parse(data);
const server = http.createServer((req, res) => {
  const urlparse = url.parse(req.url, true);
  
  if(urlparse.pathname == '/logs' && req.method == 'POST')
  {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(logs, null, 2));
  }
});

server.listen(3000, () => {});