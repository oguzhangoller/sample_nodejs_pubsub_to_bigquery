const http = require("http");
const url = require("url");
const { publishMessage } = require("./publish_message");
const { userCount, dailyUsers, averageDurations } = require("./get_bigquery");

const server = http.createServer((req, res) => {
  const urlparse = url.parse(req.url, true);

  if (urlparse.pathname == "/logs" && req.method == "POST") {
    res.writeHead(200, { "Content-Type": "application/json" });
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      const jsonData = JSON.parse(data);
      jsonData.forEach(function (user) {
        user["date"] = new Date(user["event_time"]).toISOString().slice(0, 10);
        publishMessage(user);
      });
      res.end();
    });
  }

  if (urlparse.pathname == "/stats" && req.method == "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    userCount().then((userCountJson) => {
      dailyUsers().then((dailyUserJson) => {
        averageDurations().then((averageDurationJson) => {
          let result = {};
          result["averageDurations"] = averageDurationJson;
          result["dailyUsers"] = dailyUserJson;
          result["total_users"] = userCountJson["total_users"];
          res.end(JSON.stringify(result));
        });
      });
    });
  }
});

server.listen(process.env.PORT || 3000, () => {});
