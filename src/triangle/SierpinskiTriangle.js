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
  style
} from "../DOM"

import * as Dot from "./Dot"
import unreachable from "unreachable"

const targetSize = 25

export type Message =
  | { type: "Dot", message: Dot.Message }
  | { type: "Left", message: Message }
  | { type: "Right", message: Message }
  | { type: "Top", message: Message }

export const view = (
  x: number,
  y: number,
  size: number,
  children: string
): Node<Message> => {
  if (size <= targetSize) {
    return div(
      [],
      [
        Dot.view(
          children,
          false,
          x - targetSize / 2,
          y - targetSize / 2,
          targetSize
        )
      ]
    ).map(TagDot.new)
  } else {
    const newSize = size / 2
    let slowDown = true
    if (slowDown) {
      var e = performance.now() + 0.8
      while (performance.now() < e) {
        // Artificially long execution time.
      }
    }

    size /= 2
    return div(
      [],
      [
        view(x, y - size / 2, size, children).map(TagTop.new),
        view(x - size, y + size / 2, size, children).map(TagLeft.new),
        view(x + size, y + size / 2, size, children).map(TagRight.new)
      ]
    )
  }
}

class TagDot {
  type: "Dot" = "Dot"
  message: Dot.Message
  static new(message: Dot.Message): Message {
    const tag = new TagDot()
    tag.message = message
    return tag
  }
}

class TagLeft {
  type: "Left" = "Left"
  message: Message
  static new(message: Message): Message {
    const tag = new TagLeft()
    tag.message = message
    return tag
  }
}

class TagRight {
  type: "Right" = "Right"
  message: Message
  static new(message: Message): Message {
    const tag = new TagRight()
    tag.message = message
    return tag
  }
}

class TagTop {
  type: "Top" = "Top"
  message: Message
  static new(message: Message): Message {
    const tag = new TagTop()
    tag.message = message
    return tag
  }
}
