(function () {
'use strict';

const nodeType = {
  TEXT_NODE: 3,
  ELEMENT_NODE: 1,
  INDEXED_ELEMENT_NODE: 21,
  TAGGED_ELEMENT_NODE: 22,
  THUNK_NODE: 23,
  COMMENT_NODE: 8,
  DOCUMENT_FRAGMENT_NODE: 11,
  INDEXED_FRAGMENT_NODE: 24,
  UNINDEXED_FRAGMENT_NODE: 25
};

const settingType = {
  attribute: 1,
  property: 2,
  style: 3,
  listener: 4
};

class Diff {
  constructor(buffer, changeLog, address, navigationLog) {
    this.isError = false;

    Diff.reset(this, buffer, changeLog, address, navigationLog);
  }
  static reset(diff, buffer, changeLog, address, navigationLog) {
    diff.buffer = buffer;
    diff.changeLog = changeLog;
    diff.address = address;
    diff.navigationLog = navigationLog;
    return diff;
  }
  static updateAddress(diff, address) {
    return Diff.reset(diff, diff.buffer, diff.changeLog, address, diff.navigationLog);
  }
  static updateNavigationLog(diff, navigationLog) {
    return Diff.reset(diff, diff.buffer, diff.changeLog, diff.address, navigationLog);
  }

  static update(diff, buffer) {
    return Diff.reset(diff, buffer, diff.changeLog, diff.address, diff.navigationLog);
  }
  static navigate(diff) {
    const { navigationLog, changeLog } = diff;
    let { buffer } = diff;

    while (navigationLog.length > 0) {
      let [level, index] = navigationLog.pop();

      if (level < 0) {
        buffer = changeLog.selectParent(buffer);
      }

      if (level > 0) {
        buffer = changeLog.selectChildren(buffer);
      }

      if (index !== 0) {
        buffer = changeLog.selectSibling(buffer, index);
      }
    }

    return Diff.update(diff, buffer);
  }

  static selectChildren(diff) {
    const { navigationLog } = diff;
    const [level, index] = navigationLog.length === 0 ? [0, 0] : navigationLog[0];
    switch (level) {
      case -1:
        {
          if (index === 0) {
            navigationLog.shift();
          }
          navigationLog.unshift([1, 0]);
          break;
        }
      case 0:
        {
          navigationLog.unshift([1, 0]);
          break;
        }
      default:
        {
          navigationLog.unshift([1, 0]);
          break;
        }
    }

    return Diff.updateNavigationLog(diff, navigationLog);
  }
  static selectSibling(diff, offset) {
    const { navigationLog } = diff;
    const [level, index] = navigationLog.length === 0 ? [0, 0] : navigationLog.shift();
    navigationLog.unshift([level, index + offset]);

    return Diff.updateNavigationLog(diff, navigationLog);
  }
  static selectParent(diff) {
    const { navigationLog } = diff;
    const [level, index] = navigationLog.length === 0 ? [0, 0] : navigationLog[0];

    switch (level) {
      case -1:
        {
          navigationLog.unshift([-1, 0]);
          break;
        }
      case 0:
        {
          navigationLog.shift();
          navigationLog.unshift([-1, 0]);
          break;
        }
      default:
        {
          navigationLog.shift();
          break;
        }
    }

    return Diff.updateNavigationLog(diff, navigationLog);
  }
  static removeNextSibling(diff) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.removeNextSibling(buffer));
  }

  static insertText(diff, data) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.insertText(buffer, data));
  }
  static insertComment(diff, data) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.insertComment(buffer, data));
  }
  static insertElement(diff, localName) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.insertElement(buffer, localName));
  }
  static insertElementNS(diff, namespaceURI, localName) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.insertElementNS(buffer, namespaceURI, localName));
  }
  static insertStashedNode(diff, address) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.insertStashedNode(buffer, address));
  }

  static replaceWithText(diff, data) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.replaceWithText(buffer, data));
  }
  static replaceWithComment(diff, data) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.replaceWithComment(buffer, data));
  }
  static replaceWithElement(diff, localName) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.replaceWithElement(buffer, localName));
  }
  static replaceWithElementNS(diff, namespaceURI, localName) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.replaceWithElementNS(buffer, namespaceURI, localName));
  }
  static replaceWithStashedNode(diff, address) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.replaceWithStashedNode(buffer, address));
  }

  static editTextData(diff, start, end, prefix, suffix) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.editTextData(buffer, start, end, prefix, suffix));
  }
  static setTextData(diff, data) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.setTextData(buffer, data));
  }
  static setAttribute(diff, name, value) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.setAttribute(buffer, name, value));
  }
  static removeAttribute(diff, name) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.removeAttribute(buffer, name));
  }
  static setAttributeNS(diff, namespaceURI, name, value) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.setAttributeNS(buffer, namespaceURI, name, value));
  }
  static removeAttributeNS(diff, namespaceURI, name) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.removeAttributeNS(buffer, namespaceURI, name));
  }
  static assignProperty(diff, name, value) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.assignProperty(buffer, name, value));
  }
  static deleteProperty(diff, name) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.deleteProperty(buffer, name));
  }
  static setStyleRule(diff, name, value) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.setStyleRule(buffer, name, value));
  }
  static removeStyleRule(diff, name) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.removeStyleRule(buffer, name));
  }
  static addEventDecoder(diff, type, decoder, capture) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.addEventDecoder(buffer, type, decoder, capture));
  }
  static removeEventDecoder(diff, type, decoder, capture) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.removeEventDecoder(buffer, type, decoder, capture));
  }
  static shiftSiblings(diff, count) {
    const { changeLog, buffer } = Diff.navigate(diff);
    return Diff.update(diff, changeLog.shiftSiblings(buffer, count));
  }
  static stashNextSibling(diff, address) {
    const next = Diff.navigate(Diff.updateAddress(diff, address + 1));
    return Diff.update(next, next.changeLog.stashNextSibling(next.buffer, address));
  }
  static discardStashedNode(diff, address) {
    // We don't do not encode navigation as it's not really necessary to discard
    // nodes.
    const { changeLog, buffer } = diff;
    return Diff.update(diff, changeLog.discardStashedNode(buffer, address));
  }
}

const unreachable = value => {
  const format = JSON.stringify(value);
  throw new TypeError(`Internal error: Encountered impossible value: ${format}`);
};

class EmptyList {
  constructor() {
    this.length = 0;
    this.isEmpty = true;
  }

  toArray() {
    return nil;
  }
  push(head) {
    return new LinkedList(head, this);
  }
}

class LinkedList {
  constructor(head, tail) {
    this.isEmpty = false;

    this.head = head;
    this.tail = tail;
    this.length = this.tail.length + 1;
  }
  push(head) {
    return new LinkedList(head, this);
  }
  toArray() {
    const array = [];
    let node = this;
    while (node.isEmpty === false) {
      array.push(node.head);
      node = node.tail;
    }
    return array;
  }
}

const nil = Object.freeze([]);
const emptyList = new EmptyList();

const empty$2 = () => emptyList;

const Retain = "Retain";
const Delete = "Delete";

// We don't want to copy arrays all the time, aren't mutating lists, and
// only need O(1) prepend and length, we can get away with a custom singly
// linked list implementation.

// Abstract out the table in case I want to edit the implementation to
// arrays of arrays or something.

class Table {
  constructor() {
    this.cells = Object.create(null);
    this.last = Object.create(null);
    this.next = Object.create(null);
  }
  static init(last, next) {
    const table = new this();
    let n = last.length;
    let m = next.length;
    let i = 0;
    let j = 0;

    table.put(i, j, new Cell(empty$2()));

    for (i = 1; i <= m; i += 1) {
      const [key, node] = next[i - 1];
      table.next[key] = node;
      table.put(i, 0, table.get(i - 1, 0).insert(key));
    }

    for (j = 1; j <= n; j += 1) {
      const [key, node] = last[j - 1];
      table.last[key] = j - 1;
      table.put(0, j, table.get(0, j - 1).delete(key));
    }

    return table;
  }
  static create(last, next) {
    const n = last.length;
    const m = next.length;

    let table = Table.init(last, next);
    let i = 0;
    let j = 0;

    for (i = 1; i <= m; i += 1) {
      for (j = 1; j <= n; j += 1) {
        table = chooseCell(table, i, j, last, next, (direction, table, edits, last, next) => {
          switch (direction) {
            case "Left":
              {
                return table.put(i, j, edits.insert(next[i - 1][0]));
              }
            case "Up":
              {
                return table.put(i, j, edits.delete(last[j - 1][0]));
              }
            case "Diagonal":
              {
                if (last[j - 1][0] === next[i - 1][0]) {
                  return table.put(i, j, edits.retain(last[j - 1][0]));
                } else {
                  return table.put(i, j, edits.delete(last[j - 1][0]).insert(next[i - 1][0]));
                }
              }
            default:
              return unreachable(direction);
          }
        });
      }
    }

    return table;
  }
  put(x, y, cell) {
    this.cells[`${x},${y}`] = cell;
    return this;
  }
  get(x, y) {
    const cell = this.cells[`${x},${y}`];
    if (cell) {
      return cell;
    } else {
      return this.cells[`${x},${y}`] = new Cell(empty$2());
    }
  }
}

class Cell {
  constructor(edits) {
    this.edits = edits;
    this.length = edits.length;
  }
  insert(key) {
    return new Cell(this.edits.push(key));
  }
  delete(key) {
    return new Cell(this.edits.push(Delete));
  }
  retain(key) {
    const { edits } = this;
    return new Cell(edits.push(Retain));
  }
  toArray() {
    return this.edits.toArray().reverse();
  }
}

const chooseCell = (table, x, y, last, next, edit) => {
  let edits = table.get(x, y - 1);
  let min = edits.length;
  let direction = "Up";

  if (table.get(x - 1, y).length < min) {
    edits = table.get(x - 1, y);
    min = edits.length;
    direction = "Left";
  }

  if (table.get(x - 1, y - 1).length < min) {
    edits = table.get(x - 1, y - 1);
    min = edits.length;
    direction = "Diagonal";
  }

  return edit(direction, table, edits, last, next);
};

// Constructor for operations (which are a stream of edits). Uses
// variation of Levenshtein Distance.

const empty$1 = Object.freeze([]);
const blank$1 = Object.freeze(Object.create(null));

class Changes {
  constructor(last, next) {
    this.last = last;
    this.next = next;
  }
  encode(changeLog, init) {
    return diffNode(this.last, this.next, new Diff(init, changeLog, 1, [])).buffer;
  }
}

const diff = (last, next) => new Changes(last, next);

const removeFragment = (node, log) => {
  const { children } = node;
  let index = 0;
  while (index >= 0) {
    const child = children[index];
    if (child == null) {
      index = -1;
    } else {
      index++;
      log = Diff.removeNextSibling(log);
    }
  }
  return log;
};

const insertText = (node, log) => Diff.insertText(log, node.data);

const insertComment = (node, log) => Diff.insertComment(log, node.data);

const insertElementNode = (node, log) => {
  const { localName, namespaceURI } = node;
  const out = namespaceURI == null ? Diff.insertElement(log, localName) : Diff.insertElementNS(log, namespaceURI, localName);
  return out;
};

const insertIndexedElement = (node, log) => Diff.selectSibling(populateIndexedElement(node, setSettings$1(node, Diff.selectSibling(insertElementNode(node, log), 1))), -1);

const insertUnindexedElement = (node, log) => Diff.selectSibling(populateUnindexedElement(node, setSettings$1(node, Diff.selectSibling(insertElementNode(node, log), 1))), -1);

const populateIndexedElement = (node, log) => Diff.selectParent(insertIndexedChildren(node.children, Diff.selectChildren(log)));

const populateUnindexedElement = (node, log) => Diff.selectParent(insertUnindexedChildren(node.children, Diff.selectChildren(log)));

const insertIndexedFragment = (node, log) => insertIndexedChildren(node.children, log);

const insertUnindexedFragment = (node, log) => insertUnindexedChildren(node.children, log);

const insertIndexedChildren = (children, log) => diffIndexedChildren(empty$1, children, log);

const insertUnindexedChildren = (children, log) => diffUnindexedChildren(empty$1, children, log);

const insertThunk = (thunk, log) => insertNode(thunk.force(), log);

const insertTagged = (tagged, log) => insertNode(tagged.node, log);

const replaceWithText = (node, log) => Diff.replaceWithText(log, node.data);

const replaceWithComment = (node, log) => Diff.replaceWithComment(log, node.data);

const replaceWithElementNode = (node, log) => {
  const { localName, namespaceURI } = node;
  const out = namespaceURI == null ? Diff.replaceWithElement(log, localName) : Diff.replaceWithElementNS(log, namespaceURI, localName);
  return out;
};

const replaceWithUnindexedElement = (node, log) => populateUnindexedElement(node, setSettings$1(node, replaceWithElementNode(node, log)));

const replaceWithIndexedElement = (node, log) => populateIndexedElement(node, setSettings$1(node, replaceWithElementNode(node, log)));

const replaceWithThunk = (thunk, log) => replaceWithNode(thunk.force(), log);

const replaceWithTagged = (tagged, log) => replaceWithNode(tagged.node, log);

const replaceWithIndexedFragment = (node, log) => insertIndexedFragment(node, Diff.removeNextSibling(Diff.selectSibling(log, -1)));

const replaceWithUnindexedFragment = (node, log) => insertUnindexedFragment(node, Diff.removeNextSibling(Diff.selectSibling(log, -1)));

const replaceWithNode = (node, log) => {
  switch (node.nodeType) {
    case nodeType.TEXT_NODE:
      {
        return replaceWithText(node, log);
      }
    case nodeType.COMMENT_NODE:
      {
        return replaceWithComment(node, log);
      }
    case nodeType.ELEMENT_NODE:
      {
        return replaceWithUnindexedElement(node, log);
      }
    case nodeType.INDEXED_ELEMENT_NODE:
      {
        return replaceWithIndexedElement(node, log);
      }
    case nodeType.THUNK_NODE:
      {
        return replaceWithThunk(node, log);
      }
    case nodeType.TAGGED_ELEMENT_NODE:
      {
        return replaceWithTagged(node, log);
      }
    case nodeType.INDEXED_FRAGMENT_NODE:
      {
        return replaceWithIndexedFragment(node, log);
      }
    case nodeType.UNINDEXED_FRAGMENT_NODE:
      {
        return replaceWithUnindexedFragment(node, log);
      }
    default:
      {
        return unreachable(node);
      }
  }
};

const insertNode = (node, log) => {
  switch (node.nodeType) {
    case nodeType.TEXT_NODE:
      {
        return Diff.insertText(log, node.data);
      }
    case nodeType.COMMENT_NODE:
      {
        return Diff.insertComment(log, node.data);
      }
    case nodeType.ELEMENT_NODE:
      {
        return insertUnindexedElement(node, log);
      }
    case nodeType.INDEXED_ELEMENT_NODE:
      {
        return insertIndexedElement(node, log);
      }
    case nodeType.THUNK_NODE:
      {
        return insertThunk(node, log);
      }
    case nodeType.TAGGED_ELEMENT_NODE:
      {
        return insertTagged(node, log);
      }
    case nodeType.INDEXED_FRAGMENT_NODE:
      {
        return insertIndexedFragment(node, log);
      }
    case nodeType.UNINDEXED_FRAGMENT_NODE:
      {
        return insertUnindexedFragment(node, log);
      }
    default:
      {
        return unreachable(node);
      }
  }
};

const diffThunk = (last, next, log) => {
  const { args: lastArgs, render: lastRender } = last;
  const { args: nextArgs, render: nextRender } = next;
  const equal = lastRender === nextRender && lastArgs.length === nextArgs.length && lastArgs[0] === nextArgs[0] && lastArgs[1] === nextArgs[1] && lastArgs[2] === nextArgs[2] && lastArgs[3] === nextArgs[3] && lastArgs[4] === nextArgs[4] && lastArgs[5] === nextArgs[5] && lastArgs[6] === nextArgs[6] && lastArgs[7] === nextArgs[7] && lastArgs[8] === nextArgs[8];

  if (equal) {
    next.node = last.node;
    return log;
  } else {
    return diffNode(last.force(), next.force(), log);
  }
};

const diffTagged = (last, next, log) => {
  return diffNode(last.node, next.node, log);
};

const diffNode = (last, next, log) => {
  if (last === next) {
    return log;
  } else {
    switch (next.nodeType) {
      case nodeType.TEXT_NODE:
        {
          switch (last.nodeType) {
            case nodeType.TEXT_NODE:
              return diffText(last, next, log);
            case nodeType.INDEXED_FRAGMENT_NODE:
              return insertText(next, removeFragment(last, log));
            case nodeType.UNINDEXED_FRAGMENT_NODE:
              return insertText(next, removeFragment(last, log));
            default:
              return replaceWithText(next, log);
          }
        }
      case nodeType.COMMENT_NODE:
        {
          switch (last.nodeType) {
            case nodeType.COMMENT_NODE:
              return diffComment(last, next, log);
            case nodeType.INDEXED_FRAGMENT_NODE:
              return insertComment(next, removeFragment(last, log));
            case nodeType.UNINDEXED_FRAGMENT_NODE:
              return insertComment(next, removeFragment(last, log));
            default:
              return replaceWithComment(next, log);
          }
        }
      case nodeType.ELEMENT_NODE:
        {
          switch (last.nodeType) {
            case nodeType.ELEMENT_NODE:
              return diffUnindexedElement(last, next, log);
            case nodeType.INDEXED_FRAGMENT_NODE:
              return insertUnindexedElement(next, removeFragment(last, log));
            case nodeType.UNINDEXED_FRAGMENT_NODE:
              return insertUnindexedElement(next, removeFragment(last, log));
            default:
              return replaceWithUnindexedElement(next, log);
          }
        }
      case nodeType.INDEXED_ELEMENT_NODE:
        {
          switch (last.nodeType) {
            case nodeType.INDEXED_ELEMENT_NODE:
              return diffIndexedElement(last, next, log);
            case nodeType.INDEXED_FRAGMENT_NODE:
              return insertIndexedElement(next, removeFragment(last, log));
            case nodeType.UNINDEXED_FRAGMENT_NODE:
              return insertIndexedElement(next, removeFragment(last, log));
            default:
              return replaceWithIndexedElement(next, log);
          }
        }
      case nodeType.THUNK_NODE:
        {
          switch (last.nodeType) {
            case nodeType.THUNK_NODE:
              return diffThunk(last, next, log);
            case nodeType.INDEXED_FRAGMENT_NODE:
              return insertThunk(next, removeFragment(last, log));
            case nodeType.UNINDEXED_FRAGMENT_NODE:
              return insertThunk(next, removeFragment(last, log));
            default:
              return replaceWithThunk(next, log);
          }
        }
      case nodeType.TAGGED_ELEMENT_NODE:
        {
          switch (last.nodeType) {
            case nodeType.TAGGED_ELEMENT_NODE:
              return diffTagged(last, next, log);
            case nodeType.INDEXED_FRAGMENT_NODE:
              return insertTagged(next, removeFragment(last, log));
            case nodeType.UNINDEXED_FRAGMENT_NODE:
              return insertTagged(next, removeFragment(last, log));
            default:
              return replaceWithTagged(next, log);
          }
        }
      case nodeType.INDEXED_FRAGMENT_NODE:
        {
          switch (last.nodeType) {
            case nodeType.INDEXED_FRAGMENT_NODE:
              return diffIndexedFragment(last, next, log);
            case nodeType.UNINDEXED_FRAGMENT_NODE:
              return insertIndexedFragment(next, removeFragment(last, log));
            default:
              return replaceWithIndexedFragment(next, log);
          }
        }
      case nodeType.UNINDEXED_FRAGMENT_NODE:
        {
          switch (last.nodeType) {
            case nodeType.UNINDEXED_FRAGMENT_NODE:
              return diffUnindexedFragment(last, next, log);
            case nodeType.INDEXED_FRAGMENT_NODE:
              return insertUnindexedFragment(next, removeFragment(last, log));
            default:
              return replaceWithUnindexedFragment(next, log);
          }
        }
      default:
        {
          return unreachable(next);
        }
    }
  }
};

const diffText = (last, next, log) => {
  if (last == null) {
    return insertText(next, log);
  } else if (last.data === next.data) {
    return log;
  } else {
    return diffTextData(last.data, next.data, log);
  }
};

const diffComment = (last, next, log) => {
  if (last == null) {
    return insertComment(next, log);
  } else if (last.data === next.data) {
    return log;
  } else {
    return diffTextData(last.data, next.data, log);
  }
};

const diffTextData = (last, next, log) => {
  const nextLength = next.length;
  const lastLength = last.length;
  if (nextLength <= 6) {
    return Diff.setTextData(log, next);
  } else if (lastLength > nextLength) {
    const index = last.indexOf(next);
    if (index === -1) {
      return Diff.setTextData(log, next);
    } else {
      return Diff.editTextData(log, index, lastLength - index - nextLength, "", "");
    }
  } else {
    const index = next.indexOf(last);
    if (index === -1) {
      return Diff.setTextData(log, next);
    } else {
      return Diff.editTextData(log, 0, 0, next.substr(0, index), next.substr(index + last.length));
    }
  }
};

const diffUnindexedElement = (last, next, log) => {
  if (next.localName === last.localName && next.namespaceURI === last.namespaceURI) {
    return Diff.selectParent(diffUnindexedChildren(last.children, next.children, Diff.selectChildren(diffSettings(last, next, log))));
  } else {
    return replaceWithUnindexedElement(next, log);
  }
};

const diffUnindexedFragment = (last, next, log) => diffUnindexedChildren(last.children, next.children, log);

const diffUnindexedChildren = (last, next, log) => {
  let index = 0;
  while (index >= 0) {
    const lastChild = last[index];
    const nextChild = next[index];

    // If last and next versions contain a child for the given index, just
    // diff them and move on.
    if (lastChild != null && nextChild != null) {
      log = diffNode(lastChild, nextChild, Diff.selectSibling(log, 1));
      index += 1;
      // If child is present in next version but not in the last version
      // insert it and select it.
    } else if (nextChild != null) {
      log = Diff.selectSibling(insertNode(nextChild, log), 1);
      index += 1;
      // If child is present in last version but isn't present in new version
      // remove child
    } else if (lastChild != null) {
      log = Diff.removeNextSibling(log);
      index += 1;
    } else {
      index = -1;
    }
  }

  return log;
};

const diffIndexedElement = (last, next, log) => {
  if (next.localName === last.localName && next.namespaceURI === next.namespaceURI) {
    return Diff.selectParent(diffIndexedChildren(last.children, next.children, Diff.selectChildren(diffSettings(last, next, log))));
  } else {
    return replaceWithIndexedElement(next, log);
  }
};

const diffIndexedFragment = (last, next, log) => diffIndexedChildren(last.children, next.children, log);

const diffIndexedChildren = (last, next, diff) => {
  const table = Table.create(last, next);
  const edits = table.get(next.length, last.length).toArray();
  const stash = {};
  const shifted = {};

  let index = 0;
  for (let edit of edits) {
    switch (edit) {
      case Delete:
        {
          const key = last[index][0];
          if (table.next[key] == null) {
            diff == Diff.removeNextSibling(diff);
          } else if (shifted[key] == null) {
            stash[key] = diff.address;
            diff = Diff.stashNextSibling(diff, diff.address);
          }
          index++;
          break;
        }
      case Retain:
        {
          const [key, node] = last[index];
          diff = diffNode(node, table.next[key], Diff.selectSibling(diff, 1));
          index++;
          break;
        }
      default:
        {
          const key = edit;
          if (table.last[key] == null) {
            diff = insertNode(table.next[key], diff);
            diff = Diff.selectSibling(diff, 1);
          } else {
            if (stash[key] == null) {
              shifted[key] = true;
              diff = Diff.shiftSiblings(diff, table.last[key] - index);
              diff = Diff.selectSibling(diff, 1);
            } else {
              diff = Diff.insertStashedNode(diff, stash[key]);
              diff = Diff.selectSibling(diff, 1);
            }
          }
        }
    }
  }

  return diff;
};

const setSettings$1 = (node, log) => {
  const v1 = log;
  const v2 = diffProperties(blank$1, node.properties, v1);
  const v3 = diffAttributes(blank$1, node.attributes, v2);
  const v4 = diffStyle(blank$1, node.style, v3);
  const v5 = diffListeners(blank$1, node.listeners, v4);
  return v5;
};

const diffSettings = (last, next, log) => {
  const v1 = log;
  const v2 = diffProperties(last.properties, next.properties, v1);
  const v3 = diffAttributes(last.attributes, next.attributes, v2);
  const v4 = diffStyle(last.style, next.style, v3);
  const v5 = diffListeners(last.listeners, next.listeners, v4);
  return v5;
};

const diffProperties = (last, next, log) => {
  for (let name in last) {
    if (!(name in next)) {
      log = Diff.deleteProperty(log, name);
    }
  }

  for (let name in next) {
    const value = next[name];
    if (last[name] !== value) {
      if (value === undefined) {
        log = Diff.deleteProperty(log, name);
      } else {
        log = Diff.assignProperty(log, name, value);
      }
    }
  }

  return log;
};

const diffAttributes = (last, next, log) => {
  for (let key in last) {
    if (!(key in next)) {
      const attribute = last[key];
      if (attribute != null) {
        const { name, namespaceURI } = attribute;
        if (namespaceURI == null) {
          log = Diff.removeAttribute(log, name);
        } else {
          log = Diff.removeAttributeNS(log, namespaceURI, name);
        }
      }
    }
  }

  for (let key in next) {
    const attribute = next[key];
    if (attribute != null) {
      const { namespaceURI, name, value } = attribute;
      const x = last[key];
      if (x == null || x.value !== value) {
        if (namespaceURI == null) {
          if (value == null) {
            log = Diff.removeAttribute(log, name);
          } else {
            log = Diff.setAttribute(log, name, value);
          }
        } else {
          if (value == null) {
            log = Diff.removeAttributeNS(log, namespaceURI, name);
          } else {
            log = Diff.setAttributeNS(log, namespaceURI, name, value);
          }
        }
      }
    }
  }

  return log;
};

