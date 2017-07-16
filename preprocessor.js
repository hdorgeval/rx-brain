// Copyright 2004-present Facebook. All Rights Reserved.
const ts = require("typescript");
const tsConfig = require('./tsconfig.json');
module.exports = {
  process(src, path) {
    console.log('preprocessor is called on:', path);
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      try {
          const transpileOptions = {compilerOptions: tsConfig.compilerOptions,fileName: path};
          const transpileOutput = ts.transpileModule(src,transpileOptions);
          return transpileOutput.outputText;
        } catch (error) {
          console.log(error);
        }
        
    }
    return src;
  }
};