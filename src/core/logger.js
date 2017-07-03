const winston = require('winston')

module.exports = app => {
  winston.configure({
    transports: [
      new (winston.transports.Console)({
        colorize: true
      })
    ]
  })
  return winston
  // return {
  //   app: winston,
  //   name: 'logger'
  // }
}
