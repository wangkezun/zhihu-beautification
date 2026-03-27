import { readFileSync } from 'fs';
import { resolve } from 'path';

function userscriptBanner(metaPath) {
  return readFileSync(resolve(metaPath), 'utf-8').trimEnd() + '\n';
}

// 将 .css 文件 import 为字符串
function cssStringPlugin() {
  return {
    name: 'css-string',
    transform(code, id) {
      if (!id.endsWith('.css')) return null;
      return {
        code: `export default ${JSON.stringify(code)};`,
        map: { mappings: '' },
      };
    },
  };
}

function makeConfig(input, output, metaPath) {
  return {
    input,
    output: {
      file: output,
      format: 'es',
      banner: userscriptBanner(metaPath),
      // Preserve "use strict" directives — userscript engines don't use ES module mode
      strict: false,
    },
    treeshake: false,
    plugins: [cssStringPlugin()],
  };
}

export default [
  makeConfig(
    'src/beautification/index.js',
    'dist/Zhihu-Beautification.user.js',
    'src/beautification/meta.txt',
  ),
  makeConfig(
    'src/enhanced/index.js',
    'dist/Zhihu-Enhanced.user.js',
    'src/enhanced/meta.txt',
  ),
];
