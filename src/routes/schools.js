const router = require('koa-router')({prefix: '/schools'})
const { apiRender, renderFormat } = require('../utils')
const { allowDepartmentsFilter } = require('../query')

const School = require('../models/school')

router
  .get('/', async (ctx) => {
    const criteria = allowDepartmentsFilter(ctx)
    const schools = await School.find(criteria).limit(Number(ctx.request.query.limit) || 30)
    renderFormat(ctx, schools)
  })

  .get('/search/:q*', async ctx => {
    // Perform a _logical AND_ search
    const words = ctx.params.q
    const limit = Number(ctx.request.query.limit) || 20
    const criteria = !words ? {} : {
      $text: {
        $search: words.replace(/\s+/, ' ').split(' ').map(w => `"${w}"`).join(' ')
      }
    }
    let schools = await School.find(criteria).limit(limit)
    schools = schools.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    renderFormat(ctx, schools)
  })

  .get('/count', async ctx => {
    const criteria = allowDepartmentsFilter(ctx)
    ctx.body = await School.count(criteria)
  })

  .get('/:id', async ctx => {
    const school = await School.findOne({
      _id: ctx.params.id
    })
    apiRender(ctx, school)
  })

module.exports = router
