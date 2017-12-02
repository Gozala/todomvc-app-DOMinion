// @flow

import {
  type Node,
  Decoder,
  className,
  input,
  h1,
  h3,
  autofocus,
  placeholder,
  defaultValue,
  value,
  id,
  name,
  For,
  onClick,
  header,
  text,
  thunk,
  section,
  label,
  ul,
  li,
  div,
  fieldset,
  p,
  a,
  type,
  href,
  checked,
  button,
  onInput,
  onBlur,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  onChange,
  visible,
  footer,
  span,
  strong,
  onEnter,
  on,
  style,
  px
} from "../DOM"

import * as Triangle from "./SierpinskiTriangle"
import { match } from "../Update"
import unreachable from "unreachable"
import { nofx, and, type FX } from "../Effect"
import tick from "../Tick"
import { setInterval } from "../Timer"

export class Model {
  seconds: number
  useTimeSlicing: boolean = true
  start: number
  time: number
  interval: boolean
  requestFrame: boolean
  constructor(
    seconds: number,
    useTimeSlicing: boolean,
    interval: boolean,
    start: number,
    time: number,
    requestFrame: boolean
  ) {
    this.seconds = seconds
    this.useTimeSlicing = useTimeSlicing
    this.interval = interval
    this.start = start
    this.time = time
    this.requestFrame = requestFrame
  }
  static new(
    time: number,
    interval: boolean = true,
    requestFrame: boolean = true
  ): Model {
    return new Model(0, true, interval, time, time, requestFrame)
  }
  static useTimeSlicing(
    { seconds, start, time }: Model,
    useTimeSlicing: boolean
  ): Model {
    return new Model(seconds, useTimeSlicing, false, start, time, false)
  }
  static time({ seconds, start, useTimeSlicing }: Model, time: number): Model {
    return new Model(seconds, useTimeSlicing, false, start, time, true)
  }
  static beat({ seconds, start, useTimeSlicing, time }: Model): Model {
    return new Model(
      seconds % 10 + 1,
      useTimeSlicing,
      false,
      start,
      time,
      false
    )
  }
}

export type Message =
  | { useTimeSlicing: boolean }
  | { tick: number }
  | { beat: null }
  | { triangle: Triangle.Message }

//

export const init = () => Model.new(0)
export const update = match({
  useTimeSlicing(value: boolean, model: Model): Model {
    return Model.useTimeSlicing(model, value)
  },
  tick(time: number, model: Model): Model {
    return Model.time(model, time)
  },
  beat(_, model: Model): Model {
    return Model.beat(model)
  },
  triangle(message: Triangle.Message, model: Model) {
    return model
  }
})

export const fx = (model: Model): FX<Message> =>
  and(
    model.interval ? setInterval(Beat.new, 1000) : nofx,
    model.requestFrame ? tick(Tick.new) : nofx
  )

class Beat {
  beat: null = null
  static new(): Beat {
    return new Beat()
  }
}

class Tick {
  tick: number
  constructor(tick: number) {
    this.tick = tick
  }
  static new(time: number) {
    return new Tick(time)
  }
}
export const view = (model: Model): Node<Message> => {
  const elapsed = model.time - model.start
  const seconds = model.seconds
  const t = (elapsed / 1000) % 10
  const scale = 1 + (t > 5 ? 10 - t : t) / 10
  return div(
    [],
    [
      div(
        [],
        [
          h3([], [text("Time slicing")]),
          p([], [text("Toggle this and observe the effect")]),
          viewToggle(model.useTimeSlicing, "On", "Off")
        ]
      ),
      div(
        [appStyle, styleApp(scale)],
        [
          thunk(Triangle.view, 0, 0, 1000, `${model.seconds}`).map(
            TagTriangle.new
          )
        ]
      )
    ]
  )
}

class TagTriangle {
  triangle: Triangle.Message
  constructor(triangle: Triangle.Message) {
    this.triangle = triangle
  }
  static new(triangle: Triangle.Message): Message {
    return new TagTriangle(triangle)
  }
}

const viewToggle = (
  useTimeSlicing: boolean,
  onLabel: string,
  offLabel: string
): Node<Message> =>
  label(
    [onChange(UseTimeSlicing(!useTimeSlicing))],
    [
      label(
        [],
        [
          text(onLabel),
          input([
            type("radio"),
            name("value"),
            value("on"),
            useTimeSlicing ? checked() : checked(null)
          ])
        ]
      ),
      label(
        [],
        [
          text(offLabel),
          input([
            type("radio"),
            name("value"),
            value("off"),
            !useTimeSlicing ? checked() : checked(null)
          ])
        ]
      )
    ]
  )

const appStyle = style({
  position: "absolute",
  transformOrigin: "0 0",
  left: "50%",
  top: "50%",
  width: px(10),
  height: px(10),
  background: "#eee"
})

const styleApp = scale =>
  style({
    transform: `scaleX(${scale / 2.1}) scaleY(0.7) translateZ(0.1px)`
  })

const UseTimeSlicing = (value: boolean) => Decoder.ok({ useTimeSlicing: value })
