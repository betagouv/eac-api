const router = require('koa-router')({prefix: '/schools'})
const { render, renderJson } = require('../renderers')


const School = require('../models/school')

router
  .get('/search/:q*', async ctx => {
    // Perform a _logical AND_ search
    const searchFilters = {}
    const limitParam = ctx.request.query.limit
    let limit = limitParam ? Number(limitParam) > 0 && Number(limitParam) : 20
    const q = ctx.params.q

    if (q) {
      const words = ctx.params.q.replace(/\s+/, ' ').split(' ').map(w => `"${w}"`).join(' ')
      searchFilters['$text'] = { $search: words }
    }
    const schoolsQuery = School.find(searchFilters)
    limit && schoolsQuery.limit(limit)

    const schools = await schoolsQuery
    schools.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

    render(ctx, schools)
  })

  .get('/:id', async ctx => {
    const school = await School.findOne({
      _id: ctx.params.id
    })
    renderJson(ctx, school)
  })

module.exports = router
