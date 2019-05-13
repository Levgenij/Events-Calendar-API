import Database from '../services/database'
import Sequelize from 'sequelize'

export default Database.define('events', {
  user_id: Sequelize.INTEGER,
  title: Sequelize.STRING,
  start_at: Sequelize.STRING,
  end_at: Sequelize.STRING,
  social_id: Sequelize.STRING,
}, {
  timestamps: false
});
