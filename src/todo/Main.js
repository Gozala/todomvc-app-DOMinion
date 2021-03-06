// @flow

import * as Todos from "./Todos"
import FlatBuffer from "dominion/src/Format/FlatBuffer"
import * as DOMinion from "dominion"

const DOCUMENT_FRAGMENT_NODE = 11
const ELEMENT_NODE = 1
const INDEXED_ELEMENT_NODE = 21
const TAGGED_ELEMENT_NODE = 22
const THUNK_NODE = 23

class Program<message, model> {
  state: model
  node: DOMinion.Node<message> = DOMinion.createHost()
  view: model => DOMinion.Node<message>
  update: (message, model) => [model, () => void]
  constructor({
    view,
    update
  }: {
    view: model => DOMinion.Node<message>,
    update: (message, model) => [model, () => void]
  }) {
    this.view = view
    this.update = update
  }
  transact(state: model): void {
    const node = DOMinion.createHost([], [this.view(state)])
    const changeList = FlatBuffer.encode(DOMinion.diff(this.node, node))
    if (changeList.isError === true) {
      console.error(changeList)
    } else {
      const { buffer, byteOffset } = changeList

      this.state = state
      this.node = node
      self.postMessage({ buffer, byteOffset }, [buffer])
    }
  }
  send<a>(payload: a, path: number[]): void {
    const action = Program.toMessage(this.node, path, payload)
    if (action) {
      console.log(action)
      const [state, fx] = this.update(action, this.state)
      this.transact(state)
    } else {
      console.error("Message receiver not found", path, payload)
    }
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

const program = new Program(Todos)
program.transact(Todos.Model.new())
self.onmessage = event => program.send(event.data.message, event.data.path)
