import Sequelize from 'sequelize'
import config from '../config/index'

const {database} = config

export default new Sequelize(database.database, database.username, database.password, {
  host: database.host,
  dialect: database.driver
})
