const router = require('koa-router')({
  prefix: '/actions'
})
const { searchCriteria } = require('../utils')
const { render } = require('../renderers')

const Action = require('../models/action')

const aggregateRules = [
  {
    '$unwind': '$actorId'
  },
  {
    $lookup: {
      from: 'actors',
      localField: 'actorId',
      foreignField: '_id',
      as: 'actor'
    }
  },
  {
    '$unwind': '$actor'
  }
]

router
  .get('/', async ctx => {
    const actions = await Action.aggregate(aggregateRules).limit(100)
    render(ctx, actions)
  })

  .get('/search/:q*', async ctx => {
    const from = ctx.request.query.from
    const location = from && from.split(',').map(v => Number(v))
    const limit = Number(ctx.request.query.limit) || 100
    const format = ctx.request.query.format || 'json'
    const criteria = [{$match: searchCriteria(ctx)}, ...aggregateRules]

    let actions = []

    if (from) {
      actions = await Action.aggregate(criteria)
      actions.forEach(action => {
        action.location = location
      })
      actions.sort((a, b) => a.distance - b.distance)
      actions = actions.splice(0, limit)
    } else {
      actions = await Action.aggregate(criteria).limit(limit)
    }

    render(ctx, actions)
  })

  .get('/:id', async ctx => {
    const action = await Action.findOne({ _id: ctx.params.id }).populate('actorId')
    action._doc.actor = action.actorId // actorId should be called "actor"!
    delete action._doc.actorId
    if (ctx.request.query.from) {
      action.location = ctx.request.query.from
    }
    apiRender(ctx, action)
  })

module.exports = router
