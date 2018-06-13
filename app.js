const Koa = require('koa')
const Router = require('koa-router')
const mongoose = require('mongoose')

const Actor = require('./models/actor')

const app = new Koa()
const router = new Router()

mongoose.connect('mongodb://localhost/eac')

router.get('/actors', async ctx => {
  const actors = await Actor.find().limit(10)
  ctx.set('Content-Type', 'application/json')
  debugger
  ctx.body = JSON.stringify(actors)
})

app.use(router.routes())
app.listen(4000)
