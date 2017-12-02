// @flow

import Process from "../Process"

let lastTime = 0
let frameCount = 0
const fps = document.getElementById("fps") || document.createElement("div")
const scene = document.querySelector("#container") || window.document.body
function updateFPS(time) {
  frameCount++
  if (lastTime + 1000.0 <= time) {
    fps.textContent = `${frameCount}`
    lastTime = time
    frameCount = 0
  }
}

const triangle = Process.spawn("./Triangle.js", scene)
const counter = Process.spawn("./Counter.js", scene)

const update = now => {
  triangle.tick()
  updateFPS(now)
  requestAnimationFrame(update)
  requestIdleCallback(updateCounter)
}

const updateCounter = () => {
  counter.tick()
}
requestAnimationFrame(update)
