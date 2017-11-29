// @flow
import * as DOMinion from "dominion"
import * as Decoder from "dominion/node_modules/decoder.flow"

export { Decoder, DOMinion }
export type { Node, Setting } from "dominion"

export const text = (data: string) => DOMinion.createTextNode(data)
const element = (name: string) => <message>(
  settings: Iterable<DOMinion.Setting<message>> = [],
  children: DOMinion.Node<message>[] = []
): DOMinion.Node<message> => DOMinion.createElement(name, settings, children)
export const attribute = (name: string) => <a>(
  value: ?string = ""
): DOMinion.Setting<a> => DOMinion.setAttribute(name, value)
export const property = (name: string) => (
  value?: string | number | boolean | null
) => DOMinion.property(name, value)

export const thunk = DOMinion.createThunk
export const className = attribute("class")
export const header = element("header")
export const main = element("main")
export const h1 = element("h1")
export const h3 = element("h3")
export const input = element("input")
export const placeholder = attribute("placeholder")
export const autofocus = attribute("autofocus")
export const defaultValue = property("defaultValue")
export const value = property("value")
export const section = element("section")
export const label = element("label")
export const ul = element("ul")
export const li = element("li")
export const div = element("div")
export const button = element("button")
export const footer = element("footer")
export const span = element("span")
export const a = element("a")
export const p = element("p")
export const fieldset = element("fieldset")
export const strong = element("strong")
export const id = attribute("id")
export const name = attribute("name")
export const href = attribute("href")
export const type = attribute("type")
export const For = attribute("for")
export const data = (name: string, value: string) =>
  DOMinion.setAttribute(`data-${name}`, value)
export const checked = attribute("checked")
export const on = (type: string) => <a>(
  decoder: Decoder.Decoder<?a>,
  capture: boolean = false
): DOMinion.Listener<a> => DOMinion.on(type, decoder, capture)
export const onClick = on("click")
export const onInput = on("input")
export const onBlur = on("blur")
export const onKeyDown = on("keydown")
export const onDoubleClick = on("dblclick")
export const onMouseEnter = on("mouseenter")
export const onMouseLeave = on("mouseleave")
export const onChange = on("change")

export const visible = <a>(visible: boolean): DOMinion.Setting<a> =>
  DOMinion.style({ visibility: visible ? "visible" : "hidden" })

const EnterKey = Decoder.field("keyCode", Decoder.match(13))

export const onEnter = <a>(decoder: Decoder.Decoder<a>): DOMinion.Setting<a> =>
  onKeyDown(Decoder.or(Decoder.and(EnterKey, decoder), Decoder.ok(null)))

export const style = DOMinion.style

export const px = (n: number): string => `${n}px`
