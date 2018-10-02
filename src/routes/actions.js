const router = require('express').Router()
const {apiRenderCsv, searchCriteria} = require('../utils')

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
  .get('/', async (_req, res) => {
    const actions = await Action.aggregate(aggregateRules).limit(100)
    res.send(actions)
  })

  .get('/count', async (_req, res) => {
    res.send(await Action.count())
  })
  

  .get('/search/:q?', async (req, res) => {
    const from = req.query.from
    const location = from && from.split(',').map(v => Number(v))
    const limit = Number(req.query.limit) || 30
    const format = req.query.format || 'json'
    const criteria = [{$match: searchCriteria(req)}, ...aggregateRules] // FIX

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
        // Need a better implementation
        apiRenderCsv(res, actions) // FIX
        break
      default:
        res.send(actions)
    }
    res.end()
  })

  .get('/:id', async (req, res) => {
    const action = await Action.findOne({ _id: req.params.id }).populate('actorId')
    action._doc.actor = action.actorId // actorId should be called "actor"!
    delete action._doc.actorId
    if (req.query.from) {
      action.location = req.query.from
    }
    res.send(action)
  })

module.exports = router
