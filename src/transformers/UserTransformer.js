import BaseTransformer from './BaseTransformer'

/**
 * User transformer
 */
export default class UserTransformer extends BaseTransformer {
  static transform (model) {
    return {
      object: 'User',
      id: model.id,
      name: model.name,
      email: model.email,
      avatar: model.avatar
    }
  }
}
