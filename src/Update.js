// @flow

type Message = { inc: number } | { dec: number } | { noop: null }

interface Match {
  <model, message>(Matcher<model, message>): (model, message) => model;
}

type Matcher<model, message> = $ObjMap<
  message,
  <data>(data) => (model, data) => model
>

export const match = <model, message: {}>(
  matcher: Matcher<model, message>
): ((model, message) => model) => (state: model, payload: message): model => {
  for (let key in payload) {
    state = matcher[key](state, payload[key])
  }
  return state
}

const update = match({
  inc(state: number, delta: number) {
    return state + delta
  },
  dec(state: number, delta: number) {
    return state - delta
  },
  toggle(state: number, value: boolean) {
    return state
  },
  noop(state: number) {
    return state
  }
})

update(update(0, { inc: 6 }), { toggle: true })
update(9, { inc: 6, toggle: true })
