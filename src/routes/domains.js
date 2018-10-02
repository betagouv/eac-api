const router = require('express').Router()

const Actor = require('../models/actor')

router
  .get('/', async (_req, res) => {
    const domains = await Actor.distinct('domains')
    const cleanedDomains = domains
      .filter(d => String(d) === d)
      .filter(d => d.length)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    res.send(cleanedDomains)
  })

module.exports = router
