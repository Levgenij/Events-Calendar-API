/**
 * An object which transforms models
 * to response objects for front-end
 */
export default class BaseTransformer {
  constructor (model) {
    this.model = model
  }

  static transform (model) {
    return model
  }

  toResponse () {
    return this.constructor.transform(this.model)
  }

  toString () {
    return JSON.stringify(this.toResponse())
  }

  static collection (objects) {
    return objects.map(this.transform)
  }
}
