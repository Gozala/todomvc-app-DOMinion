// @flow

import {
  type Node,
  Decoder,
  className,
  input,
  h1,
  autofocus,
  placeholder,
  defaultValue,
  value,
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
  a,
  type,
  href,
  checked,
  button,
  onInput,
  onBlur,
  onKeyDown,
  visible,
  footer,
  span,
  strong,
  onEnter
} from "../DOM"

import * as Task from "./Task"
import unreachable from "unreachable"

export type Visibility = "All" | "Active" | "Completed"

export class Model {
  tasks: Task.Model[]
  visibility: Visibility
  field: string
  uid: number
  constructor(
    tasks: Task.Model[],
    visibility: Visibility,
    field: string,
    uid: number
  ) {
    this.tasks = tasks
    this.visibility = visibility
    this.field = field
    this.uid = uid
  }
  static new(): Model {
    return new Model([], "All", "", 0)
  }
  static updateField(model: Model, field: string): Model {
    if (model.field === field) {
      return model
    } else {
      return new Model(model.tasks, model.visibility, field, model.uid)
    }
  }
  static addTask(model: Model, description: string): Model {
    if (description === "") {
      return model
    } else {
      const newTask = Task.Model.new(model.uid, description)
      return new Model(
        [...model.tasks, newTask],
        model.visibility,
        "",
        model.uid + 1
      )
    }
  }
  static updateTasks(model: Model, tasks: Task.Model[]): Model {
    return new Model(tasks, model.visibility, model.field, model.uid)
  }
  static updateVisibility(model: Model, visibility: Visibility): Model {
    return new Model(model.tasks, visibility, model.field, model.uid)
  }
}

export type Message =
  | { type: "UpdateField", field: string }
  | { type: "Add" }
  | { type: "UpdateTask", id: number, message: Task.Message }
  | { type: "DeleteComplete" }
  | { type: "CheckAll", value: boolean }
  | { type: "ChangeVisibility", visibility: Visibility }

class UpdateTask {
  type: "UpdateTask" = "UpdateTask"
  id: number
  message: Task.Message
  constructor(id: number, message: Task.Message) {
    this.id = id
    this.message = message
  }
  static new(id: number, message: Task.Message): UpdateTask {
    return new UpdateTask(id, message)
  }
}

export const update = (message: Message, model: Model): [Model, () => void] => {
  switch (message.type) {
    case "UpdateField": {
      const newModel = Model.updateField(model, message.field)
      return [newModel, save(newModel)]
    }
    case "Add": {
      const description = model.field.trim()
      const newModel = Model.addTask(model, description)
      return [newModel, save(newModel)]
    }
    case "UpdateTask": {
      const { id, message: taskMessage } = message
      const updateTask = task => {
        if (task.id === id) {
          return Task.update(taskMessage, task)
        } else {
          return task
        }
      }

      const newTasks = filterMap(updateTask, model.tasks)
      const newModel = Model.updateTasks(model, newTasks)
      return [newModel, save(model)]
    }
    case "DeleteComplete": {
      const newTasks = model.tasks.filter(task => !task.completed)
      const newModel = Model.updateTasks(model, newTasks)
      return [newModel, save(model)]
    }
    case "CheckAll": {
      const { value } = message
      const updateTask = task => Task.Model.updateComplete(task, value)
      const newTasks = model.tasks.map(updateTask)
      const newModel = Model.updateTasks(model, newTasks)
      return [newModel, save(model)]
    }
    case "ChangeVisibility": {
      const { visibility } = message
      const newModel = Model.updateVisibility(model, visibility)
      return [newModel, save(model)]
    }
    default: {
      return unreachable(message)
    }
  }
}

const viewEntry = (inputValue: string): Node<Message> =>
  header(
    [className("header")],
    [
      h1([], [text("todos")]),
      input([
        className("new-todo"),
        placeholder("What needs to be done?"),
        autofocus(),
        value(inputValue),
        onInput(UpdateField),
        onEnter(Add)
      ])
    ]
  )

export const viewMain = (
  tasks: Task.Model[],
  visibility: Visibility
): Node<Message> =>
  section(
    [className("main"), visible(tasks.length > 0)],
    [
      input([id("toggle-all"), className("toggle-all"), type("checkbox")]),
      label([For("toggle-all")], [text("Mark all as complete")]),
      viewTaskList(tasks, visibility)
    ]
  )

const viewTaskList = (tasks: Task.Model[], visibility: Visibility) =>
  ul(
    [className("todo-list")],
    tasks
      .filter(task => {
        switch (visibility) {
          case "Active":
            return !task.completed
          case "Completed":
            return task.completed
          default:
            return true
        }
      })
      .map(viewTask)
  )

const viewTask = (model: Task.Model): Node<Message> =>
  Task.view(model).map(message => UpdateTask.new(model.id, message))

const viewControls = (
  tasks: Task.Model[],
  visibility: Visibility
): Node<Message> => {
  const count = tasks.length
  const complete = tasks.filter(task => task.completed).length
  const remaining = count - complete
  const item = remaining === 1 ? "item" : "items"

  return footer(
    [className("footer"), visible(count > 0)],
    [
      span(
        [className("todo-count")],
        [strong([], [text(`${remaining}`)]), text(`${item} left`)]
      ),
      ul(
        [className("filters")],
        [
          viewControl("", "All", visibility),
          viewControl("active", "Active", visibility),
          viewControl("completed", "Completed", visibility)
        ]
      ),
      button([className("clear-completed")], [text("Clear completed")])
    ]
  )
}

const viewControl = (
  path: string,
  visibility: Visibility,
  select: Visibility
): Node<Message> => {
  const selection = className(visibility === select ? "selected" : "")
  return li(
    [onClick(ChangeVisibility(visibility))],
    [a([href(`#/${path}`), selection], [text(visibility)])]
  )
}

export const view = (model: Model): Node<Message> =>
  section(
    [className("todoapp")],
    [
      viewEntry(model.field),
      viewMain(model.tasks, model.visibility),
      viewControls(model.tasks, model.visibility)
    ]
  )

const UpdateField = Decoder.form({
  type: Decoder.ok("UpdateField"),
  field: Decoder.at(["target", "value"], Decoder.String)
})

const ChangeVisibility = visibility =>
  Decoder.form({
    type: Decoder.ok("ChangeVisibility"),
    visibility: Decoder.ok(visibility)
  })

const Add: Decoder.Decoder<Message> = Decoder.form({
  type: Decoder.ok("Add")
})

const ignore = () => {}
const save = model => () => {}

const filterMap = <a, b>(f: a => ?b, items: a[]): b[] => {
  const out = []
  for (let item of items) {
    const postItem = f(item)
    if (postItem != null) {
      out.push(postItem)
    }
  }
  return out
}
