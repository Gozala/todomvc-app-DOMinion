// @flow

import json from "rollup-plugin-json"
import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import babel from "rollup-plugin-babel"
import flowSyntax from "babel-preset-flow-syntax"
import legacy from "rollup-plugin-legacy"
import serve from "rollup-plugin-serve"
import livereload from "rollup-plugin-livereload"

const flatbuffersPath = require.resolve("dominion/node_modules/flatbuffers")

const server = serve()
const reload = livereload()

const config = (file, server, reload) => ({
  input: `./src/${file}.js`,
  output: {
    file: `./js/${file}.js`,
    format: "iife",
    // intro: "window.global = window;",
    // name: `${file}`,
    sourcemap: true
  },
  moduleContext: {
    [flatbuffersPath]: "({})"
  },
  plugins: [
    babel({
      babelrc: false,
      presets: [flowSyntax]
    }),
    json({ preferConst: true }),
    legacy({
      [flatbuffersPath]: {
        flatbuffers: "flatbuffers"
      }
    }),
    resolve({
      module: true,
      jsnext: true,
      main: true,
      browser: true,
      extensions: [".js", ".json"]
    }),
    commonjs()
  ]
})
export default [
  config("triangle/worker", null, null),
  config("triangle/app", server, reload)
]
