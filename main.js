// On a wall surface, any
// continuous stretch of wall,
/** @type HTMLCanvasElement */
// @ts-ignore
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d', { alpha: false })

let cellW = 0.1
let cellH = 0.2
let preOrientation = canvas.width > canvas.height ? 'landscape' : 'portrait'

const bgColor = 'hsl(30,0%,100%)'
let f = 0.5
const opacity = 1
const lineWidth = 1

updateCanvasResolution()

let startPoints = generatePoints()
let currentPoints = []

window.addEventListener('resize', updateCanvasResolution)

draw()

function draw () {
  ctx.fillStyle = bgColor
  ctx.lineCap = 'round'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.beginPath()

  currentPoints = getCurrentPoints()

  // All of the points should be connected by straight lines.
  for (var i = 0; i < currentPoints.length; i++) {
    var p = currentPoints[i]
    for (var k = i + 1; k < currentPoints.length; k++) {
      var pEnd = currentPoints[k]
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(pEnd.x, pEnd.y)
      ctx.strokeStyle = p.color
      ctx.lineWidth = lineWidth
      ctx.stroke()
    }
  }
  requestAnimationFrame(draw)
}

function updateCanvasResolution () {
  canvas.width = window.innerWidth * window.devicePixelRatio
  canvas.height = window.innerHeight * window.devicePixelRatio
  updateCellSizes()
}

function updateCellSizes () {
  const newOrientation = canvas.width > canvas.height ? 'landscape' : 'portrait'
  if (newOrientation === preOrientation) return
  preOrientation = newOrientation
  if (canvas.width > canvas.height) {
    cellW = 1 / 10
    cellH = 1 / 5
  } else {
    cellW = 1 / 5
    cellH = 1 / 10
  }
  if (!startPoints) return
  let row = -1
  const numCols = canvas.width > canvas.height ? 10 : 5
  startPoints.forEach((p, i) => {
    const col = i % numCols
    if (col === 0) row++
    p.col = col
    p.row = row
    p.x = currentPoints[i].x / canvas.width
    p.y = currentPoints[i].y / canvas.height
    p.distX = randomPosition(col, cellW, f)
    p.distY = randomPosition(row, cellH, f)
    p.t = 0
  })
}

function generatePoints () {
  var points = []
  // The points should be evenly
  // distributed over the area of the wall. !!!
  for (var x = 0; x < 10; x++) {
    for (var y = 0; y < 5; y++) {
      const iX = canvas.width > canvas.height ? x : y
      const iY = canvas.width > canvas.height ? y : x
      var point = {}
      updatePoint(
        point,
        randomPosition(iX, cellW, f),
        randomPosition(iY, cellH, f),
        iX,
        iY,
        `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},${opacity})`
      )
      points.push(point)
    }
  }
  return points
}

function getCurrentPoints () {
  const points = []
  for (let i = 0; i < startPoints.length; i++) {
    const sP = startPoints[i]
    points.push(interpolatePoint(sP))
    sP.t += sP.tStep
    if (sP.t > 1) {
      updatePoint(sP, sP.distX, sP.distY)
    }
  }
  return points
}

/**
 * @param {Object} p
 * @param {number} x
 * @param {number} y
 * @param {number} [col]
 * @param {number} [row]
 * @param {string} [color]
 */
function updatePoint (p, x, y, col, row, color) {
  if (typeof col === 'undefined') col = p.col
  if (typeof row === 'undefined') row = p.row
  p.x = typeof x === 'undefined' ? randomPosition(col, cellW, f) : x
  p.y = typeof y === 'undefined' ? randomPosition(row, cellH, f) : y
  p.distX = randomPosition(col, cellW, f)
  p.distY = randomPosition(row, cellH, f)
  p.t = 0
  p.tStep = makeTimeStep()
  p.col = col
  p.row = row
  if (color) p.color = color
}

function interpolatePoint (p) {
  const t = interpolateTime(p.t, 'easeOutElastic')
  return {
    x: (p.x + (p.distX - p.x) * t) * canvas.width,
    y: (p.y + (p.distY - p.y) * t) * canvas.height,
    color: p.color
  }
}

function randomPosition (index, cellSize, f) {
  var random = Math.random() * cellSize * f
  return cellSize * index + random + (cellSize - cellSize * f) / 2
}

function makeTimeStep () {
  return Math.max(0.2, Math.random()) / 100
}

function interpolateTime (t, method) {
  if (method === 'easeOutElastic') {
    var p = 0.2
    return Math.pow(2, -10 * t) * Math.sin((t - p / 8) * (2 * Math.PI) / p) + 1
  } else if (method === 'easeInOutCubic') {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  } else {
    return t
  }
}
