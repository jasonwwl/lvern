const path = require('path')

class Config {
  constructor () {
    this.config = {
      port: 3000,
      mongo: '',
      dir_base: '',
      dir_controller: '',
      dir_library: '',
      dir_core_library: '',
      dir_router: '',
      dir_config: '',
      production: !!process.env.PROD
    }
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

  init (baseDir) {
    this.set('dir_base', baseDir)
    this.set('dir_controller', path.resolve(baseDir, './app/controller'))
    this.set('dir_router', path.resolve(baseDir, './app/router'))
    this.set('dir_library', path.resolve(baseDir, './app/lib'))
    this.set('dir_core_library', path.resolve(__dirname, '../lib'))
    this.set('dir_config', path.resolve(baseDir, './app/config'))
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
}

module.exports = Config
