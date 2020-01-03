const fs = require('fs')
const path = require('path')

module.exports = {
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd())
  },

  directoryExists: (filePath) => {
    return fs.existsSync(filePath)
  },

  createDirectoryIfDoesntExist: (path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }
    return path
  }

};