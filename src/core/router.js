const Router = require('koa-router')

module.exports = app => {
  const router = Router()
  try {
    const routesConfig = require(app.config.get('dir_router'))
    routesConfig(app, router, app.controller)
  } catch (e) {
    app.logger.warn('Routes load error: %s', e.message)
  }
  return router
}
