import {google} from 'googleapis'
import {log} from '../helpers'
import config from '../config/index'

/**
 * Google services credentials
 *
 * @type {default.services.google|{id, secret}}
 */
const credentials = config.services.google

/**
 * Wrapper around google api
 * using googleapis package
 */
export default class GoogleProvider {
  constructor (accessToken, refreshToken, redirectUrl = null) {
    this.accessToken = accessToken

    this.client = new google.auth.OAuth2(credentials.id, credentials.secret, redirectUrl)

    this.client.setCredentials({
      access_token: this.accessToken,
      refresh_token: refreshToken
    })

    this.calendarId = 'primary'
  }
  
  /**
   * Resolves google's calendar api
   *
   * @return {*}
   */
  resolveCalendarProvider () {
    return google.calendar({
      auth: this.client,
      version: 'v3'
    })
  }

  /**
   * Fetches user data from google
   * @return {Promise<any>}
   */
  user () {
    const oauth2 = google.oauth2({
      auth: this.client,
      version: 'v2'
    })

    return new Promise((resolve, reject) => {
      oauth2.userinfo.get((err, response) => {
        if (err) {
          log('GoogleProvider.user()', err)

          return reject(new Error('Failed to obtain social user'))
        }

        resolve(response)
      })
    })
  }
  
  /**
   * Fetches user events
   *
   * @return {Promise<any>}
   */
  events () {
    const calendar = this.resolveCalendarProvider()

    return new Promise((resolve, reject) => {
      calendar.events.list({
        calendarId: this.calendarId,
        timeMin: (new Date()).toISOString(),
        maxResults: 300,
        singleEvents: true,
        orderBy: 'startTime',
      }, (err, response) => {
        if (err) {
          log('GoogleProvider.events()', err.stack)
      
          return reject(new Error('Failed to obtain user events'))
        }
    
        resolve(response)
      })
    })
  }
  
  /**
   * Create event in google calendar
   *
   * @param payload
   * @return {Promise<any>}
   */
  createEvent (payload) {
    const calendar = this.resolveCalendarProvider()
  
    return new Promise((resolve, reject) => {
      calendar.events.insert({
        calendarId: this.calendarId,
        resource: payload
      }, (err, response) => {
        if (err) {
          log('GoogleProvider.createEvent()', err.stack)
        
          return reject(new Error('Failed to create social event'))
        }
      
        resolve(response.data)
      })
    })
  }
  
  /**
   * Update event in google calendar
   *
   * @param id
   * @param payload
   * @return {Promise<any>}
   */
  updateEvent (id, payload) {
    const calendar = this.resolveCalendarProvider()
  
    return new Promise((resolve, reject) => {
      calendar.events.update({
        calendarId: this.calendarId,
        eventId: id,
        resource: payload
      }, (err, response) => {
        if (err) {
          log('GoogleProvider.updateEvent()', err.stack)
        
          return reject(new Error('Failed to update social event'))
        }
      
        resolve(response.data)
      })
    })
  }
  
  /**
   * Delete event in google calendar
   *
   * @param id
   * @return {Promise<any>}
   */
  deleteEvent (id) {
    const calendar = this.resolveCalendarProvider()
    
    return new Promise((resolve, reject) => {
      calendar.events.delete({
        calendarId: this.calendarId,
        eventId: id
      }, (err, response) => {
        if (err) {
          log('GoogleProvider.deleteEvent()', err.stack)
          
          return reject(new Error('Failed to delete social event'))
        }
        
        resolve(response.data)
      })
    })
  }
}
