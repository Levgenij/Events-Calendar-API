import config from './config/index'

/**
 * Debug logging
 */
export const log = (...args) => {
  if (config.debug) {
    console.log.apply(null, ['[LOG]', ...args])
  }
}

/**
 * Send structured response
 *
 * @param response
 * @param data
 * @param meta
 * @return {*}
 */
export const send = (response, data, meta = {}) => response.send({data: data, meta: meta})

/**
 * A helper for pagination
 *
 * @param page
 * @param pageSize
 * @return {{offset: number, limit: number}}
 */
export const paginate = (page, pageSize) => {
  page = page < 0 ? 0 : page - 1
  pageSize = pageSize < 0 ? 0 : pageSize
  
  const offset = page * parseInt(pageSize)
  const limit = parseInt(offset) + parseInt(pageSize)

  return {
    offset,
    limit
  }
}

