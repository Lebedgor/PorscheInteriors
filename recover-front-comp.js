const fs = require('fs')
const path = require('path')

const projectRoot = __dirname
const currentFrontPath = path.join(projectRoot, 'front')
const compiledFrontPath = path.join(projectRoot, 'front_comp')
const targetFrontPath = path.join(projectRoot, 'front_recovered')
const jsMapPath = path.join(compiledFrontPath, 'static', 'js', 'main.8aca984a.js.map')
const cssMapPath = path.join(compiledFrontPath, 'static', 'css', 'main.f9eda0c0.css.map')

const shouldSkipScaffoldPath = (sourcePath) => {
  const normalizedPath = sourcePath.replace(/\\/g, '/')

  return normalizedPath.includes('/node_modules/')
    || normalizedPath.endsWith('/node_modules')
    || normalizedPath.includes('/build/')
    || normalizedPath.endsWith('/build')
}

const ensureDirectory = (targetPath) => {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
}

const readMapFile = (mapPath) => JSON.parse(fs.readFileSync(mapPath, 'utf8'))

const normalizeRecoveredSourcePath = (sourcePath, fallbackFolder = 'src') => {
  const normalizedPath = String(sourcePath || '').replace(/\\/g, '/').trim()

  if (!normalizedPath) {
    return null
  }

  if (normalizedPath.startsWith('../node_modules/') || normalizedPath.startsWith('node_modules/')) {
    return null
  }

  const cleanedPath = normalizedPath
    .replace(/^\.\.\/src\//, '')
    .replace(/^src\//, '')
    .replace(/^\.\//, '')

  if (!cleanedPath || cleanedPath.startsWith('../')) {
    return null
  }

  return path.join(targetFrontPath, fallbackFolder, cleanedPath)
}

const extractSourcesFromMap = (mapPath, fallbackFolder = 'src') => {
  const map = readMapFile(mapPath)
  const writtenFiles = []

  ;(map.sources || []).forEach((sourcePath, index) => {
    const targetFilePath = normalizeRecoveredSourcePath(sourcePath, fallbackFolder)
    const sourceContent = map.sourcesContent?.[index]

    if (!targetFilePath || typeof sourceContent !== 'string') {
      return
    }

    ensureDirectory(targetFilePath)
    fs.writeFileSync(targetFilePath, sourceContent, 'utf8')
    writtenFiles.push(targetFilePath)
  })

  return writtenFiles
}

const copyDirectoryContents = (sourcePath, targetPath, shouldSkip = () => false) => {
  if (!fs.existsSync(sourcePath)) {
    return
  }

  fs.mkdirSync(targetPath, { recursive: true })

  for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
    const sourceEntryPath = path.join(sourcePath, entry.name)
    const targetEntryPath = path.join(targetPath, entry.name)

    if (shouldSkip(sourceEntryPath, entry)) {
      continue
    }

    if (entry.isDirectory()) {
      copyDirectoryContents(sourceEntryPath, targetEntryPath, shouldSkip)
      continue
    }

    fs.copyFileSync(sourceEntryPath, targetEntryPath)
  }
}

if (fs.existsSync(targetFrontPath)) {
  fs.rmSync(targetFrontPath, { recursive: true, force: true })
}

copyDirectoryContents(currentFrontPath, targetFrontPath, (entryPath) => shouldSkipScaffoldPath(entryPath))

const publicTargetPath = path.join(targetFrontPath, 'public')
copyDirectoryContents(compiledFrontPath, publicTargetPath, (entryPath, entry) => {
  const normalizedPath = entryPath.replace(/\\/g, '/')

  if (normalizedPath.includes('/static/')) {
    return true
  }

  if (!entry.isDirectory() && (
    normalizedPath.endsWith('asset-manifest.json')
    || normalizedPath.endsWith('.map')
    || normalizedPath.endsWith('.LICENSE.txt')
  )) {
    return true
  }

  return false
})

const jsFiles = extractSourcesFromMap(jsMapPath, 'src')
const cssFiles = extractSourcesFromMap(cssMapPath, 'src')

console.log(JSON.stringify({
  targetFrontPath,
  restoredJsFiles: jsFiles.length,
  restoredCssFiles: cssFiles.length,
  sampleFiles: [...jsFiles, ...cssFiles]
    .map((filePath) => path.relative(targetFrontPath, filePath).replace(/\\/g, '/'))
    .slice(0, 30)
}, null, 2))
