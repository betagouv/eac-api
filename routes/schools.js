const router = require('koa-router')({prefix: '/schools'})
const apiRender = require('../utils').apiRender

const School = require('../models/school')

router
  .get('/search/:q', async ctx => {
    // Perform a _logical AND_ search
    const words = ctx.params.q.replace(/\s+/, ' ').split(' ').map(w => `"${w}"`).join(' ')
    let schools = await School.find({
      $text: {
        $search: words
      }
    }).limit(20)
    schools = schools.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    apiRender(ctx, schools)
  })

  .get('/:id', async ctx => {
    const school = await School.findOne({
      _id: ctx.params.id
    })
    apiRender(ctx, school)
  })

module.exports = router
