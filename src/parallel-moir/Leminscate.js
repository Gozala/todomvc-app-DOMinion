// @flow

import {
  update,
  init,
  Model,
  fx,
  UpdateCount,
  styleBackground,
  viewLemniscate,
  type Message
} from "../moir/Moir"
import { type Node, main, input, div, onChange, DOMinion } from "../DOM"
import Process from "../Worker"

const view = ({ time, n }: Model): Node<Message> => {
  const t = time / 1600
  return main([], [input([onChange(UpdateCount)]), div(), viewLemniscate(t, n)])
}

Process.spawn(
  { update, init, fx, view },
  self,
  DOMinion.createHost([], [main([], [input(), div()])])
)
