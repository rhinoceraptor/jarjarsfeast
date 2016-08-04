/*
 * JarJar's Feast
 */
'use strict'

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
canvas.width = 640
canvas.height = 640
document.body.appendChild(canvas)

const clips = [
  'tonguestickout',
  'eat',
  'exsqueezeme',
  'boom',
  'howwude',
  'meesaback',
  'ohno',
  'oops',
  'thisembarassing',
  'tonguegrab'
]
const sounds = _.zipObject(clips, clips.map(c => new Audio(`sounds/${c}.mp3`)))

const pics = [
  'deadjarjar',
  'jarjar',
  'tongueinit',
  'apple',
  'tonguesection',
  'bomb'
]
const images = _.zipObject(pics, pics.map(p => {
  let pic = new Image()
  pic.src = `images/${p}.png`
  return pic
}))

const keysDown = {}
addEventListener('keydown', function (e) {
  keysDown[e.keyCode] = true
}, false)

addEventListener('keyup', function (e) {
  delete keysDown[e.keyCode]
}, false)

let apples = []
let bombs = []
let tongue = {}
let score = 0
let dead = false

const generateInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const generateAppleSpeed = () => !!generateInt(0, 1) ? (5 + Math.random(1)) : (5 - Math.random(1))
const generateBombSpeed = () => !!generateInt(0, 1) ? (7 + Math.random(1)) : (7 - Math.random(1))

const updateGame = function () {
  if (dead) {
    if (13 in keysDown) {
      sounds.meesaback.cloneNode().play()
      dead = false
    }
    return
  }
  let drawBomb = generateInt(1, 200) === 6

  let drawApple = generateInt(1, 75) === 6

  // Add apples
  if (drawApple) {
    apples.push({
      x: generateInt(480, 580),
      y: 0,
      speed: generateAppleSpeed()
    })
  }

  // Add bombs
  if (drawBomb) {
    bombs.push({
      x: generateInt(480, 580),
      y: 0,
      speed: generateBombSpeed()
    })
  }

  if (32 in keysDown) {
    tongue.drawing = true
  } else {
    tongue.drawing = false
    tongue.sections = 0
  }

  if (tongue.drawing) {
    if (tongue.sections === 0) {
      sounds.tonguestickout.cloneNode().play()
    }

    if (tongue.sections < 0) {
      tongue.drawing = false
    } else if (tongue.sections < 5) {
      tongue.sections++
    } else {
      tongue.sections--
    }
  }

  const dropObjects = arr => arr
    .map(obj => ({ x: obj.x, y: obj.y + obj.speed, speed: obj.speed }))
    .filter(obj => obj.y < 640)
  bombs = dropObjects(bombs)
  apples = dropObjects(apples)

  const withinThirty = (mid, num) => num > (mid - 50) && num < (mid + 50)

  apples.forEach((apple, index) => {
    if (withinThirty(350, apple.y) && withinThirty(400 + (30 * tongue.sections), apple.x)) {
      apples.splice(index, 1)
      sounds.eat.cloneNode().play()
      score++
    }
  })

  bombs.forEach((bomb, index) => {
    if (withinThirty(350, bomb.y) && withinThirty(400 + (30 * tongue.sections), bomb.x)) {
      bombs.splice(index, 1)
      score = 0
      dead = true
      apples = []
      bombs = []
      _.sample([
        sounds.tonguegrab,
        sounds.thisembarassing,
        sounds.howwude,
        sounds.oops,
        sounds.ohno
      ]).cloneNode().play()
    }
  })
}

const render = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(dead ? images.deadjarjar : images.jarjar, 0, 160)
  apples.forEach(apple => ctx.drawImage(images.apple, apple.x, apple.y))
  bombs.forEach(bomb => ctx.drawImage(images.bomb, bomb.x, bomb.y))
  if (tongue.drawing) {
    ctx.drawImage(images.tongueinit, 240, 334)
    for (var i = 0; i < tongue.sections; i++) {
      ctx.drawImage(images.tonguesection, 300 + (50 * i), 347)
    }
  }

  ctx.fillStyle = 'rgb(0, 0, 0)'
  ctx.font = '24px Helvetica'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  if (!dead) {
    ctx.fillText('Press space to eat\nScore: ' + score, 32, 32)
  } else {
    ctx.fillText('You have died! Press enter to play again.', 32, 32)
  }

}

const gameLoop = function () {
  updateGame()
  render()
  requestAnimationFrame(gameLoop)
}

// Let's play this game!
gameLoop()
sounds.meesaback.cloneNode().play()

