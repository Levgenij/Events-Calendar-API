export default {
  debug: true,

  /**
   * Database credentials
   */
  database: {
    driver: 'mysql',
    host: '127.0.0.1',
    username: 'root',
    password: 'root',
    database: 'test'
  },
  
  auth: {
    secret: "&@$!test-case!$@&"
  },

  services: {
    /**
     * Google application credentials
     */
    google: {
      id: '657226011143-7hg089raq5afv7bnuudeo6v60fhb1dn8.apps.googleusercontent.com',
      secret: 'Uuj6DE367CWHp_rMLdrviOQN'
    }
  },

  databaseDateTimeFormat: 'YYYY-MM-DD HH:mm:ss'
}
