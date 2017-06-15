class Login {
  constructor (app) {
    this.lvern = app
  }

  async login (ctx) {
    ctx.body = 'call login!!'
  }
}
module.exports = Login
