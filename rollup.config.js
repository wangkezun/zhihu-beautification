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
      // 函数形式：watch 模式下每次重新构建都重读 meta.txt
      banner: () => userscriptBanner(metaPath),
    },
    plugins: [cssStringPlugin()],
  };
}

export default [
  makeConfig(
    'src/index.js',
    'dist/Zhihu-Beautification.user.js',
    'src/meta.txt',
  ),
];
