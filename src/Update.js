// @flow

export type Match<model, message> = (message, model) => model

type Matcher<model, message> = $ObjMap<
  message & message,
  <payload>(payload) => (payload, model) => model
>

export const match = <model, message: {}>(
  matcher: Matcher<model, message>
): Match<model, message> => (payload: message, state: model): model => {
  for (let key in payload) {
    state = matcher[key](payload[key], state)
  }
  return state
}
