"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _chalk = _interopRequireDefault(require("chalk"));

var _fs = _interopRequireDefault(require("fs"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _path = _interopRequireDefault(require("path"));

var _createTypeFromMetadata = require("../lib/createTypeFromMetadata");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default({
  input,
  output
}) {
  const __dirname = _path.default.resolve();

  const inputFile = _path.default.resolve(__dirname, input);

  try {
    _fs.default.statSync(inputFile);
  } catch (error) {
    console.error(_chalk.default.red(`File ${inputFile} not found`));
    return;
  }

  try {
    const metadata = JSON.parse(_fs.default.readFileSync(inputFile, 'utf-8'));

    const outputFile = _path.default.resolve(__dirname, output, `./${metadata.name}.ts`);

    const outputDir = _path.default.dirname(outputFile);

    _mkdirp.default.sync(outputDir);

    const type = (0, _createTypeFromMetadata.createTypeFromMetadata)(metadata);

    _fs.default.writeFileSync(outputFile, type);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return console.error(_chalk.default.red(`File ${inputFile} is not a valid JSON file`));
    }

    console.error(_chalk.default.red(error));
  }
}