const diffStyle = (last, next, log) => {
  for (let name in last) {
    if (name !== "settingType") {
      if (!(name in next) && last[name] != null) {
        log = Diff.removeStyleRule(log, name);
      }
    }
  }

  for (let name in next) {
    if (name != "settingType") {
      const value = next[name];
      const lastValue = last[name];
      if (lastValue !== value) {
        if (value == null) {
          if (lastValue != null) {
            log = Diff.removeStyleRule(log, name);
          }
        } else {
          log = Diff.setStyleRule(log, name, value);
        }
      }
    }
  }

  return log;
};

const isEqualListeners = (last, next) => {
  return last.type === next.type && last.capture === next.capture && JSON.stringify(last.decoder) === JSON.stringify(next.decoder);
};

const diffListeners = (last, next, log) => {
  for (let name in last) {
    if (!(name in next)) {
      const listener = last[name];
      if (listener) {
        const { type, capture, decoder } = listener;
        log = Diff.removeEventDecoder(log, type, decoder, capture);
      }
    }
  }

  for (let name in next) {
    const nextListener = next[name];
    const lastListener = last[name];

    const [remove, add] = lastListener && !nextListener ? [lastListener, null] : !lastListener && nextListener ? [null, nextListener] : lastListener && nextListener && isEqualListeners(lastListener, nextListener) ? [null, null] : [lastListener, nextListener];

    if (remove) {
      const { type, capture, decoder } = remove;
      log = Diff.removeEventDecoder(log, type, decoder, capture);
    }
    if (add) {
      const { type, capture, decoder } = add;
      log = Diff.addEventDecoder(log, type, decoder, capture);
    }
  }

  return log;
};

/**
 * Library for representing the `Result` of a computation that may fail. Which
 * is a more type friendly way to handle errors than exceptions.
 */

const anArticle = /^(a|e[^u]|i|o|u)/i;

class Error$2 {
  static decode(decoder, input) {
    if (decoder instanceof Error$2) {
      return decoder;
    } else {
      return new Error$2(decoder.message);
    }
  }
  constructor(description = "") {
    this.name = "Error";
    this.type = "Error";

    if (description !== "") {
      this.description = description;
    }
  }
  describe(context) {
    return `${this.where(context)}${this.description}`;
  }
  where(context) {
    const result = context == `` ? `` : ` at ${context}`;

    return result;
  }
  toJSON() {
    return {
      type: "Error",
      message: this.message
    };
  }
}

// Flow cannot safely type getter and setter properties, so using them is an
// error by default. It is possible to set a setting to allow them but then
// every signle user (direct or intderect) will have to enable it for themselfs
// and may even shoot themselvs in the foot. There for instead we just trick
// flow into thinking it's a regular property, that way computation of the
// error messages is deferred until it's being used. For details see:
// https://flow.org/en/docs/config/options/#toc-unsafe-enable-getters-and-setters-boolean
Object.defineProperties(Error$2.prototype, {
  message: {
    enumerable: true,
    configurable: true,
    get() {
      const value = this.describe("");
      Object.defineProperty(this, "message", {
        enumerable: true,
        configurable: false,
        writable: false,
        value
      });
      return value;
    }
  }
});

const articleFor = word => anArticle.test(word) ? "an" : "a";
const serialize = value => {
  switch (typeof value) {
    case "boolean":
      return `${String(value)}`;
    case "string":
      return JSON.stringify(value);
    case "number":
      return `${value}`;
    case "undefined":
      return "undefined";
    case "symbol":
      return value.toString();
    case "function":
      {
        try {
          return `${value.toString()}`;
        } catch (_) {
          return `function() {/*...*/}`;
        }
      }
    case "object":
    default:
      {
        if (value === null) {
          return `null`;
        } else {
          try {
            const json = JSON.stringify(value);
            switch (json.charAt(0)) {
              case "{":
                return json;
              case "[":
                return json;
              case "t":
                return `new Boolean(true)`;
              case "f":
                return `new Boolean(false)`;
              case '"':
                return `new String(${json})`;
              default:
                return `new Number(${json})`;
            }
          } catch (_) {
            return `{/*...*/}`;
          }
        }
      }
  }
};

class TypeError$1 extends Error$2 {
  constructor(expect, actual, article = articleFor(expect)) {
    super();
    this.name = "TypeError";
    this.actual = actual;
    this.expect = expect;
    this.article = article;
  }
  describe(context) {
    const where = this.where(context);
    const actual = serialize(this.actual);
    const expect = `${this.article} ${this.expect}`;

    return `Expecting ${expect}${where} but instead got: \`${actual}\``;
  }
}

class MissmatchError extends Error$2 {
  constructor(actual, expect) {
    super();
    this.actual = actual;
    this.expect = expect;
  }
  describe(context) {
    const where = this.where(context);
    const actual = serialize(this.actual);
    const expect = serialize(this.expect);

    return `Expecting \`${expect}\`${where} but instead got: \`${actual}\``;
  }
}

class ThrownError extends Error$2 {
  constructor(exception) {
    super();
    this.name = "ThrowError";
    this.exception = exception;
  }
  describe(context) {
    return `An exception was thrown by ${context}: ${this.exception.message}`;
  }
}

const StringConstructor = "".constructor;

class String$2 {
  constructor() {
    this.type = "String";
  }

  static decode(input) {
    if (typeof input === "string") {
      return input;
    } else if (input instanceof StringConstructor) {
      return `${input}`;
    } else {
      return new TypeError$1("String", input);
    }
  }
}

class Boolean$1 {
  constructor() {
    this.type = "Boolean";
  }

  static decode(input) {
    if (input === true) {
      return true;
    } else if (input === false) {
      return false;
    } else {
      return new TypeError$1("Boolean", input);
    }
  }
}

const truncate = value => value | 0;

class Integer$1 {
  constructor() {
    this.type = "Integer";
  }

  static decode(input) {
    // Note that if `Number.isInteger(x)` returns `true` we know that `x` is an
    // integer number, but flow can not infer that, there for we trick flow into
    // thinking we also perform typeof input === "number" so it can narrow down
    // type to a number.
    if (Number.isInteger(input) && typeof input === "number") {
      return truncate(input);
    } else {
      return new TypeError$1("Integer", input);
    }
  }
}

const toFloat = value => value;

class Float$1 {
  constructor() {
    this.type = "Float";
  }

  static decode(input) {
    // Note that if `Number.isFinite(x)` returns `true` we know that `x` is a
    // finite number, but flow can't infer it there for we trick flow into
    // thinking that we also check typeof input === "number" so it will narrow
    // the type down to number
    if (Number.isFinite(input) && typeof input === "number") {
      return toFloat(input);
    } else {
      return new TypeError$1("Float", input);
    }
  }
}

class Optional {
  static decode(decoder, input) {
    const value = decode$1(decoder, input);
    if (value instanceof Error$2) {
      if (input == null) {
        return null;
      } else {
        return value;
      }
    } else {
      return value;
    }
  }
  constructor(decoder) {
    this.type = "Optional";

    this.optional = decoder;
  }
}

class FieldError extends Error$2 {
  constructor(field, problem) {
    super();
    this.name = "FieldError";
    this.field = field;
    this.problem = problem;
  }
  describe(context) {
    const where = context === "" ? "input" : context;
    return this.problem.describe(`${where}["${this.field}"]`);
  }
}

class Field {
  constructor(name, field) {
    this.type = "Field";

    this.name = name;
    this.field = field;
  }
  static decode(name, field, input) {
    switch (typeof input) {
      case "function":
      case "object":
        {
          if (input === null) {
            break;
          } else {
            try {
              const value = decode$1(field, input[name]);
              if (value instanceof Error$2) {
                if (name in input) {
                  return new FieldError(name, value);
                } else {
                  break;
                }
              } else {
                return value;
              }
            } catch (error) {
              return new FieldError(name, new ThrownError(error));
            }
          }
        }
    }
    return new TypeError$1(`object with a field named '${name}'`, input);
  }
}

class RecordReader {
  constructor(fields) {
    this.type = "Record";

    this.fields = fields;
  }
  static decode(fields, input) {
    if (typeof input === "object" && input !== null) {
      const result = {};
      for (let key of Object.keys(fields)) {
        try {
          const value = decode$1(fields[key], input[key]);
          if (value instanceof Error$2) {
            return new FieldError(key, value);
          } else {
            result[key] = value;
          }
        } catch (error) {
          return new FieldError(key, new ThrownError(error));
        }
      }
      return result;
    } else {
      return new TypeError$1("object", input);
    }
  }
}

class Form {
  constructor(form) {
    this.type = "Form";

    this.form = form;
  }
  static decode(form, input) {
    const record = {};
    for (let key of Object.keys(form)) {
      const value = decode$1(form[key], input);
      if (value instanceof Error$2) {
        return value;
      } else {
        record[key] = value;
      }
    }
    return record;
  }
}

class IndexError extends Error$2 {
  constructor(index, problem) {
    super();
    this.name = "IndexError";
    this.index = index;
    this.problem = problem;
  }
  describe(context) {
    const where = context === "" ? "input" : context;
    return this.problem.describe(`${where}[${this.index}]`);
  }
}

class Index {
  constructor(index, member) {
    this.type = "Index";

    this.index = index;
    this.member = member;
  }
  static decode(index, member, input) {
    if (!Array.isArray(input)) {
      return new TypeError$1("array", input);
    } else if (index >= input.length) {
      return new TypeError$1(`longer (>=${index + 1}) array`, input);
    } else {
      try {
        const value = decode$1(member, input[index]);
        if (value instanceof Error$2) {
          return new IndexError(index, value);
        } else {
          return value;
        }
      } catch (error) {
        return new IndexError(index, new ThrownError(error));
      }
    }
  }
}

class Array$1 {
  constructor(decoder) {
    this.type = "Array";

    this.array = decoder;
  }
  static decode(decoder, input) {
    if (Array$1.isArray(input)) {
      let index = 0;
      const array = [];
      for (let element of input) {
        const value = decode$1(decoder, element);
        if (value instanceof Error$2) {
          return new IndexError(index, value);
        } else {
          array[index] = value;
        }
        index++;
      }
      return array;
    } else {
      return new TypeError$1("Array", input);
    }
  }
}
Array$1.isArray = [].constructor.isArray;

class AccessorError extends Error$2 {
  constructor(accessor, problem) {
    super();
    this.name = "AccessorError";
    this.accessor = accessor;
    this.problem = problem;
  }
  describe(context) {
    const where = context === "" ? "input" : context;
    return this.problem.describe(`${where}["${this.accessor}"]()`);
  }
}

class Accessor {
  constructor(name, decoder) {
    this.type = "Accessor";

    this.name = name;
    this.accessor = decoder;
  }
  static decode(name, accessor, input) {
    if (typeof input === "object" && input != null && name in input) {
      const object = input;
      try {
        if (typeof object[name] === "function") {
          const value = decode$1(accessor, object[name]());
          if (value instanceof Error$2) {
            return new AccessorError(name, value);
          } else {
            return value;
          }
        } else {
          return new FieldError(name, new TypeError$1("function", object[name]));
        }
      } catch (error) {
        return new AccessorError(name, new ThrownError(error));
      }
    } else {
      return new TypeError$1(`object with a method named '${name}'`, input);
    }
  }
}

class DictionaryReader {
  constructor(decoder) {
    this.type = "Dictionary";

    this.dictionary = decoder;
  }
  static decode(decoder, input) {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return new TypeError$1("object", input);
    } else {
      const dictionary = Object.create(null);
      for (let key in input) {
        try {
          const value = decode$1(decoder, input[key]);
          if (value instanceof Error$2) {
            return new FieldError(key, value);
          } else {
            dictionary[key] = value;
          }
        } catch (error) {
          return new FieldError(key, new ThrownError(error));
        }
      }
      return dictionary;
    }
  }
}

class EitherError extends Error$2 {
  constructor(problems) {
    super();
    this.name = "EitherError";
    this.problems = problems;
  }
  describe(context) {
    const { problems } = this;
    const descriptions = problems.map(problem => problem.describe(context)).join("\n");
    const where = this.where(context);

    return `Ran into the following problems${where}:\n\n${descriptions}`;
  }
}

class Either {
  constructor(decoders) {
    this.type = "Either";

    this.either = decoders;
  }
  static decode(either, input) {
    let problems = null;
    for (let decoder of either) {
      const value = decode$1(decoder, input);
      if (value instanceof Error$2) {
        problems = problems == null ? [value] : (problems.push(value), problems);
      } else {
        return value;
      }
    }

    return new EitherError(problems || []);
  }
}

class Null {
  constructor(Null) {
    this.type = "Null";

    this.Null = Null;
  }
  static decode(Null, input) {
    if (input === null) {
      return Null;
    } else {
      return new TypeError$1("null", input);
    }
  }
}

class Undefined {
  constructor(Undefined) {
    this.type = "Undefined";

    this.Undefined = Undefined;
  }
  static decode(Undefined, input) {
    if (input === undefined) {
      return Undefined;
    } else {
      return new TypeError$1("undefined", input);
    }
  }
}

class Ok$1 {
  static decode(value, input) {
    return value;
  }
  constructor(value) {
    this.type = "Ok";

    this.value = value;
  }
}

class And {
  constructor(left, right) {
    this.type = "And";

    this.left = left;
    this.right = right;
  }
  static decode(left, right, input) {
    const result = decode$1(left, input);
    if (result instanceof Error$2) {
      return result;
    } else {
      return decode$1(right, input);
    }
  }
}

const matches = (actual, expected) => {
  if (actual === expected) {
    return true;
  } else {
    if (actual && typeof actual === "object" && expected && typeof expected === "object") {
      if (Array.isArray(expected)) {
        if (Array.isArray(actual)) {
          const count = expected.length;
          let index = 0;
          let isMatch = count <= actual.length;
          while (isMatch && index < count) {
            isMatch = matches(actual[index], expected[index]);
            index++;
          }
          return isMatch;
        } else {
          return false;
        }
      } else {
        for (const key in expected) {
          if (Object.prototype.hasOwnProperty.call(expected, key)) {
            if (!matches(actual[key], expected[key])) {
              return false;
            }
          }
        }
        return true;
      }
    } else {
      return false;
    }
  }
};

class Match {
  constructor(match) {
    this.type = "Match";

    this.match = match;
  }
  static decode(match, input) {
    if (matches(input, match)) {
      return match;
    } else {
      return new MissmatchError(input, match);
    }
  }
}

const decode$1 = (decoder, input) => {
  switch (decoder.type) {
    case "Accessor":
      {
        return Accessor.decode(decoder.name, decoder.accessor, input);
      }
    case "Either":
      {
        return Either.decode(decoder.either, input);
      }
    case "Array":
      {
        return Array$1.decode(decoder.array, input);
      }
    case "Dictionary":
      {
        return DictionaryReader.decode(decoder.dictionary, input);
      }
    case "Maybe":
      {
        return Maybe.decode(decoder.maybe, input);
      }
    case "Optional":
      {
        return Optional.decode(decoder.optional, input);
      }
    case "Float":
      {
        return Float$1.decode(input);
      }
    case "Integer":
      {
        return Integer$1.decode(input);
      }
    case "String":
      {
        return String$2.decode(input);
      }
    case "Boolean":
      {
        return Boolean$1.decode(input);
      }
    case "Record":
      {
        return RecordReader.decode(decoder.fields, input);
      }
    case "Form":
      {
        return Form.decode(decoder.form, input);
      }
    case "Error":
      {
        return Error$2.decode(decoder, input);
      }
    case "Ok":
      {
        return Ok$1.decode(decoder.value, input);
      }
    case "Field":
      {
        return Field.decode(decoder.name, decoder.field, input);
      }
    case "Index":
      {
        return Index.decode(decoder.index, decoder.member, input);
      }
    case "Null":
      {
        return Null.decode(decoder.Null, input);
      }
    case "Undefined":
      {
        return Undefined.decode(decoder.Undefined, input);
      }
    case "Match":
      {
        return Match.decode(decoder.match, input);
      }
    case "And":
      {
        return And.decode(decoder.left, decoder.right, input);
      }
    default:
      {
        return unreachable(decoder);
      }
  }
};

class Maybe {
  static decode(decoder, input) {
    const value = decode$1(decoder, input);
    if (value instanceof Error$2) {
      if (input == null) {
        return value;
      } else {
        return null;
      }
    } else {
      return value;
    }
  }
  constructor(decoder) {
    this.type = "Maybe";

    this.maybe = decoder;
  }
}

/**
 * Parses given `input` string into a JSON value and then runs given
 * `Decoder<a>` on it. Returns `Result` with `Result.Error<Decoder.ParseError>`
 * if the string is not well-formed JSON or `Result.Error<Decoder.Error>` if
 * the value can't be decoded with a given `Decoder<a>`. If operation is
 * successfull returns `Result.Ok<a>`.
 */


/**
 * Runs given `Decoder<a>` on a given JSON value. Returns `Result` that either
 * contains `Decoder.Error` if value can't be decoded with a given decoder or
 * a `Result.Ok<a>`.
 */


const String$1 = new String$2();

const Boolean$$1 = new Boolean$1();

const Float$$1 = new Float$1();

const Integer$$1 = new Integer$1();

const ok$1 = value => new Ok$1(value);

const error$1 = reason => new Error$2(reason);

const field = (name, decoder) => new Field(name, decoder);

const at = (path, decoder) => path.reduceRight((decoder, name) => field(name, decoder), decoder);

const index = (index, decoder) => new Index(index, decoder);

const accessor = (name, decoder) => new Accessor(name, decoder);

const either = (...decoders) => new Either(decoders);



const and$1 = (left, right) => new And(left, right);

const maybe = decoder => new Maybe(decoder);

const array = decoder => new Array$1(decoder);

const dictionary = decoder => new DictionaryReader(decoder);

const form = fields => new Form(fields);

const record = fields => new RecordReader(fields);

const optional = decoder => new Optional(decoder);

const annul = value => new Null(value);

const avoid = value => new Undefined(value);

const match = value => new Match(value);

const empty$3 = Object.freeze([]);

/**
 * Dictionary class used across the library to create `Dict` instances.
 */
const Dictionary = function Dictionary() {};

/**
 * Library provides APIs to work with a dictionary mapping of unique string
 * keys to values.
 */

/**
 * Dictionary of keys and values. `Dict<User>` is a dictionary that lets
 * you look up a `User` by a `string` key (such as user names).
 */

Dictionary.prototype = Object.freeze(Object.create(null));

/**
 * Creates an empty dictionary.
 *
 * ```js
 * const v0 = Dictionary.empty()
 * v0 // => ({}:Dict<*>)
 * const v1 = Dictionary.set('Jack', 1, v0)
 * v1 // => ({"Jack": 1}:Dict<number>)
 * const v2 = Dictionary.set('Jane', 'Jane', v1)
 * v2 // => ({"Jack": 1, "Jane": "Jane"}:Dict<number|string>)
 * ```
 *
 * Notice that type of values dictionary holds is open and get's extended based
 * on usage, this is actualy very useful in practice. That being said sometimes
 * you'd want to put bounds to what dictionary holds ahead you could do it in
 * multiple ways:
 * 
 * ##### Anotate binding
 * 
 * ```js
 * const v3:Dict<number> = Dictionary.empty()
 * v3 // => ({}:Dict<number>)
 * const v4 = Dictionary.set('Jack', 1, v3)
 * v4 // => ({"Jack": 1}:Dict<number>)
 * const v5 = Dictionary.set('Jane', 'Jane', v1)
 * ```
 * 
 * ##### Enclose in typed function
 * ```js
 * const enumerate = (...keys:string[]):Dict<number> => {
 *   let dict = empty()
 *   let index = 0
 *   for (let key of keys) {
 *     dict = set(key, index++, dict)
 *   }
 *   return dict
 * }
 * ```
 */
const empty$4 = () => new Dictionary();

/**
 * Create a dictionary with one entry of given key, value pair.
 *
 * ```js
 * Dictionary.singleton('Zoe', 15) // => ({Zoe: 15}:Dict<number>)
 * Dictionary.singleton('a', {foo:"bar"}) // => ({a: {foo:"bar"}}:Dict<{foo:string}>)
 * ```
 * 
 * Note that as with `empty` returned dictionary has open type for values.
 */
const singleton$1 = (key, value) => {
  const result = new Dictionary();
  result[key] = value;
  return result;
};

/**
 * Create a dictionary from iterable of `[key, value]` pairs
 *
 * ```js
 * Dictionary.fromEntries([
 *    ['Zoe', 17],
 *    ['Sandro', 18]
 * ]) // => ({Zoe: 17, Sandro: 18}:Dict<number>)
 *
 * Dictionary
 *  .fromEntries((db:Map<string, User>)).entries()) // => ({...}:Dict<User>)
 * ```
 */


/**
 * Insert an entry under the given key with a gievn value into a dictionary.
 * Replaces value of the entry if there was one under that key.
 *
 * ```js
 * const v0 = Dictionary.fromEntries([["a", 1]])
 * v0 // => ({a:1}:Dict<number>)
 *
 * // Add
 * const v1 = Dictionary.set("b", 2, v0)
 * v1 // => ({a:1, b:2}:Dict<number>)
 *
 * // Replace
 * const v2 = Dictionary.set("b", 15, v1)
 * v2 // => ({a:1, b:15}:Dict<number>)
 * ```
 */
const set$1 = (key, value, dict) => (dict[key] = value, dict);

/**
 * Updates the entry in the dictionary for a given key with a provided
 * `updater` function. If updader returns `Maybe.nothing` entry is
 * removed from the dictionory otherwise it's value is swapped with
 * returned value.
 *
 * ```js
 * const v0 = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * v0 // => ({a:1, b:2}:Dict<number>)
 *
 * const inc = (v: ?number): ?number => (v == null ? 0 : v + 1)
 *
 * // Add
 * const v1 = Dictionary.update("c", inc, v0)
 * v1 // => ({a:1, b:2, c:0}:Dict<number>)
 *
 * // Modify
 * const v2 = Dictionary.update("b", inc, v1)
 * v2 // => ({a:1, b:3, c:0}:Dict<number>)
 *
 * // Delete
 * const v3 = Dictionary.update("b", _ => null, v2)
 * v3 // => ({a:1, c:0}:Dict<number>)
 *
 * const v4 = Dictionary.update("c", _ => undefined, v3)
 * v4 // => ({a:1}:Dict<number>)
 *
 * // NoOp
 * const v5 = Dictionary.update("d", _ => null, v4)
 * v5 // => ({a: 1}:Dict<number>)
 * ```
 */


/**
 * Remove an entry for the given key from a dictionary. If there is no entry
 * for the given key no changes are made.
 *
 * ```js
 * const before = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * before // => ({a: 1, b:2}:Dict<number>)
 * const after = Dictionary.remove("a", before)
 * after // => ({b:2}:Dict<number>)
 * Dictionary.remove("c", after) // => ({b:2}:Dict<number>)
 * ```
 */


/**
 * Determine if there is an entry with a given key is in a dictionary.
 *
 * ```js
 * const dict = Dictionary.singleton("a", 1)
 *
 * Dictionary.has("a", dict) // => true
 * Dictionary.has("b", dict) // => false
 * ```
 */


/**
 * Returns value for the give key in the given dictionary or a default passed-in
 * as a third argument if dictionary has no entry for the give key
 *
 * ```js
 * const animals = Dictionary.fromEntries([["Tom", "Cat"], ["Jerry", "Mouse"]])
 *
 * Dictionary.get("Jerry", animals) // => ("Mouse":string|void)
 * Dictionary.get("Tom", animals, null) // => ("Cat":string|null)
 * Dictionary.get("Tom", animals, "") // => ("Cat":string)
 * Dictionary.get("Spike", animals, null) // => (null:string|null)
 * Dictionary.get("Spike", animals, "") // => ("":string|null)
 * ```
 */


/**
 * Returns an iterable of dictionary `[key, value]` pairs using `for of`
 *
 * ```js
 * const dict = Dictionary.singleton('Car', {color:'blue'})
 *
 * for (let [key, value] of Dictionary.entries(dict)) {
 *    // ...
 * }
 * ```
 */


/**
 * Returns an iterable of dictionary keys that can be iterated over using
 * `for of`
 *
 * ```js
 * const dict = Dictionary.singleton('Bicycle', {color:'red'})
 *
 * for (let key of Dictionary.keys(dict)) {
 *    // ...
 * }
 * ```
 */


/**
 * Returns an iterable of dictionary values that can be iterated over using `for of`
 *
 * ```js
 * const dict = Dictionary.singleton('Horse', {color:'black'})
 *
 * for (let value of Dictionary.values(dict)) {
 *    // ...
 * }
 * ```
 */


/**
 * Maps dictionary entries using given function
 *
 * ```js
 * const before = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * before // => ({a: 1, b: 2}:Dict<number>)
 *
 * const after = Dictionary.map(([k, v]) =>
 *                               [k.toUpperCase(), String(v + 5)], before)
 * after // => ({A:"6", B:"7"}:Dict<string>)
 * ```
 */


/**
 * Keep a dictionary entries that satisfy provided predicate.
 *
 * ```js
 * const before = Dictionary.fromEntries([["a", -1], ["b", 2]])
 * before // => ({a: -1, b: 2}:Dict<number>)
 *
 * const after = Dictionary.filter(([_k, v]) => v > 0, before)
 * after // => ({b: 2}:Dict<number>)
 * ```
 */


/**
 * Partition a dictionary according to a predicate. The first dictionary
 * contains all entries which satisfy the predicate, and the second contains
 * the rest.
 *
 * ```js
 * const all = Dictionary.fromEntries([["a", -1], ["b", 2]])
 * all // => ({a: -1, b: 2}:Dict<number>)
 *
 * const [positive, negative] = Dictionary.partition(([_k, v]) => v > 0, all)
 * positive // => ({b: 2}:Dict<number>)
 * negative // => ({a: -1}:Dict<number>)
 * ```
 */


