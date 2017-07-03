module.exports = (app, router, ctrl) => {
  router.get('/test', ctrl.admin.v1.auth.login)
}
