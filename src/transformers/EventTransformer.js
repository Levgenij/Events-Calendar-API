import BaseTransformer from './BaseTransformer'

/**
 * Event transformer
 */
export default class EventTransformer extends BaseTransformer {
  static transform (model) {
    return {
      object: 'Event',
      id: model.id,
      title: model.title,
      start_at: model.start_at,
      end_at: model.end_at,
      description: model.description
    }
  }
}
