const Boom = require('boom')
const Logger = require('./logger')
const Loader = require('./loader')
const Router = require('./router')

const HOOK_BEFORE = Symbol('HOOK_BEFORE')
const HOOK_AFTER = Symbol('HOOK_AFTER')

class App {
  constructor (config) {
    this.config = config
    this.errors = Boom
    this.logger = Logger(this)
    this.loader = new Loader(this, module)
    this.service = {}
    this.controller = {}
    this.hookStack = {
      [HOOK_BEFORE]: [],
      [HOOK_AFTER]: []
    }
    this.load()
    this.router = Router(this)
  }

  loadExtends (nameSpace) {
    const startTime = Date.now()
    const loads = this.loader.load(this.config.get(`dir_${nameSpace}`))
    if (loads.names.length < 1) {
      return null
    }
    this[nameSpace] = loads.modules
    this.logger.info('[lvern-core] loaded %s: (%sms)\n%s',
      nameSpace,
      Date.now() - startTime,
      loads.names.map(n => `    - ${n}`).join('\n')
    )
  }

  load () {
    const time = Date.now()
    const lib = this.loader.loadLibrary([this.config.get('dir_core_library'), this.config.get('dir_library')])
    for (let k in lib) {
      this[k] = lib[k]
    }
    this.logger.info('[lvern-core] loaded library:[ %s ] (%sms)', Object.keys(lib).join(' | '), Date.now() - time)
    this.loadExtends('service')
    this.loadExtends('controller')
    this.logger.info('[lvern-core] load finished (%sms)', Date.now() - time)
  }

  beforeStart (func) {
    this.hookStack[HOOK_BEFORE].push(func)
  }

  afterStart (func) {
    this.hookStack[HOOK_AFTER].push(func)
  }

  async triggerHook (hookStackName) {
    const startTime = Date.now()
    this.logger.info('[lvern-core] trigger %s start hook... (%d hooks)', hookStackName, this.hookStack[hookStackName].length)
    for (let func of this.hookStack[hookStackName]) {
      await func.call(this)
    }
    this.logger.info('[lvern-core] %s hook finished (%sms)', hookStackName, Date.now() - startTime)
  }

  async triggerBeforeHook () {
    await this.triggerHook(HOOK_BEFORE)
  }

  async triggerAfterHook () {
    await this.triggerHook(HOOK_AFTER)
  }
}

module.exports = App
