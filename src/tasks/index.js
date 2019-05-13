import User from '../models/User'

/**
 * Fetches authenticated user data
 *
 * @param request
 * @return {Promise<*>}
 */
export const getAuthenticatedUser = async (request) => {
  const user = request.user
  
  if (!user) return Promise.resolve(null)

  return await User.findOne({
    where: {
      id: user.id
    }
  })
}
