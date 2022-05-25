"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createProgram;

var _chalk = _interopRequireDefault(require("chalk"));

var _commander = require("commander");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _docCommand = _interopRequireDefault(require("./docCommand"));

var _typeCommand = _interopRequireDefault(require("./typeCommand"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createProgram() {
  const {
    version
  } = JSON.parse(_fs.default.readFileSync(_path.default.resolve('package.json'), 'utf-8'));
  const program = new _commander.Command();
  program.version(version);
  program.name('konecty');

  function runCommand(option, input, options) {
    switch (option) {
      case 'doc':
        const docOptions = Object.assign({}, options, {
          input
        });
        return (0, _docCommand.default)(docOptions);

      case 'class':
        const typeOtions = Object.assign({}, options, {
          input
        });
        return (0, _typeCommand.default)(typeOtions);

      default:
        return console.error(_chalk.default.red(`Unknown command ${option}`));
    }
  }

  program.command('create <option> <input>').description('Create a new type from a metadata file').option('-o, --output <input>', 'Output type file').action(runCommand);
  return program;
}