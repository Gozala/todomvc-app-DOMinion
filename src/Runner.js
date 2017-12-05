// @flow

import * as DOMinion from "dominion"
import type { FX } from "./Effect"
import { getPath } from "./Process"
import Worker from "./Worker"
import type { Program } from "./Worker"

export default class Process<message, model> {
  target: HTMLElement
  host: DOMinion.Archive<HTMLElement>
  state: model
  node: DOMinion.Node<message>
  renderedNode: DOMinion.Node<message>
  view: model => DOMinion.Node<message>
  update: (message, model) => model
  fx: model => FX<message>
  tick: number => void
  constructor(
    { view, update, fx }: Program<message, model>,
    target: HTMLElement,
    renderedNode: DOMinion.Node<message>
  ) {
    this.view = view
    this.update = update
    this.fx = fx
    this.renderedNode = renderedNode
    this.tick = this.tick.bind(this)
  }
  static spawn<message, model>(
    program: Program<message, model>,
    target: HTMLElement = window.document.body,
    renderedNode: DOMinion.Node<message> = DOMinion.createHost()
  ): Process<message, model> {
    const process = new Process(program, target, renderedNode)
    const host = DOMinion.mount(target, (result, event) =>
      process.handleUIEvent(result, event)
    )
    process.host = host

    const state = program.init()
    process.transact(state)
    process.fx(state).perform(process)
    return process
  }
  handleUIEvent(result: Object, event: Event) {
    const { target } = this
    if (result.isOk) {
      const { value } = result
      if (value != null) {
        const path = getPath((event.currentTarget: Object), target)
        if (path) {
          this.receive(value, path)
        }
      }
    } else {
      console.error(result.error)
    }
  }
  transact(state: model): void {
    const node = DOMinion.createHost([], [this.view(state)])
    this.node = node
    this.state = state
  }
  tick(time: number) {
    if (this.renderedNode !== this.node) {
      DOMinion.patch(this.host, DOMinion.diff(this.renderedNode, this.node))
      this.renderedNode = this.node
    }
  }
  receive<a>(packet: a, path: number[]): void {
    const payload = Worker.toMessage(this.node, path, packet)
    if (payload) {
      this.send(payload)
    } else {
      console.error("Message receiver not found", path, packet)
    }
  }
  send(payload: message): void {
    const state = this.update(payload, this.state)
    this.transact(state)
    this.fx(state).perform(this)
  }
}
