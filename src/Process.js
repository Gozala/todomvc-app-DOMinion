// @flow

import { DOMinion } from "./DOM"
import FlatBuffer from "dominion/src/Format/FlatBuffer"
import Log from "dominion/src/Patch/Log"

const indexOf = (child: Node, parent: Node): ?number => {
  let index = 0
  let node = parent.firstChild
  while (node) {
    if (node === child) {
      return index
    } else {
      index++
      node = node.nextSibling
    }
  }

  return null
}

export const getPath = (from: Node, to: Node): ?(number[]) => {
  let path = []
  let node = from
  while (node !== to) {
    const { parentNode } = node
    if (parentNode) {
      const n = indexOf(node, parentNode)
      if (n == null) {
        return null
      } else {
        path.unshift(n)
        node = parentNode
      }
    } else {
      return null
    }
  }
  return path
}

export default class Process {
  target: HTMLElement
  worker: Worker
  mailbox: Uint8Array[]
  host: DOMinion.Archive<HTMLElement>
  static spawn(script: string, target: HTMLElement = window.document.body) {
    const mailbox = []
    const host = DOMinion.mount(target, (result, event) =>
      process.handleUIEvent(result, event)
    )
    const worker = new Worker(script)

    const process = new Process(target, worker, mailbox, host)
    return process
  }
  constructor(
    target: HTMLElement,
    worker: Worker,
    mailbox: Uint8Array[],
    host: DOMinion.Archive<HTMLElement>
  ) {
    this.target = target
    this.worker = worker
    this.mailbox = mailbox
    this.host = host
    worker.addEventListener("message", (this: any))
  }
  handleEvent(event: MessageEvent) {
    const { buffer, byteOffset } = (event.data: any)
    const changeList = new Uint8Array(buffer, byteOffset)
    this.mailbox.unshift(changeList)
  }
  handleUIEvent(result: Object, event: Event) {
    const { worker, target } = this
    if (result.isOk) {
      const { value } = result
      if (value != null) {
        const path = getPath((event.currentTarget: Object), target)
        worker.postMessage({
          message: value,
          path
        })
      }
    } else {
      console.error(result.error)
    }
  }
  tick(): boolean {
    const { mailbox, host } = this
    if (mailbox.length > 0) {
      const changeList = mailbox.pop()
      const result = DOMinion.patch(host, FlatBuffer.decode(changeList))
      if (result.isError) {
        console.error(result)
      }
    }
    return mailbox.length > 0
  }
}
