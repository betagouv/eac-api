const Koa = require('koa')
const Router = require('koa-router')
const mongoose = require('mongoose')

const Actor = require('./models/actor')
const School = require('./models/school')

const app = new Koa()
const router = new Router()

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/eac')

function apiRender (context, body) {
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
  if (domains) criteria.domains = {$in: domains}
  // Search within 100km
  const from = ctx.request.query.from
  let actors
  if (from) {
    const location = from.split(',').map(v => Number(v))
    criteria.loc = { $geoWithin: { $centerSphere: [ location, 100 / 3963.2 ] } }
    actors = await Actor.find(criteria).limit(100)
    // Calculate the distance and sort
    actors.forEach(actor => { actor.location = location })
    actors.sort((a, b) => a.distance > b.distance)
  } else {
    actors = await Actor.find(criteria).limit(100)
  }
  apiRender(ctx, actors)
})

router.get('/actors/:id', async ctx => {
  const actor = await Actor.findOne({_id: ctx.params.id})
  actor.location = ctx.request.query.from
  apiRender(ctx, actor)
})

router.get('/domains', async ctx => {
  const domains = await Actor.distinct('domains')
  const cleanedDomains = domains
    .filter(d => String(d) === d)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  apiRender(ctx, cleanedDomains)
})

router.get('/schools/search/:q', async ctx => {
  // Perform a _logical AND_ search
  const words = ctx.params.q.replace(/\s+/, ' ').split(' ').map(w => `"${w}"`).join(' ')
  let schools = await School.find({ $text: { $search: words } }).limit(20)
  schools = schools.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  apiRender(ctx, schools)
})

router.get('/schools/:id', async ctx => {
  const school = await School.findOne({_id: ctx.params.id})
  apiRender(ctx, school)
})

app.use(router.routes())
app.listen(process.env.PORT || 3000)
