const router = require('express').Router()
const { renderFormat, searchCriteria, version } = require('../utils')
const { allowDepartmentsFilter } = require('../query')
const Actor = require('../models/actor')
const Action = require('../models/action')

router
  .get('/', async (req, res) => {
    const criteria = allowDepartmentsFilter(req)
    const actors = await Actor.find(criteria).limit(Number(req.query.limit) || 30)
    renderFormat(req, res, actors) // FIX
  })

  .post('/', async (req, res) => {
    await createOrUpdateActor(req, res, x => Actor.create(x))
  })

  .put('/:id', async (req, res) => {
    await createOrUpdateActor(req, res, async actor => {
      await version('Actor', await Actor.findByIdAndUpdate(req.params.id, actor))
      return Actor.findById(req.params.id)
    })
  })

  .delete('/:id', async (req, res) => {
    const actor = await Actor.findOneAndRemove({
      _id: req.params.id
    })
    await version('Actor', actor)
    const actions = await Action.find({ actorId: req.params.id })
    await Action.remove({ id: { $in: actions.map(a => a.id) } })
    await version('Action', actions)
    res.send(actor)
  })

  .get('/count', async (req, res) => {
    const criteria = allowDepartmentsFilter(req)
    res.send(await Actor.count(criteria))
  })

  .get('/search/:q?', async (req, res) => {
    const from = req.query.from
    const location = from && from.split(',').map(v => Number(v))
    const limit = Number(req.query.limit) || 30
    const criteria = searchCriteria(req)

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
    renderFormat(req, res, actors) // FIX
  })

  .get('/:id', async (req, res) => {
    const actor = await Actor.findOne({
      _id: req.params.id
    })
    actor.actions = await Action.find({actorId: actor._id})
    actor.location = req.query.from
    res.send(actor)
  })

async function createOrUpdateActor (req, res, callback) {
  const params = req.body
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

    res.send(actor)
  } catch (e) {
    res.status(400).send({
      message: e.message
    })
  }
}

module.exports = router
