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

import unreachable from "unreachable"

export class Model {
  hover: boolean
  static new(hover: boolean): Model {
    const dot = new Model()
    dot.hover = hover
    return dot
  }
  static enter(model: Model): Model {
    if (model.hover) {
      return model
    } else {
      return Model.new(true)
    }
  }
  static leave(model: Model): Model {
    if (model.hover) {
      return Model.new(false)
    } else {
      return model
    }
  }
}

export type Message = { type: "Enter" } | { type: "Leave" }

export const update = (message: Message, model: Model): [Model, () => void] => {
  switch (message.type) {
    case "Enter": {
      return [Model.enter(model), ignore]
    }
    case "Leave": {
      return [Model.leave(model), ignore]
    }
    default: {
      return unreachable(message)
    }
  }
}

export const view = (
  label: string,
  hover: boolean,
  x: number,
  y: number,
  size: number
): Node<Message> =>
  div(
    [
      dotStyle,
      styleDot(size * 1.3, x, y, hover),
      onMouseEnter(Enter),
      onMouseLeave(Leave)
    ],
    [hover ? text(`*${label}*`) : text(label)]
  )

const dotStyle = style({
  position: "absolute",
  background: "#61dafb",
  font: "normal 15px sans-serif",
  textAlign: "center",
  cursor: "pointer"
})

const styleDot = (size: number, x: number, y: number, hover: boolean) =>
  style({
    width: px(size),
    height: px(size),
    left: px(x),
    top: px(y),
    borderRadius: px(size / 2),
    lineHeight: px(size),
    background: hover ? "#ff0" : dotStyle.background
  })

const Enter = Decoder.ok({ type: "Enter" })
const Leave = Decoder.ok({ type: "Leave" })

const ignore = () => {}
