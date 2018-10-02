const router = require('koa-router')({
  prefix: '/actors'
})
const { apiRender, renderFormat, searchCriteria, version } = require('../utils')
const { allowDepartmentsFilter } = require('../query')
const Actor = require('../models/actor')
const Action = require('../models/action')

router
  .get('/', async ctx => {
    const criteria = allowDepartmentsFilter(ctx)
    const actors = await Actor.find(criteria).limit(Number(ctx.request.query.limit) || 30)
    renderFormat(ctx, actors)
  })

  .post('/', async ctx => {
    await createOrUpdateActor(ctx, x => Actor.create(x))
  })

  .put('/:id', async ctx => {
    await createOrUpdateActor(ctx, async actor => {
      await version('Actor', await Actor.findByIdAndUpdate(ctx.params.id, actor))
      return Actor.findById(ctx.params.id)
    })
  })

  .delete('/:id', async ctx => {
    const actor = await Actor.findOneAndRemove({
      _id: ctx.params.id
    })
    await version('Actor', actor)
    const actions = await Action.find({ actorId: ctx.params.id })
    await Action.remove({ id: { $in: actions.map(a => a.id) } })
    await version('Action', actions)
    apiRender(ctx, actor)
  })

  .get('/count', async ctx => {
    const criteria = allowDepartmentsFilter(ctx)
    ctx.body = await Actor.count(criteria)
  })

  .get('/search/:q*', async ctx => {
    const from = ctx.request.query.from
    const location = from && from.split(',').map(v => Number(v))
    const limit = Number(ctx.request.query.limit) || 30
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
    renderFormat(ctx, actors)
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
    const toBeRemovedActionsIds = existingActionsIds.filter(x => !updatedActionsIds.includes(x))
    const toBeRemovedActions = await Action.find({ id: { $in: toBeRemovedActionsIds } })
    await Action.remove({ id: { $in: toBeRemovedActionsIds } })
    await version('Action', toBeRemovedActions)

    // Update existing actions and create new ones.
    params.actions && await Promise.all(params.actions.map(async action => {
      const actionProperties = {...action, ...{actorId: actor._id, loc: actor.loc}}
      if (!action.id) {
        return Action.create(actionProperties)
      } else {
        const actionBeforeUpdate = await Action.findByIdAndUpdate(action.id, actionProperties)
        return version('Action', actionBeforeUpdate)
      }
    }))

    apiRender(ctx, actor)
  } catch (e) {
    apiRender(ctx, {
      message: e.message
    }, 400)
  }
}

module.exports = router
