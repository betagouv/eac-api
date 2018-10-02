const router = require('express').Router()
const User = require('../models/user')

router
  .post('/signup', async (res, req) => {
    const params = req.body
    if (!params.email || !params.password || !params.name) {
      return res.status(400).send({ message: 'Email, password and name required.' })
    }

    const user = new User({
      name: params.name,
      email: params.email,
      roles: ['actor'],
      password: params.password
    })

    try {
      await user.save()
      return res.send({ message: 'User created.', user: user })
    } catch (e) {
      return res.status(400).send({ message: e.message })
    }
  })

  .post('/signin', async (res, req) => {
    const params = req.body
    const message = 'Invalid email or password.'
    const user = await User.findOne({ email: params.email })
    if (!user) {
      return res.status(401).send({ message })
    }
    const match = await user.comparePassword(params.password)
    return match ? res.send({ token: 'JWT - TODO', user }) : res.status(401).send({ message })
  })

module.exports = router
