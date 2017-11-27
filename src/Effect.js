// @flow

type Message = { inc: number } | { dec: number } | { noop: null }

interface NoFX {
  size: 0;
  and<message>(FX<message>): FX<message>;
}

interface SomeFX<message> {
  size: number;
  perform((message) => void): void;
  and(FX<message>): FX<message>;
}

type FX<message> = SomeFX<message> | NoFX

const nofx: NoFX = new class {
  size = 0
  and<message>(fx: FX<message>): FX<message> {
    return fx
  }
}()

class BatchFX<message> implements SomeFX<message> {
  size: number
  effects: SomeFX<message>[]
  constructor(effects: SomeFX<message>[]) {
    this.effects = effects
    this.size = effects.length
  }
  perform(receive: message => void): void {
    for (let fx of this.effects) {
      fx.perform(receive)
    }
  }
  and(fx: FX<message>): FX<message> {
    if (fx.size === 0) {
      return this
    } else {
      return new BatchFX([...this.effects, fx])
    }
  }
}

class Send<message> implements SomeFX<message> {
  payload: message
  size = 1
  constructor(payload: message) {
    this.payload = payload
  }
  perform(receive: message => void): void {
    receive(this.payload)
  }
  and(fx: FX<message>): FX<message> {
    if (fx.size === 0) {
      return this
    } else {
      return new BatchFX([this, fx])
    }
  }
}

export const send = <a>(payload: a): FX<a> => new Send(payload)

interface Match {
  <model, message>(
    Matcher<model, message>
  ): (model, message) => [model, FX<message>];
}

type Matcher<model, message> = $ObjMap<
  message,
  <data>(data) => (data, model) => [model, FX<message>]
>

export const match = <model, message: {}>(
  matcher: Matcher<model, message>
): ((message, model) => [model, FX<message>]) => (
  payload: message,
  state: model
): [model, FX<message>] => {
  let fx = nofx
  for (let key in payload) {
    const [nextState, nextFX] = matcher[key](state, payload[key])
    state = nextState
    fx = fx.and(nextFX)
  }
  return [state, fx]
}

const update = match({
  inc(delta: number, state: number) {
    return [state + delta, send({ toggle: true })]
  },
  dec(delta: number, state: number) {
    return [state - delta, nofx]
  },
  toggle(value: boolean, state: number) {
    return [state, nofx]
  },
  noop(_, state: number) {
    return [state, nofx]
  }
})

// update(update(0, { inc: 6 }), { toggle: true })
update({ inc: 6, toggle: true }, 9)
