// @flow

import { type FX, type SomeFX, type Process, and } from "./Effect"

class SetInterval<message> implements SomeFX<message> {
  toMessage: number => message
  size: number = 1
  time: number
  constructor(toMessage: number => message, time: number) {
    this.toMessage = toMessage
    this.time = time
  }
  perform(process: Process<message>) {
    console.log(this.time)
    self.setInterval(
      () => process.send(this.toMessage(performance.now())),
      this.time
    )
  }
  and(other: FX<message>): FX<message> {
    return and(this, other)
  }
}

export const interval = <message>(
  toMessage: number => message,
  time: number
): FX<message> => new SetInterval(toMessage, time)

export { interval as setInterval }
