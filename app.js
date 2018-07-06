const Koa = require('koa')
const router = require('koa-router')()

const app = new Koa()

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/eac')

app.use(require('./routes/actors').routes())
app.use(require('./routes/domains').routes())
app.use(require('./routes/schools').routes())

app.use(router.routes())

module.exports = app
