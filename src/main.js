// On a wall surface, any
// continuous stretch of wall,
/** @type HTMLCanvasElement */
// @ts-ignore
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d', { alpha: false })

let cellW = 0.1
let cellH = 0.2
let preOrientation = canvas.width > canvas.height ? 'landscape' : 'portrait'

const bgColor = 'hsl(0,0%,0%)'
let f = 0.8
const opacity = 0.9
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
      var point = {
        x: randomPosition(iX, cellW, f),
        y: randomPosition(iY, cellH, f),
        distX: randomPosition(iX, cellW, f),
        distY: randomPosition(iY, cellH, f),
        // color: `rgb(100,100,100,${opacity})`,
        color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},${opacity})`,
        t: 0,
        tStep: makeTimeStep(),
        col: iX,
        row: iY
      }
      points.push(point)
    }
  }
  return points
}

function randomPosition (index, cellSize, f) {
  var random = Math.random() * cellSize * f
  return cellSize * index + random + (cellSize - cellSize * f) / 2
}

function getCurrentPoints () {
  const points = []
  for (let i = 0; i < startPoints.length; i++) {
    const sP = startPoints[i]
    points.push(interpolatePoint(sP, interpolateTime(sP.t, 'easeOutElastic')))
    sP.t += sP.tStep
    if (sP.t > 1) {
      sP.t = 0
      sP.x = sP.distX
      sP.y = sP.distY
      sP.distX = randomPosition(sP.col, cellW, f)
      sP.distY = randomPosition(sP.row, cellH, f)
      sP.tStep = makeTimeStep()
    }
  }
  return points
}

function interpolatePoint (p, t) {
  return {
    x: (p.x + (p.distX - p.x) * t) * canvas.width,
    y: (p.y + (p.distY - p.y) * t) * canvas.height,
    color: p.color
  }
}

function makeTimeStep () {
  return Math.max(0.2, Math.random()) / 60
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
