const router = require('express').Router()
const Feedback = require('../models/feedback')

router
  // Create a new feedback.
  .post('/', async (req, res) => {
    const params = req.body
    const feedback = new Feedback({
      actionId: params.actionId,
      email: params.email,
      participation: Boolean(params.participation)
    })
    try {
      await feedback.save()
      return res.send({ message: 'Feedback created.', feedback })
    } catch (e) {
      return res.status(400).send({ message: e.message })
    }
  })

  // Get all feedbacks.
  .get('/', async (_req, res) => {
    res.send(await Feedback.find({}))
  })

module.exports = router
