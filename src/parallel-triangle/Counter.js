// @flow

import { DOMinion } from "../DOM"
import { Model, update, view, fx } from "../triangle/Triangle"
import Process from "../Worker"

// Just create init that won't schedule an animation frame
const init = () => Model.new(0, true, false)

Process.spawn(
  { init, update, view, fx },
  self,
  DOMinion.createHost([], [view(init())])
)
