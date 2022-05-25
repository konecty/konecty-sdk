"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _chalk = _interopRequireDefault(require("chalk"));

var _fs = _interopRequireDefault(require("fs"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _path = _interopRequireDefault(require("path"));

var _createDocFromMetadata = require("../lib/createDocFromMetadata");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default({
  input,
  output
}) {
  const __dirname = _path.default.resolve(process.env.INIT_CWD ?? './');

  const inputFile = _path.default.resolve(__dirname, input);

  try {
    _fs.default.statSync(inputFile);
  } catch (error) {
    console.error(_chalk.default.red(`File ${inputFile} not found`));
    return;
  }

  try {
    const metadataFileContent = _fs.default.readFileSync(inputFile, 'utf-8');

    const metadata = JSON.parse(metadataFileContent);

    const outputFile = _path.default.resolve(__dirname, output ?? `./${metadata.name}.md`);

    const outputDir = _path.default.dirname(outputFile);

    _mkdirp.default.sync(outputDir);

    const result = (0, _createDocFromMetadata.createDocFromMetadata)(metadata);

    _fs.default.writeFileSync(outputFile, result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return console.error(_chalk.default.red(`File ${inputFile} is not a valid JSON file`));
    }

    console.error(_chalk.default.red(error));
  }
}