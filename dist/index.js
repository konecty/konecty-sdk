"use strict";

var _app = _interopRequireDefault(require("./app"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const server = (0, _app.default)();
server.listen(3000, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`server listening on ${address}`);
});