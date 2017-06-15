class Auth {
  constructor (app) {
    this.lvern = app
  }

  async login (ctx) {
    ctx.body = 'call login!!'
  }
}

module.exports = Auth
