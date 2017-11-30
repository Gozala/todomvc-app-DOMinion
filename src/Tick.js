// @flow

import { requestAnimationFrame } from "preemptive-animation-frame"
import { type FX, type SomeFX, type Process, and } from "./Effect"

class Tick<message> implements SomeFX<message> {
  toMessage: number => message
  size: number = 1
  constructor(toMessage: number => message) {
    this.toMessage = toMessage
  }
  perform(process: Process<message>) {
    requestAnimationFrame(time => process.send(this.toMessage(time)))
  }
  and(other: FX<message>): FX<message> {
    return and(this, other)
  }
}

export default <message>(toMessage: number => message): FX<message> =>
  new Tick(toMessage)
