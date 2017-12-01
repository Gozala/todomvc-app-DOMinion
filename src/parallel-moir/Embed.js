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

const moirView = Process.spawn("./Moir.js", scene)
let orbitingView
let lemniscateView

const update = now => {
  const time = performance.now()
  moirView.tick()
  if (orbitingView) {
    if (time + 5 > performance.now()) {
      orbitingView.tick()
    }
  } else {
    orbitingView = Process.spawn("./Orbiting.js", scene)
  }

  if (lemniscateView) {
    if (time + 8 > performance.now()) {
      lemniscateView.tick()
    }
  } else {
    lemniscateView = Process.spawn("./Leminscate.js", scene)
  }

  updateFPS(now)
  requestAnimationFrame(update)
}
requestAnimationFrame(update)
