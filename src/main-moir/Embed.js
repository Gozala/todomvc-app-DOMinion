// @flow

import * as Moir from "../moir/Moir"
import Process from "../Runner"

const fps = document.getElementById("fps") || document.createElement("div")
const scene = document.querySelector("#scene") || window.document.body
const process = Process.spawn(Moir, scene)

let lastTime = 0
let frameCount = 0
const updateFPS = time => {
  frameCount++
  if (lastTime + 1000.0 <= time) {
    fps.textContent = `${frameCount}`
    lastTime = time
    frameCount = 0
  }
}

const update = now => {
  process.tick(now)
  updateFPS(now)
  requestAnimationFrame(update)
}
requestAnimationFrame(update)
