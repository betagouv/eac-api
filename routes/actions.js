const router = require('koa-router')({
  prefix: '/actions'
})
const utils = require('../utils')
const apiRender = utils.apiRender
const searchCriteria = utils.searchCriteria

const Action = require('../models/action')

const aggregateRules = [{
    "$unwind": "$actorId"
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
    "$unwind": "$actor"
  }
]

router
  .get('/', async ctx => {
    const actions = await Action.aggregate(aggregateRules).limit(100)
    apiRender(ctx, actions)
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

    switch (format) {
      case 'csv':
        apiRenderCsv(ctx, actions.map(action => action.toCsv()))
        break
      default:
        apiRender(ctx, actions)
    }
  })

module.exports = router
