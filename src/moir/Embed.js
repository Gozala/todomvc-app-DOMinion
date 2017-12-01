// @flow

import Process from "../Process"

let lastTime = 0
let frameCount = 0
const fps = document.getElementById("fps") || document.createElement("div")
const scene = document.querySelector("#scene") || window.document.body
function updateFPS(time) {
  frameCount++
  if (lastTime + 1000.0 <= time) {
    fps.textContent = `${frameCount}`
    lastTime = time
    frameCount = 0
  }
}

const process = Process.spawn("./Main.js", scene)

const update = now => {
  const start = performance.now()
  process.tick()
  updateFPS(now)
  requestAnimationFrame(update)
}
requestAnimationFrame(update)
