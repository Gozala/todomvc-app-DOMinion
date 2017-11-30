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
const orbitingView = Process.spawn("./Orbiting.js", scene)
const lemniscateView = Process.spawn("./Leminscate.js", scene)

const select = (first, ...rest) => {
  let selection = first
  for (const process of rest) {
    if (process.mailbox.length > selection.mailbox.length) {
      selection = process
    }
  }
  return selection
}

let n: 0 | 1 | 2 = 0
const update = now => {
  switch (n) {
    case 0:
      moirView.tick()
      n = 1
      break
    case 1:
      orbitingView.tick()
      n = 2
      break
    default:
      lemniscateView.tick()
      n = 0
      break
  }

  updateFPS(now)
  requestAnimationFrame(update)
}
requestAnimationFrame(update)
