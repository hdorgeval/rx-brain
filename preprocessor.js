// Copyright 2004-present Facebook. All Rights Reserved.
const ts = require("typescript");
const tsConfig = require('./tsconfig.json');
module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
        const content = src;
        const transpileOptions = {compilerOptions: tsConfig.compilerOptions};
        const transpileOutput = ts.transpileModule(content,transpileOptions);
        return transpileOutput.outputText;
    }
    return src;
  }
};