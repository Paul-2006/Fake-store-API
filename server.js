const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript"
};

const server = http.createServer((request, response) => {
  const filePath = request.url === "/"
    ? path.join(root, "index.html")
    : path.join(root, request.url);
  const safePath = path.normalize(filePath);

  if (!safePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(safePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(safePath)] || "text/plain"
    });
    response.end(data);
  });
});

server.listen(3003, "127.0.0.1");
