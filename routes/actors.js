const fs = require('fs')
const csvWriter = require('csv-write-stream')

const router = require('koa-router')({
  prefix: '/actors'
})
const utils = require('../utils')
const apiRender = utils.apiRender

const Actor = require('../models/actor')
const Action = require('../models/action')

router
  .get('/', async ctx => {
    const actors = await Actor.find().limit(100)
    apiRender(ctx, actors)
  })

  .post('/', async ctx => {
    await createOrUpdateActor(ctx, x => Actor.create(x))
  })

  .put('/:id', async ctx => {
    await createOrUpdateActor(ctx, x => Actor.findByIdAndUpdate(ctx.params.id, x, {new: true}))
  })

  .delete('/:id', async ctx => {
    const actor = await Actor.deleteOne({
      _id: ctx.params.id
    })
    apiRender(ctx, actor)
  })

  .get('/search/:q*', async ctx => {
    // Perform a _logical AND_ search
    const words = ctx.params.q
    const from = ctx.request.query.from
    const limit = Number(ctx.request.query.limit) || 100
    const distance = Number(ctx.request.query.distance) || 100
    const domains = ctx.request.query.domains && ctx.request.query.domains.split(',')
    const format = ctx.request.query.format || 'json'

    const criteria = !words ? {} : {
      $text: {
        $search: words.replace(/\s+/, ' ').split(' ').map(w => `"${w}"`).join(' ')
      }
    }

    // Filter with certain domains
    if (domains) {
      criteria.domains = {
        $in: domains
      }
    }
    // Search within 100km
    let actors
    if (from) {
      const location = from.split(',').map(v => Number(v))
      criteria.loc = {
        $geoWithin: {
          $centerSphere: [location, distance / 3963.2]
        }
      }
      actors = await Actor.find(criteria)
      // Calculate the distance and sort
      actors.forEach(actor => {
        actor.location = location
      })
      actors.sort((a, b) => a.distance - b.distance)
      actors = actors.splice(0, limit)
    } else {
      actors = await Actor.find(criteria).limit(limit)
    }

    switch (format) {
      case 'csv':
        const stream = csvWriter()
        actors.forEach(model => {
          const actor = model._doc
          actor.location = actor.loc && actor.loc.coordinates.join(',')
          actor.editUrl = `https://www.education-artistique-culturelle.fr/actor/${actor._id}/edit`
          delete actor._id
          delete actor.loc
          return stream.write(actor)
        })
        ctx.set('Content-disposition', `attachment; filename=actors-export.csv`)
        ctx.statusCode = 200
        ctx.body = stream
        stream.end()
        break
      default:
        apiRender(ctx, actors)
    }
  })

  .get('/:id', async ctx => {
    const actor = await Actor.findOne({
      _id: ctx.params.id
    })
    actor.actions = await Action.find({actorId: actor._id})
    actor.location = ctx.request.query.from
    apiRender(ctx, actor)
  })

async function createOrUpdateActor (ctx, callback) {
  const params = ctx.request.body
  try {
    const {actions, ...properties} = {...params, ...{updatedAt: new Date(), source: 'eac_website'}}

    // Create actor.
    const actor = await callback(properties)
    
    // Remove deleted actions.
    const existingActionsIds = (await Action.find({actorId: actor._id})).map(a => a.id)
    const updatedActionsIds = params.actions ? params.actions.filter(a => a.id).map(a => a.id) : []
    await Action.remove({ id: { $in: existingActionsIds.filter(x => !updatedActionsIds.includes(x)) }})

    // Update existing actions and create new ones.
    params.actions && await Promise.all(params.actions.map(action => {
      const actionProperties = {...action, ...{actorId: actor._id}}
      return action.id ? Action.findByIdAndUpdate(action.id, actionProperties, {new: true}) : Action.create(actionProperties)
    }))
    
    apiRender(ctx, actor)
  } catch (e) {
    apiRender(ctx, {
      message: e.message
    }, 400)
  }
}

module.exports = router
