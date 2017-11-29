// @flow

import {
  type Node,
  type integer,
  Decoder,
  className,
  input,
  h1,
  h3,
  autofocus,
  placeholder,
  defaultValue,
  min,
  max,
  value,
  id,
  name,
  For,
  onClick,
  header,
  text,
  thunk,
  section,
  main,
  label,
  ul,
  li,
  div,
  fieldset,
  p,
  a,
  type,
  data,
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
  n: number
  time: number
  constructor(n: number, time: number) {
    this.n = n
    this.time = time
  }
  static new(time: number = 0, n: number = 200) {
    return new Model(n, time)
  }
  static updateTime(model: Model, time: number) {
    if (model.time === time) {
      return model
    } else {
      return new Model(model.n, time)
    }
  }
  static updateCount(model: Model, n: number) {
    if (model.n === n) {
      return model
    } else {
      return new Model(n, model.time)
    }
  }
}

export type Message =
  | { type: "Tick", time: number }
  | { type: "UpdateCount", n: Decoder.integer }

export const update = (message: Message, model: Model): [Model, () => void] => {
  switch (message.type) {
    case "Tick":
      return [Model.updateTime(model, message.time), ignore]
    case "UpdateCount": {
      return [Model.updateCount(model, message.n), ignore]
    }
    default:
      return unreachable(message)
  }
}

const ignore = () => {}

export const view = ({ time, n }: Model): Node<Message> => {
  const t = time / 1600
  return main(
    [styleBackground(t)],
    [viewControl(n), viewOrbiting(t, n), viewLemniscate(t, n)]
  )
}

const viewControl = n =>
  input([
    id("circle-count"),
    type("range"),
    min(30),
    max(500),
    value(n),
    onChange(UpdateCount)
  ])

const UpdateCount = Decoder.form({
  type: Decoder.ok("UpdateCount"),
  n: Decoder.at(["target", "valueAsNumber"], Decoder.Integer)
})
const styleBackground = t => style({ backgroundColor: backgroundColor(t) })

const viewObject = (t, n, x, y) =>
  div(
    [
      className("object"),
      style({
        left: `${x}px`,
        top: `${y}px`
      })
    ],
    [viewCircle(t, n, n)]
  )

const viewOrbiting = (t, n) => {
  const d = 200
  const x = Math.sin(t) * d
  const y = Math.cos(t) * d
  return viewObject(t, n, x, y)
}

const viewLemniscate = (t, n) => {
  var a = 150
  var x = a * Math.sin(t)
  var y = a * Math.sin(t) * Math.cos(t)
  return viewObject(t, n, x, y)
}

const viewCircle = (t, n, count) => {
  const r = n * 16
  return div(
    [className(`circle`), data("radius", `${r}`), styleCircle(t, n, r, count)],
    n == 0 ? [] : [viewCircle(t, n - 1, count)]
  )
}

const styleCircle = (t, n, r, count) =>
  style({
    borderColor: colorCircle(t, n, count),
    marginLeft: `-${r / 2 + 3}px`,
    marginTop: `-${r / 2 + 3}px`,
    width: `${r}px`,
    height: `${r}px`
  })

const colorCircle = (t, n, count) => {
  t /= 3.0
  const base = getInterpolatedColor("fg", t % 1.0)
  const lightness = 1.0 - n / count
  return getCSSRGBAColor(base.r, base.g, base.b, lightness)
}

function rgbToHSV(originalR, originalG, originalB) {
  var rr,
    gg = 0,
    bb = 0,
    r = originalR / 255,
    g = originalG / 255,
    b = originalB / 255,
    h = 0,
    s = 0,
    v = Math.max(r, g, b),
    diff = v - Math.min(r, g, b),
    diffc = function(c) {
      return (v - c) / 6 / diff + 1 / 2
    }

  if (diff === 0) {
    h = s = 0
  } else {
    s = diff / v
    rr = diffc(r)
    gg = diffc(g)
    bb = diffc(b)

    if (r === v) {
      h = bb - gg
    } else if (g === v) {
      h = 1 / 3 + rr - bb
    } else if (b === v) {
      h = 2 / 3 + gg - rr
    }

    if (h < 0) {
      h += 1
    } else if (h > 1) {
      h -= 1
    }
  }
  return {
    h: h,
    s: s,
    v: v
  }
}

function hsvToRGB(h, s, v) {
  let [r, g, b] = [0, 0, 0]
  let i = Math.floor(h * 6)
  let f = h * 6 - i
  let p = v * (1 - s)
  let q = v * (1 - f * s)
  let t = v * (1 - (1 - f) * s)
  switch (i % 6) {
    case 0:
      r = v
      g = t
      b = p
      break
    case 1:
      r = q
      g = v
      b = p
      break
    case 2:
      r = p
      g = v
      b = t
      break
    case 3:
      r = p
      g = q
      b = v
      break
    case 4:
      r = t
      g = p
      b = v
      break
    case 5:
      r = v
      g = p
      b = q
      break
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

function parseCSSColorToHSV(color) {
  var r = parseInt(color.substr(1, 2), 16)
  var g = parseInt(color.substr(3, 2), 16)
  var b = parseInt(color.substr(5, 2), 16)
  return rgbToHSV(r, g, b)
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function clamp(lo, hi, x) {
  return x < lo ? lo : x > hi ? hi : x
}

function lerpHSV(a, b, t) {
  var h = lerp(a.h, b.h, t)
  var s = lerp(a.s, b.s, t)
  var v = lerp(a.v, b.v, t)
  //var h = a.h, s = a.s, v = a.v;
  var result = hsvToRGB(h, s, v)
  return result
}

var palettes = [
  {
    fg: "#fef6df",
    bg: "#74c3c8"
  },
  {
    fg: "#fccf74",
    bg: "#41657f"
  },
  {
    fg: "#d9e0e8",
    bg: "#945d72"
  }
].map(function(palette) {
  return {
    bg: parseCSSColorToHSV(palette.bg),
    fg: parseCSSColorToHSV(palette.fg)
  }
})

function getInterpolatedColor(which, t) {
  t *= palettes.length
  var prevIndex = Math.floor(t) % palettes.length
  var nextIndex = (prevIndex + 1) % palettes.length
  t = clamp(-0.5, 0.5, (t % 1.0 - 0.5) * 5.0) + 0.5
  var result = lerpHSV(
    palettes[prevIndex][which],
    palettes[nextIndex][which],
    t
  )
  return result
}

function getCSSColor(r, g, b) {
  r = Math.round(clamp(0, 255, r))
  g = Math.round(clamp(0, 255, g))
  b = Math.round(clamp(0, 255, b))
  return "rgb(" + r + ", " + g + ", " + b + ")"
}

function getCSSRGBAColor(r, g, b, a) {
  r = Math.round(clamp(0, 255, r))
  g = Math.round(clamp(0, 255, g))
  b = Math.round(clamp(0, 255, b))
  return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")"
}

function backgroundColor(t) {
  t /= 3.0
  var interpolatedColor = getInterpolatedColor("bg", t % 1.0)
  var color = getCSSColor(
    interpolatedColor.r,
    interpolatedColor.g,
    interpolatedColor.b
  )
  return color
}
