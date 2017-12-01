// @flow

import FlatBuffer from "dominion/src/Format/FlatBuffer"
import * as DOMinion from "dominion"
import type { FX } from "./Effect"
import type { Match } from "./Update"

const DOCUMENT_FRAGMENT_NODE = 11
const ELEMENT_NODE = 1
const INDEXED_ELEMENT_NODE = 21
const TAGGED_ELEMENT_NODE = 22
const THUNK_NODE = 23

type Program<message, model> = {
  view(model): DOMinion.Node<message>,
  init(): model,
  update: Match<model, message>,
  fx(model): FX<message>
}

export default class Process<message, model> {
  worker: Worker
  state: model
  node: DOMinion.Node<message>
  view: model => DOMinion.Node<message>
  requestID: ?number = null
  update: (message, model) => model
  fx: model => FX<message>
  constructor(
    { view, update, fx }: Program<message, model>,
    worker: Worker,
    node: DOMinion.Node<message>
  ) {
    this.view = view
    this.update = update
    this.fx = fx
    this.worker = worker
    this.node = node
  }
  static spawn<message, model>(
    program: Program<message, model>,
    worker: Worker,
    node: DOMinion.Node<message> = DOMinion.createHost()
  ): Process<message, model> {
    const process = new Process(program, worker, node)
    worker.addEventListener("message", (process: Object))
    const state = program.init()

    process.transact(state)
    process.fx(state).perform(process)
    return process
  }
  handleEvent(event: Object) {
    this.receive(event.data.message, event.data.path)
  }
  transact(state: model): void {
    const node = DOMinion.createHost([], [this.view(state)])
    const changeList = FlatBuffer.encode(DOMinion.diff(this.node, node))
    if (changeList.isError === true) {
      console.error(changeList)
    } else {
      const { buffer, byteOffset } = changeList

      this.requestID = null
      this.node = node
      this.state = state
      self.postMessage({ buffer, byteOffset }, [buffer])
    }
  }
  receive<a>(packet: a, path: number[]): void {
    const payload = Process.toMessage(this.node, path, packet)
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
  static toMessage<a, b>(
    root: DOMinion.Node<b>,
    path: number[],
    payload: a
  ): ?b {
    const tags = []
    let node: DOMinion.Node<any> = root
    let index = 0
    const count = path.length
    while (index < count) {
      const n = path[index]
      switch (node.nodeType) {
        case ELEMENT_NODE: {
          node = node.children[n]
          index++
          break
        }
        case TAGGED_ELEMENT_NODE: {
          tags.unshift(node.tag)
          node = node.node
          break
        }
        case THUNK_NODE: {
          node = node.force()
          break
        }
        default: {
          return null
        }
      }
    }

    let tagged: any = payload
    for (const tag of tags) {
      tagged = tag(tagged)
    }
    return tagged
  }
}
