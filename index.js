module.exports = function createStatsWidget (drawCalls) {
  // the widget keeps track of the previous values of gpuTime,
  // in order to compute the frame time.
  var prevGpuTimes = []
  var i
  for (i = 0; i < drawCalls.length; i++) {
    prevGpuTimes[i] = 0
  }

  // we update the widget every second, we need to keep track of the time:
  var totalTime = 1.1

  // we show the average frametime to the user.
  var N = 50
  var totalFrameTime = []
  var frameTimeCount = 0
  var avgFrameTime = []
  for (i = 0; i < drawCalls.length; ++i) {
    totalFrameTime[i] = 0.0
    avgFrameTime[i] = 0.0
  }

  // the widget is contained in a <div>
  var container = document.createElement('div')
  container.style.cssText = 'position:fixed;top:20px;left:20px;opacity:0.8;z-index:10000;'
  var pr = Math.round(window.devicePixelRatio || 1)

  // widget styling constants.
  var WIDTH = 160
  var TEXT_SIZE = 10
  var TEXT_START = [7, 37]
  var TEXT_SPACING = 6
  var HEADER_SIZE = 20
  var BOTTOM_SPACING = 20
  var HEADER_POS = [3, 3]
  var BG = '#000'
  var FG = '#ccc'
  var HEIGHT = drawCalls.length * TEXT_SIZE + (drawCalls.length - 1) * TEXT_SPACING + TEXT_START[1] + BOTTOM_SPACING

  // we draw the widget on a canvas.
  var canvas = document.createElement('canvas')
  var context = canvas.getContext('2d')

  // set canvas size
  canvas.width = WIDTH * pr
  canvas.height = HEIGHT * pr
  canvas.style.cssText = 'width:' + WIDTH + 'px;height:' + HEIGHT + 'px'

  // draw background.
  context.fillStyle = BG
  context.fillRect(0, 0, WIDTH * pr, HEIGHT * pr)

  // draw header.
  context.font = 'bold ' + (HEADER_SIZE * pr) + 'px Helvetica,Arial,sans-serif'
  context.textBaseline = 'top'
  context.fillStyle = FG
  context.fillText('Stats', HEADER_POS[0] * pr, HEADER_POS[1] * pr)

  container.appendChild(canvas)
  document.body.appendChild(container)

  return {
    update: function (deltaTime) {
      totalTime += deltaTime
      if (totalTime > 1.0) {
        totalTime = 0

        // make sure that we clear the old text before drawing new text.
        context.fillStyle = BG
        context.fillRect(
          TEXT_START[0] * pr,
          TEXT_START[1] * pr,
          (WIDTH - TEXT_START[0]) * pr,
          (HEIGHT - TEXT_START[1]) * pr)

        context.font = 'bold ' + (TEXT_SIZE * pr) + 'px Helvetica,Arial,sans-serif'
        context.fillStyle = FG

        var drawCall
        var str
        var textCursor = [TEXT_START[0], TEXT_START[1]]
        var frameTime
        for (var i = 0; i < drawCalls.length; i++) {
          drawCall = drawCalls[i]

          str = drawCall[1] + ' : ' + Math.round(100.0 * avgFrameTime[i]) / 100.0 + 'ms'
          context.fillText(str, textCursor[0] * pr, textCursor[1] * pr)

          // next line
          textCursor[1] += TEXT_SIZE + TEXT_SPACING
        }
      }

      frameTimeCount++
      // make sure to update the previous gpuTime, and to compute the average.
      for (i = 0; i < drawCalls.length; i++) {
        drawCall = drawCalls[i]

        frameTime = drawCall[0].stats.gpuTime - prevGpuTimes[i]
        totalFrameTime[i] += frameTime

        if (frameTimeCount === N) {
          avgFrameTime[i] = totalFrameTime[i] / N
          totalFrameTime[i] = 0.0
        }

        prevGpuTimes[i] = drawCall[0].stats.gpuTime
      }

      // reset avg calculation.
      if (frameTimeCount === N) {
        frameTimeCount = 0
      }
    }
  }
}
