process.env.PORT = "3001";
process.env.BASE = "http://127.0.0.1:3001";

const app = require("./server.js");

const server = app.listen(3001, "127.0.0.1", () => {
  console.log("Test server active on http://127.0.0.1:3001");
  setTimeout(() => {
    require("./test.js");
  }, 1000);
});