/**
 * Combine two dictionaries. If there is a collision, preference is given to
 * the first dictionary.
 *
 * ```js
 * const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * left // => ({a:1, b:2}:Dict<number>)
 *
 * const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
 * right // => ({b:18, c:9}:Dict<number>)
 *
 * const union = Dictionary.union(left, right)
 * union // => ({a:1, b:2, c:9}:Dict<number>)
 * ```
 */


/**
 * Keep a entries from left dictionary when right dictionary has entries for
 * the same key.
 *
 * ```js
 * const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * left // => ({a:1, b:2}:Dict<number>)
 *
 * const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
 * right // => ({b:18, c:9}:Dict<number>)
 *
 * const intersect = Dictionary.intersect(left, right)
 * intersect // => ({b:2}:Dict<number>)
 * ```
 */


/**
 * Keep a entries from left dictionary only if right dictionary does not have
 * entry for that key.
 *
 * ```js
 * const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * left // => ({a:1, b:2}:Dict<number>)
 * const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
 * right // => ({b:18, c:9}:Dict<number>)
 * const delta = Dictionary.diff(left, right)
 * delta // => ({a:1}:Dict<number>)
 * ```
 */


/**
 * The most general way of combining two dictionaries. You provide three
 * accumulators for when a given key appears:
 *
 * - Only in the left dictionary.
 * - In both dictionaries.
 * - Only in the right dictionary.
 *
 * You then traverse all the keys from lowest to highest, building up whatever
 * you want.
 *
 * ```js
 * Dictionary.merge(
 *   ([key, left], log):string[] =>
 *      [...log, `- ${key} : ${left}`],
 *   ([key, [left, right]], log):string[] =>
 *      [...log, `= ${key} : ${left} -> ${right}`],
 *   ([key, right], log):string[] =>
 *      [...log, `+ ${key} : ${right}`],
 *   Dictionary.fromEntries([["a", 1], ["b", 2]]),
 *   Dictionary.fromEntries([["b", 18], ["c", 9]]),
 *   []
 * ) // => ['- a : 1', '= b : 2 -> 18', '+ c : 9']
 * ```
 */

const empty = Object.freeze([]);
const blank = empty$4();

class AttributeSetting {
  constructor(namespaceURI, name, value) {
    this.settingType = settingType.attribute;

    this.namespaceURI = namespaceURI;
    this.name = name;
    this.value = value;
  }
}

class ListenerSetting {
  constructor(type, capture, decoder) {
    this.settingType = settingType.listener;

    this.type = type;
    this.capture = capture;
    this.decoder = decoder;
  }
}

class TaggedNode {
  constructor(node, tag) {
    this.nodeType = nodeType.TAGGED_ELEMENT_NODE;

    this.node = node;
    this.tag = tag;
  }
  toDebugString() {
    return `<tagged tag=${this.tag.toString()}>${this.node.toDebugString()}</tagged>`;
  }
  map(tag) {
    return new TaggedNode(this, tag);
  }
}

class ElementNode {
  constructor(namespaceURI, localName) {
    this.attributes = blank;
    this.properties = blank;
    this.style = blank;
    this.listeners = blank;

    this.namespaceURI = namespaceURI;
    this.localName = localName;
  }
  toDebugChildrenString() {
    return "";
  }
  toDebugString() {
    const { localName, namespaceURI } = this;
    const attributes = [];

    if (namespaceURI != null) {
      attributes.push(`xmlns="${namespaceURI}"`);
    }

    for (const key in this.attributes) {
      const attribute = this.attributes[key];
      if (attribute != null && attribute.value != null) {
        attributes.push(`"${attribute.name}"="${attribute.value}"`);
      }
    }

    const properties = [];
    for (const key in this.properties) {
      const value = this.properties[key];
      if (value !== undefined) {
        properties.push(`\`property:${key}\`=\`${JSON.stringify(value)}\``);
      }
    }

    const rules = [];
    for (const name in this.style) {
      if (name !== "settingType") {
        const value = this.style[name];
        if (value != null) {
          rules.push(`${cammelCaseToDashDelimeted(name)}:${value}`);
        }
      }
    }

    const style = rules.length === 0 ? "" : ` style="${rules.join(";")}"`;

    const settings = [...attributes, ...properties].join(" ");
    const details = settings === "" ? style : ` ${settings}${style}`;

    return `<${localName}${details}>${this.toDebugChildrenString()}</${localName}>`;
  }
}

const cammelCaseToDashDelimeted = input => {
  let output = "";
  for (let ch of input) {
    if (ch.toUpperCase() == ch) {
      output += `-${ch.toLowerCase()}`;
    } else {
      output += ch;
    }
  }
  return output;
};

const setSettings = (element, settings) => {
  for (const setting of settings) {
    setSetting(element, setting);
  }
};

const set = (name, value, dict) => dict === blank ? singleton$1(name, value) : set$1(name, value, dict);

const setSetting = (element, setting) => {
  switch (setting.settingType) {
    case settingType.attribute:
      {
        const ns = setting.namespaceURI == null ? "" : `@${setting.namespaceURI}`;
        element.attributes = set(`${setting.name}${ns}`, setting, element.attributes);
        return element;
      }
    case settingType.property:
      {
        element.properties = set(setting.name, setting.value, element.properties);
        return element;
      }
    case settingType.style:
      {
        element.style = element.style === blank ? Object.assign(Object.create(null), setting) : Object.assign(element.style, setting);
        return element;
      }
    case settingType.listener:
      {
        const key = `${setting.type}${setting.capture ? "Capture" : ""}`;
        element.listeners = set(key, setting, element.listeners);

        return element;
      }
    default:
      {
        return unreachable(setting);
      }
  }
};

class UnindexedElementNode extends ElementNode {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.nodeType = nodeType.ELEMENT_NODE, _temp;
  }

  toDebugChildrenString() {
    return this.children.map(child => child.toDebugString()).join("");
  }
  map(tag) {
    return new TaggedNode(this, tag);
  }
}

const setAttribute = (name, value = "") => new AttributeSetting(null, name, value == null ? null : value);





const on$1 = (type, decoder, capture = false) => new ListenerSetting(type, capture, decoder);

const style$1 = rules => {
  const style = rules;
  style.settingType = settingType.style;
  return style;
};





const createElement = (localName, settings = empty, children = empty) => {
  const element = new UnindexedElementNode(null, localName);
  setSettings(element, settings);
  element.children = children;
  return element;
};









const createHost = (settings = empty, children = empty) => createElement("x-host", settings, children);

const element = name => (settings = [], children = []) => createElement(name, settings, children);
const attribute = name => (value = "") => setAttribute(name, value);



const className = attribute("class");

const main = element("main");


const input = element("input");










const div = element("div");












const data = (name, value) => setAttribute(`data-${name}`, value);

const on = type => (decoder, capture = false) => on$1(type, decoder, capture);







const onChange = on("change");





const style = style$1;

const unreachable$2 = value => {
  const format = JSON.stringify(value);
  throw new TypeError(`Internal error: Encountered impossible value: ${format}`);
};

const nofx = new class {
  constructor() {
    this.size = 0;
  }

  and(fx) {
    return fx;
  }
  perform() {}
}();

class BatchFX {
  constructor(effects) {
    this.effects = effects;
    this.size = effects.length;
  }
  perform(process) {
    for (let fx of this.effects) {
      fx.perform(process);
    }
  }
  and(fx) {
    if (fx.size === 0) {
      return this;
    } else {
      return new BatchFX([...this.effects, fx]);
    }
  }
}


const and$2 = (left, right) => left.size === 0 ? right : right.size === 0 ? left : new BatchFX([left, right]);



// const update = match({
//   inc(delta: number, state: number) {
//     return [state + delta, send({ toggle: true })]
//   },
//   dec(delta: number, state: number) {
//     return [state - delta, nofx]
//   },
//   toggle(value: boolean, state: number) {
//     return [state, nofx]
//   },
//   noop(_, state: number) {
//     return [state, nofx]
//   }
// })

// // update(update(0, { inc: 6 }), { toggle: true })
// update({ inc: 6, toggle: true }, 9)

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var performanceNow = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.7.1
(function () {
  var getNanoSeconds, hrtime, loadTime;

  if (typeof performance !== "undefined" && performance !== null && performance.now) {
    module.exports = function () {
      return performance.now();
    };
  } else if (typeof process !== "undefined" && process !== null && process.hrtime) {
    module.exports = function () {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function () {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function () {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function () {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }
}).call(commonjsGlobal);
});

var requestPolyfilledAnimationFrame_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cancelAnimationFrame = exports.requestAnimationFrame = exports.cancelPolyfilledAnimationFrame = exports.requestPolyfilledAnimationFrame = exports.now = undefined;



var _performanceNow2 = _interopRequireDefault(performanceNow);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var now = exports.now = _performanceNow2.default;

var lastTime = now();

var requestPolyfilledAnimationFrame = exports.requestPolyfilledAnimationFrame = function requestPolyfilledAnimationFrame(callback) {
  var time = now();
  var remaining = Math.max(0, 16 - (time - lastTime));
  lastTime = time + remaining;
  return setTimeout(callback, remaining, lastTime);
};

var cancelPolyfilledAnimationFrame = exports.cancelPolyfilledAnimationFrame = function cancelPolyfilledAnimationFrame(id) {
  return clearTimeout(id);
};

var requestAnimationFrame = exports.requestAnimationFrame = typeof window === 'undefined' ? requestPolyfilledAnimationFrame : typeof window.msRequestAnimationFrame === 'function' ? function (callback) {
  return window.msRequestAnimationFrame(callback);
} : typeof window.mozRequestAnimationFrame === 'function' ? function (callback) {
  return window.mozRequestAnimationFrame(callback);
} : typeof window.webkitRequestAnimationFrame === 'function' ? function (callback) {
  return window.webkitRequestAnimationFrame(callback);
} : typeof window.oRequestAnimationFrame === 'function' ? function (callback) {
  return window.oRequestAnimationFrame(callback);
} : requestPolyfilledAnimationFrame;

var cancelAnimationFrame = exports.cancelAnimationFrame = typeof window === 'undefined' ? cancelPolyfilledAnimationFrame : typeof window.msCancelAnimationFrame === 'function' ? function (id) {
  return window.msCancelAnimationFrame(id);
} : typeof window.mozCancelAnimationFrame === 'function' ? function (id) {
  return window.mozCancelAnimationFrame(id);
} : typeof window.webkitCancelAnimationFrame === 'function' ? function (id) {
  return window.webkitCancelAnimationFrame(id);
} : typeof window.oCancelAnimationFrame === 'function' ? function (id) {
  return window.oCancelAnimationFrame(id);
} : typeof window.msCancelRequestAnimationFrame === 'function' ? function (id) {
  return window.msCancelRequestAnimationFrame(id);
} : typeof window.mozCancelRequestAnimationFrame === 'function' ? function (id) {
  return window.mozCancelRequestAnimationFrame(id);
} : typeof window.webkitCancelRequestAnimationFrame === 'function' ? function (id) {
  return window.webkitCancelRequestAnimationFrame(id);
} : typeof window.oCancelRequestAnimationFrame === 'function' ? function (id) {
  return window.oCancelRequestAnimationFrame(id);
} : cancelPolyfilledAnimationFrame;
});

unwrapExports(requestPolyfilledAnimationFrame_1);
var requestPolyfilledAnimationFrame_2 = requestPolyfilledAnimationFrame_1.cancelAnimationFrame;
var requestPolyfilledAnimationFrame_3 = requestPolyfilledAnimationFrame_1.requestAnimationFrame;
var requestPolyfilledAnimationFrame_4 = requestPolyfilledAnimationFrame_1.cancelPolyfilledAnimationFrame;
var requestPolyfilledAnimationFrame_5 = requestPolyfilledAnimationFrame_1.requestPolyfilledAnimationFrame;
var requestPolyfilledAnimationFrame_6 = requestPolyfilledAnimationFrame_1.now;

var preemptiveAnimationFrame = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.forceAnimationFrame = exports.cancelAnimationFrame = exports.requestAnimationFrame = exports.now = undefined;



var RAF = _interopRequireWildcard(requestPolyfilledAnimationFrame_1);

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }newObj.default = obj;return newObj;
  }
}

// Invariants:
// 1. In the NO_REQUEST state, there is never a scheduled animation frame.
// 2. In the PENDING_REQUEST and EXTRA_REQUEST states, there is always exactly
// one scheduled animation frame.
var NO_REQUEST = 0;

var PENDING_REQUEST = 1;
var EXTRA_REQUEST = 2;

var requestID = null;
var nextID = 0;
var state = NO_REQUEST;
var requests = [];
var ids = [];

var absent = new Error('absent');

var now = exports.now = RAF.now;

var requestAnimationFrame = exports.requestAnimationFrame = function requestAnimationFrame(request) {
  if (state === NO_REQUEST) {
    requestID = RAF.requestAnimationFrame(performAnimationFrame);
  }

  var id = ++nextID;
  requests.push(request);
  ids.push(id);
  state = PENDING_REQUEST;
  return id;
};

var cancelAnimationFrame = exports.cancelAnimationFrame = function cancelAnimationFrame(id) {
  var index = ids.indexOf(id);
  if (index >= 0) {
    ids.splice(index, 1);
    requests.splice(index, 1);
  }
};

var forceAnimationFrame = exports.forceAnimationFrame = function forceAnimationFrame() {
  var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : now();

  switch (state) {
    case NO_REQUEST:
      break;
    default:
      if (requestID != null) {
        RAF.cancelAnimationFrame(requestID);
        requestID = null;
      }
      performAnimationFrame(time);
  }
};

var performAnimationFrame = function performAnimationFrame(time) {
  switch (state) {
    case NO_REQUEST:
      // This state should not be possible. How can there be no
      // request, yet somehow we are actively fulfilling a
      // request?
      throw Error('Unexpected frame request');
    case PENDING_REQUEST:
      // At this point, we do not *know* that another frame is
      // needed, but we make an extra frame request just in
      // case. It's possible to drop a frame if frame is requested
      // too late, so we just do it preemptively.
      requestID = RAF.requestAnimationFrame(performAnimationFrame);
      state = EXTRA_REQUEST;
      ids.splice(0);
      dispatchAnimationFrame(requests.splice(0), 0, time);
      break;
    case EXTRA_REQUEST:
      // Turns out the extra request was not needed, so we will
      // stop requesting. No reason to call it all the time if
      // no one needs it.
      state = NO_REQUEST;
      break;
  }
};

var dispatchAnimationFrame = function dispatchAnimationFrame(requests, index, time) {
  var exception = absent;
  var count = requests.length;
  try {
    while (index < count) {
      var request = requests[index];
      index = index + 1;
      request(time);
    }
  } catch (error) {
    exception = error;
  }

  if (index < count) {
    dispatchAnimationFrame(requests, index, time);
  }

  if (exception !== absent) {
    throw exception;
  }
};
});

unwrapExports(preemptiveAnimationFrame);
var preemptiveAnimationFrame_1 = preemptiveAnimationFrame.forceAnimationFrame;
var preemptiveAnimationFrame_2 = preemptiveAnimationFrame.cancelAnimationFrame;
var preemptiveAnimationFrame_3 = preemptiveAnimationFrame.requestAnimationFrame;
var preemptiveAnimationFrame_4 = preemptiveAnimationFrame.now;

class Tick$1 {
  constructor(toMessage) {
    this.size = 1;

    this.toMessage = toMessage;
  }
  perform(process) {
    preemptiveAnimationFrame_3(time => process.send(this.toMessage(time)));
  }
  and(other) {
    return and$2(this, other);
  }
}

var tick = (toMessage => new Tick$1(toMessage));

class Model {
  constructor(n, time) {
    this.n = n;
    this.time = time;
  }
  static new(time = 0, n = 200) {
    return new Model(n, time);
  }
  static updateTime(model, time) {
    if (model.time === time) {
      return model;
    } else {
      return new Model(model.n, time);
    }
  }
  static updateCount(model, n) {
    if (model.n === n) {
      return model;
    } else {
      return new Model(n, model.time);
    }
  }
}

const init = () => [Model.new(), tick(Tick)];

const update = (message, model) => {
  switch (message.type) {
    case "Tick":
      return [Model.updateTime(model, message.time), tick(Tick)];
    case "UpdateCount":
      {
        return [Model.updateCount(model, message.n), nofx];
      }
    default:
      return unreachable$2(message);
  }
};





const Tick = time => ({
  type: "Tick",
  time
});

const UpdateCount = form({
  type: ok$1("UpdateCount"),
  n: at(["target", "valueAsNumber"], Integer$$1)
});



const viewObject = (t, n, x, y) => div([className("object"), style({
  left: `${x}px`,
  top: `${y}px`
})], [viewCircle(t, n, n)]);



const viewLemniscate = (t, n) => {
  var a$$1 = 150;
  var x = a$$1 * Math.sin(t);
  var y = a$$1 * Math.sin(t) * Math.cos(t);
  return viewObject(t, n, x, y);
};

const viewCircle = (t, n, count) => {
  const r = n * 16;
  return div([className(`circle`), data("radius", `${r}`), styleCircle(t, n, r, count)], n == 0 ? [] : [viewCircle(t, n - 1, count)]);
};

const styleCircle = (t, n, r, count) => style({
  borderColor: colorCircle(t, n, count),
  marginLeft: `-${r / 2 + 3}px`,
  marginTop: `-${r / 2 + 3}px`,
  width: `${r}px`,
  height: `${r}px`
});

const colorCircle = (t, n, count) => {
  t /= 3.0;
  const base = getInterpolatedColor("fg", t % 1.0);
  const lightness = 1.0 - n / count;
  return getCSSRGBAColor(base.r, base.g, base.b, lightness);
};

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
      diff$$1 = v - Math.min(r, g, b),
      diffc = function (c) {
    return (v - c) / 6 / diff$$1 + 1 / 2;
  };

  if (diff$$1 === 0) {
    h = s = 0;
  } else {
    s = diff$$1 / v;
    rr = diffc(r);
    gg = diffc(g);
    bb = diffc(b);

    if (r === v) {
      h = bb - gg;
    } else if (g === v) {
      h = 1 / 3 + rr - bb;
    } else if (b === v) {
      h = 2 / 3 + gg - rr;
    }

    if (h < 0) {
      h += 1;
    } else if (h > 1) {
      h -= 1;
    }
  }
  return {
    h: h,
    s: s,
    v: v
  };
}

