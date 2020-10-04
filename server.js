const http = require("http");
const app = require("./shop");
const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port, () => console.log(`server running on 3000`));