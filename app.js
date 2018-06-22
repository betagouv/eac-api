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
  const words = ctx.params.q.replace(/\s+/, ' ').split(' ').map(w => `"${w}"`).join(' ')
  const criteria = { $text: { $search: words } }
  // Filter with certain domains
  const domains = ctx.request.query.domains && ctx.request.query.domains.split(',')
  if(domains) criteria.domains = {$in: domains}
  // Search within 100km
  const from = ctx.request.query.from
  if(from) criteria.loc = { $geoWithin: { $centerSphere: [from.split(',').map(v => Number(v)),
                                                          100 / 3963.2 ]
                          } }
  const actors = await Actor.find(criteria).limit(100)
  apiRender(ctx, actors)
})

router.get('/actors/:id', async ctx => {
  const actor = await Actor.findOne({_id: ctx.params.id})
  apiRender(ctx, actor)
})
router.get('/domains', async ctx => {
  const domains = await Actor.distinct('domains')
  const cleanedDomains = domains
    .filter(d => String(d) === d)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  apiRender(ctx, cleanedDomains)
})

app.use(router.routes())
app.listen(process.env.PORT || 3000)
