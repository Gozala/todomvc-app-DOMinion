// @flow

import {
  update,
  init,
  fx,
  Model,
  UpdateCount,
  styleBackground,
  viewOrbiting,
  type Message
} from "../moir/Moir"
import { type Node, main, input, div, onChange, DOMinion } from "../DOM"
import Process from "../Worker"

const view = ({ time, n }: Model): Node<Message> => {
  const t = time / 1600
  return main([], [input([onChange(UpdateCount)]), viewOrbiting(t, n)])
}

Process.spawn(
  { update, init, fx, view },
  self,
  DOMinion.createHost([], [main([], [input()])])
)
