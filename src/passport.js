const { Strategy, ExtractJwt } = require('passport-jwt')
const configSecret = require('./config').secret
const User = require('./models/user')

module.exports = function(passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: configSecret
  }
  passport.use(new Strategy(opts, async function(jwtPayload, done) {
    try {
      const user = await User.findOne({ _id: jwtPayload._id })
      return done(null, user || false)
    } catch (e) {
      return done(e, false)
    }
  }))
}
