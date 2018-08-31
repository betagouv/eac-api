const router = require('koa-router')({
  prefix: '/actors'
})
const {apiRender, apiRenderCsv, searchCriteria} = require('../utils')
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
    await Action.find({ actorId: ctx.params.id }).remove()
    apiRender(ctx, actor)
  })

  .get('/search/:q*', async ctx => {
    const from = ctx.request.query.from
    const location = from && from.split(',').map(v => Number(v))
    const limit = Number(ctx.request.query.limit) || 100
    const format = ctx.request.query.format || 'json'
    const criteria = searchCriteria(ctx)

    let actors = []

    if (from) {
      actors = await Actor.find(criteria)
      actors.forEach(actor => {
        actor.location = location
      })
      actors.sort((a, b) => a.distance - b.distance)
      if (limit !== -1) {
        actors = actors.splice(0, limit)
      }
    } else {
      actors = limit === -1 ? await Actor.find(criteria) : await Actor.find(criteria).limit(limit)
    }

    switch (format) {
      case 'csv':
        apiRenderCsv(ctx, actors.map(actor => actor.toCsv()))
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
    await Action.remove({ id: { $in: existingActionsIds.filter(x => !updatedActionsIds.includes(x)) } })

    // Update existing actions and create new ones.
    params.actions && await Promise.all(params.actions.map(action => {
      const actionProperties = {...action, ...{actorId: actor._id, loc: actor.loc}}
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
