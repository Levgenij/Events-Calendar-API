import Event from '../models/Event'
import {log, paginate, send} from '../helpers'
import EventTransformer from '../transformers/EventTransformer'
import {getAuthenticatedUser} from '../tasks/index'
import GoogleProvider from '../services/GoogleProvider'
import moment from 'moment-timezone'
import Errors from 'restify-errors'

/**
 * List all events
 *
 * @param request
 * @param response
 * @param next
 * @return {*}
 */
export const all = async (request, response, next) => {
  const user = request.user
  const {page, limit} = request.query

  const events = await Event.findAll({
    ...paginate(page, limit),
    where: {
      user_id: user.id
    },
    order: [
      ['start_at', 'ASC']
    ]
  })
  
  send(
    response,
    EventTransformer.collection(events),
    {
      page: page,
      limit: limit
    }
  )

  return next()
}

/**
 * Create new event in google calendar
 *
 * @param request
 * @param response
 * @param next
 * @return {*}
 */
export const create = async (request, response, next) => {
  const {title, start_at, end_at} = request.body

  const user = await getAuthenticatedUser(request)
  
  const provider = new GoogleProvider(user.g_access_token, user.g_refresh_token)

  // First create event in google calendar
  // in order to obtain it's social id
  const socialEvent = await provider.createEvent({
    summary: title,
    start: {
      dateTime: moment(start_at),
      timeZone: 'UTC'
    },
    end: {
      dateTime: moment(end_at),
      timeZone: 'UTC'
    }
  })

  // Create event in our database
  const event = await Event.create({
    user_id: user.id,
    title: title,
    start_at: start_at,
    end_at: end_at,
    social_id: socialEvent.id
  })
  
  send(
    response,
    (new EventTransformer(event)).toResponse()
  )

  return next()
}

/**
 * Update certain event
 *
 * @param request
 * @param response
 * @param next
 * @return {*}
 */
export const update = async (request, response, next) => {
  const eventId = parseInt(request.params.id)

  const {title, start_at, end_at} = request.body

  const user = await getAuthenticatedUser(request)

  const provider = new GoogleProvider(user.g_access_token, user.g_refresh_token)

  const event = await Event.findByPk(eventId)

  if (!event) {
    return next(new Errors.NotFoundError({}, 'The resource was not found'))
  }

  provider.updateEvent(event.social_id, {
    summary: title,
    start: {
      dateTime: moment(start_at),
      timeZone: 'UTC'
    },
    end: {
      dateTime: moment(end_at),
      timeZone: 'UTC'
    }
  })
  
  const freshEvent = await Event.update(request.body, {
    where: {
      id: eventId
    }
  }).then(() => Event.findByPk(eventId))

  send(
    response,
    (new EventTransformer(freshEvent)).toResponse()
  )

  return next()
}

/**
 * Delete event
 *
 * @param request
 * @param response
 * @param next
 * @return {*}
 */
export const deleteById = async (request, response, next) => {
  const eventId = parseInt(request.params.id)

  const user = await getAuthenticatedUser(request)

  const provider = new GoogleProvider(user.g_access_token, user.g_refresh_token)

  const event = await Event.findByPk(eventId)
  
  if (!event) {
    return next(new Errors.NotFoundError({}, 'The resource was not found'))
  }

  provider.deleteEvent(event.social_id)

  await Event.destroy({
    where: {
      id: parseInt(request.params.id)
    }
  })
  
  send(response)

  return next()
}
