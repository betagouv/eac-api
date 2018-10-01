const router = require('koa-router')({
  prefix: '/auth'
})
const User = require('../models/user')
const { apiRender } = require('../utils')

router
  .post('/signup', async ctx => {
    const params = ctx.request.body
    if (!params.email || !params.password || !params.name) {
      return apiRender(ctx, { message: 'Email, password and name required.' }, 400)
    }

    const user = new User({
      name: params.name,
      email: params.email,
      roles: ['actor'],
      password: params.password
    })

    try {
      await user.save()
      return apiRender(ctx, { message: 'User created.', user: user }, 200)
    } catch (e) {
      return apiRender(ctx, { message: e.message }, 400)
    }
  })

  .post('/signin', async ctx => {
    const params = ctx.request.body
    const message = 'Invalid email or password.'
    user = await User.findOne({ email: params.email })
    if (!user) {
      return apiRender(ctx, { message }, 401)
    }
    const match = await user.comparePassword(params.password)
    return match ? apiRender(ctx, { token: 'JWT - TODO', user }) : apiRender(ctx, { message }, 401)
  })

module.exports = router
