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

const bundle = (file, ...plugins) => ({
  input: `./src/${file}.js`,
  output: {
    file: `./DOMinion/${file}.js`,
    format: "iife",
    sourcemap: true
  },
  moduleContext: {
    [flatbuffersPath]: "({})"
  },
  plugins: [
    ...plugins,
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

const watch =
  process.argv.includes("-w") || process.argv.includes("--watch")
    ? [serve(), livereload()]
    : []

export default [
  bundle(`${String(process.env.BUNDLE)}/Main`),
  bundle(`${String(process.env.BUNDLE)}/Embed`, ...watch)
]
