function Point (col, row) {
  this.col = col
  this.row = row
  this.x = this.randomPosition(col, this.cellSize.w)
  this.y = this.randomPosition(row, this.cellSize.h)
  this.distX = this.randomPosition(col, this.cellSize.w)
  this.distY = this.randomPosition(row, this.cellSize.h)
  this.t = 0
  this.tStep = this.makeTimeStep()
  this.color = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},${this.opacity})`
}

Point.prototype.cellSize = {w: 0.1, h: 0.2}
Point.prototype.placementFactor = 0.5
Point.prototype.interpolationMethod = 'easeOutElastic'
Point.prototype.opacity = 1

/*
 * @param {Object} data
 */
Point.prototype.update = function(data){
  Object.keys(data).forEach(key => {
    if (this.hasOwnProperty(key)) this[key] = data[key]
  })
}

Point.prototype.currentPosition = function(){
  const t = this.interpolateTime()
  return {
    x: this.clamp((this.x + (this.distX - this.x) * t), 0, 1),
    y: this.clamp((this.y + (this.distY - this.y) * t), 0, 1)
  }
}

Point.prototype.advance = function () {
  this.t += this.tStep
  if (this.t > 1) {
    this.updatePosition(this.distX, this.distY)
    this.t = 0
    this.tStep = this.makeTimeStep()
  }
}

Point.prototype.updateAddress = function(col, row){
  this.col = col
  this.row = row
}

Point.prototype.updatePosition = function(x, y){
  this.x = typeof x !== null ? x : this.randomPosition(this.col, this.cellSize.w)
  this.y = typeof y !== null ? y : this.randomPosition(this.row, this.cellSize.h)
  this.distX = this.randomPosition(this.col, this.cellSize.w)
  this.distY = this.randomPosition(this.row, this.cellSize.h)
  this.t = 0
  this.tStep = this.makeTimeStep()
}

Point.prototype.randomPosition = function(cellIndex, cellSize) {
  const positionSize = cellSize * this.placementFactor
  const random = Math.random() * positionSize
  const shift = (cellSize - positionSize) / 2
  return cellSize * cellIndex + random + shift
}

Point.prototype.makeTimeStep = function() {
  return Math.max(0.2, Math.random()) / 100
}

Point.prototype.interpolateTime = function () {
  const t = this.t
  if (this.interpolationMethod === 'easeOutElastic') {
    var p = 0.2
    return Math.pow(2, -10 * t) * Math.sin((t - p / 8) * (2 * Math.PI) / p) + 1
  } else if (this.interpolationMethod === 'easeInOutCubic') {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  }
  return t
}

Point.prototype.clamp = function (n, min, max) {
  return Math.max(min, Math.min(n, max))
}
