/**
 * maximtyminko.com
 * @param {HTMLCanvasElement} canvas 
 */
function Drawing (canvas) {
  const ctx = canvas.getContext('2d', { alpha: false })
  let cellW = 0.1
  let cellH = 0.2
  let preOrientation = canvas.width > canvas.height ? 'landscape' : 'portrait'

  const bgColor = 'hsl(30,0%,100%)'
  let f = 0
  const opacity = 1
  const lineWidth = 1
  let play = true

  /** @type Point[] */ let startPoints
  let currentPoints = []
  updateCanvasResolution()
  startPoints = generatePoints()

  window.addEventListener('resize', updateCanvasResolution)
  window.addEventListener('keyup', function (e) {
    if (e.code === 'Space' || e.keyCode === 32) togglePlay()
  })
  canvas.addEventListener('click', togglePlay)

  function togglePlay () {
    play = !play
    if(play) draw()
  }


  draw()

  function draw () {
    ctx.fillStyle = bgColor
    ctx.lineCap = 'round'
    ctx.lineWidth = lineWidth
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    currentPoints = getCurrentPoints()
    
    for (var i = 0; i < currentPoints.length; i++) {
      var p = currentPoints[i]
      for (var k = i + 1; k < currentPoints.length; k++) {
        var pEnd = currentPoints[k]
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(pEnd.x, pEnd.y)
        ctx.strokeStyle = p.color
        ctx.stroke()
      }
    }
    if (play) requestAnimationFrame(draw)
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
      Point.prototype.cellSize = {w: 1 / 10, h: 1 / 5}
    } else {
      Point.prototype.cellSize = {w: 1 / 5, h: 1 / 10}
    }
    if (!startPoints) return
    let row = -1
    const numCols = canvas.width > canvas.height ? 10 : 5
    startPoints.forEach((p, i) => {
      const col = i % numCols
      if (col === 0) row++
      p.updateAddress(col, row)
      const x = currentPoints.length ? currentPoints[i].x / canvas.width : null
      const y = currentPoints.length ? currentPoints[i].y / canvas.height : null
      p.updatePosition(x, y)
    })
  }

  function generatePoints () {
    const numCols = canvas.width > canvas.height ? 10 : 5
    let row = -1
    let points = []
    for (let i = 0; i < 50; i++) {
      const col = i % numCols
      if (col === 0) row++
      const p = new Point(col, row)
      points.push(p)
    }
    return points
  }

  function getCurrentPoints () {
    return startPoints.map(p => {
      let {x, y} = p.currentPosition()
      p.advance()
      return {
        x: x * canvas.width,
        y: y * canvas.height,
        color: p.color
      }
    })
  }
}