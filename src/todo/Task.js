// @flow
import unreachable from "unreachable"
import {
  type Node,
  Decoder,
  className,
  input,
  h1,
  autofocus,
  placeholder,
  defaultValue,
  id,
  For,
  onClick,
  header,
  text,
  section,
  label,
  ul,
  li,
  div,
  type,
  checked,
  button,
  onInput,
  onBlur,
  onEnter,
  onDoubleClick
} from "../DOM"

export const view = (model: Model): Node<Message> =>
  li(
    [className(model.completed ? "completed" : model.edits ? "editing" : "")],
    [
      div(
        [className("view")],
        [
          input([
            className("toggle"),
            type("checkbox"),
            checked(model.completed ? "" : null),
            onClick(Complete(!model.completed))
          ]),
          label(
            [onDoubleClick(Enter)],
            [text(model.edits || model.description)]
          ),
          button([className("destroy"), onClick(Delete)])
        ]
      ),
      input([
        id(`todo-${model.id}`),
        className("edit"),
        defaultValue(model.edits),
        onInput(Edit),
        onBlur(Commit),
        onEnter(Commit)
      ])
    ]
  )

export class Model {
  id: number
  description: string
  completed: boolean
  edits: ?string
  constructor(
    id: number,
    description: string,
    completed: boolean,
    edits: ?string
  ) {
    this.id = id
    this.description = description
    this.completed = completed
    this.edits = edits
  }
  static new(id: number, description: string): Model {
    return new Model(id, description, false, null)
  }
  static updateEdits(model: Model, edits: ?string): Model {
    return new Model(model.id, model.description, model.completed, edits)
  }
  static updateComplete(model: Model, value: boolean): Model {
    return new Model(model.id, model.description, value, model.edits)
  }
  static enter(model: Model): Model {
    return Model.updateEdits(model, model.description)
  }
  static delete(model: Model): ?Model {
    return null
  }
  static cancel(model: Model): Model {
    return new Model(model.id, model.description, model.completed, null)
  }
  static commit(model: Model): ?Model {
    const { edits } = model
    if (edits == null) {
      return model
    } else {
      const description = edits.trim()
      if (description === "") {
        return Model.delete(model)
      } else {
        return new Model(model.id, description, model.completed, null)
      }
    }
  }
}

export type Message =
  | { type: "enter" }
  | { type: "edit", edit: string }
  | { type: "commit" }
  | { type: "cancel" }
  | { type: "delete" }
  | { type: "complete", complete: boolean }

export const update = (message: Message, model: Model): ?Model => {
  switch (message.type) {
    case "complete": {
      return Model.updateComplete(model, message.complete)
    }
    case "enter": {
      return Model.enter(model)
    }
    case "edit": {
      return Model.updateEdits(model, message.edit)
    }
    case "delete": {
      return Model.delete(model)
    }
    case "cancel": {
      return Model.cancel(model)
    }
    case "commit": {
      return Model.commit(model)
    }
    default:
      return unreachable(message)
  }
}

const Edit = Decoder.form({
  type: Decoder.ok("edit"),
  edit: Decoder.at(["target", "value"], Decoder.String)
})

const Enter = Decoder.ok({ type: "enter" })
const Commit = Decoder.ok({ type: "commit" })
const Delete = Decoder.ok({ type: "delete" })
const Complete = (complete: boolean) =>
  Decoder.ok({
    type: "complete",
    complete
  })
