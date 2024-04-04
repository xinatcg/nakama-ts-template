import resolve from '@rollup/plugin-node-resolve'
import commonJS from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import replace from 'rollup-plugin-replace'
import pkg from './package.json' assert { type: 'json' }
const extensions = ['.mjs', '.js', '.ts', '.json']

export default {
  input: './src/main.ts',
  external: ['nakama-runtime'],
  plugins: [
    // Allows node_modules resolution
    resolve({ extensions }),

    // Compile TypeScript
    typescript(),

    json(),

    // Resolve CommonJS modules
    commonJS({ extensions }),

    // Transpile to ES5
    babel({
      extensions,
      babelHelpers: 'bundled',
    }),

    replace({
      'process.env.VERSION': JSON.stringify(pkg.version),
      'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
      // pass dev env in command otherwise prod is default. 使用命令行中传入的环境变量，如果没有则默认为prod环境
      'process.env.MODE': JSON.stringify(process.env.MODE || 'prod'),
      preventAssignment: true,
    }),
  ],
  output: {
    file: pkg.main,
  },
}
