const router = require('express').Router()

const Action = require('../models/action')

router
  .get('/', async (_req, res) => {
    const schoolLevels = await Action.distinct('schoolLevels')
    res.send(
      schoolLevels
        .filter(d => String(d) === d)
        .filter(d => d.length)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    )
  })

module.exports = router
