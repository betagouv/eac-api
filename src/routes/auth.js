const router = require('express').Router()
const User = require('../models/user')
const configSecret = require('../config').secret
const jwt = require('jsonwebtoken')
const passport = require('passport')

router
  .post('/signup', async (req, res) => {
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

  .post('/signin', async (req, res) => {
    const params = req.body
    if (!params.email || !params.password) {
      return res.status(400).send({ message: 'Email and password required.' })
    }
    const message = 'Invalid email or password.'
    const user = await User.findOne({ email: params.email })
    if (!user) {
      return res.status(401).send({ message })
    }
    if (await user.comparePassword(params.password)) {
      const token = jwt.sign({ _id: user._id }, configSecret, { expiresIn: '7d' })
      return res.send({ token: `JWT ${token}`, user })
    }
    return res.status(401).send({ message })
  })

  .get('/user', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send({ user: req.user })
  })

module.exports = router
