const router = require('koa-router')({prefix: '/domains'})
const { render } = require('../renderers')

const Actor = require('../models/actor')

router
  .get('/', async ctx => {
    const domains = await Actor.distinct('domains')
    const cleanedDomains = domains
      .filter(d => String(d) === d)
      .filter(d => d.length)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    render(ctx, cleanedDomains)
  })

module.exports = router
