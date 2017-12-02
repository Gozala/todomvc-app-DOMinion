// @flow

import { Model, update, view, fx } from "../triangle/Triangle"
import Process from "../Worker"

const init = () => Model.new(0, false)

Process.spawn({ init, update, view, fx }, self)
