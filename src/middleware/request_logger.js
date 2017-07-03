const Counter = require('passthrough-counter')
const util = require('util')

module.exports = app => {
  return new RequestLogger(app)
}

class RequestLogger {
  constructor (app) {
    this.app = app
    return this.middleware.bind(this)
  }

  async middleware (ctx, next) {
    ctx.req._startTime = new Date()
    await next()
    console.log(this.defaultLogger(ctx.req, ctx.res))
  }

  defaultLogger (req, res) {
    return this.remoteAddr(req, res) +
      ` [${this.date(req, res)}]` +
      ` "${this.method(req, res)}"` +
      ` ${this.url(req, res)}` +
      ` HTTP/:${this.httpVersion(req, res)}"` +
      ` ${this.status(req, res)}` +
      ` ${this.contentLength(req, res)}` +
      ` ${this.responseTime(req)}ms` +
      ` ${this.referrer(req, res)}` +
      ` ${this.userAgent(req, res)}`
  }

  genContent (format, req, res) {
    Object.getOwnPropertyNames(Object.getPrototypeOf(this))
  }

  responseTime (req) {
    return (new Date()) - req._startTime
  }

  remoteAddr (req) {
    return req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress) || undefined
  }

  remoteUser (req) {
    return ''
  }

  date () {
    return this.clfdate(new Date())
  }

  method (req) {
    return req.method
  }

  httpVersion (req) {
    return req.httpVersionMajor + '.' + req.httpVersionMinor
  }

  status (req, res) {
    return res.statusCode
  }

  url (req) {
    return req.originalUrl || req.url
  }

  referrer (req) {
    return req.headers['referer'] || req.headers['referrer'] || '-'
  }

  userAgent (req) {
    return req.headers['user-agent']
  }

  contentLength (req, res) {
    return res.length || 0
  }

  clfdate (dateTime) {
    const date = dateTime.getDate()
    const hour = dateTime.getHours()
    const mins = dateTime.getMinutes()
    const secs = dateTime.getSeconds()
    const year = dateTime.getFullYear()
    const month = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ][dateTime.getMonth()]

    return this.pad2(date) + '/' + month + '/' + year +
      ':' + this.pad2(hour) + ':' + this.pad2(mins) + ':' + this.pad2(secs) +
      ' +0800'
  }

  pad2 (num) {
    const str = String(num)
    return (str.length === 1 ? '0' : '') + str
  }
}
