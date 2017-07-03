const Events = require('events')
const Koa = require('koa')
const Config = require('./core/config')
const LvernApp = require('./core/app')
const RequestLogger = require('./middleware/request_logger')

class Lvern extends Events {
  constructor (options) {
    super()
    const { baseDir } = options
    this.startTime = Date.now()
    this.koa = new Koa()
    this.app = new LvernApp(new Config(baseDir))
    this.use(RequestLogger(this.app))
  }

  use (fn) {
    this.koa.use(fn.bind(this))
    return this
  }

  async run () {
    try {
      await this.app.triggerBeforeHook()
      this.use(this.app.router.routes())
      await this.runKoa()
      await this.app.triggerAfterHook()
    } catch (e) {
      this.app.logger.error(e.message)
    }
  }

  runKoa () {
    return new Promise(resolve => {
      this.app.logger.info('[lvern-core] starting...')
      this.koa.listen(this.app.config.get('port'), () => {
        this.app.logger.info('[lvern-core] lvern started on http://127.0.0.1:%s (%sms)',
          this.app.config.get('port'), Date.now() - this.startTime)
        resolve()
      })
    })
  }
}

module.exports = Lvern
