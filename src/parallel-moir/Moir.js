// @flow

import {
  update,
  init,
  fx,
  Model,
  styleBackground,
  viewControl,
  type Message
} from "../moir/Moir"
import { type Node, main } from "../DOM"
import Process from "../Worker"

const view = ({ time, n }: Model): Node<Message> => {
  const t = time / 1600
  return main([styleBackground(t)], [viewControl(n)])
}

Process.spawn({ update, init, view, fx }, self)
