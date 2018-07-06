const router = require('koa-router')({prefix: '/domains'})
const apiRender = require('../utils').apiRender

const Actor = require('../models/actor')

router
  .get('/', async ctx => {
    const domains = await Actor.distinct('domains')
    const cleanedDomains = domains
      .filter(d => String(d) === d)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    apiRender(ctx, cleanedDomains)
  })

module.exports = router
