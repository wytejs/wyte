const path = require('path')
const fs = require('fs')

const getAllFiles = function(rDir, arrayOfFiles, dirPath = '', firstIteration = true) {
  files = fs.readdirSync(path.join(rDir, dirPath))

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(rDir + '/' + dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(rDir, arrayOfFiles, dirPath + "/" + file, false)
    } else {
      arrayOfFiles.push(path.join(dirPath, file))
    }
  })

  return arrayOfFiles.map(r => r.replace(/\\/g, '/'))
}

module.exports = getAllFiles