function hsvToRGB(h, s, v) {
  let [r, g, b] = [0, 0, 0];
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p$$1 = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p$$1;
      break;
    case 1:
      r = q;
      g = v;
      b = p$$1;
      break;
    case 2:
      r = p$$1;
      g = v;
      b = t;
      break;
    case 3:
      r = p$$1;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p$$1;
      b = v;
      break;
    case 5:
      r = v;
      g = p$$1;
      b = q;
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function parseCSSColorToHSV(color) {
  var r = parseInt(color.substr(1, 2), 16);
  var g = parseInt(color.substr(3, 2), 16);
  var b = parseInt(color.substr(5, 2), 16);
  return rgbToHSV(r, g, b);
}

function lerp(a$$1, b, t) {
  return a$$1 + (b - a$$1) * t;
}

function clamp(lo, hi, x) {
  return x < lo ? lo : x > hi ? hi : x;
}

function lerpHSV(a$$1, b, t) {
  var h = lerp(a$$1.h, b.h, t);
  var s = lerp(a$$1.s, b.s, t);
  var v = lerp(a$$1.v, b.v, t);
  //var h = a.h, s = a.s, v = a.v;
  var result = hsvToRGB(h, s, v);
  return result;
}

var palettes = [{
  fg: "#fef6df",
  bg: "#74c3c8"
}, {
  fg: "#fccf74",
  bg: "#41657f"
}, {
  fg: "#d9e0e8",
  bg: "#945d72"
}].map(function (palette) {
  return {
    bg: parseCSSColorToHSV(palette.bg),
    fg: parseCSSColorToHSV(palette.fg)
  };
});

function getInterpolatedColor(which, t) {
  t *= palettes.length;
  var prevIndex = Math.floor(t) % palettes.length;
  var nextIndex = (prevIndex + 1) % palettes.length;
  t = clamp(-0.5, 0.5, (t % 1.0 - 0.5) * 5.0) + 0.5;
  var result = lerpHSV(palettes[prevIndex][which], palettes[nextIndex][which], t);
  return result;
}

function getCSSRGBAColor(r, g, b, a$$1) {
  r = Math.round(clamp(0, 255, r));
  g = Math.round(clamp(0, 255, g));
  b = Math.round(clamp(0, 255, b));
  return "rgba(" + r + ", " + g + ", " + b + ", " + a$$1 + ")";
}

/// @file
/// @addtogroup flatbuffers_javascript_api
/// @{
/// @cond FLATBUFFERS_INTERNAL

/**
 * @fileoverview
 *
 * Need to suppress 'global this' error so the Node.js export line doesn't cause
 * closure compile to error out.
 * @suppress {globalThis}
 */

/**
 * @const
 * @namespace
 */
var flatbuffers = {};

/**
 * @type {number}
 * @const
 */
flatbuffers.SIZEOF_SHORT = 2;

/**
 * @type {number}
 * @const
 */
flatbuffers.SIZEOF_INT = 4;

/**
 * @type {number}
 * @const
 */
flatbuffers.FILE_IDENTIFIER_LENGTH = 4;

/**
 * @enum {number}
 */
flatbuffers.Encoding = {
  UTF8_BYTES: 1,
  UTF16_STRING: 2
};

/**
 * @type {Int32Array}
 * @const
 */
flatbuffers.int32 = new Int32Array(2);

/**
 * @type {Float32Array}
 * @const
 */
flatbuffers.float32 = new Float32Array(flatbuffers.int32.buffer);

/**
 * @type {Float64Array}
 * @const
 */
flatbuffers.float64 = new Float64Array(flatbuffers.int32.buffer);

/**
 * @type {boolean}
 * @const
 */
flatbuffers.isLittleEndian = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;

////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @param {number} low
 * @param {number} high
 */
flatbuffers.Long = function (low, high) {
  /**
   * @type {number}
   * @const
   */
  this.low = low | 0;

  /**
   * @type {number}
   * @const
   */
  this.high = high | 0;
};

/**
 * @param {number} low
 * @param {number} high
 * @returns {flatbuffers.Long}
 */
flatbuffers.Long.create = function (low, high) {
  // Special-case zero to avoid GC overhead for default values
  return low == 0 && high == 0 ? flatbuffers.Long.ZERO : new flatbuffers.Long(low, high);
};

/**
 * @returns {number}
 */
flatbuffers.Long.prototype.toFloat64 = function () {
  return (this.low >>> 0) + this.high * 0x100000000;
};

/**
 * @param {flatbuffers.Long} other
 * @returns {boolean}
 */
flatbuffers.Long.prototype.equals = function (other) {
  return this.low == other.low && this.high == other.high;
};

/**
 * @type {flatbuffers.Long}
 * @const
 */
flatbuffers.Long.ZERO = new flatbuffers.Long(0, 0);

/// @endcond
////////////////////////////////////////////////////////////////////////////////
/**
 * Create a FlatBufferBuilder.
 *
 * @constructor
 * @param {number=} opt_initial_size
 */
flatbuffers.Builder = function (opt_initial_size) {
  if (!opt_initial_size) {
    var initial_size = 1024;
  } else {
    var initial_size = opt_initial_size;
  }

  /**
   * @type {flatbuffers.ByteBuffer}
   * @private
   */
  this.bb = flatbuffers.ByteBuffer.allocate(initial_size);

  /**
   * Remaining space in the ByteBuffer.
   *
   * @type {number}
   * @private
   */
  this.space = initial_size;

  /**
   * Minimum alignment encountered so far.
   *
   * @type {number}
   * @private
   */
  this.minalign = 1;

  /**
   * The vtable for the current table.
   *
   * @type {Array.<number>}
   * @private
   */
  this.vtable = null;

  /**
   * The amount of fields we're actually using.
   *
   * @type {number}
   * @private
   */
  this.vtable_in_use = 0;

  /**
   * Whether we are currently serializing a table.
   *
   * @type {boolean}
   * @private
   */
  this.isNested = false;

  /**
   * Starting offset of the current struct/table.
   *
   * @type {number}
   * @private
   */
  this.object_start = 0;

  /**
   * List of offsets of all vtables.
   *
   * @type {Array.<number>}
   * @private
   */
  this.vtables = [];

  /**
   * For the current vector being built.
   *
   * @type {number}
   * @private
   */
  this.vector_num_elems = 0;

  /**
   * False omits default values from the serialized data
   *
   * @type {boolean}
   * @private
   */
  this.force_defaults = false;
};

/**
 * In order to save space, fields that are set to their default value
 * don't get serialized into the buffer. Forcing defaults provides a
 * way to manually disable this optimization.
 *
 * @param {boolean} forceDefaults true always serializes default values
 */
flatbuffers.Builder.prototype.forceDefaults = function (forceDefaults) {
  this.force_defaults = forceDefaults;
};

/**
 * Get the ByteBuffer representing the FlatBuffer. Only call this after you've
 * called finish(). The actual data starts at the ByteBuffer's current position,
 * not necessarily at 0.
 *
 * @returns {flatbuffers.ByteBuffer}
 */
flatbuffers.Builder.prototype.dataBuffer = function () {
  return this.bb;
};

/**
 * Get the bytes representing the FlatBuffer. Only call this after you've
 * called finish().
 *
 * @returns {Uint8Array}
 */
flatbuffers.Builder.prototype.asUint8Array = function () {
  return this.bb.bytes().subarray(this.bb.position(), this.bb.position() + this.offset());
};

/// @cond FLATBUFFERS_INTERNAL
/**
 * Prepare to write an element of `size` after `additional_bytes` have been
 * written, e.g. if you write a string, you need to align such the int length
 * field is aligned to 4 bytes, and the string data follows it directly. If all
 * you need to do is alignment, `additional_bytes` will be 0.
 *
 * @param {number} size This is the of the new element to write
 * @param {number} additional_bytes The padding size
 */
flatbuffers.Builder.prototype.prep = function (size, additional_bytes) {
  // Track the biggest thing we've ever aligned to.
  if (size > this.minalign) {
    this.minalign = size;
  }

  // Find the amount of alignment needed such that `size` is properly
  // aligned after `additional_bytes`
  var align_size = ~(this.bb.capacity() - this.space + additional_bytes) + 1 & size - 1;

  // Reallocate the buffer if needed.
  while (this.space < align_size + size + additional_bytes) {
    var old_buf_size = this.bb.capacity();
    this.bb = flatbuffers.Builder.growByteBuffer(this.bb);
    this.space += this.bb.capacity() - old_buf_size;
  }

  this.pad(align_size);
};

/**
 * @param {number} byte_size
 */
flatbuffers.Builder.prototype.pad = function (byte_size) {
  for (var i = 0; i < byte_size; i++) {
    this.bb.writeInt8(--this.space, 0);
  }
};

/**
 * @param {number} value
 */
flatbuffers.Builder.prototype.writeInt8 = function (value) {
  this.bb.writeInt8(this.space -= 1, value);
};

/**
 * @param {number} value
 */
flatbuffers.Builder.prototype.writeInt16 = function (value) {
  this.bb.writeInt16(this.space -= 2, value);
};

/**
 * @param {number} value
 */
flatbuffers.Builder.prototype.writeInt32 = function (value) {
  this.bb.writeInt32(this.space -= 4, value);
};

/**
 * @param {flatbuffers.Long} value
 */
flatbuffers.Builder.prototype.writeInt64 = function (value) {
  this.bb.writeInt64(this.space -= 8, value);
};

/**
 * @param {number} value
 */
flatbuffers.Builder.prototype.writeFloat32 = function (value) {
  this.bb.writeFloat32(this.space -= 4, value);
};

/**
 * @param {number} value
 */
flatbuffers.Builder.prototype.writeFloat64 = function (value) {
  this.bb.writeFloat64(this.space -= 8, value);
};
/// @endcond

/**
 * Add an `int8` to the buffer, properly aligned, and grows the buffer (if necessary).
 * @param {number} value The `int8` to add the the buffer.
 */
flatbuffers.Builder.prototype.addInt8 = function (value) {
  this.prep(1, 0);
  this.writeInt8(value);
};

/**
 * Add an `int16` to the buffer, properly aligned, and grows the buffer (if necessary).
 * @param {number} value The `int16` to add the the buffer.
 */
flatbuffers.Builder.prototype.addInt16 = function (value) {
  this.prep(2, 0);
  this.writeInt16(value);
};

/**
 * Add an `int32` to the buffer, properly aligned, and grows the buffer (if necessary).
 * @param {number} value The `int32` to add the the buffer.
 */
flatbuffers.Builder.prototype.addInt32 = function (value) {
  this.prep(4, 0);
  this.writeInt32(value);
};

/**
 * Add an `int64` to the buffer, properly aligned, and grows the buffer (if necessary).
 * @param {flatbuffers.Long} value The `int64` to add the the buffer.
 */
flatbuffers.Builder.prototype.addInt64 = function (value) {
  this.prep(8, 0);
  this.writeInt64(value);
};

/**
 * Add a `float32` to the buffer, properly aligned, and grows the buffer (if necessary).
 * @param {number} value The `float32` to add the the buffer.
 */
flatbuffers.Builder.prototype.addFloat32 = function (value) {
  this.prep(4, 0);
  this.writeFloat32(value);
};

/**
 * Add a `float64` to the buffer, properly aligned, and grows the buffer (if necessary).
 * @param {number} value The `float64` to add the the buffer.
 */
flatbuffers.Builder.prototype.addFloat64 = function (value) {
  this.prep(8, 0);
  this.writeFloat64(value);
};

/// @cond FLATBUFFERS_INTERNAL
/**
 * @param {number} voffset
 * @param {number} value
 * @param {number} defaultValue
 */
flatbuffers.Builder.prototype.addFieldInt8 = function (voffset, value, defaultValue) {
  if (this.force_defaults || value != defaultValue) {
    this.addInt8(value);
    this.slot(voffset);
  }
};

/**
 * @param {number} voffset
 * @param {number} value
 * @param {number} defaultValue
 */
flatbuffers.Builder.prototype.addFieldInt16 = function (voffset, value, defaultValue) {
  if (this.force_defaults || value != defaultValue) {
    this.addInt16(value);
    this.slot(voffset);
  }
};

/**
 * @param {number} voffset
 * @param {number} value
 * @param {number} defaultValue
 */
flatbuffers.Builder.prototype.addFieldInt32 = function (voffset, value, defaultValue) {
  if (this.force_defaults || value != defaultValue) {
    this.addInt32(value);
    this.slot(voffset);
  }
};

/**
 * @param {number} voffset
 * @param {flatbuffers.Long} value
 * @param {flatbuffers.Long} defaultValue
 */
flatbuffers.Builder.prototype.addFieldInt64 = function (voffset, value, defaultValue) {
  if (this.force_defaults || !value.equals(defaultValue)) {
    this.addInt64(value);
    this.slot(voffset);
  }
};

/**
 * @param {number} voffset
 * @param {number} value
 * @param {number} defaultValue
 */
flatbuffers.Builder.prototype.addFieldFloat32 = function (voffset, value, defaultValue) {
  if (this.force_defaults || value != defaultValue) {
    this.addFloat32(value);
    this.slot(voffset);
  }
};

/**
 * @param {number} voffset
 * @param {number} value
 * @param {number} defaultValue
 */
flatbuffers.Builder.prototype.addFieldFloat64 = function (voffset, value, defaultValue) {
  if (this.force_defaults || value != defaultValue) {
    this.addFloat64(value);
    this.slot(voffset);
  }
};

/**
 * @param {number} voffset
 * @param {flatbuffers.Offset} value
 * @param {flatbuffers.Offset} defaultValue
 */
flatbuffers.Builder.prototype.addFieldOffset = function (voffset, value, defaultValue) {
  if (this.force_defaults || value != defaultValue) {
    this.addOffset(value);
    this.slot(voffset);
  }
};

/**
 * Structs are stored inline, so nothing additional is being added. `d` is always 0.
 *
 * @param {number} voffset
 * @param {flatbuffers.Offset} value
 * @param {flatbuffers.Offset} defaultValue
 */
flatbuffers.Builder.prototype.addFieldStruct = function (voffset, value, defaultValue) {
  if (value != defaultValue) {
    this.nested(value);
    this.slot(voffset);
  }
};

/**
 * Structures are always stored inline, they need to be created right
 * where they're used.  You'll get this assertion failure if you
 * created it elsewhere.
 *
 * @param {flatbuffers.Offset} obj The offset of the created object
 */
flatbuffers.Builder.prototype.nested = function (obj) {
  if (obj != this.offset()) {
    throw new Error('FlatBuffers: struct must be serialized inline.');
  }
};

/**
 * Should not be creating any other object, string or vector
 * while an object is being constructed
 */
flatbuffers.Builder.prototype.notNested = function () {
  if (this.isNested) {
    throw new Error('FlatBuffers: object serialization must not be nested.');
  }
};

/**
 * Set the current vtable at `voffset` to the current location in the buffer.
 *
 * @param {number} voffset
 */
flatbuffers.Builder.prototype.slot = function (voffset) {
  this.vtable[voffset] = this.offset();
};

/**
 * @returns {flatbuffers.Offset} Offset relative to the end of the buffer.
 */
flatbuffers.Builder.prototype.offset = function () {
  return this.bb.capacity() - this.space;
};

/**
 * Doubles the size of the backing ByteBuffer and copies the old data towards
 * the end of the new buffer (since we build the buffer backwards).
 *
 * @param {flatbuffers.ByteBuffer} bb The current buffer with the existing data
 * @returns {flatbuffers.ByteBuffer} A new byte buffer with the old data copied
 * to it. The data is located at the end of the buffer.
 *
 * uint8Array.set() formally takes {Array<number>|ArrayBufferView}, so to pass
 * it a uint8Array we need to suppress the type check:
 * @suppress {checkTypes}
 */
flatbuffers.Builder.growByteBuffer = function (bb) {
  var old_buf_size = bb.capacity();

  // Ensure we don't grow beyond what fits in an int.
  if (old_buf_size & 0xC0000000) {
    throw new Error('FlatBuffers: cannot grow buffer beyond 2 gigabytes.');
  }

  var new_buf_size = old_buf_size << 1;
  var nbb = flatbuffers.ByteBuffer.allocate(new_buf_size);
  nbb.setPosition(new_buf_size - old_buf_size);
  nbb.bytes().set(bb.bytes(), new_buf_size - old_buf_size);
  return nbb;
};
/// @endcond

/**
 * Adds on offset, relative to where it will be written.
 *
 * @param {flatbuffers.Offset} offset The offset to add.
 */
flatbuffers.Builder.prototype.addOffset = function (offset) {
  this.prep(flatbuffers.SIZEOF_INT, 0); // Ensure alignment is already done.
  this.writeInt32(this.offset() - offset + flatbuffers.SIZEOF_INT);
};

/// @cond FLATBUFFERS_INTERNAL
/**
 * Start encoding a new object in the buffer.  Users will not usually need to
 * call this directly. The FlatBuffers compiler will generate helper methods
 * that call this method internally.
 *
 * @param {number} numfields
 */
flatbuffers.Builder.prototype.startObject = function (numfields) {
  this.notNested();
  if (this.vtable == null) {
    this.vtable = [];
  }
  this.vtable_in_use = numfields;
  for (var i = 0; i < numfields; i++) {
    this.vtable[i] = 0; // This will push additional elements as needed
  }
  this.isNested = true;
  this.object_start = this.offset();
};

/**
 * Finish off writing the object that is under construction.
 *
 * @returns {flatbuffers.Offset} The offset to the object inside `dataBuffer`
 */
flatbuffers.Builder.prototype.endObject = function () {
  if (this.vtable == null || !this.isNested) {
    throw new Error('FlatBuffers: endObject called without startObject');
  }

  this.addInt32(0);
  var vtableloc = this.offset();

  // Write out the current vtable.
  for (var i = this.vtable_in_use - 1; i >= 0; i--) {
    // Offset relative to the start of the table.
    this.addInt16(this.vtable[i] != 0 ? vtableloc - this.vtable[i] : 0);
  }

  var standard_fields = 2; // The fields below:
  this.addInt16(vtableloc - this.object_start);
  this.addInt16((this.vtable_in_use + standard_fields) * flatbuffers.SIZEOF_SHORT);

  // Search for an existing vtable that matches the current one.
  var existing_vtable = 0;
  outer_loop: for (var i = 0; i < this.vtables.length; i++) {
    var vt1 = this.bb.capacity() - this.vtables[i];
    var vt2 = this.space;
    var len = this.bb.readInt16(vt1);
    if (len == this.bb.readInt16(vt2)) {
      for (var j = flatbuffers.SIZEOF_SHORT; j < len; j += flatbuffers.SIZEOF_SHORT) {
        if (this.bb.readInt16(vt1 + j) != this.bb.readInt16(vt2 + j)) {
          continue outer_loop;
        }
      }
      existing_vtable = this.vtables[i];
      break;
    }
  }

  if (existing_vtable) {
    // Found a match:
    // Remove the current vtable.
    this.space = this.bb.capacity() - vtableloc;

    // Point table to existing vtable.
    this.bb.writeInt32(this.space, existing_vtable - vtableloc);
  } else {
    // No match:
    // Add the location of the current vtable to the list of vtables.
    this.vtables.push(this.offset());

    // Point table to current vtable.
    this.bb.writeInt32(this.bb.capacity() - vtableloc, this.offset() - vtableloc);
  }

  this.isNested = false;
  return vtableloc;
};
/// @endcond

/**
 * Finalize a buffer, poiting to the given `root_table`.
 *
 * @param {flatbuffers.Offset} root_table
 * @param {string=} opt_file_identifier
 */
flatbuffers.Builder.prototype.finish = function (root_table, opt_file_identifier) {
  if (opt_file_identifier) {
    var file_identifier = opt_file_identifier;
    this.prep(this.minalign, flatbuffers.SIZEOF_INT + flatbuffers.FILE_IDENTIFIER_LENGTH);
    if (file_identifier.length != flatbuffers.FILE_IDENTIFIER_LENGTH) {
      throw new Error('FlatBuffers: file identifier must be length ' + flatbuffers.FILE_IDENTIFIER_LENGTH);
    }
    for (var i = flatbuffers.FILE_IDENTIFIER_LENGTH - 1; i >= 0; i--) {
      this.writeInt8(file_identifier.charCodeAt(i));
    }
  }
  this.prep(this.minalign, flatbuffers.SIZEOF_INT);
  this.addOffset(root_table);
  this.bb.setPosition(this.space);
};

/// @cond FLATBUFFERS_INTERNAL
/**
 * This checks a required field has been set in a given table that has
 * just been constructed.
 *
 * @param {flatbuffers.Offset} table
 * @param {number} field
 */
flatbuffers.Builder.prototype.requiredField = function (table, field) {
  var table_start = this.bb.capacity() - table;
  var vtable_start = table_start - this.bb.readInt32(table_start);
  var ok = this.bb.readInt16(vtable_start + field) != 0;

  // If this fails, the caller will show what field needs to be set.
  if (!ok) {
    throw new Error('FlatBuffers: field ' + field + ' must be set');
  }
};

/**
 * Start a new array/vector of objects.  Users usually will not call
 * this directly. The FlatBuffers compiler will create a start/end
 * method for vector types in generated code.
 *
 * @param {number} elem_size The size of each element in the array
 * @param {number} num_elems The number of elements in the array
 * @param {number} alignment The alignment of the array
 */
flatbuffers.Builder.prototype.startVector = function (elem_size, num_elems, alignment) {
  this.notNested();
  this.vector_num_elems = num_elems;
  this.prep(flatbuffers.SIZEOF_INT, elem_size * num_elems);
  this.prep(alignment, elem_size * num_elems); // Just in case alignment > int.
};

/**
 * Finish off the creation of an array and all its elements. The array must be
 * created with `startVector`.
 *
 * @returns {flatbuffers.Offset} The offset at which the newly created array
 * starts.
 */
flatbuffers.Builder.prototype.endVector = function () {
  this.writeInt32(this.vector_num_elems);
  return this.offset();
};
/// @endcond

/**
 * Encode the string `s` in the buffer using UTF-8. If a Uint8Array is passed
 * instead of a string, it is assumed to contain valid UTF-8 encoded data.
 *
 * @param {string|Uint8Array} s The string to encode
 * @return {flatbuffers.Offset} The offset in the buffer where the encoded string starts
 */
flatbuffers.Builder.prototype.createString = function (s) {
  if (s instanceof Uint8Array) {
    var utf8 = s;
  } else {
    var utf8 = [];
    var i = 0;

    while (i < s.length) {
      var codePoint;

      // Decode UTF-16
      var a = s.charCodeAt(i++);
      if (a < 0xD800 || a >= 0xDC00) {
        codePoint = a;
      } else {
        var b = s.charCodeAt(i++);
        codePoint = (a << 10) + b + (0x10000 - (0xD800 << 10) - 0xDC00);
      }

      // Encode UTF-8
      if (codePoint < 0x80) {
        utf8.push(codePoint);
      } else {
        if (codePoint < 0x800) {
          utf8.push(codePoint >> 6 & 0x1F | 0xC0);
        } else {
          if (codePoint < 0x10000) {
            utf8.push(codePoint >> 12 & 0x0F | 0xE0);
          } else {
            utf8.push(codePoint >> 18 & 0x07 | 0xF0, codePoint >> 12 & 0x3F | 0x80);
          }
          utf8.push(codePoint >> 6 & 0x3F | 0x80);
        }
        utf8.push(codePoint & 0x3F | 0x80);
      }
    }
  }

  this.addInt8(0);
  this.startVector(1, utf8.length, 1);
  this.bb.setPosition(this.space -= utf8.length);
  for (var i = 0, offset = this.space, bytes = this.bb.bytes(); i < utf8.length; i++) {
    bytes[offset++] = utf8[i];
  }
  return this.endVector();
};

/**
 * A helper function to avoid generated code depending on this file directly.
 *
 * @param {number} low
 * @param {number} high
 * @returns {flatbuffers.Long}
 */
flatbuffers.Builder.prototype.createLong = function (low, high) {
  return flatbuffers.Long.create(low, high);
};
////////////////////////////////////////////////////////////////////////////////
/// @cond FLATBUFFERS_INTERNAL
/**
 * Create a new ByteBuffer with a given array of bytes (`Uint8Array`).
 *
 * @constructor
 * @param {Uint8Array} bytes
 */
flatbuffers.ByteBuffer = function (bytes) {
  /**
   * @type {Uint8Array}
   * @private
   */
  this.bytes_ = bytes;

  /**
   * @type {number}
   * @private
   */
  this.position_ = 0;
};

/**
 * Create and allocate a new ByteBuffer with a given size.
 *
 * @param {number} byte_size
 * @returns {flatbuffers.ByteBuffer}
 */
flatbuffers.ByteBuffer.allocate = function (byte_size) {
  return new flatbuffers.ByteBuffer(new Uint8Array(byte_size));
};

/**
 * Get the underlying `Uint8Array`.
 *
 * @returns {Uint8Array}
 */
flatbuffers.ByteBuffer.prototype.bytes = function () {
  return this.bytes_;
};

/**
 * Get the buffer's position.
 *
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.position = function () {
  return this.position_;
};

/**
 * Set the buffer's position.
 *
 * @param {number} position
 */
flatbuffers.ByteBuffer.prototype.setPosition = function (position) {
  this.position_ = position;
};

/**
 * Get the buffer's capacity.
 *
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.capacity = function () {
  return this.bytes_.length;
};

/**
 * @param {number} offset
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.readInt8 = function (offset) {
  return this.readUint8(offset) << 24 >> 24;
};

/**
 * @param {number} offset
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.readUint8 = function (offset) {
  return this.bytes_[offset];
};

/**
 * @param {number} offset
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.readInt16 = function (offset) {
  return this.readUint16(offset) << 16 >> 16;
};

/**
 * @param {number} offset
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.readUint16 = function (offset) {
  return this.bytes_[offset] | this.bytes_[offset + 1] << 8;
};

/**
 * @param {number} offset
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.readInt32 = function (offset) {
  return this.bytes_[offset] | this.bytes_[offset + 1] << 8 | this.bytes_[offset + 2] << 16 | this.bytes_[offset + 3] << 24;
};

/**
 * @param {number} offset
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.readUint32 = function (offset) {
  return this.readInt32(offset) >>> 0;
};

/**
 * @param {number} offset
 * @returns {flatbuffers.Long}
 */
flatbuffers.ByteBuffer.prototype.readInt64 = function (offset) {
  return new flatbuffers.Long(this.readInt32(offset), this.readInt32(offset + 4));
};

/**
 * @param {number} offset
 * @returns {flatbuffers.Long}
 */
flatbuffers.ByteBuffer.prototype.readUint64 = function (offset) {
  return new flatbuffers.Long(this.readUint32(offset), this.readUint32(offset + 4));
};

/**
 * @param {number} offset
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.readFloat32 = function (offset) {
  flatbuffers.int32[0] = this.readInt32(offset);
  return flatbuffers.float32[0];
};

/**
 * @param {number} offset
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.readFloat64 = function (offset) {
  flatbuffers.int32[flatbuffers.isLittleEndian ? 0 : 1] = this.readInt32(offset);
  flatbuffers.int32[flatbuffers.isLittleEndian ? 1 : 0] = this.readInt32(offset + 4);
  return flatbuffers.float64[0];
};

/**
 * @param {number} offset
 * @param {number|boolean} value
 */
flatbuffers.ByteBuffer.prototype.writeInt8 = function (offset, value) {
  this.bytes_[offset] = /** @type {number} */value;
};

/**
 * @param {number} offset
 * @param {number} value
 */
flatbuffers.ByteBuffer.prototype.writeUint8 = function (offset, value) {
  this.bytes_[offset] = value;
};

/**
 * @param {number} offset
 * @param {number} value
 */
flatbuffers.ByteBuffer.prototype.writeInt16 = function (offset, value) {
  this.bytes_[offset] = value;
  this.bytes_[offset + 1] = value >> 8;
};

/**
 * @param {number} offset
 * @param {number} value
 */
flatbuffers.ByteBuffer.prototype.writeUint16 = function (offset, value) {
  this.bytes_[offset] = value;
  this.bytes_[offset + 1] = value >> 8;
};

/**
 * @param {number} offset
 * @param {number} value
 */
flatbuffers.ByteBuffer.prototype.writeInt32 = function (offset, value) {
  this.bytes_[offset] = value;
  this.bytes_[offset + 1] = value >> 8;
  this.bytes_[offset + 2] = value >> 16;
  this.bytes_[offset + 3] = value >> 24;
};

/**
 * @param {number} offset
 * @param {number} value
 */
flatbuffers.ByteBuffer.prototype.writeUint32 = function (offset, value) {
  this.bytes_[offset] = value;
  this.bytes_[offset + 1] = value >> 8;
  this.bytes_[offset + 2] = value >> 16;
  this.bytes_[offset + 3] = value >> 24;
};

/**
 * @param {number} offset
 * @param {flatbuffers.Long} value
 */
flatbuffers.ByteBuffer.prototype.writeInt64 = function (offset, value) {
  this.writeInt32(offset, value.low);
  this.writeInt32(offset + 4, value.high);
};

/**
 * @param {number} offset
 * @param {flatbuffers.Long} value
 */
flatbuffers.ByteBuffer.prototype.writeUint64 = function (offset, value) {
  this.writeUint32(offset, value.low);
  this.writeUint32(offset + 4, value.high);
};

/**
 * @param {number} offset
 * @param {number} value
 */
flatbuffers.ByteBuffer.prototype.writeFloat32 = function (offset, value) {
  flatbuffers.float32[0] = value;
  this.writeInt32(offset, flatbuffers.int32[0]);
};

/**
 * @param {number} offset
 * @param {number} value
 */
flatbuffers.ByteBuffer.prototype.writeFloat64 = function (offset, value) {
  flatbuffers.float64[0] = value;
  this.writeInt32(offset, flatbuffers.int32[flatbuffers.isLittleEndian ? 0 : 1]);
  this.writeInt32(offset + 4, flatbuffers.int32[flatbuffers.isLittleEndian ? 1 : 0]);
};

/**
 * Look up a field in the vtable, return an offset into the object, or 0 if the
 * field is not present.
 *
 * @param {number} bb_pos
 * @param {number} vtable_offset
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.__offset = function (bb_pos, vtable_offset) {
  var vtable = bb_pos - this.readInt32(bb_pos);
  return vtable_offset < this.readInt16(vtable) ? this.readInt16(vtable + vtable_offset) : 0;
};

/**
 * Initialize any Table-derived type to point to the union at the given offset.
 *
 * @param {flatbuffers.Table} t
 * @param {number} offset
 * @returns {flatbuffers.Table}
 */
flatbuffers.ByteBuffer.prototype.__union = function (t, offset) {
  t.bb_pos = offset + this.readInt32(offset);
  t.bb = this;
  return t;
};

/**
 * Create a JavaScript string from UTF-8 data stored inside the FlatBuffer.
 * This allocates a new string and converts to wide chars upon each access.
 *
 * To avoid the conversion to UTF-16, pass flatbuffers.Encoding.UTF8_BYTES as
 * the "optionalEncoding" argument. This is useful for avoiding conversion to
 * and from UTF-16 when the data will just be packaged back up in another
 * FlatBuffer later on.
 *
 * @param {number} offset
 * @param {flatbuffers.Encoding=} opt_encoding Defaults to UTF16_STRING
 * @returns {string|Uint8Array}
 */
flatbuffers.ByteBuffer.prototype.__string = function (offset, opt_encoding) {
  offset += this.readInt32(offset);

  var length = this.readInt32(offset);
  var result = '';
  var i = 0;

  offset += flatbuffers.SIZEOF_INT;

  if (opt_encoding === flatbuffers.Encoding.UTF8_BYTES) {
    return this.bytes_.subarray(offset, offset + length);
  }

  while (i < length) {
    var codePoint;

    // Decode UTF-8
    var a = this.readUint8(offset + i++);
    if (a < 0xC0) {
      codePoint = a;
    } else {
      var b = this.readUint8(offset + i++);
      if (a < 0xE0) {
        codePoint = (a & 0x1F) << 6 | b & 0x3F;
      } else {
        var c = this.readUint8(offset + i++);
        if (a < 0xF0) {
          codePoint = (a & 0x0F) << 12 | (b & 0x3F) << 6 | c & 0x3F;
        } else {
          var d = this.readUint8(offset + i++);
          codePoint = (a & 0x07) << 18 | (b & 0x3F) << 12 | (c & 0x3F) << 6 | d & 0x3F;
        }
      }
    }

    // Encode UTF-16
    if (codePoint < 0x10000) {
      result += String.fromCharCode(codePoint);
    } else {
      codePoint -= 0x10000;
      result += String.fromCharCode((codePoint >> 10) + 0xD800, (codePoint & (1 << 10) - 1) + 0xDC00);
    }
  }

  return result;
};

/**
 * Retrieve the relative offset stored at "offset"
 * @param {number} offset
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.__indirect = function (offset) {
  return offset + this.readInt32(offset);
};

/**
 * Get the start of data of a vector whose offset is stored at "offset" in this object.
 *
 * @param {number} offset
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.__vector = function (offset) {
  return offset + this.readInt32(offset) + flatbuffers.SIZEOF_INT; // data starts after the length
};

/**
 * Get the length of a vector whose offset is stored at "offset" in this object.
 *
 * @param {number} offset
 * @returns {number}
 */
flatbuffers.ByteBuffer.prototype.__vector_len = function (offset) {
  return this.readInt32(offset + this.readInt32(offset));
};

/**
 * @param {string} ident
 * @returns {boolean}
 */
flatbuffers.ByteBuffer.prototype.__has_identifier = function (ident) {
  if (ident.length != flatbuffers.FILE_IDENTIFIER_LENGTH) {
    throw new Error('FlatBuffers: file identifier must be length ' + flatbuffers.FILE_IDENTIFIER_LENGTH);
  }
  for (var i = 0; i < flatbuffers.FILE_IDENTIFIER_LENGTH; i++) {
    if (ident.charCodeAt(i) != this.readInt8(this.position_ + flatbuffers.SIZEOF_INT + i)) {
      return false;
    }
  }
  return true;
};

/**
 * A helper function to avoid generated code depending on this file directly.
 *
 * @param {number} low
 * @param {number} high
 * @returns {flatbuffers.Long}
 */
flatbuffers.ByteBuffer.prototype.createLong = function (low, high) {
  return flatbuffers.Long.create(low, high);
};

// Exports for Node.js and RequireJS
({}).flatbuffers = flatbuffers;

class DecoderError {
  constructor() {
    this.isError = true;
  }

  toString() {
    return this.format();
  }
}

class FieldError$1 extends DecoderError {
  constructor(fieldName, table) {
    super();
    this.kind = "FieldError";
    this.table = table;
    this.fieldName = fieldName;
  }
  format(context) {
    const where = context == null ? "" : `at ${context}`;
    return `Faild to decode a field "${this.fieldName}" from "${this.table.name}" table${where}`;
  }
}

class VariantError extends DecoderError {
  constructor(table, options, option) {
    super();
    this.kind = "VariantError";
    this.table = table;
    this.options = options;
    this.option = option;
  }
  format(context) {
    const { options, option } = this;
    let optionName = "";
    for (let key in options) {
      if (options[key] === option) {
        optionName = key;
        break;
      }
    }

    return `Faild to decode a union "${this.table.name}" as ${optionName}:${option}`;
  }
}

// Transformed verison of fbs.ts
// Replace import {flatbuffers} -> import * as flatbuffers
// Comment out all `export namespace JSON{` and corresponding `}`
// Rewrite enums to Type and value pairs.
// Replace '<T extends' with '<T:'
// Rewrite all overloads for string field methods.
// Replace flatbuffers.Encoding with flatbuffers.EncodingValue

/**
 * @enum
 */
// export namespace JSON{
const JSONVariant = {
  NONE: 0,
  Boolean: 1,
  Integer: 2,
  Float: 3,
  String: 4,
  JSONArray: 5,
  JSONObject: 6
  //};

};

/**
 * @constructor
 */
// export namespace JSON{
class JSONArray {
  constructor() {
    this.bb_pos = 0;
  }
  /**
   * @type {flatbuffers.ByteBuffer}
   */


  /**
   * @type {number}
   */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {JSONArray}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {JSONArray=} obj
  * @returns {JSONArray}
  */
  static getRootAsJSONArray(bb, obj) {
    return (obj || new this.constructor()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @param {number} index
  * @param {Element=} obj
  * @returns {Element}
  */
  elements(index, obj) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? (obj || new Element()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }

  /**
  * @returns {number}
  */
  elementsLength() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startJSONArray(builder) {
    builder.startObject(1);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {flatbuffers.Offset} elementsOffset
  */
  static addElements(builder, elementsOffset) {
    builder.addFieldOffset(0, elementsOffset, 0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {JSONArray.<flatbuffers.Offset>} data
  * @returns {flatbuffers.Offset}
  */
  static createElementsVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (var i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {number} numElems
  */
  static startElementsVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endJSONArray(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
//}
/**
 * @constructor
 */
// export namespace JSON{
class JSONObject {
  constructor() {
    this.bb_pos = 0;
  }
  /**
   * @type {flatbuffers.ByteBuffer}
   */


  /**
   * @type {number}
   */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {JSONObject}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {JSONObject=} obj
  * @returns {JSONObject}
  */
  static getRootAsJSONObject(bb, obj) {
    return (obj || new JSONObject()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @param {number} index
  * @param {Property=} obj
  * @returns {Property}
  */
  properties(index, obj) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? (obj || new Property()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }

  /**
  * @returns {number}
  */
  propertiesLength() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startJSONObject(builder) {
    builder.startObject(1);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {flatbuffers.Offset} propertiesOffset
  */
  static addProperties(builder, propertiesOffset) {
    builder.addFieldOffset(0, propertiesOffset, 0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {JSONArray.<flatbuffers.Offset>} data
  * @returns {flatbuffers.Offset}
  */
  static createPropertiesVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (var i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {number} numElems
  */
  static startPropertiesVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endJSONObject(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
//}
/**
 * @constructor
 */
// export namespace JSON{
class Property {
  constructor() {
    this.bb_pos = 0;
  }
  /**
   * @type {flatbuffers.ByteBuffer}
   */


  /**
   * @type {number}
   */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {Property}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {Property=} obj
  * @returns {Property}
  */
  static getRootAsProperty(bb, obj) {
    return (obj || new Property()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @param {flatbuffers.EncodingValue=} optionalEncoding
  * @returns {string|Uint8Array|null}
  */
  name(optionalEncoding) /*
                         name(optionalEncoding:flatbuffers.EncodingValue):string|Uint8Array|null
                         name(optionalEncoding?:any):string|Uint8Array|null*/{
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
  * @returns {JSONType}
  */
  valueType() {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? /** @type {JSONType} */this.bb.readUint8(this.bb_pos + offset) : JSONVariant.NONE;
  }

  /**
  * @param {flatbuffers.Table} obj
  * @returns {?flatbuffers.Table}
  */
  value(obj) {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startProperty(builder) {
    builder.startObject(3);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {flatbuffers.Offset} nameOffset
  */
  static addName(builder, nameOffset) {
    builder.addFieldOffset(0, nameOffset, 0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {JSONType} valueType
  */
  static addValueType(builder, valueType) {
    builder.addFieldInt8(1, valueType, JSONVariant.NONE);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {flatbuffers.Offset} valueOffset
  */
  static addValue(builder, valueOffset) {
    builder.addFieldOffset(2, valueOffset, 0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endProperty(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
//}
/**
 * @constructor
 */
// export namespace JSON{
class Element {
  constructor() {
    this.bb_pos = 0;
  }
  /**
   * @type {flatbuffers.ByteBuffer}
   */


  /**
   * @type {number}
   */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {Element}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {Element=} obj
  * @returns {Element}
  */
  static getRootAsElement(bb, obj) {
    return (obj || new Element()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @returns {JSONType}
  */
  valueType() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? /** @type {JSONType} */this.bb.readUint8(this.bb_pos + offset) : JSONVariant.NONE;
  }

  /**
  * @param {flatbuffers.Table} obj
  * @returns {?flatbuffers.Table}
  */
  value(obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startElement(builder) {
    builder.startObject(2);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {JSONType} valueType
  */
  static addValueType(builder, valueType) {
    builder.addFieldInt8(0, valueType, JSONVariant.NONE);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {flatbuffers.Offset} valueOffset
  */
  static addValue(builder, valueOffset) {
    builder.addFieldOffset(1, valueOffset, 0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endElement(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
//}
/**
 * @constructor
 */
// export namespace JSON{
class Boolean$3 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
   * @type {flatbuffers.ByteBuffer}
   */


  /**
   * @type {number}
   */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {Boolean}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {Boolean=} obj
  * @returns {Boolean}
  */
  static getRootAsBoolean(bb, obj) {
    return (obj || new Boolean$3()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @returns {boolean}
  */
  value() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startBoolean(builder) {
    builder.startObject(1);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {boolean} value
  */
  static addValue(builder, value) {
    builder.addFieldInt8(0, +value, +false);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endBoolean(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
//}
/**
 * @constructor
 */
// export namespace JSON{
class Integer$3 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
   * @type {flatbuffers.ByteBuffer}
   */


  /**
   * @type {number}
   */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {Integer}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {Integer=} obj
  * @returns {Integer}
  */
  static getRootAsInteger(bb, obj) {
    return (obj || new Integer$3()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @returns {number}
  */
  value() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startInteger(builder) {
    builder.startObject(1);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {number} value
  */
  static addValue(builder, value) {
    builder.addFieldInt32(0, value, 0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endInteger(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
//}
/**
 * @constructor
 */
// export namespace JSON{
class String$4 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
   * @type {flatbuffers.ByteBuffer}
   */


  /**
   * @type {number}
   */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {String}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {String=} obj
  * @returns {String}
  */
  static getRootAsString(bb, obj) {
    return (obj || new String$4()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @param {flatbuffers.EncodingValue=} optionalEncoding
  * @returns {string|Uint8Array|null}
  */
  value(optionalEncoding) /*
                          value(optionalEncoding:flatbuffers.EncodingValue):string|Uint8Array|null
                          value(optionalEncoding?:any):string|Uint8Array|null*/{
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startString(builder) {
    builder.startObject(1);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {flatbuffers.Offset} valueOffset
  */
  static addValue(builder, valueOffset) {
    builder.addFieldOffset(0, valueOffset, 0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endString(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
//}
/**
 * @constructor
 */
// export namespace JSON{
class Float$3 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
   * @type {flatbuffers.ByteBuffer}
   */


  /**
   * @type {number}
   */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {Float}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {Float=} obj
  * @returns {Float}
  */
  static getRootAsFloat(bb, obj) {
    return (obj || new Float$3()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @returns {number}
  */
  value() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startFloat(builder) {
    builder.startObject(1);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {number} value
  */
  static addValue(builder, value) {
    builder.addFieldFloat32(0, value, 0.0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endFloat(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
//}

// Transformed verison of fbs.ts
// Replace import {flatbuffers} -> import * as flatbuffers
// Comment out all `// export namespace Decoder{` and corresponding `}`
// Rewrite enums to Type and value pairs.
// Replace '<T extends' with '<T:'
// Rewrite all overloads for string field methods.
// Replace 'Decoder.Decoder.' with 'decoderType.'
// Replace 'JSON.' with 'jsonType.'
// Replace 'Value.' with 'valueType.'
// Replace 'Decoder.' with ''
// Replace all '/** @type {Decoder} */ (this.bb.readUint8(this.bb_pos + offset))' with `((this.bb.readUint8(this.bb_pos + offset):any):Decoder)`
// Replace all `/** @type {Value} */ (this.bb.readInt8(this.bb_pos + offset))` with `((this.bb.readInt8(this.bb_pos + offset):any):Value)`
// Replace all `/** @type {JSON} */ (this.bb.readUint8(this.bb_pos + offset))` with `((this.bb.readUint8(this.bb_pos + offset):any):JSON)`

/**
 * @enum
 */
// // export namespace Decoder{
const decoder = {
  NONE: 0,
  Error: 1,
  Ok: 2,
  Boolean: 3,
  Accessor: 4,
  Either: 5,
  Field: 6,
  Index: 7,
  Null: 8,
  Undefined: 9,
  Optional: 10,
  Maybe: 11,
  Collection: 12,
  Dictionary: 13,
  Record: 14,
  Form: 15,
  String: 16,
  Integer: 17,
  Float: 18,
  And: 19,
  Match: 20
};

// };

/**
   * @constructor
   */
// export namespace Decoder{
class Accessor$1 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Accessor}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Accessor=} obj
   * @returns {Accessor}
   */
  static getRootAsAccessor(bb, obj) {
    return (obj || new Accessor$1()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.Encoding=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  name(optionalEncoding) {
    //name(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
    //name(optionalEncoding?:any):string|Uint8Array|null {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @returns {Decoder}
   */
  decoderType() {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : decoder.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  decoder(obj) {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startAccessor(builder) {
    builder.startObject(3);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} nameOffset
   */
  static addName(builder, nameOffset) {
    builder.addFieldOffset(0, nameOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Decoder} accessorType
   */
  static addDecoderType(builder, accessorType) {
    builder.addFieldInt8(1, accessorType, decoder.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} accessorOffset
   */
  static addDecoder(builder, accessorOffset) {
    builder.addFieldOffset(2, accessorOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endAccessor(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Collection {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Collection}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Collection=} obj
   * @returns {Collection}
   */
  static getRootAsCollection(bb, obj) {
    return (obj || new Collection()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {Decoder}
   */
  decoderType() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : decoder.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  decoder(obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startCollection(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Decoder} decoderType
   */
  static addDecoderType(builder, decoderType) {
    builder.addFieldInt8(0, decoderType, decoder.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} decoderOffset
   */
  static addDecoder(builder, decoderOffset) {
    builder.addFieldOffset(1, decoderOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endCollection(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Boolean$2 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Boolean}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Boolean=} obj
   * @returns {Boolean}
   */
  static getRootAsPrimitive(bb, obj) {
    return (obj || new Boolean$2()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startBoolean(builder) {
    builder.startObject(0);
  }
  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endBoolean(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Dictionary$1 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Dictionary}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Dictionary=} obj
   * @returns {Dictionary}
   */
  static getRootAsDictionary(bb, obj) {
    return (obj || new Dictionary$1()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {Decoder}
   */
  decoderType() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : decoder.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  decoder(obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startDictionary(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Decoder} decoderType
   */
  static addDecoderType(builder, decoderType) {
    builder.addFieldInt8(0, decoderType, decoder.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} decoderOffset
   */
  static addDecoder(builder, decoderOffset) {
    builder.addFieldOffset(1, decoderOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endDictionary(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Either$1 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Either}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Either=} obj
   * @returns {Either}
   */
  static getRootAsEither(bb, obj) {
    return (obj || new Either$1()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {number} index
   * @param {Variant=} obj
   * @returns {Variant}
   */
  variants(index, obj) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? (obj || new Variant()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }

  /**
   * @returns {number}
   */
  variantsLength() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startEither(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} variantsOffset
   */
  static addVariants(builder, variantsOffset) {
    builder.addFieldOffset(0, variantsOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Array.<flatbuffers.Offset>} data
   * @returns {flatbuffers.Offset}
   */
  static createVariantsVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (var i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {number} numElems
   */
  static startVariantsVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endEither(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Variant {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Variant}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Variant=} obj
   * @returns {Variant}
   */
  static getRootAsVariant(bb, obj) {
    return (obj || new Variant()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {Decoder}
   */
  decoderType() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : decoder.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  decoder(obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startVariant(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Decoder} decoderType
   */
  static addDecoderType(builder, decoderType) {
    builder.addFieldInt8(0, decoderType, decoder.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} decoderOffset
   */
  static addDecoder(builder, decoderOffset) {
    builder.addFieldOffset(1, decoderOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endVariant(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Error$4 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Error}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Error=} obj
   * @returns {Error}
   */
  static getRootAsError(bb, obj) {
    return (obj || new Error$4()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.Encoding=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  message(optionalEncoding) {
    //message(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
    //message(optionalEncoding?:any):string|Uint8Array|null {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startError(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} messageOffset
   */
  static addMessage(builder, messageOffset) {
    builder.addFieldOffset(0, messageOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endError(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Ok$2 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Ok}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Ok=} obj
   * @returns {Ok}
   */
  static getRootAsOk(bb, obj) {
    return (obj || new Ok$2()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {JSON.JSONType}
   */
  valueType() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : JSONVariant.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  value(obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startOk(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {JSON.JSONType} JSONType
   */
  static addValueType(builder, valueType) {
    builder.addFieldInt8(0, valueType, JSONVariant.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} valueOffset
   */
  static addValue(builder, valueOffset) {
    builder.addFieldOffset(1, valueOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endOk(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Field$1 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Field}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Field=} obj
   * @returns {Field}
   */
  static getRootAsField(bb, obj) {
    return (obj || new Field$1()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.Encoding=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  name(optionalEncoding) {
    //name(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
    //name(optionalEncoding?:any):string|Uint8Array|null {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @returns {Decoder}
   */
  decoderType() {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : decoder.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  decoder(obj) {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startField(builder) {
    builder.startObject(3);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} nameOffset
   */
  static addName(builder, nameOffset) {
    builder.addFieldOffset(0, nameOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Decoder} decoderType
   */
  static addDecoderType(builder, decoderType) {
    builder.addFieldInt8(1, decoderType, decoder.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} fieldOffset
   */
  static addDecoder(builder, decoderOffset) {
    builder.addFieldOffset(2, decoderOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endField(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Index$1 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Index}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Index=} obj
   * @returns {Index}
   */
  static getRootAsIndex(bb, obj) {
    return (obj || new Index$1()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {number}
   */
  index() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }

  /**
   * @returns {Decoder}
   */
  decoderType() {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : decoder.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  decoder(obj) {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startIndex(builder) {
    builder.startObject(3);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {number} index
   */
  static addIndex(builder, index) {
    builder.addFieldInt32(0, index, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Decoder} memberType
   */
  static addDecoderType(builder, decoderType) {
    builder.addFieldInt8(1, decoderType, decoder.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} memberOffset
   */
  static addDecoder(builder, decoderOffset) {
    builder.addFieldOffset(2, decoderOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endIndex(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Form$1 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Form}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Form=} obj
   * @returns {Form}
   */
  static getRootAsForm(bb, obj) {
    return (obj || new Form$1()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {number} index
   * @param {Field=} obj
   * @returns {Field}
   */
  fields(index, obj) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? (obj || new Field$1()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }

  /**
   * @returns {number}
   */
  fieldsLength() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startForm(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} fieldsOffset
   */
  static addFields(builder, fieldsOffset) {
    builder.addFieldOffset(0, fieldsOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Array.<flatbuffers.Offset>} data
   * @returns {flatbuffers.Offset}
   */
  static createFormVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (var i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {number} numElems
   */
  static startFieldsVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endForm(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Record {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Record}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Record=} obj
   * @returns {Record}
   */
  static getRootAsRecord(bb, obj) {
    return (obj || new Record()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {number} index
   * @param {Field=} obj
   * @returns {Field}
   */
  fields(index, obj) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? (obj || new Field$1()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }

  /**
   * @returns {number}
   */
  fieldsLength() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startRecord(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} fieldsOffset
   */
  static addFields(builder, fieldsOffset) {
    builder.addFieldOffset(0, fieldsOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Array.<flatbuffers.Offset>} data
   * @returns {flatbuffers.Offset}
   */
  static createFieldsVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (var i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {number} numElems
   */
  static startFieldsVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endRecord(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Maybe$1 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Maybe}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Maybe=} obj
   * @returns {Maybe}
   */
  static getRootAsMaybe(bb, obj) {
    return (obj || new Maybe$1()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {Decoder}
   */
  decoderType() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : decoder.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  decoder(obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startMaybe(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Decoder} decoderType
   */
  static addDecoderType(builder, decoderType) {
    builder.addFieldInt8(0, decoderType, decoder.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} maybeOffset
   */
  static addDecoder(builder, decoderOffset) {
    builder.addFieldOffset(1, decoderOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endMaybe(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Null$1 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Null}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Null=} obj
   * @returns {Null}
   */
  static getRootAsNull(bb, obj) {
    return (obj || new Null$1()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {JSON}
   */
  valueType() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : JSONVariant.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  value(obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startNull(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {JSON} valueType
   */
  static addValueType(builder, valueType) {
    builder.addFieldInt8(0, valueType, JSONVariant.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} valueOffset
   */
  static addValue(builder, valueOffset) {
    builder.addFieldOffset(1, valueOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endNull(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Undefined$1 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Undefined}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Undefined=} obj
   * @returns {Undefined}
   */
  static getRootAsUndefined(bb, obj) {
    return (obj || new Undefined$1()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {JSON}
   */
  valueType() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : JSONVariant.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  value(obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startUndefined(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {JSON} valueType
   */
  static addValueType(builder, valueType) {
    builder.addFieldInt8(0, valueType, JSONVariant.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} valueOffset
   */
  static addValue(builder, valueOffset) {
    builder.addFieldOffset(1, valueOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endUndefined(builder) {
    var offset = builder.endObject();
    return offset;
  }

  //}
}
/**
   * @constructor
   */
// export namespace Decoder{
class Optional$1 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Optional}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Optional=} obj
   * @returns {Optional}
   */
  static getRootAsOptional(bb, obj) {
    return (obj || new Optional$1()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {Decoder}
   */
  decoderType() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : decoder.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  decoder(obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startOptional(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Decoder} decoderType
   */
  static addDecoderType(builder, decoderType) {
    builder.addFieldInt8(0, decoderType, decoder.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} optionalOffset
   */
  static addDecoder(builder, decoderOffset) {
    builder.addFieldOffset(1, decoderOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endOptional(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
// }

/**
 * @constructor
 */
// export namespace Decoder{
class Integer$2 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
   * @type {flatbuffers.ByteBuffer}
   */


  /**
   * @type {number}
   */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {Integer}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {Integer=} obj
  * @returns {Integer}
  */
  static getRootAsInteger(bb, obj) {
    return (obj || new Integer$2()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startInteger(builder) {
    builder.startObject(0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endInteger(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
// }
/**
 * @constructor
 */
// export namespace Decoder{
class Float$2 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
   * @type {flatbuffers.ByteBuffer}
   */


  /**
   * @type {number}
   */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {Float}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {Float=} obj
  * @returns {Float}
  */
  static getRootAsFloat(bb, obj) {
    return (obj || new Float$2()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startFloat(builder) {
    builder.startObject(0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endFloat(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
// }
/**
 * @constructor
 */
// export namespace Decoder{
class String$3 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
   * @type {flatbuffers.ByteBuffer}
   */


  /**
   * @type {number}
   */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {String}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {String=} obj
  * @returns {String}
  */
  static getRootAsString(bb, obj) {
    return (obj || new String$3()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startString(builder) {
    builder.startObject(0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endString(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
// }
/**
 * @constructor
 */
// export namespace Decoder{
class And$1 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {And}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {And=} obj
   * @returns {And}
   */
  static getRootAsAnd(bb, obj) {
    return (obj || new And$1()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {Decoder}
   */
  leftType() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? /** @type {Decoder} */this.bb.readUint8(this.bb_pos + offset) : decoder.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  left(obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @returns {Decoder}
   */
  rightType() {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? /** @type {Decoder} */this.bb.readUint8(this.bb_pos + offset) : decoder.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  right(obj) {
    var offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startAnd(builder) {
    builder.startObject(4);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Decoder} leftType
   */
  static addLeftType(builder, leftType) {
    builder.addFieldInt8(0, leftType, decoder.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} leftOffset
   */
  static addLeft(builder, leftOffset) {
    builder.addFieldOffset(1, leftOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Decoder} rightType
   */
  static addRightType(builder, rightType) {
    builder.addFieldInt8(2, rightType, decoder.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} rightOffset
   */
  static addRight(builder, rightOffset) {
    builder.addFieldOffset(3, rightOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endAnd(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
// }
/**
   * @constructor
   */
// export namespace Decoder{
class Match$1 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Match}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Match=} obj
   * @returns {Match}
   */
  static getRootAsMatch(bb, obj) {
    return (obj || new Match$1()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {JSON.JSON}
   */
  valueType() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? /** @type {JSON.JSON} */this.bb.readUint8(this.bb_pos + offset) : JSONVariant.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  value(obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startMatch(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {JSON.JSON} valueType
   */
  static addValueType(builder, valueType) {
    builder.addFieldInt8(0, valueType, JSONVariant.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} valueOffset
   */
  static addValue(builder, valueOffset) {
    builder.addFieldOffset(1, valueOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endMatch(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
// }

// Transformed verison of DOMinion.fbs.ts

const op = {
  NONE: 0,
  SelectChildren: 1,
  SelectSibling: 2,
  SelectParent: 3,
  InsertComment: 4,
  InsertText: 5,
  InsertElement: 6,
  InsertStashedNode: 7,
  ReplaceWithComment: 8,
  ReplaceWithText: 9,
  ReplaceWithElement: 10,
  ReplaceWithStashedNode: 11,
  RemoveNextSibling: 12,
  SetTextData: 13,
  EditTextData: 14,
  SetAttribute: 15,
  RemoveAttribute: 16,
  AssignStringProperty: 17,
  AssignBooleanProperty: 18,
  AssignNumberProperty: 19,
  AssignNullProperty: 20,
  DeleteProperty: 21,
  SetStyleRule: 22,
  RemoveStyleRule: 23,
  StashNextSibling: 24,
  DiscardStashed: 25,
  ShiftSiblings: 26,
  AddEventListener: 27,
  RemoveEventListener: 28
};

/**
 * @constructor
 */

class StashNextSibling {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {StashNextSibling}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {StashNextSibling=} obj
   * @returns {StashNextSibling}
   */
  static getRootAsStashNextSibling(bb, obj) {
    return (obj || new StashNextSibling()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {number}
   */
  address() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startStashNextSibling(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {number} address
   */
  static addAddress(builder, address) {
    builder.addFieldInt32(0, address, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endStashNextSibling(builder) {
    var offset = builder.endObject();
    return offset;
  }
}

class ShiftSiblings {
  constructor() {
    this.bb_pos = 0;
  }
  /**
   * @type {flatbuffers.ByteBuffer}
   */


  /**
   * @type {number}
   */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {ShiftSiblings}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {ShiftSiblings=} obj
  * @returns {ShiftSiblings}
  */
  static getRootAsShiftSiblings(bb, obj) {
    return (obj || new ShiftSiblings()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @returns {number}
  */
  count() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startShiftSiblings(builder) {
    builder.startObject(1);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {number} count
  */
  static addCount(builder, count) {
    builder.addFieldInt32(0, count, 0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endShiftSiblings(builder) {
    var offset = builder.endObject();
    return offset;
  }
}

/**
   * @constructor
   */
class DiscardStashed {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {DiscardStashed}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {DiscardStashed=} obj
   * @returns {DiscardStashed}
   */
  static getRootAsDiscardStashed(bb, obj) {
    return (obj || new DiscardStashed()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {number}
   */
  address() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startDiscardStashed(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {number} address
   */
  static addAddress(builder, address) {
    builder.addFieldInt32(0, address, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endDiscardStashed(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class AssignStringProperty {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {AssignStringProperty}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {AssignStringProperty=} obj
   * @returns {AssignStringProperty}
   */
  static getRootAsAssignStringProperty(bb, obj) {
    return (obj || new AssignStringProperty()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  name(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  value(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startAssignStringProperty(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} nameOffset
   */
  static addName(builder, nameOffset) {
    builder.addFieldOffset(0, nameOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} valueOffset
   */
  static addValue(builder, valueOffset) {
    builder.addFieldOffset(1, valueOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endAssignStringProperty(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class AssignBooleanProperty {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {AssignBooleanProperty}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {AssignBooleanProperty=} obj
   * @returns {AssignBooleanProperty}
   */
  static getRootAsAssignBooleanProperty(bb, obj) {
    return (obj || new AssignBooleanProperty()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  name(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @returns {boolean}
   */
  value() {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startAssignBooleanProperty(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} nameOffset
   */
  static addName(builder, nameOffset) {
    builder.addFieldOffset(0, nameOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {boolean} value
   */
  static addValue(builder, value) {
    builder.addFieldInt8(1, +value, +false);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endAssignBooleanProperty(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class AssignNumberProperty {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {AssignNumberProperty}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {AssignNumberProperty=} obj
   * @returns {AssignNumberProperty}
   */
  static getRootAsAssignNumberProperty(bb, obj) {
    return (obj || new AssignNumberProperty()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  name(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @returns {number}
   */
  value() {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readFloat64(this.bb_pos + offset) : 0.0;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startAssignNumberProperty(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} nameOffset
   */
  static addName(builder, nameOffset) {
    builder.addFieldOffset(0, nameOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {number} value
   */
  static addValue(builder, value) {
    builder.addFieldFloat64(1, value, 0.0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endAssignNumberProperty(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class AssignNullProperty {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {AssignNullProperty}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {AssignNullProperty=} obj
   * @returns {AssignNullProperty}
   */
  static getRootAsAssignNullProperty(bb, obj) {
    return (obj || new AssignNullProperty()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  name(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startAssignNullProperty(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} nameOffset
   */
  static addName(builder, nameOffset) {
    builder.addFieldOffset(0, nameOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endAssignNullProperty(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class DeleteProperty {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {DeleteProperty}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {DeleteProperty=} obj
   * @returns {DeleteProperty}
   */
  static getRootAsDeleteProperty(bb, obj) {
    return (obj || new DeleteProperty()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  name(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startDeleteProperty(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} nameOffset
   */
  static addName(builder, nameOffset) {
    builder.addFieldOffset(0, nameOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endDeleteProperty(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class SetStyleRule {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {SetStyleRule}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {SetStyleRule=} obj
   * @returns {SetStyleRule}
   */
  static getRootAsSetStyleRule(bb, obj) {
    return (obj || new SetStyleRule()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  name(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  value(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startSetStyleRule(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} nameOffset
   */
  static addName(builder, nameOffset) {
    builder.addFieldOffset(0, nameOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} valueOffset
   */
  static addValue(builder, valueOffset) {
    builder.addFieldOffset(1, valueOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endSetStyleRule(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class RemoveStyleRule {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {RemoveStyleRule}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {RemoveStyleRule=} obj
   * @returns {RemoveStyleRule}
   */
  static getRootAsRemoveStyleRule(bb, obj) {
    return (obj || new RemoveStyleRule()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  name(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startRemoveStyleRule(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} nameOffset
   */
  static addName(builder, nameOffset) {
    builder.addFieldOffset(0, nameOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endRemoveStyleRule(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class SetAttribute {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {SetAttribute}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {SetAttribute=} obj
   * @returns {SetAttribute}
   */
  static getRootAsSetAttribute(bb, obj) {
    return (obj || new SetAttribute()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  namespaceURI(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  name(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  value(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startSetAttribute(builder) {
    builder.startObject(3);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} namespaceURIOffset
   */
  static addNamespaceURI(builder, namespaceURIOffset) {
    builder.addFieldOffset(0, namespaceURIOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} nameOffset
   */
  static addName(builder, nameOffset) {
    builder.addFieldOffset(1, nameOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} valueOffset
   */
  static addValue(builder, valueOffset) {
    builder.addFieldOffset(2, valueOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endSetAttribute(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class RemoveAttribute {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {RemoveAttribute}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {RemoveAttribute=} obj
   * @returns {RemoveAttribute}
   */
  static getRootAsRemoveAttribute(bb, obj) {
    return (obj || new RemoveAttribute()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  namespaceURI(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  name(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startRemoveAttribute(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} namespaceURIOffset
   */
  static addNamespaceURI(builder, namespaceURIOffset) {
    builder.addFieldOffset(0, namespaceURIOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} nameOffset
   */
  static addName(builder, nameOffset) {
    builder.addFieldOffset(1, nameOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endRemoveAttribute(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class InsertText {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {InsertText}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {InsertText=} obj
   * @returns {InsertText}
   */
  static getRootAsInsertText(bb, obj) {
    return (obj || new InsertText()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  data(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startInsertText(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} dataOffset
   */
  static addData(builder, dataOffset) {
    builder.addFieldOffset(0, dataOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endInsertText(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class InsertComment {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {InsertComment}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {InsertComment=} obj
   * @returns {InsertComment}
   */
  static getRootAsInsertComment(bb, obj) {
    return (obj || new InsertComment()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  data(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startInsertComment(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} dataOffset
   */
  static addData(builder, dataOffset) {
    builder.addFieldOffset(0, dataOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endInsertComment(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class InsertElement {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {InsertElement}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {InsertElement=} obj
   * @returns {InsertElement}
   */
  static getRootAsInsertElement(bb, obj) {
    return (obj || new InsertElement()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  namespaceURI(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  localName(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startInsertElement(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} namespaceURIOffset
   */
  static addNamespaceURI(builder, namespaceURIOffset) {
    builder.addFieldOffset(0, namespaceURIOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} localNameOffset
   */
  static addLocalName(builder, localNameOffset) {
    builder.addFieldOffset(1, localNameOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endInsertElement(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class InsertStashedNode {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {InsertStashedNode}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {InsertStashedNode=} obj
   * @returns {InsertStashedNode}
   */
  static getRootAsInsertStashedNode(bb, obj) {
    return (obj || new InsertStashedNode()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {number}
   */
  address() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startInsertStashedNode(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {number} address
   */
  static addAddress(builder, address) {
    builder.addFieldInt32(0, address, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endInsertStashedNode(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class ReplaceWithText {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {ReplaceWithText}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {ReplaceWithText=} obj
   * @returns {ReplaceWithText}
   */
  static getRootAsReplaceWithText(bb, obj) {
    return (obj || new ReplaceWithText()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  data(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startReplaceWithText(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} dataOffset
   */
  static addData(builder, dataOffset) {
    builder.addFieldOffset(0, dataOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endReplaceWithText(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class ReplaceWithComment {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {ReplaceWithComment}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {ReplaceWithComment=} obj
   * @returns {ReplaceWithComment}
   */
  static getRootAsReplaceWithComment(bb, obj) {
    return (obj || new ReplaceWithComment()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  data(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startReplaceWithComment(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} dataOffset
   */
  static addData(builder, dataOffset) {
    builder.addFieldOffset(0, dataOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endReplaceWithComment(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class ReplaceWithElement {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {ReplaceWithElement}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {ReplaceWithElement=} obj
   * @returns {ReplaceWithElement}
   */
  static getRootAsReplaceWithElement(bb, obj) {
    return (obj || new ReplaceWithElement()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  namespaceURI(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  localName(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startReplaceWithElement(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} namespaceURIOffset
   */
  static addNamespaceURI(builder, namespaceURIOffset) {
    builder.addFieldOffset(0, namespaceURIOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} localNameOffset
   */
  static addLocalName(builder, localNameOffset) {
    builder.addFieldOffset(1, localNameOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endReplaceWithElement(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class ReplaceWithStashedNode {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {ReplaceWithStashedNode}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {ReplaceWithStashedNode=} obj
   * @returns {ReplaceWithStashedNode}
   */
  static getRootAsReplaceWithStashedNode(bb, obj) {
    return (obj || new ReplaceWithStashedNode()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {number}
   */
  address() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startReplaceWithStashedNode(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {number} address
   */
  static addAddress(builder, address) {
    builder.addFieldInt32(0, address, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endReplaceWithStashedNode(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class SetTextData {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {SetTextData}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {SetTextData=} obj
   * @returns {SetTextData}
   */
  static getRootAsSetTextData(bb, obj) {
    return (obj || new SetTextData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  data(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startSetTextData(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} dataOffset
   */
  static addData(builder, dataOffset) {
    builder.addFieldOffset(0, dataOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endSetTextData(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class EditTextData {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {EditTextData}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {EditTextData=} obj
   * @returns {EditTextData}
   */
  static getRootAsEditTextData(bb, obj) {
    return (obj || new EditTextData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {number}
   */
  start() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }

  /**
   * @returns {number}
   */
  end() {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  prefix(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.EncodingValue=} optionalEncoding
   * @returns {string|Uint8Array|null}
   */
  suffix(optionalEncoding) {
    var offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startEditTextData(builder) {
    builder.startObject(4);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {number} start
   */
  static addStart(builder, start) {
    builder.addFieldInt32(0, start, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {number} end
   */
  static addEnd(builder, end) {
    builder.addFieldInt32(1, end, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} prefixOffset
   */
  static addPrefix(builder, prefixOffset) {
    builder.addFieldOffset(2, prefixOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} suffixOffset
   */
  static addSuffix(builder, suffixOffset) {
    builder.addFieldOffset(3, suffixOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endEditTextData(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class SelectChildren {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {SelectChildren}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {SelectChildren=} obj
   * @returns {SelectChildren}
   */
  static getRootAsSelectChildren(bb, obj) {
    return (obj || new SelectChildren()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startSelectChildren(builder) {
    builder.startObject(0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endSelectChildren(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class SelectSibling {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {SelectSibling}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {SelectSibling=} obj
   * @returns {SelectSibling}
   */
  static getRootAsSelectSibling(bb, obj) {
    return (obj || new SelectSibling()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {number}
   */
  offset() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startSelectSibling(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {number} offset
   */
  static addOffset(builder, offset) {
    builder.addFieldInt32(0, offset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endSelectSibling(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class SelectParent {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {SelectParent}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {SelectParent=} obj
   * @returns {SelectParent}
   */
  static getRootAsSelectParent(bb, obj) {
    return (obj || new SelectParent()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startSelectParent(builder) {
    builder.startObject(0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endSelectParent(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class RemoveNextSibling {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {RemoveNextSibling}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {RemoveNextSibling=} obj
   * @returns {RemoveNextSibling}
   */
  static getRootAsRemoveNextSibling(bb, obj) {
    return (obj || new RemoveNextSibling()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startRemoveNextSibling(builder) {
    builder.startObject(0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endRemoveNextSibling(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
* @constructor
*/
// export namespace DOMinion{
class AddEventListener {
  constructor() {
    this.bb_pos = 0;
  }
  /**
  * @type {flatbuffers.ByteBuffer}
  */


  /**
  * @type {number}
  */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {AddEventListener}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {AddEventListener=} obj
  * @returns {AddEventListener}
  */
  static getRootAsAddEventListener(bb, obj) {
    return (obj || new AddEventListener()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @param {flatbuffers.Encoding=} optionalEncoding
  * @returns {string|Uint8Array|null}
  */
  type(optionalEncoding) {
    // type(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
    // type(optionalEncoding?:any):string|Uint8Array|null {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
  * @returns {boolean}
  */
  capture() {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
  }

  /**
  * @returns {Decoder.Decoder}
  */
  decoderType() {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? /** @type {Decoder.Decoder} */this.bb.readUint8(this.bb_pos + offset) : decoder.NONE;
  }

  /**
  * @param {flatbuffers.Table} obj
  * @returns {?flatbuffers.Table}
  */
  decoder(obj) {
    var offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startAddEventListener(builder) {
    builder.startObject(4);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {flatbuffers.Offset} typeOffset
  */
  static addType(builder, typeOffset) {
    builder.addFieldOffset(0, typeOffset, 0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {boolean} capture
  */
  static addCapture(builder, capture) {
    builder.addFieldInt8(1, +capture, +false);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {Decoder.Decoder} decoderType
  */
  static addDecoderType(builder, decoderType) {
    builder.addFieldInt8(2, decoderType, decoder.NONE);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {flatbuffers.Offset} decoderOffset
  */
  static addDecoder(builder, decoderOffset) {
    builder.addFieldOffset(3, decoderOffset, 0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endAddEventListener(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
// }
/**
* @constructor
*/
// export namespace DOMinion{
class RemoveEventListener {
  constructor() {
    this.bb_pos = 0;
  }
  /**
  * @type {flatbuffers.ByteBuffer}
  */


  /**
  * @type {number}
  */


  /**
  * @param {number} i
  * @param {flatbuffers.ByteBuffer} bb
  * @returns {RemoveEventListener}
  */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
  * @param {flatbuffers.ByteBuffer} bb
  * @param {RemoveEventListener=} obj
  * @returns {RemoveEventListener}
  */
  static getRootAsRemoveEventListener(bb, obj) {
    return (obj || new RemoveEventListener()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
  * @param {flatbuffers.Encoding=} optionalEncoding
  * @returns {string|Uint8Array|null}
  */
  type(optionalEncoding) {
    // type(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
    // type(optionalEncoding?:any):string|Uint8Array|null {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }

  /**
  * @returns {boolean}
  */
  capture() {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
  }

  /**
  * @returns {Decoder.Decoder}
  */
  decoderType() {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? /** @type {Decoder.Decoder} */this.bb.readUint8(this.bb_pos + offset) : decoder.NONE;
  }

  /**
  * @param {flatbuffers.Table} obj
  * @returns {?flatbuffers.Table}
  */
  decoder(obj) {
    var offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
  * @param {flatbuffers.Builder} builder
  */
  static startRemoveEventListener(builder) {
    builder.startObject(4);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {flatbuffers.Offset} typeOffset
  */
  static addType(builder, typeOffset) {
    builder.addFieldOffset(0, typeOffset, 0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {boolean} capture
  */
  static addCapture(builder, capture) {
    builder.addFieldInt8(1, +capture, +false);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {Decoder.Decoder} decoderType
  */
  static addDecoderType(builder, decoderType) {
    builder.addFieldInt8(2, decoderType, decoder.NONE);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @param {flatbuffers.Offset} decoderOffset
  */
  static addDecoder(builder, decoderOffset) {
    builder.addFieldOffset(3, decoderOffset, 0);
  }

  /**
  * @param {flatbuffers.Builder} builder
  * @returns {flatbuffers.Offset}
  */
  static endRemoveEventListener(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
// }
/**
   * @constructor
   */
class Change$1 {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {Change}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {Change=} obj
   * @returns {Change}
   */
  static getRootAsChange(bb, obj) {
    return (obj || new Change$1()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @returns {Op}
   */
  opType() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : op.NONE;
  }

  /**
   * @param {flatbuffers.Table} obj
   * @returns {?flatbuffers.Table}
   */
  op(obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startChange(builder) {
    builder.startObject(2);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Op} opType
   */
  static addOpType(builder, opType) {
    builder.addFieldInt8(0, opType, op.NONE);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} opOffset
   */
  static addOp(builder, opOffset) {
    builder.addFieldOffset(1, opOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endChange(builder) {
    var offset = builder.endObject();
    return offset;
  }
}
/**
   * @constructor
   */
class ChangeLog {
  constructor() {
    this.bb_pos = 0;
  }
  /**
     * @type {flatbuffers.ByteBuffer}
     */


  /**
     * @type {number}
     */


  /**
   * @param {number} i
   * @param {flatbuffers.ByteBuffer} bb
   * @returns {ChangeLog}
   */
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  /**
   * @param {flatbuffers.ByteBuffer} bb
   * @param {ChangeLog=} obj
   * @returns {ChangeLog}
   */
  static getRootAsChangeLog(bb, obj) {
    return (obj || new ChangeLog()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  /**
   * @param {number} index
   * @param {Change=} obj
   * @returns {Change}
   */
  log(index, obj) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? (obj || new Change$1()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }

  /**
   * @returns {number}
   */
  logLength() {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }

  /**
   * @param {flatbuffers.Builder} builder
   */
  static startChangeLog(builder) {
    builder.startObject(1);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} logOffset
   */
  static addLog(builder, logOffset) {
    builder.addFieldOffset(0, logOffset, 0);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {Array.<flatbuffers.Offset>} data
   * @returns {flatbuffers.Offset}
   */
  static createLogVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (var i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {number} numElems
   */
  static startLogVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @returns {flatbuffers.Offset}
   */
  static endChangeLog(builder) {
    var offset = builder.endObject();
    return offset;
  }

  /**
   * @param {flatbuffers.Builder} builder
   * @param {flatbuffers.Offset} offset
   */
  static finishChangeLogBuffer(builder, offset) {
    builder.finish(offset);
  }
}

class String$6 extends String$4 {
  static encode(builder, value) {
    const offset = builder.createString(value);
    String$6.startString(builder);
    String$6.addValue(builder, offset);
    return String$6.endString(builder);
  }
  static decode(table) {
    const value = table.value();
    if (value) {
      return value;
    } else {
      return new FieldError$1("value", String$6);
    }
  }
  decode() {
    return String$6.decode(this);
  }
}

class Float$5 extends Float$3 {
  static encode(builder, value) {
    Float$5.startFloat(builder);
    Float$5.addValue(builder, value);
    return Float$5.endFloat(builder);
  }
  static decode(table) {
    const value = table.value();
    if (value) {
      return value;
    } else {
      return new FieldError$1("value", Float$5);
    }
  }
  decode() {
    return Float$5.decode(this);
  }
}

class Integer$5 extends Integer$3 {
  static encode(builder, value) {
    Integer$5.startInteger(builder);
    Integer$5.addValue(builder, value);
    return Integer$5.endInteger(builder);
  }
  static decode(table) {
    const value = table.value();
    if (value) {
      return value;
    } else {
      return new FieldError$1("value", Integer$5);
    }
  }
  decode() {
    return Integer$5.decode(this);
  }
}

class Boolean$5 extends Boolean$3 {
  static encode(builder, value) {
    Boolean$5.startBoolean(builder);
    Boolean$5.addValue(builder, value);
    return Boolean$5.endBoolean(builder);
  }
  static decode(table) {
    return table.value();
  }
  decode() {
    return Boolean$5.decode(this);
  }
}

class Element$1 extends Element {
  static encode(builder, value) {
    const type = JSON$1.typeOf(value);
    const encodedValue = type === JSONVariant.NONE ? null : JSON$1.encode(builder, value);
    Element$1.startElement(builder);
    Element$1.addValueType(builder, type);
    if (encodedValue) {
      Element$1.addValue(builder, encodedValue);
    }
    return Element$1.endElement(builder);
  }
  static decode(table) {
    return JSON$1.decode(table);
  }
  decode() {
    return Element$1.decode(this);
  }
}

class JSONArray$1 extends JSONArray {
  static encode(builder, array) {
    const elements = [];
    for (let element of array) {
      elements.push(Element$1.encode(builder, element));
    }
    const offset = JSONArray$1.createElementsVector(builder, elements);
    JSONArray$1.startJSONArray(builder);
    JSONArray$1.addElements(builder, offset);
    return JSONArray$1.endJSONArray(builder);
  }
  static decode(table) {
    const cursor = JSONArray$1.element;
    const length = table.elementsLength();
    const elements = [];
    let index = 0;
    while (index < length) {
      const element = table.elements(index, cursor);
      if (element == null) {
        return new FieldError$1(index.toString(), JSONArray$1);
      } else {
        const value = Element$1.decode(cursor);
        if (value instanceof DecoderError) {
          return value;
        } else {
          elements[index] = value;
        }
      }
      index += 1;
    }
    return elements;
  }
  decode() {
    return JSONArray$1.decode(this);
  }
}

JSONArray$1.element = new Element$1();
class Property$1 extends Property {
  static encode(builder, name, value) {
    const encodedName = builder.createString(name);
    const encodedValue = JSON$1.encode(builder, value);
    Property$1.startProperty(builder);
    Property$1.addName(builder, encodedName);
    Property$1.addValueType(builder, JSON$1.typeOf(value));
    if (encodedValue != null) {
      Property$1.addValue(builder, encodedValue);
    }
    return Property$1.endProperty(builder);
  }
}

class JSONObject$1 extends JSONObject {
  static encode(builder, object) {
    const properties = [];
    for (const name of Object.keys(object)) {
      const value = object[name];
      properties.push(Property$1.encode(builder, name, value));
    }
    const offset = JSONObject.createPropertiesVector(builder, properties);
    JSONObject$1.startJSONObject(builder);
    JSONObject$1.addProperties(builder, offset);

    return JSONObject$1.endJSONObject(builder);
  }
  static decode(table) {
    const object = Object.create(null);

    const cursor = JSONObject$1.property;
    const length = table.propertiesLength();
    let index = 0;
    while (index < length) {
      const property = table.properties(index, cursor);
      if (property == null) {
        return new FieldError$1(`property # ${index}`, Object);
      } else {
        const property = cursor;
        const name = property.name();
        const value = JSON$1.decode(property);
        if (value instanceof DecoderError) {
          return value;
        } else if (name == null) {
          return new FieldError$1("name", Property$1);
        } else {
          object[name] = value;
        }
      }
      index += 1;
    }

    return object;
  }
  decode() {
    return JSONObject$1.decode(this);
  }
}

JSONObject$1.property = new Property$1();
class JSON$1 {
  static from(value) {
    return value;
  }
  static typeOf(value) {
    switch (typeof value) {
      case "string":
        return JSONVariant.String;
      case "boolean":
        return JSONVariant.Boolean;
      case "number":
        return JSONVariant.Float;
      default:
        {
          if (value === null) {
            return JSONVariant.NONE;
          } else {
            return JSONVariant.JSONObject;
          }
        }
    }
  }
  static encode(builder, value) {
    switch (typeof value) {
      case "string":
        {
          return String$6.encode(builder, value);
        }
      case "number":
        {
          return Float$5.encode(builder, value);
        }
      case "boolean":
        {
          return Boolean$5.encode(builder, value);
        }
      case "object":
        {
          if (value === null) {
            return null;
          } else if (Array.isArray(value)) {
            return JSONArray$1.encode(builder, value);
          } else {
            return JSONObject$1.encode(builder, value);
          }
        }
      default:
        return unreachable(value);
    }
  }
  static decode(table) {
    const type = table.valueType();
    const variant = JSON$1.pool[type];
    if (variant == null) {
      return null;
    } else {
      const value = table.value(variant);
      if (value) {
        return value.decode();
      } else {
        return new VariantError(JSON$1, JSONVariant, type);
      }
    }
  }
}

JSON$1.pool = {
  [JSONVariant.NONE]: null,
  [JSONVariant.Boolean]: new Boolean$5(),
  [JSONVariant.String]: new String$6(),
  [JSONVariant.Float]: new Float$5(),
  [JSONVariant.Integer]: new Integer$5(),
  [JSONVariant.JSONArray]: new JSONArray$1(),
  [JSONVariant.JSONObject]: new JSONObject$1()
};

const decoderType = decoder;


class Accessor$2 extends Accessor$1 {
  static encode(builder, name, decoder$$1) {
    const nameOffset = builder.createString(name);
    const decoderOffset = Variant$1.encode(builder, decoder$$1);
    Accessor$2.startAccessor(builder);
    Accessor$2.addName(builder, nameOffset);
    Accessor$2.addDecoderType(builder, Variant$1.typeOf(decoder$$1));
    Accessor$2.addDecoder(builder, decoderOffset);
    return Accessor$2.endAccessor(builder);
  }
  static decode(name, decoder$$1) {
    return accessor(name, decoder$$1);
  }
  decode() {
    const name = this.name();
    if (!name) {
      return new FieldError$1("name", Accessor$2);
    }
    const decoder$$1 = Variant$1.decode(this);
    if (decoder$$1 instanceof DecoderError) {
      return decoder$$1;
    } else {
      return Accessor$2.decode(name, decoder$$1);
    }
  }
}

class Collection$1 extends Collection {
  static encode(builder, decoder$$1) {
    const encodedDecoder = Variant$1.encode(builder, decoder$$1);
    Collection$1.startCollection(builder);
    Collection$1.addDecoderType(builder, Variant$1.typeOf(decoder$$1));
    Collection$1.addDecoder(builder, encodedDecoder);
    return Collection$1.endCollection(builder);
  }
  static decode(decoder$$1) {
    return array(decoder$$1);
  }
  decode() {
    const decoder$$1 = Variant$1.decode(this);
    if (decoder$$1 instanceof DecoderError) {
      return decoder$$1;
    } else {
      return Collection$1.decode(decoder$$1);
    }
  }
}

class Dictionary$2 extends Dictionary$1 {
  static encode(builder, decoder$$1) {
    const encodedDecoder = Variant$1.encode(builder, decoder$$1);
    Dictionary$2.startDictionary(builder);
    Dictionary$2.addDecoderType(builder, Variant$1.typeOf(decoder$$1));
    Dictionary$2.addDecoder(builder, encodedDecoder);
    return Dictionary$2.endDictionary(builder);
  }
  static decode(decoder$$1) {
    return dictionary(decoder$$1);
  }
  decode() {
    const decoder$$1 = Variant$1.decode(this);
    if (decoder$$1 instanceof DecoderError) {
      return decoder$$1;
    } else {
      return Dictionary$2.decode(decoder$$1);
    }
  }
}

class Maybe$2 extends Maybe$1 {
  static encode(builder, decoder$$1) {
    const encodedDecoder = Variant$1.encode(builder, decoder$$1);
    Maybe$2.startMaybe(builder);
    Maybe$2.addDecoderType(builder, Variant$1.typeOf(decoder$$1));
    Maybe$2.addDecoder(builder, encodedDecoder);
    return Maybe$2.endMaybe(builder);
  }
  static decode(decoder$$1) {
    return maybe(decoder$$1);
  }
  decode() {
    const decoder$$1 = Variant$1.decode(this);
    if (decoder$$1 instanceof DecoderError) {
      return decoder$$1;
    } else {
      return Maybe$2.decode(decoder$$1);
    }
  }
}

class Optional$2 extends Optional$1 {
  static encode(builder, decoder$$1) {
    const encodedDecoder = Variant$1.encode(builder, decoder$$1);
    Optional$2.startOptional(builder);
    Optional$2.addDecoderType(builder, Variant$1.typeOf(decoder$$1));
    Optional$2.addDecoder(builder, encodedDecoder);
    return Optional$2.endOptional(builder);
  }
  static decode(decoder$$1) {
    return optional(decoder$$1);
  }
  decode() {
    const decoder$$1 = Variant$1.decode(this);
    if (decoder$$1 instanceof DecoderError) {
      return decoder$$1;
    } else {
      return Optional$2.decode(decoder$$1);
    }
  }
}

class Either$2 extends Either$1 {
  static encode(builder, decoders) {
    const variants = [];
    for (const decoder$$1 of decoders) {
      const encodedDecoder = Variant$1.encode(builder, decoder$$1);
      Variant$1.startVariant(builder);
      Variant$1.addDecoderType(builder, Variant$1.typeOf(decoder$$1));
      Variant$1.addDecoder(builder, encodedDecoder);
      const encodedVariant = Variant$1.endVariant(builder);
      variants.push(encodedVariant);
    }

    const encodedVariants = Either$2.createVariantsVector(builder, variants);

    Either$2.startEither(builder);
    Either$2.addVariants(builder, encodedVariants);

    return Either$2.endEither(builder);
  }
  static decode(decoders) {
    return either(...decoders);
  }
  decode() {
    const cursor = Either$2.variant;
    const length = this.variantsLength();
    const variants = [];
    let index$$1 = 0;
    while (index$$1 < length) {
      const variant = this.variants(index$$1, cursor);
      if (variant == null) {
        return new FieldError$1(index$$1.toString(), Either$2);
      } else {
        const decoder$$1 = Variant$1.decode(variant);
        if (decoder$$1 instanceof DecoderError) {
          return decoder$$1;
        } else {
          variants[index$$1] = decoder$$1;
        }
      }
      index$$1 += 1;
    }
    return Either$2.decode(variants);
  }
}

Either$2.variant = new Variant();
class Undefined$2 extends Undefined$1 {
  static encode(builder, value) {
    const encodedValue = JSON$1.encode(builder, value);
    Undefined$2.startUndefined(builder);
    Undefined$2.addValueType(builder, JSON$1.typeOf(value));
    if (encodedValue) {
      Undefined$2.addValue(builder, encodedValue);
    }
    return Undefined$2.endUndefined(builder);
  }
  static decode(value) {
    return avoid(value);
  }
  decode() {
    const value = JSON$1.decode(this);
    if (value instanceof DecoderError) {
      return new FieldError$1("value", Undefined$2);
    } else {
      return Undefined$2.decode(value);
    }
  }
}

class Null$2 extends Null$1 {
  static encode(builder, value) {
    const encodedValue = JSON$1.encode(builder, value);
    Null$2.startNull(builder);
    Null$2.addValueType(builder, JSON$1.typeOf(value));
    if (encodedValue) {
      Null$2.addValue(builder, encodedValue);
    }
    return Null$2.endNull(builder);
  }
  static decode(value) {
    return annul(value);
  }
  decode() {
    const value = JSON$1.decode(this);
    if (value instanceof DecoderError) {
      return new FieldError$1("value", Null$2);
    } else {
      return Null$2.decode(value);
    }
  }
}

class Boolean$4 extends Boolean$2 {
  static encode(builder) {
    Boolean$4.startBoolean(builder);
    return Boolean$4.endBoolean(builder);
  }
  static decode() {
    return Boolean$$1;
  }
  decode() {
    return Boolean$$1;
  }
}

class Integer$4 extends Integer$2 {
  static encode(builder) {
    Integer$4.startInteger(builder);
    return Integer$4.endInteger(builder);
  }
  static decode() {
    return Integer$$1;
  }
  decode() {
    return Integer$$1;
  }
}

class Float$4 extends Float$2 {
  static encode(builder) {
    Float$4.startFloat(builder);
    return Float$4.endFloat(builder);
  }
  static decode() {
    return Float$$1;
  }
  decode() {
    return Float$$1;
  }
}

class String$5 extends String$3 {
  static encode(builder) {
    String$5.startString(builder);
    return String$5.endString(builder);
  }
  static decode() {
    return String$1;
  }
  static decode() {
    return String$1;
  }
  decode() {
    return String$1;
  }
}

class Field$2 extends Field$1 {
  static encode(builder, name, decoder$$1) {
    const encodedName = builder.createString(name);
    const encodedVariant = Variant$1.encode(builder, decoder$$1);
    Field$2.startField(builder);
    Field$2.addName(builder, encodedName);
    Field$2.addDecoderType(builder, Variant$1.typeOf(decoder$$1));
    Field$2.addDecoder(builder, encodedVariant);
    return Field$2.endField(builder);
  }
  static decode(name, decoder$$1) {
    return field(name, decoder$$1);
  }
  decode() {
    const name = this.name();
    if (!name) {
      return new FieldError$1("name", Field$2);
    }
    const decoder$$1 = Variant$1.decode(this);
    if (decoder$$1 instanceof DecoderError) {
      return decoder$$1;
    } else {
      return field(name, decoder$$1);
    }
  }
}

class Index$2 extends Index$1 {
  static encode(builder, index$$1, decoder$$1) {
    const encodedVariant = Variant$1.encode(builder, decoder$$1);
    Index$2.startIndex(builder);
    Index$2.addIndex(builder, index$$1);
    Index$2.addDecoderType(builder, Variant$1.typeOf(decoder$$1));
    Index$2.addDecoder(builder, encodedVariant);
    return Index$2.endIndex(builder);
  }
  static decode(index$$1, decoder$$1) {
    return index(index$$1, decoder$$1);
  }
  decode() {
    const index$$1 = this.index();
    const decoder$$1 = Variant$1.decode(this);
    if (decoder$$1 instanceof DecoderError) {
      return decoder$$1;
    } else {
      return index(index$$1, decoder$$1);
    }
  }
}

class Ok$3 extends Ok$2 {
  static encode(builder, value) {
    const encodedValue = JSON$1.encode(builder, value);
    Ok$3.startOk(builder);
    Ok$3.addValueType(builder, JSON$1.typeOf(value));
    if (encodedValue) {
      Ok$3.addValue(builder, encodedValue);
    }
    return Ok$3.endOk(builder);
  }
  static decode(value) {
    return ok$1(value);
  }
  decode() {
    const value = JSON$1.decode(this);
    if (value instanceof DecoderError) {
      return value;
    } else {
      return Ok$3.decode(value);
    }
  }
}

class Match$2 extends Match$1 {
  static encode(builder, value) {
    const encodedValue = JSON$1.encode(builder, value);
    Match$2.startMatch(builder);
    Match$2.addValueType(builder, JSON$1.typeOf(value));
    if (encodedValue) {
      Match$2.addValue(builder, encodedValue);
    }
    return Match$2.endMatch(builder);
  }
  static decode(value) {
    return match(value);
  }
  decode() {
    const value = JSON$1.decode(this);
    if (value instanceof DecoderError) {
      return value;
    } else {
      return Match$2.decode(value);
    }
  }
}

class Left {
  reset(source) {
    this.source = source;
    return this;
  }
  decoderType() {
    return this.source.leftType();
  }
  decoder(table) {
    return this.source.left(table);
  }
}

class Right {
  reset(source) {
    this.source = source;
    return this;
  }
  decoderType() {
    return this.source.rightType();
  }
  decoder(table) {
    return this.source.right(table);
  }
}

class And$2 extends And$1 {
  static encode(builder, left, right) {
    const encodedLeft = Variant$1.encode(builder, left);
    const encodedRight = Variant$1.encode(builder, right);

    And$2.startAnd(builder);
    And$2.addLeftType(builder, Variant$1.typeOf(left));
    And$2.addLeft(builder, encodedLeft);
    And$2.addRightType(builder, Variant$1.typeOf(right));
    And$2.addRight(builder, encodedRight);
    return And$2.endAnd(builder);
  }
  static decode(left, right) {
    return and$1(left, right);
  }
  decode() {
    const left = Variant$1.decode(And$2.left.reset(this));
    if (left instanceof DecoderError) {
      return left;
    }
    const right = Variant$1.decode(And$2.right.reset(this));
    if (right instanceof DecoderError) {
      return right;
    }
    return And$2.decode(left, right);
  }
}

And$2.left = new Left();
And$2.right = new Right();
class Error$5 extends Error$4 {
  static encode(builder, message) {
    const encodedMessage = builder.createString(message);
    Error$5.startError(builder);
    Error$5.addMessage(builder, encodedMessage);
    return Error$5.endError(builder);
  }
  static decode(message) {
    return error$1(message);
  }
  decode() {
    const message = this.message();
    if (message == null) {
      return new FieldError$1("message", Error$5);
    } else {
      return Error$5.decode(message);
    }
  }
}

class Fields {
  static encode(builder, fields) {
    const offsets = [];
    for (let name of Object.keys(fields)) {
      const decoder$$1 = fields[name];
      const nameOffset = builder.createString(name);
      const valueOffset = Variant$1.encode(builder, decoder$$1);
      Field$2.startField(builder);
      Field$2.addName(builder, nameOffset);
      Field$2.addDecoderType(builder, Variant$1.typeOf(decoder$$1));
      Field$2.addDecoder(builder, valueOffset);
      offsets.push(Field$2.endField(builder));
    }
    return offsets;
  }
  static decode(table) {
    const fields = Object.create(null);
    const cursor = Fields.field;
    const length = table.fieldsLength();
    let index$$1 = 0;
    while (index$$1 < length) {
      const field$$1 = table.fields(index$$1, cursor);
      if (field$$1 == null) {
        return new FieldError$1(`field#${index$$1}`, Form$2);
      } else {
        const name = cursor.name();
        if (name == null) {
          return new FieldError$1(`field#${index$$1}.name`, Form$2);
        }
        const decoder$$1 = Variant$1.decode(cursor);
        if (decoder$$1 instanceof DecoderError) {
          return decoder$$1;
        }
        fields[name] = decoder$$1;
      }
      index$$1 += 1;
    }
    return fields;
  }
}

Fields.field = new Field$2();
class Form$2 extends Form$1 {
  static encode(builder, fields) {
    const encodedFields = Form$2.createFormVector(builder, Fields.encode(builder, fields));

    Form$2.startForm(builder);
    Form$2.addFields(builder, encodedFields);
    return Form$2.endForm(builder);
  }
  static decode(fields) {
    return form(fields);
  }
  decode() {
    const fields = Fields.decode(this);
    if (fields instanceof DecoderError) {
      return fields;
    } else {
      return Form$2.decode(fields);
    }
  }
}

Form$2.cursor = new Field$2();
class Record$1 extends Record {
  static encode(builder, fields) {
    const encodedFields = Record$1.createFieldsVector(builder, Fields.encode(builder, fields));
    Record$1.startRecord(builder);
    Record$1.addFields(builder, encodedFields);
    return Record$1.endRecord(builder);
  }
  static decode(fields) {
    return record(fields);
  }
  decode() {
    const fields = Fields.decode(this);
    if (fields instanceof DecoderError) {
      return fields;
    } else {
      return Record$1.decode(fields);
    }
  }
}

class Variant$1 extends Variant {
  static typeOf(decoder$$1) {
    const { type } = decoder$$1;
    switch (type) {
      case "Array":
        return decoderType.Collection;
      default:
        return decoderType[type];
    }
  }
  static encode(builder, decoder$$1) {
    switch (decoder$$1.type) {
      case "Accessor":
        {
          return Accessor$2.encode(builder, decoder$$1.name, decoder$$1.accessor);
        }
      case "Array":
        {
          return Collection$1.encode(builder, decoder$$1.array);
        }
      case "Boolean":
        {
          return Boolean$4.encode(builder);
        }
      case "Integer":
        {
          return Integer$4.encode(builder);
        }
      case "Float":
        {
          return Float$4.encode(builder);
        }
      case "String":
        {
          return String$5.encode(builder);
        }
      case "Dictionary":
        {
          return Dictionary$2.encode(builder, decoder$$1.dictionary);
        }
      case "Maybe":
        {
          return Maybe$2.encode(builder, decoder$$1.maybe);
        }
      case "Optional":
        {
          return Optional$2.encode(builder, decoder$$1.optional);
        }
      case "Either":
        {
          return Either$2.encode(builder, decoder$$1.either);
        }
      case "Null":
        {
          return Null$2.encode(builder, JSON$1.from(decoder$$1.Null));
        }
      case "Undefined":
        {
          return Undefined$2.encode(builder, JSON$1.from(decoder$$1.Undefined));
        }
      case "Field":
        {
          return Field$2.encode(builder, decoder$$1.name, decoder$$1.field);
        }
      case "Index":
        {
          return Index$2.encode(builder, decoder$$1.index, decoder$$1.member);
        }
      case "Ok":
        {
          return Ok$3.encode(builder, JSON$1.from(decoder$$1.value));
        }
      case "Error":
        {
          return Error$5.encode(builder, decoder$$1.message);
        }
      case "Record":
        {
          return Record$1.encode(builder, decoder$$1.fields);
        }
      case "Form":
        {
          return Form$2.encode(builder, decoder$$1.form);
        }
      case "And":
        {
          return And$2.encode(builder, decoder$$1.left, decoder$$1.right);
        }
      case "Match":
        {
          return Match$2.encode(builder, JSON$1.from(decoder$$1.match));
        }
      default:
        return unreachable(decoder$$1);
    }
  }
  static cursor(type) {
    return Variant$1.pool[type];
  }
  static decode(table) {
    const type = table.decoderType();
    const cursor = Variant$1.cursor(type);
    const variant = cursor && table.decoder(cursor);
    const decoder$$1 = variant && variant.decode();

    if (decoder$$1 == null) {
      return new VariantError(Variant$1, decoderType, type);
    } else if (decoder$$1 instanceof DecoderError) {
      return decoder$$1;
    } else {
      return decoder$$1;
    }
  }
}
Variant$1.pool = {
  [decoderType.Accessor]: new Accessor$2(),
  [decoderType.Collection]: new Collection$1(),
  [decoderType.Dictionary]: new Dictionary$2(),
  [decoderType.Either]: new Either$2(),
  [decoderType.Error]: new Error$5(),
  [decoderType.Field]: new Field$2(),
  [decoderType.Form]: new Form$2(),
  [decoderType.Index]: new Index$2(),
  [decoderType.Maybe]: new Maybe$2(),
  [decoderType.Null]: new Null$2(),
  [decoderType.Ok]: new Ok$3(),
  [decoderType.Optional]: new Optional$2(),
  [decoderType.Record]: new Record$1(),
  [decoderType.Undefined]: new Undefined$2(),
  [decoderType.Boolean]: new Boolean$4(),
  [decoderType.Float]: new Float$4(),
  [decoderType.Integer]: new Integer$4(),
  [decoderType.String]: new String$5(),
  [decoderType.Match]: new Match$2(),
  [decoderType.And]: new And$2()
};

const opType = op;


class AssignBooleanProperty$1 extends AssignBooleanProperty {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.opType = opType.AssignBooleanProperty, _temp;
  }

  static encode(builder, name, value) {
    const nameOffset = builder.createString(name);
    AssignBooleanProperty$1.startAssignBooleanProperty(builder);
    AssignBooleanProperty$1.addName(builder, nameOffset);
    AssignBooleanProperty$1.addValue(builder, value);
    return AssignBooleanProperty$1.endAssignBooleanProperty(builder);
  }
  decode(changeLog, buffer) {
    const name = this.name();
    if (name == null) {
      return new FieldError$1("name", AssignBooleanProperty$1);
    } else {
      return changeLog.assignProperty(buffer, name, this.value());
    }
  }
}

AssignBooleanProperty$1.opType = opType.AssignBooleanProperty;
class AssignNullProperty$1 extends AssignNullProperty {
  constructor(...args) {
    var _temp2;

    return _temp2 = super(...args), this.opType = opType.AssignNullProperty, _temp2;
  }

  static encode(builder, name, value = null) {
    const nameOffset = builder.createString(name);
    AssignNullProperty$1.startAssignNullProperty(builder);
    AssignNullProperty$1.addName(builder, nameOffset);
    return AssignNullProperty$1.endAssignNullProperty(builder);
  }
  decode(changeLog, buffer) {
    const name = this.name();
    if (name == null) {
      return new FieldError$1("name", AssignNullProperty$1);
    } else {
      return changeLog.assignProperty(buffer, name, null);
    }
  }
}

AssignNullProperty$1.opType = opType.AssignNullProperty;
class AssignNumberProperty$1 extends AssignNumberProperty {
  constructor(...args) {
    var _temp3;

    return _temp3 = super(...args), this.opType = opType.AssignNumberProperty, _temp3;
  }

  static encode(builder, name, value) {
    const nameOffset = builder.createString(name);
    AssignNumberProperty$1.startAssignNumberProperty(builder);
    AssignNumberProperty$1.addName(builder, nameOffset);
    AssignNumberProperty$1.addValue(builder, value);
    return AssignNumberProperty$1.endAssignNumberProperty(builder);
  }
  decode(changeLog, buffer) {
    const name = this.name();
    if (name == null) {
      return new FieldError$1("name", AssignNumberProperty$1);
    } else {
      return changeLog.assignProperty(buffer, name, this.value());
    }
  }
}

AssignNumberProperty$1.opType = opType.AssignNumberProperty;
class AssignStringProperty$1 extends AssignStringProperty {
  constructor(...args) {
    var _temp4;

    return _temp4 = super(...args), this.opType = opType.AssignStringProperty, _temp4;
  }

  static encode(builder, name, value) {
    const nameOffset = builder.createString(name);
    const valueOffset = builder.createString(value);
    AssignStringProperty$1.startAssignStringProperty(builder);
    AssignStringProperty$1.addName(builder, nameOffset);
    AssignStringProperty$1.addValue(builder, valueOffset);
    return AssignStringProperty$1.endAssignStringProperty(builder);
  }
  decode(changeLog, buffer) {
    const name = this.name();
    if (name == null) {
      return new FieldError$1("name", AssignStringProperty$1);
    } else {
      return changeLog.assignProperty(buffer, name, this.value());
    }
  }
}

AssignStringProperty$1.opType = opType.AssignStringProperty;
class DeleteProperty$1 extends DeleteProperty {
  constructor(...args) {
    var _temp5;

    return _temp5 = super(...args), this.opType = opType.DeleteProperty, _temp5;
  }

  static encode(builder, name) {
    const nameOffset = builder.createString(name);
    DeleteProperty$1.startDeleteProperty(builder);
    DeleteProperty$1.addName(builder, nameOffset);
    return DeleteProperty$1.endDeleteProperty(builder);
  }
  decode(changeLog, buffer) {
    const name = this.name();
    if (name == null) {
      return new FieldError$1("name", DeleteProperty$1);
    } else {
      return changeLog.deleteProperty(buffer, name);
    }
  }
}

DeleteProperty$1.opType = opType.DeleteProperty;
class AddEventListener$1 extends AddEventListener {
  constructor(...args) {
    var _temp6;

    return _temp6 = super(...args), this.opType = opType.AddEventListener, _temp6;
  }

  static encode(builder, type, decoder, capture) {
    const typeOffset = builder.createString(type);
    const decoderOffset = Variant$1.encode(builder, decoder);

    AddEventListener$1.startAddEventListener(builder);
    AddEventListener$1.addType(builder, typeOffset);
    AddEventListener$1.addDecoderType(builder, Variant$1.typeOf(decoder));
    AddEventListener$1.addDecoder(builder, decoderOffset);
    AddEventListener$1.addCapture(builder, capture);

    return AddEventListener$1.endAddEventListener(builder);
  }
  decode(changeLog, buffer) {
    const capture = this.capture();
    const type = this.type();
    if (type == null) {
      return new FieldError$1("type", AddEventListener$1);
    }
    const decoder = Variant$1.decode(this);
    if (decoder instanceof DecoderError) {
      return new FieldError$1("decoder", AddEventListener$1);
    } else {
      return changeLog.addEventDecoder(buffer, type, decoder, capture);
    }
  }
}

AddEventListener$1.opType = opType.AddEventListener;
class RemoveEventListener$1 extends RemoveEventListener {
  constructor(...args) {
    var _temp7;

    return _temp7 = super(...args), this.opType = opType.RemoveEventListener, _temp7;
  }

  static encode(builder, type, decoder, capture) {
    const typeOffset = builder.createString(type);
    const decoderOffset = Variant$1.encode(builder, decoder);

    RemoveEventListener$1.startRemoveEventListener(builder);
    RemoveEventListener$1.addType(builder, typeOffset);
    RemoveEventListener$1.addDecoderType(builder, Variant$1.typeOf(decoder));
    RemoveEventListener$1.addDecoder(builder, decoderOffset);
    RemoveEventListener$1.addCapture(builder, capture);

    return RemoveEventListener$1.endRemoveEventListener(builder);
  }
  decode(changeLog, buffer) {
    const capture = this.capture();
    const type = this.type();
    if (type == null) {
      return new FieldError$1("type", RemoveEventListener$1);
    }

    const decoder = Variant$1.decode(this);
    if (decoder instanceof DecoderError) {
      return new FieldError$1("decoder", RemoveEventListener$1);
    } else {
      return changeLog.removeEventDecoder(buffer, type, decoder, capture);
    }
  }
}

RemoveEventListener$1.opType = opType.RemoveEventListener;
class DiscardStashed$1 extends DiscardStashed {
  constructor(...args) {
    var _temp8;

    return _temp8 = super(...args), this.opType = opType.DiscardStashed, _temp8;
  }

  static encode(builder, address) {
    DiscardStashed$1.startDiscardStashed(builder);
    DiscardStashed$1.addAddress(builder, address);
    return DiscardStashed$1.endDiscardStashed(builder);
  }
  decode(changeLog, buffer) {
    return changeLog.discardStashedNode(buffer, this.address());
  }
}

DiscardStashed$1.opType = opType.DiscardStashed;
class ShiftSiblings$1 extends ShiftSiblings {
  constructor(...args) {
    var _temp9;

    return _temp9 = super(...args), this.opType = opType.ShiftSiblings, _temp9;
  }

  static encode(builder, count) {
    ShiftSiblings$1.startShiftSiblings(builder);
    ShiftSiblings$1.addCount(builder, count);
    return ShiftSiblings$1.endShiftSiblings(builder);
  }
  decode(changeLog, buffer) {
    return changeLog.shiftSiblings(buffer, this.count());
  }
}

ShiftSiblings$1.opType = opType.ShiftSiblings;
class EditTextData$1 extends EditTextData {
  constructor(...args) {
    var _temp10;

    return _temp10 = super(...args), this.opType = opType.EditTextData, _temp10;
  }

  static encode(builder, start, end, prefix, suffix) {
    const prefixOffset = builder.createString(prefix);
    const suffixOffset = builder.createString(suffix);
    EditTextData$1.startEditTextData(builder);
    EditTextData$1.addStart(builder, start);
    EditTextData$1.addEnd(builder, end);
    EditTextData$1.addPrefix(builder, prefixOffset);
    EditTextData$1.addSuffix(builder, suffixOffset);
    return EditTextData$1.endEditTextData(builder);
  }
  decode(changeLog, buffer) {
    const prefix = this.prefix();
    if (prefix == null) {
      return new FieldError$1("prefix", EditTextData$1);
    }

    const suffix = this.suffix();
    if (suffix == null) {
      return new FieldError$1("suffix", EditTextData$1);
    }

    return changeLog.editTextData(buffer, this.start(), this.end(), prefix, suffix);
  }
}

EditTextData$1.opType = opType.EditTextData;
class InsertComment$1 extends InsertComment {
  constructor(...args) {
    var _temp11;

    return _temp11 = super(...args), this.opType = opType.InsertComment, _temp11;
  }

  static encode(builder, data) {
    const dataOffset = builder.createString(data);
    InsertComment$1.startInsertComment(builder);
    InsertComment$1.addData(builder, dataOffset);
    return InsertComment$1.endInsertComment(builder);
  }
  decode(changeLog, buffer) {
    const data = this.data();
    if (data == null) {
      return new FieldError$1("data", InsertComment$1);
    } else {
      return changeLog.insertComment(buffer, data);
    }
  }
}

InsertComment$1.opType = opType.InsertComment;
class InsertElement$1 extends InsertElement {
  constructor(...args) {
    var _temp12;

    return _temp12 = super(...args), this.opType = opType.InsertElement, _temp12;
  }

  static encode(builder, namespaceURI, localName) {
    const namespaceURIOffset = namespaceURI == null ? null : builder.createString(namespaceURI);
    const localNameOffset = builder.createString(localName);
    InsertElement$1.startInsertElement(builder);
    if (namespaceURIOffset != null) {
      InsertElement$1.addNamespaceURI(builder, namespaceURIOffset);
    }
    InsertElement$1.addLocalName(builder, localNameOffset);
    return InsertElement$1.endInsertElement(builder);
  }
  decode(changeLog, buffer) {
    const localName = this.localName();
    if (localName == null) {
      return new FieldError$1("localName", InsertElement$1);
    }

    const namespaceURI = this.namespaceURI();
    if (namespaceURI == null) {
      return changeLog.insertElement(buffer, localName);
    } else {
      return changeLog.insertElementNS(buffer, namespaceURI, localName);
    }
  }
}

InsertElement$1.opType = opType.InsertElement;
class InsertStashedNode$1 extends InsertStashedNode {
  constructor(...args) {
    var _temp13;

    return _temp13 = super(...args), this.opType = opType.InsertStashedNode, _temp13;
  }

  static encode(builder, address) {
    InsertStashedNode$1.startInsertStashedNode(builder);
    InsertStashedNode$1.addAddress(builder, address);
    return InsertStashedNode$1.endInsertStashedNode(builder);
  }
  decode(changeLog, buffer) {
    return changeLog.insertStashedNode(buffer, this.address());
  }
}

InsertStashedNode$1.opType = opType.InsertStashedNode;
class InsertText$1 extends InsertText {
  constructor(...args) {
    var _temp14;

    return _temp14 = super(...args), this.opType = opType.InsertText, _temp14;
  }

  static encode(builder, data) {
    const dataOffset = builder.createString(data);
    InsertText$1.startInsertText(builder);
    InsertText$1.addData(builder, dataOffset);
    return InsertText$1.endInsertText(builder);
  }
  decode(changeLog, buffer) {
    const data = this.data();
    if (data == null) {
      return new FieldError$1("data", InsertText$1);
    } else {
      return changeLog.insertText(buffer, data);
    }
  }
}

InsertText$1.opType = opType.InsertText;
class RemoveAttribute$1 extends RemoveAttribute {
  constructor(...args) {
    var _temp15;

    return _temp15 = super(...args), this.opType = opType.RemoveAttribute, _temp15;
  }

  static encode(builder, namespaceURI, name) {
    const namespaceURIOffset = namespaceURI == null ? null : builder.createString(namespaceURI);
    const nameOffset = builder.createString(name);
    RemoveAttribute$1.startRemoveAttribute(builder);
    if (namespaceURIOffset != null) {
      RemoveAttribute$1.addNamespaceURI(builder, namespaceURIOffset);
    }
    RemoveAttribute$1.addName(builder, nameOffset);

    return RemoveAttribute$1.endRemoveAttribute(builder);
  }
  decode(changeLog, buffer) {
    const name = this.name();
    if (name == null) {
      return new FieldError$1("name", RemoveAttribute$1);
    }
    const namespaceURI = this.namespaceURI();
    if (namespaceURI == null) {
      return changeLog.removeAttribute(buffer, name);
    } else {
      return changeLog.removeAttributeNS(buffer, namespaceURI, name);
    }
  }
}

RemoveAttribute$1.opType = opType.RemoveAttribute;
class RemoveNextSibling$1 extends RemoveNextSibling {
  constructor(...args) {
    var _temp16;

    return _temp16 = super(...args), this.opType = opType.RemoveNextSibling, _temp16;
  }

  static encode(builder) {
    RemoveNextSibling$1.startRemoveNextSibling(builder);
    return RemoveNextSibling$1.endRemoveNextSibling(builder);
  }
  decode(changeLog, buffer) {
    return changeLog.removeNextSibling(buffer);
  }
}

RemoveNextSibling$1.opType = opType.RemoveNextSibling;
class RemoveStyleRule$1 extends RemoveStyleRule {
  constructor(...args) {
    var _temp17;

    return _temp17 = super(...args), this.opType = opType.RemoveStyleRule, _temp17;
  }

  static encode(builder, name) {
    const nameOffset = builder.createString(name);
    RemoveStyleRule$1.startRemoveStyleRule(builder);
    RemoveStyleRule$1.addName(builder, nameOffset);
    return RemoveStyleRule$1.endRemoveStyleRule(builder);
  }
  decode(changeLog, buffer) {
    const name = this.name();
    if (name == null) {
      return new FieldError$1("name", RemoveStyleRule$1);
    } else {
      return changeLog.removeStyleRule(buffer, name);
    }
  }
}

RemoveStyleRule$1.opType = opType.RemoveStyleRule;
class ReplaceWithComment$1 extends ReplaceWithComment {
  constructor(...args) {
    var _temp18;

    return _temp18 = super(...args), this.opType = opType.ReplaceWithComment, _temp18;
  }

  static encode(builder, data) {
    const dataOffset = builder.createString(data);
    ReplaceWithComment$1.startReplaceWithComment(builder);
    ReplaceWithComment$1.addData(builder, dataOffset);
    return ReplaceWithComment$1.endReplaceWithComment(builder);
  }
  decode(changeLog, buffer) {
    const data = this.data();
    if (data == null) {
      return new FieldError$1("data", ReplaceWithComment$1);
    } else {
      return changeLog.replaceWithComment(buffer, data);
    }
  }
}

ReplaceWithComment$1.opType = opType.ReplaceWithComment;
class ReplaceWithElement$1 extends ReplaceWithElement {
  constructor(...args) {
    var _temp19;

    return _temp19 = super(...args), this.opType = opType.ReplaceWithElement, _temp19;
  }

  static encode(builder, namespaceURI, localName) {
    const namespaceURIOffset = namespaceURI == null ? null : builder.createString(namespaceURI);
    const localNameOffset = builder.createString(localName);
    ReplaceWithElement$1.startReplaceWithElement(builder);
    if (namespaceURIOffset != null) {
      ReplaceWithElement$1.addNamespaceURI(builder, namespaceURIOffset);
    }
    ReplaceWithElement$1.addLocalName(builder, localNameOffset);
    return ReplaceWithElement$1.endReplaceWithElement(builder);
  }
  decode(changeLog, buffer) {
    const localName = this.localName();
    if (localName == null) {
      return new FieldError$1("localName", ReplaceWithElement$1);
    }

    const namespaceURI = this.namespaceURI();
    if (namespaceURI == null) {
      return changeLog.replaceWithElement(buffer, localName);
    } else {
      return changeLog.replaceWithElementNS(buffer, namespaceURI, localName);
    }
  }
}

ReplaceWithElement$1.opType = opType.ReplaceWithElement;
class ReplaceWithStashedNode$1 extends ReplaceWithStashedNode {
  constructor(...args) {
    var _temp20;

    return _temp20 = super(...args), this.opType = opType.ReplaceWithStashedNode, _temp20;
  }

  static encode(builder, address) {
    ReplaceWithStashedNode$1.startReplaceWithStashedNode(builder);
    ReplaceWithStashedNode$1.addAddress(builder, address);
    return ReplaceWithStashedNode$1.endReplaceWithStashedNode(builder);
  }
  decode(changeLog, buffer) {
    return changeLog.replaceWithStashedNode(buffer, this.address());
  }
}

ReplaceWithStashedNode$1.opType = opType.ReplaceWithStashedNode;
class ReplaceWithText$1 extends ReplaceWithText {
  constructor(...args) {
    var _temp21;

    return _temp21 = super(...args), this.opType = opType.ReplaceWithText, _temp21;
  }

  static encode(builder, data) {
    const dataOffset = builder.createString(data);
    ReplaceWithText$1.startReplaceWithText(builder);
    ReplaceWithText$1.addData(builder, dataOffset);
    return ReplaceWithText$1.endReplaceWithText(builder);
  }
  decode(changeLog, buffer) {
    const data = this.data();
    if (data == null) {
      return new FieldError$1("data", ReplaceWithText$1);
    } else {
      return changeLog.replaceWithText(buffer, data);
    }
  }
}

ReplaceWithText$1.opType = opType.ReplaceWithText;
class SelectChildren$1 extends SelectChildren {
  constructor(...args) {
    var _temp22;

    return _temp22 = super(...args), this.opType = opType.SelectChildren, _temp22;
  }

  static encode(builder) {
    SelectChildren$1.startSelectChildren(builder);
    return SelectChildren$1.endSelectChildren(builder);
  }
  decode(changeLog, buffer) {
    return changeLog.selectChildren(buffer);
  }
}

SelectChildren$1.opType = opType.SelectChildren;
class SelectParent$1 extends SelectParent {
  constructor(...args) {
    var _temp23;

    return _temp23 = super(...args), this.opType = opType.SelectParent, _temp23;
  }

  static encode(builder) {
    SelectParent$1.startSelectParent(builder);
    return SelectParent$1.endSelectParent(builder);
  }
  decode(changeLog, buffer) {
    return changeLog.selectParent(buffer);
  }
}

SelectParent$1.opType = opType.SelectParent;
class SelectSibling$1 extends SelectSibling {
  constructor(...args) {
    var _temp24;

    return _temp24 = super(...args), this.opType = opType.SelectSibling, _temp24;
  }

  static encode(builder, n) {
    SelectSibling$1.startSelectSibling(builder);
    SelectSibling$1.addOffset(builder, n);
    return SelectSibling$1.endSelectSibling(builder);
  }
  decode(changeLog, buffer) {
    return changeLog.selectSibling(buffer, this.offset());
  }
}

SelectSibling$1.opType = opType.SelectSibling;
class SetAttribute$1 extends SetAttribute {
  constructor(...args) {
    var _temp25;

    return _temp25 = super(...args), this.opType = opType.SetAttribute, _temp25;
  }

  static encode(builder, namespaceURI, name, value) {
    const namespaceURIOffset = namespaceURI == null ? null : builder.createString(namespaceURI);
    const nameOffset = builder.createString(name);
    const valueOffset = builder.createString(value);
    SetAttribute$1.startSetAttribute(builder);
    if (namespaceURIOffset != null) {
      SetAttribute$1.addNamespaceURI(builder, namespaceURIOffset);
    }
    SetAttribute$1.addName(builder, nameOffset);
    SetAttribute$1.addValue(builder, valueOffset);

    return SetAttribute$1.endSetAttribute(builder);
  }
  decode(changeLog, buffer) {
    const name = this.name();
    if (name == null) {
      return new FieldError$1("name", SetAttribute$1);
    }
    const value = this.value();
    if (value == null) {
      return new FieldError$1("value", SetAttribute$1);
    }
    const namespaceURI = this.namespaceURI();
    if (namespaceURI == null) {
      return changeLog.setAttribute(buffer, name, value);
    } else {
      return changeLog.setAttributeNS(buffer, namespaceURI, name, value);
    }
  }
}

SetAttribute$1.opType = opType.SetAttribute;
class SetStyleRule$1 extends SetStyleRule {
  constructor(...args) {
    var _temp26;

    return _temp26 = super(...args), this.opType = opType.SetStyleRule, _temp26;
  }

  static encode(builder, name, value) {
    const nameOffset = builder.createString(name);
    const valueOffset = builder.createString(value);

    SetStyleRule$1.startSetStyleRule(builder);
    SetStyleRule$1.addName(builder, nameOffset);
    SetStyleRule$1.addValue(builder, valueOffset);

    return SetStyleRule$1.endSetStyleRule(builder);
  }
  decode(changeLog, buffer) {
    const name = this.name();
    if (name == null) {
      return new FieldError$1("name", SetStyleRule$1);
    }

    const value = this.value();
    if (value == null) {
      return new FieldError$1("value", SetStyleRule$1);
    }

    return changeLog.setStyleRule(buffer, name, value);
  }
}

SetStyleRule$1.opType = opType.SetStyleRule;
class SetTextData$1 extends SetTextData {
  constructor(...args) {
    var _temp27;

    return _temp27 = super(...args), this.opType = opType.SetTextData, _temp27;
  }

  static encode(builder, data) {
    const dataOffset = builder.createString(data);
    SetTextData$1.startSetTextData(builder);
    SetTextData$1.addData(builder, dataOffset);
    return SetTextData$1.endSetTextData(builder);
  }
  decode(changeLog, buffer) {
    const data = this.data();
    if (data == null) {
      return new FieldError$1("data", SetTextData$1);
    } else {
      return changeLog.setTextData(buffer, data);
    }
  }
}

SetTextData$1.opType = opType.SetTextData;
class StashNextSibling$1 extends StashNextSibling {
  constructor(...args) {
    var _temp28;

    return _temp28 = super(...args), this.opType = opType.StashNextSibling, _temp28;
  }

  static encode(builder, address) {
    StashNextSibling$1.startStashNextSibling(builder);
    StashNextSibling$1.addAddress(builder, address);
    return StashNextSibling$1.endStashNextSibling(builder);
  }
  decode(changeLog, buffer) {
    return changeLog.stashNextSibling(buffer, this.address());
  }
}

StashNextSibling$1.opType = opType.StashNextSibling;

class UnknownOpType extends DecoderError {
  constructor(opType) {
    super();
    this.opType = opType;
  }
  format(context) {
    const where = context == null ? "" : `at ${context}`;
    return `Encountered unknown opType:${this.opType.toString()} in "Change" table${where}`;
  }
}

class OpError extends DecoderError {
  constructor(opName) {
    super();
    this.kind = "OpError";
    this.opName = opName;
  }
  format(context) {
    const where = context == null ? "" : `at ${context}`;
    return `Failed to decode op as ${this.opName} table${where}`;
  }
}

class Change extends Change$1 {
  static decode(change, changeLog, buffer) {
    const type = change.opType();
    const variant = Change.pool[type];
    if (variant == null) {
      return new UnknownOpType(type);
    } else {
      const op$$1 = change.op(variant);
      if (op$$1 == null) {
        return new OpError(variant.constructor.name);
      }
      return op$$1.decode(changeLog, buffer);
    }
  }
  static encode(builder, opType, opOffset) {
    Change.startChange(builder);
    Change.addOp(builder, opOffset);
    Change.addOpType(builder, opType);
    return Change.endChange(builder);
  }
}
Change.Table = Change$1;
Change.pool = {
  [AssignStringProperty$1.opType]: new AssignStringProperty$1(),
  [RemoveNextSibling$1.opType]: new RemoveNextSibling$1(),
  [InsertText$1.opType]: new InsertText$1(),
  [InsertComment$1.opType]: new InsertComment$1(),
  [InsertElement$1.opType]: new InsertElement$1(),
  [ReplaceWithComment$1.opType]: new ReplaceWithComment$1(),
  [ReplaceWithText$1.opType]: new ReplaceWithText$1(),
  [ReplaceWithElement$1.opType]: new ReplaceWithElement$1(),
  [ReplaceWithStashedNode$1.opType]: new ReplaceWithStashedNode$1(),
  [InsertStashedNode$1.opType]: new InsertStashedNode$1(),
  [RemoveAttribute$1.opType]: new RemoveAttribute$1(),
  [DeleteProperty$1.opType]: new DeleteProperty$1(),
  [AssignBooleanProperty$1.opType]: new AssignBooleanProperty$1(),
  [AssignNullProperty$1.opType]: new AssignNullProperty$1(),
  [AssignNumberProperty$1.opType]: new AssignNumberProperty$1(),
  [SetAttribute$1.opType]: new SetAttribute$1(),
  [SetStyleRule$1.opType]: new SetStyleRule$1(),
  [RemoveStyleRule$1.opType]: new RemoveStyleRule$1(),
  [SelectChildren$1.opType]: new SelectChildren$1(),
  [SelectSibling$1.opType]: new SelectSibling$1(),
  [SelectParent$1.opType]: new SelectParent$1(),
  [EditTextData$1.opType]: new EditTextData$1(),
  [SetTextData$1.opType]: new SetTextData$1(),
  [DiscardStashed$1.opType]: new DiscardStashed$1(),
  [StashNextSibling$1.opType]: new StashNextSibling$1(),
  [ShiftSiblings$1.opType]: new ShiftSiblings$1(),
  [AddEventListener$1.opType]: new AddEventListener$1(),
  [RemoveEventListener$1.opType]: new RemoveEventListener$1()
};

class IndexError$1 extends DecoderError {
  constructor(index) {
    super();
    this.kind = "IndexError";
    this.index = index;
  }
  fromat(context) {
    const where = context == null ? "" : `at ${context}`;
    return `Failed to decode ${this.index}th element from a vector${where}`;
  }
}

class ChangeError extends DecoderError {
  constructor(index, reason) {
    super();
    this.index = index;
    this.reason = reason;
  }
  fromat(context) {
    const { index, reason } = this;
    return reason.format(`changeLog.log[${index}]`);
  }
}

const changePool = new Change();

class ChangeLog$1 extends ChangeLog {
  static decode(table, changeLog, buffer) {
    const count = table.logLength();

    let index = 0;
    while (index < count) {
      const change = table.log(index, changePool);
      if (change == null) {
        console.error(`Decode: Change is null log[${index}]`);
        return new IndexError$1(index);
      }
      const result = Change.decode(changePool, changeLog, buffer);
      if (result instanceof DecoderError) {
        return new ChangeError(index, result);
      } else {
        buffer = result;
      }
      index++;
    }

    return buffer;
  }
  static encode(builder, changes) {
    const logOffset = ChangeLog$1.createLogVector(builder, changes);
    ChangeLog$1.startChangeLog(builder);
    ChangeLog$1.addLog(builder, logOffset);
    return ChangeLog$1.endChangeLog(builder);
  }
}
ChangeLog$1.Table = ChangeLog;

const push$2 = (item, items) => (items.push(item), items);

class FlatBufferEncoder {
  constructor(builder, log) {
    this.reset(builder, log);
  }
  reset(builder, log) {
    this.builder = builder;
    this.log = log;

    return this;
  }
  change(opType, opOffset) {
    return this.reset(this.builder, push$2(Change.encode(this.builder, opType, opOffset), this.log));
  }
  static toUint8Array({ builder, log }) {
    builder.finish(ChangeLog$1.encode(builder, log));
    return builder.asUint8Array();
  }

  static encoder(size = 1024) {
    return new FlatBufferEncoder(new flatbuffers.Builder(size), []);
  }
  static selectChildren(state) {
    return state.change(SelectChildren$1.opType, SelectChildren$1.encode(state.builder));
  }
  static selectSibling(state, offset) {
    return state.change(SelectSibling$1.opType, SelectSibling$1.encode(state.builder, offset));
  }
  static selectParent(state) {
    return state.change(SelectParent$1.opType, SelectParent$1.encode(state.builder));
  }
  static removeNextSibling(state) {
    return state.change(RemoveNextSibling$1.opType, RemoveNextSibling$1.encode(state.builder));
  }

  static insertText(state, data) {
    return state.change(InsertText$1.opType, InsertText$1.encode(state.builder, data));
  }
  static insertComment(state, data) {
    return state.change(InsertComment$1.opType, InsertComment$1.encode(state.builder, data));
  }
  static insertElement(state, localName) {
    return state.change(InsertElement$1.opType, InsertElement$1.encode(state.builder, null, localName));
  }
  static insertElementNS(state, namespaceURI, localName) {
    return state.change(InsertElement$1.opType, InsertElement$1.encode(state.builder, namespaceURI, localName));
  }
  static insertStashedNode(state, address) {
    return state.change(InsertStashedNode$1.opType, InsertStashedNode$1.encode(state.builder, address));
  }

  static replaceWithText(state, data) {
    return state.change(ReplaceWithText$1.opType, ReplaceWithText$1.encode(state.builder, data));
  }
  static replaceWithComment(state, data) {
    return state.change(ReplaceWithComment$1.opType, ReplaceWithComment$1.encode(state.builder, data));
  }
  static replaceWithElement(state, localName) {
    return state.change(ReplaceWithElement$1.opType, ReplaceWithElement$1.encode(state.builder, null, localName));
  }
  static replaceWithElementNS(state, namespaceURI, localName) {
    return state.change(ReplaceWithElement$1.opType, ReplaceWithElement$1.encode(state.builder, namespaceURI, localName));
  }
  static replaceWithStashedNode(state, address) {
    return state.change(ReplaceWithStashedNode$1.opType, ReplaceWithStashedNode$1.encode(state.builder, address));
  }

  static editTextData(state, start, end, prefix, suffix) {
    return state.change(EditTextData$1.opType, EditTextData$1.encode(state.builder, start, end, prefix, suffix));
  }
  static setTextData(state, data) {
    return state.change(SetTextData$1.opType, SetTextData$1.encode(state.builder, data));
  }
  static setAttribute(state, name, value) {
    return state.change(SetAttribute$1.opType, SetAttribute$1.encode(state.builder, null, name, value));
  }
  static removeAttribute(state, name) {
    return state.change(RemoveAttribute$1.opType, RemoveAttribute$1.encode(state.builder, null, name));
  }
  static setAttributeNS(state, namespaceURI, name, value) {
    return state.change(SetAttribute$1.opType, SetAttribute$1.encode(state.builder, namespaceURI, name, value));
  }
  static removeAttributeNS(state, namespaceURI, name) {
    return state.change(RemoveAttribute$1.opType, RemoveAttribute$1.encode(state.builder, namespaceURI, name));
  }
  static assignProperty(state, name, value) {
    switch (typeof value) {
      case "string":
        {
          return state.change(AssignStringProperty$1.opType, AssignStringProperty$1.encode(state.builder, name, value));
        }
      case "number":
        {
          return state.change(AssignNumberProperty$1.opType, AssignNumberProperty$1.encode(state.builder, name, value));
        }
      case "boolean":
        {
          return state.change(AssignBooleanProperty$1.opType, AssignBooleanProperty$1.encode(state.builder, name, value));
        }
      default:
        {
          if (value === null) {
            return state.change(AssignNullProperty$1.opType, AssignNullProperty$1.encode(state.builder, name, value));
          } else {
            return unreachable(value);
          }
        }
    }
  }
  static deleteProperty(state, name) {
    return state.change(DeleteProperty$1.opType, DeleteProperty$1.encode(state.builder, name));
  }
  static setStyleRule(state, name, value) {
    return state.change(SetStyleRule$1.opType, SetStyleRule$1.encode(state.builder, name, value));
  }
  static removeStyleRule(state, name) {
    return state.change(RemoveStyleRule$1.opType, RemoveStyleRule$1.encode(state.builder, name));
  }
  static addEventDecoder(state, type, decoder, capture$$1) {
    return state.change(AddEventListener$1.opType, AddEventListener$1.encode(state.builder, type, decoder, capture$$1));
  }
  static removeEventDecoder(state, type, decoder, capture$$1) {
    return state.change(RemoveEventListener$1.opType, RemoveEventListener$1.encode(state.builder, type, decoder, capture$$1));
  }

  static stashNextSibling(state, address) {
    return state.change(StashNextSibling$1.opType, StashNextSibling$1.encode(state.builder, address));
  }
  static discardStashedNode(state, address) {
    return state.change(DiscardStashed$1.opType, DiscardStashed$1.encode(state.builder, address));
  }
  static shiftSiblings(state, count) {
    return state.change(ShiftSiblings$1.opType, ShiftSiblings$1.encode(state.builder, count));
  }

  static encode(changeList) {
    const result = changeList.encode(FlatBufferEncoder, FlatBufferEncoder.encoder());
    if (result instanceof FlatBufferEncoder) {
      return FlatBufferEncoder.toUint8Array(result);
    } else {
      return result;
    }
  }
}

class FlatBufferDecoder {
  constructor(data) {
    this.data = data;
  }
  encode(encoder, init) {
    const byteBuffer = new flatbuffers.ByteBuffer(this.data);
    const chageLog = new ChangeLog$1();
    ChangeLog$1.getRootAsChangeLog(byteBuffer, chageLog);
    return ChangeLog$1.decode(chageLog, encoder, init);
  }

  static decode(data) {
    return new FlatBufferDecoder(data);
  }
}

class FlatBuffer {}
FlatBuffer.Encoder = FlatBufferEncoder;
FlatBuffer.Decoder = FlatBufferDecoder;
FlatBuffer.encoder = FlatBufferEncoder.encoder;
FlatBuffer.encode = FlatBufferEncoder.encode;
FlatBuffer.decode = FlatBufferDecoder.decode;

const ELEMENT_NODE$1 = 1;
const TAGGED_ELEMENT_NODE = 22;
const THUNK_NODE = 23;

class Process {
  constructor({ view, update }, worker, node) {
    this.requestID = null;

    this.view = view;
    this.update = update;
    this.worker = worker;
    this.node = node;
  }
  static spawn(program, worker, node = createHost()) {
    const process = new Process(program, worker, node);
    worker.addEventListener("message", process);
    const [state, fx] = program.init();

    process.transact(state);
    fx.perform(process);
    return process;
  }
  handleEvent(event) {
    this.receive(event.data.message, event.data.path);
  }
  transact(state) {
    const node = createHost([], [this.view(state)]);
    const changeList = FlatBuffer.encode(diff(this.node, node));
    if (changeList.isError === true) {
      console.error(changeList);
    } else {
      const { buffer, byteOffset } = changeList;

      this.requestID = null;
      this.node = node;
      this.state = state;
      self.postMessage({ buffer, byteOffset }, [buffer]);
    }
  }
  receive(packet, path) {
    const payload = Process.toMessage(this.node, path, packet);
    if (payload) {
      this.send(payload);
    } else {
      console.error("Message receiver not found", path, packet);
    }
  }
  send(payload) {
    const [state, fx] = this.update(payload, this.state);
    this.transact(state);
    fx.perform(this);
  }
  static toMessage(root, path, payload) {
    const tags = [];
    let node = root;
    let index = 0;
    const count = path.length;
    while (index < count) {
      const n = path[index];
      switch (node.nodeType) {
        case ELEMENT_NODE$1:
          {
            node = node.children[n];
            index++;
            break;
          }
        case TAGGED_ELEMENT_NODE:
          {
            tags.unshift(node.tag);
            node = node.node;
            break;
          }
        case THUNK_NODE:
          {
            node = node.force();
            break;
          }
        default:
          {
            return null;
          }
      }
    }

    let tagged = payload;
    for (const tag of tags) {
      tagged = tag(tagged);
    }
    return tagged;
  }
}

const view = ({ time, n }) => {
  const t = time / 1600;
  return main([], [input([onChange(UpdateCount)]), div(), viewLemniscate(t, n)]);
};

Process.spawn({ update, init, Model, view }, self, createHost([], [main([], [input(), div()])]));

}());
//# sourceMappingURL=Leminscate.js.map
