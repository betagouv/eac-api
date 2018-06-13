const Koa = require('koa')
const Router = require('koa-router')
const mongoose = require('mongoose')

const Actor = require('./models/actor')

const app = new Koa()
const router = new Router()

mongoose.connect('mongodb://localhost/eac')

function apiRender(context, body) {
  context.set('Content-Type', 'application/json')
  context.set('Access-Control-Allow-Origin', '*')
  context.body = JSON.stringify(body)
}

router.get('/actors', async ctx => {
  const actors = await Actor.find().limit(10)
  apiRender(ctx, actors)
})

router.get('/actors/:id', async ctx => {
  const actor = await Actor.findOne({_id: ctx.params.id})
  apiRender(ctx, actor)
})

app.use(router.routes())
app.listen(3000)
