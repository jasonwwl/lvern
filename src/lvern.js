const Events = require('events')
const Koa = require('koa')
const Config = require('./core/config')
const Loader = require('./core/loader')
const logger = require('./core/logger')
const Boom = require('boom')

class Lvern extends Events {
  constructor (options) {
    super()
    const { baseDir } = options
    this.startTime = Date.now()
    this.koa = new Koa()
    this.app = {
      errors: Boom,
      controller: {},
      service: {},
      _before: [],
      _after: [],
      beforeStart: this.beforeStart,
      afterStart: this.afterStart
    }
    this.app.config = new Config()
    this.app.config.init(baseDir)
    this.app.logger = logger(this.app)
    this.load()
  }

  load () {
    const startTime = Date.now()
    const loader = new Loader(this, module)
    const lib = loader.loadLibrary([this.app.config.get('dir_core_library'), this.app.config.get('dir_library')])
    Object.assign(this.app, lib)
    this.app.logger.info('[lvern-core] loaded library:[ %s ] (%sms)', Object.keys(lib).join('|'), Date.now() - startTime)
    this.app.logger.info('[lvern-core] load finished (%sms)', Date.now() - startTime)
  }

  mount (name, func) {
    this.lib[name] = func
  }

  use (fn) {
    this.koa.use(fn.bind(this))
    return this
  }

  beforeStart (func) {
    this.app._before.push(func)
  }

  afterStart (func) {
    this.app._after.push(func)
  }

  async triggerHook (action) {
    const hookStackName = action === 'before' ? '_before' : '_after'
    const hookStack = this.app[hookStackName]
    if (!hookStack || !(hookStack instanceof Array)) {
      return null
    }
    for (const func of hookStack) {
      await func.call(this.app)
    }
  }

  async run () {
    this.app.logger.info('[lvern-core] trigger before start hook... (%d hooks)', this.app._before.length)
    const beforeTime = Date.now()
    await this.triggerHook('before')
    this.app.logger.info('[lvern-core] before start hook finished (%sms)', Date.now() - beforeTime)
    this.app.logger.info('[lvern-core] starting...')
    await this.runKoa()
    this.app.logger.info('[lvern-core] trigger after start hook... (%d hooks)', this.app._after.length)
    const afterTime = Date.now()
    await this.triggerHook('after')
    this.app.logger.info('[lvern-core] after start hook finished (%sms)', Date.now() - afterTime)
  }

  runKoa () {
    return new Promise(resolve => {
      this.koa.listen(this.app.config.get('port'), () => {
        this.app.logger.info('[lvern-core] lvern started on http://127.0.0.1:%s (%sms)',
          this.app.config.get('port'), Date.now() - this.startTime)
        resolve()
      })
    })
  }
}

module.exports = Lvern
