import Restify from 'restify';
import config from './config/index'
import rjwt from 'restify-jwt-community'
import apiRoutes from './routes/api'
import restifyValidation from 'node-restify-validation'
import CorsMiddleware from 'restify-cors-middleware'
import {log} from './helpers'

const cors = CorsMiddleware({
  allowHeaders: ['Accept', 'Content-Type', 'Authorization']
})

const server = Restify.createServer();

server.use(Restify.plugins.acceptParser(server.acceptable));
server.use(Restify.plugins.queryParser());
server.use(Restify.plugins.bodyParser());
server.use(rjwt(config.auth).unless({
  path: ['/sign-in']
}))
server.use(restifyValidation.validationPlugin({
  errorsAsArray: false,
  forbidUndefinedVariables: false,
  errorHandler: log
}))
server.pre(cors.preflight)
server.use(cors.actual)

// Register api routes
apiRoutes(server)

server.listen(8888, function () {
  console.log('%s listening at %s', server.name, server.url);
});
