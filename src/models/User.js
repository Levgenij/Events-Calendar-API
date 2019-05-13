import Database from '../services/database'
import Sequelize from 'sequelize'

export default Database.define('users', {
  email: Sequelize.STRING,
  name: Sequelize.STRING,
  avatar: Sequelize.STRING,
  g_access_token: Sequelize.STRING,
  g_refresh_token: Sequelize.STRING,
}, {
  timestamps: false
});
