import User from '../models/User'
import Event from '../models/Event'
import GoogleProvider from '../services/GoogleProvider'
import UserTransformer from '../transformers/UserTransformer'
import JWT from 'jsonwebtoken'
import config from '../config/index'
import {log, send} from '../helpers'

/**
 * Fetches certain data from google user response
 * and compose valid social user object
 *
 * @param data
 * @return {{email: *, name: *, avatar: string | {url?: string}}}
 */
const handleSocialUser = ({data}) => {
  return {
    email: data.email,
    name: data.name,
    avatar: data.picture
  }
}

/**
 * Create new user based on google data
 *
 * @param socialUser
 * @param accessToken
 * @param refreshToken
 * @return {*}
 */
const createUser = (socialUser, accessToken, refreshToken) => {
  return User.create({
    name: socialUser.name,
    email: socialUser.email,
    avatar: socialUser.avatar,
    g_access_token: accessToken,
    g_refresh_token: refreshToken
  })
}

/**
 * Sync user data with google user
 *
 * @param originalUser
 * @param socialUser
 * @param accessToken
 * @param refreshToken
 * @return {*}
 */
const updateUser = (originalUser, socialUser, accessToken, refreshToken) => {
  const fields = {
    name: socialUser.name,
    email: socialUser.email,
    avatar: socialUser.avatar,
    g_access_token: accessToken,
    g_refresh_token: refreshToken
  }
  
  return User.update(fields, {
    where: {
      email: socialUser.email
    }
  }).then(() => Object.assign(originalUser, fields))
}

/**
 * Generate access token for user
 *
 * @param user
 * @return {{token: *, iat: *, exp: *}}
 */
const makeAccessToken = (user) => {
  const token = JWT.sign({id: user.id, email: user.email}, config.auth.secret, {
    expiresIn: '2d' // token expires in 2 days
  })

  const { iat, exp } = JWT.decode(token)

  return {
    token: token,
    iat: iat,
    exp: exp
  }
}

/**
 * Fetches future events for user
 *
 * @param provider
 * @param user
 */
const fetchEvents = (provider, user) => {
  provider.events().then(({data}) => {
    const events = data.items.map(event => {
      return {
        user_id: user.id,
        social_id: event.id,
        title: event.summary,
        start_at: event.start.date,
        end_at: event.end.date,
        description: event.description
      }
    })

    Event.bulkCreate(events)
  })
}

/**
 * Create or update user
 *
 * @param user
 * @param socialUser
 * @param accessToken
 * @param refreshToken
 * @return {Promise<void>}
 */
const resolveFreshUser = async (user, socialUser, accessToken, refreshToken) => {
  const promise = user ? updateUser(user, socialUser, accessToken, refreshToken) : createUser(socialUser, accessToken, refreshToken)
  
  return await promise
}

/**
 * Create new user and fetches his events
 * from google's primary calendar
 * or updates existed user
 */
export const signIn = async (request, response, next) => {
  const {code, redirect_url} = request.body
  
  // Exchanges oauth code for access & refresh tokens
  const googleTokenData = await GoogleProvider.getToken(code, redirect_url)
  
  const provider = new GoogleProvider(googleTokenData.access_token, googleTokenData.refresh_token)
  
  log(googleTokenData)

  const socialUser = await provider.user().then(handleSocialUser)

  const user = await User.findOne({
    where: {
      email: socialUser.email
    }
  })

  const freshUser = await resolveFreshUser(user, socialUser, googleTokenData.access_token, googleTokenData.refresh_token || '')

  if (!user) fetchEvents(provider, freshUser)

  const token = makeAccessToken(freshUser)

  send(
    response,
    (new UserTransformer(freshUser)).toResponse(),
    token
  )

  return next()
}
