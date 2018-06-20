const Koa = require('koa')
const Router = require('koa-router')
const mongoose = require('mongoose')

const Actor = require('./models/actor')

const app = new Koa()
const router = new Router()

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/eac')

function apiRender(context, body) {
  context.set('Content-Type', 'application/json')
  context.set('Access-Control-Allow-Origin', '*')
  context.body = JSON.stringify(body)
}

router.get('/actors', async ctx => {
  const actors = await Actor.find().limit(100)
  apiRender(ctx, actors)
})

router.get('/actors/search/:q', async ctx => {
  // Perform a _logical AND_ search
  const query = ctx.params.q.replace(/\s+/, ' ').split(' ').map(w => `"${w}"`).join(' ')
  const actors = await Actor.find({$text: {$search: query}}).limit(100)
  apiRender(ctx, actors)
})

router.get('/actors/:id', async ctx => {
  const actor = await Actor.findOne({_id: ctx.params.id})
  apiRender(ctx, actor)
})

app.use(router.routes())
app.listen(process.env.PORT || 3000)
