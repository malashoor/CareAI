const NodeEnvironment = require('jest-environment-node');
const { TextEncoder, TextDecoder } = require('util');

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder;
    this.global.window = {
      navigator: {
        userAgent: 'node.js',
      },
    };
  }

  async setup() {
    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }

  getVmContext() {
    return super.getVmContext();
  }
}

module.exports = CustomEnvironment; 