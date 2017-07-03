const path = require('path')

class Config {
  constructor (baseDir) {
    this.baseDir = baseDir
    this.config = {
      port: 3000,
      mongo: '',
      dir_base: baseDir,
      dir_controller: this.appPath('controller'),
      dir_service: this.appPath('service'),
      dir_library: this.appPath('lib'),
      dir_core_library: path.resolve(__dirname, '../lib'),
      dir_router: this.appPath('routes.js'),
      dir_config: this.appPath('config'),
      production: !!process.env.PROD
    }
    const configFileName = this.get('production') ? 'config.prod.json' : 'config.dev.json'
    try {
      const customConfig = require(path.resolve(this.get('dir_config'), configFileName))
      for (const key in customConfig) {
        this.set(key, customConfig[key])
      }
    } catch (e) {
      console.warn('未发现项目中的自定义配置文件')
    }
  }

  appPath (pathName) {
    return path.resolve(this.baseDir, `./app/${pathName}`)
  }

  get (k) {
    if (!k) {
      return this.config
    }
    return this.config[k]
  }

  set (k, v) {
    this.config[k] = v
  }
}

module.exports = Config
