const Koa = require('koa')
const router = require('koa-router')()
const cors = require('koa-cors')
const app = new Koa()

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/eac')

app.use(cors())

app.use(require('./routes/actors').routes())
app.use(require('./routes/domains').routes())
app.use(require('./routes/schools').routes())

app.use(router.routes())

module.exports = app
