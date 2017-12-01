// @flow

export interface Process<message> {
  send(message): void;
}

interface NoFX {
  size: 0;
  and<message>(FX<message>): FX<message>;
  perform(Process<empty>): void;
}

export interface SomeFX<message> {
  size: number;
  perform(Process<message>): void;
  and(FX<message>): FX<message>;
}

export type FX<message> = SomeFX<message> | NoFX

export const nofx: NoFX = new class {
  size = 0
  and<message>(fx: FX<message>): FX<message> {
    return fx
  }
  perform() {}
}()

class BatchFX<message> implements SomeFX<message> {
  size: number
  effects: SomeFX<message>[]
  constructor(effects: SomeFX<message>[]) {
    this.effects = effects
    this.size = effects.length
  }
  perform(process: Process<message>): void {
    for (let fx of this.effects) {
      fx.perform(process)
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
  perform(process: Process<message>): void {
    process.send(this.payload)
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
export const and = <a>(left: FX<a>, right: FX<a>): FX<a> =>
  left.size === 0 ? right : right.size === 0 ? left : new BatchFX([left, right])

interface Match {
  <model, message>(
    Matcher<model, message>
  ): (model, message) => [model, FX<message>];
}

type Matcher<model, message> = $ObjMap<
  message,
  <data>(data) => (data, model) => [model, FX<message>]
>
