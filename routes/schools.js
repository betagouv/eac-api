const router = require('koa-router')({prefix: '/schools'})
const {apiRender, apiRenderCsv} = require('../utils')

const School = require('../models/school')

router
  .get('/search/:q*', async ctx => {
    // Perform a _logical AND_ search
    const words = ctx.params.q
    const limit = Number(ctx.request.query.limit) || 20
    const format = ctx.request.query.format || 'json'
    const criteria = !words ? {} : {
      $text: {
        $search: words.replace(/\s+/, ' ').split(' ').map(w => `"${w}"`).join(' ')
      }
    }
    let schools = await School.find(criteria).limit(limit)
    schools = schools.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    switch (format) {
      case 'csv':
        apiRenderCsv(ctx, schools.map(school => school.toCsv()))
        break
      default:
        apiRender(ctx, schools)
    }
  })

  .get('/:id', async ctx => {
    const school = await School.findOne({
      _id: ctx.params.id
    })
    apiRender(ctx, school)
  })

module.exports = router
