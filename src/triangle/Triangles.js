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
import unreachable from "unreachable"

export class Model {
  seconds: number
  useTimeSlicing: boolean = true
  intervalID: number
  start: number
  time: number
  constructor(
    seconds: number,
    useTimeSlicing: boolean,
    intervalID: number,
    start: number,
    time: number
  ) {
    this.seconds = seconds
    this.useTimeSlicing = useTimeSlicing
    this.intervalID = intervalID
    this.start = start
    this.time = time
  }
  static new(time: number, intervalID: number): Model {
    return new Model(0, true, intervalID, time, time)
  }
  static useTimeSlicing(
    { seconds, intervalID, start, time }: Model,
    useTimeSlicing: boolean
  ): Model {
    return new Model(seconds, useTimeSlicing, intervalID, start, time)
  }
  static time(
    { seconds, intervalID, start, useTimeSlicing }: Model,
    time: number
  ): Model {
    return new Model(seconds, useTimeSlicing, intervalID, start, time)
  }
  static beat({
    seconds,
    intervalID,
    start,
    useTimeSlicing,
    time
  }: Model): Model {
    return new Model(seconds % 10 + 1, useTimeSlicing, intervalID, start, time)
  }
}

export type Message =
  | { type: "UseTimeSlicing", value: boolean }
  | { type: "Tick", time: number }
  | { type: "Beat" }
  | { type: "Triangle", message: Triangle.Message }

export const update = (message: Message, model: Model): [Model, () => void] => {
  switch (message.type) {
    case "UseTimeSlicing": {
      return [Model.useTimeSlicing(model, message.value), ignore]
    }
    case "Tick": {
      return [Model.time(model, message.time), ignore]
    }
    case "Triangle": {
      return [model, ignore]
    }
    case "Beat": {
      return [Model.beat(model), ignore]
    }
    default: {
      return unreachable(message)
    }
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
  type: "Triangle" = "Triangle"
  message: Triangle.Message
  constructor(message: Triangle.Message) {
    this.message = message
  }
  static new(message: Triangle.Message): Message {
    return new TagTriangle(message)
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

const UseTimeSlicing = (value: boolean) =>
  Decoder.ok({ type: "UseTimeSlicing", value })

const ignore = () => {}
