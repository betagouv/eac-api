const router = require('express').Router()
const {apiRenderCsv, searchCriteria, distance} = require('../utils')
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
    res.send(String(await Action.countDocuments()))
  })

  .get('/search/:q?', async (req, res) => {
    const from = req.query.from
    const location = from && from.split(',').map(v => Number(v))
    const limit = Number(req.query.limit) || 30
    const format = req.query.format || 'json'
    const domains = req.query.domains && req.query.domains.split(',')
    const schoolLevels = req.query.schoolLevels && req.query.schoolLevels.split(',')
    let criteria = searchCriteria(req)
    if (schoolLevels) {
      criteria.schoolLevels = { $in: schoolLevels }
    }
    if (domains) {
      criteria = [{$match: criteria}, ...aggregateRules,{$match: {"actor.domains": { $in: domains } } }]
    } else {
      criteria = [{$match: criteria}, ...aggregateRules]
    }
    

    let actions = []

    if (from) {
      actions = await Action.aggregate(criteria)
      actions.forEach(action => {
        action.distance = distance(action.loc.coordinates, location)
      })
      actions.sort((a, b) => a.distance - b.distance)
      actions = actions.splice(0, limit)
    } else {
      actions = await Action.aggregate(criteria).limit(limit)
    }

    switch (format) {
      case 'csv':
        // Need a better implementation
        apiRenderCsv(res, actions)
        break
      default:
        res.send(actions)
    }
  })

  .get('/:id', async (req, res) => {
    const action = await Action.findOne({ _id: req.params.id }).populate('actorId')
    action._doc.actor = action.actorId // actorId should be called "actor"!
    delete action._doc.actorId
    if (req.query.from) {
      action.distance = distance(action.loc.coordinates, req.query.from)
    }
    res.send(action)
  })

module.exports = router
