const fs = require('fs')
const path = require('path')
const requireDirectory = require('require-directory')

class Loader {
  constructor (app, m) {
    this.m = m
    this.app = app
  }

  load (dir) {
    const retval = { names: [], modules: {} }
    try {
      retval.modules = requireDirectory(this.m, dir, {
        visit: (func, path) => {
          retval.names.push(path.replace(dir + '/', '')
            .replace(/\//g, '.')
            .replace('.js', '')
            .toLocaleLowerCase())
          return func(this.app)
        },
        rename: name => name.toLocaleLowerCase()
      })
    } catch (e) {
      if (e.message.search('no such file or directory') < 0) {
        throw e
      }
    }
    return retval
  }

  loadLibrary (dirs) {
    const objs = this.requireFiles(dirs)
    const retval = {}
    for (const name in objs) {
      if (typeof objs[name] === 'function') {
        const obj = objs[name].call(undefined, this.app)
        let instance = { name: null, app: null }
        if (typeof obj === 'object' && obj.hasOwnProperty('name') && obj.hasOwnProperty('app')) {
          instance = obj
        } else {
          instance = {
            name: name.toLocaleLowerCase(),
            app: obj
          }
        }
        if (this.app[instance.name]) {
          this.app.logger.error('[lvern-loader] require library error [%s] is exist', instance.name)
          continue
        }
        retval[instance.name] = instance.app
      }
    }
    return retval
  }

  requireFiles (dirs) {
    if (!(dirs instanceof Array)) {
      dirs = [dirs]
    }
    const paths = {}
    for (const dir of dirs) {
      const fPaths = this.getFilePaths(dir)
      for (const name in fPaths) {
        paths[name] = fPaths[name]
      }
    }
    const retval = {}
    for (const name in paths) {
      try {
        retval[name] = this.m.require(paths[name])
      } catch (e) {
        this.app.logger.error('[lvern-loader] require file error %s', paths[name], e)
      }
    }
    return retval
  }

  getFilePaths (dir) {
    const retval = {}
    try {
      fs.readdirSync(dir).forEach(fPath => {
        retval[path.parse(fPath).name] = path.resolve(dir, fPath)
      })
    } catch (e) { }
    return retval
  }
}

module.exports = Loader
