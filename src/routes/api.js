import {signIn} from '../actions/auth'
import {all, create, deleteById, update} from '../actions/event'

/**
 * Register server api routes
 *
 * TODO: Implement validation for routes requests
 *
 * @param server
 */
export default (server) => {
  server.post('/sign-in', signIn)
  server.get('/events', all)
  server.post('/events', create)
  server.put('/events/:id', update)
  server.del('/events/:id', deleteById)
}
