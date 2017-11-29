// @flow

import { DOMinion } from "../DOM"
import FlatBuffer from "dominion/src/Format/FlatBuffer"
import Log from "dominion/src/Patch/Log"

const worker = new Worker("./Main.js")

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

const getPath = (from: Node, to: Node): ?(number[]) => {
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

const host = DOMinion.mount(window.document.body, (result, event: Event) => {
  if (result.isOk) {
    const { value } = result
    if (value != null) {
      const path = getPath((event.currentTarget: Object), window.document.body)
      worker.postMessage({
        message: value,
        path
      })
    }
  } else {
    console.error(result.error)
  }
})

worker.onmessage = event => {
  const { buffer, byteOffset } = (event.data: any)
  const changeList = new Uint8Array(buffer, byteOffset)
  const result = DOMinion.patch(host, FlatBuffer.decode(changeList))
  if (result.isError) {
    console.error(result)
  }
}
