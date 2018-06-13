const Koa = require('koa')
const Router = require('koa-router')
const mongoose = require('mongoose')


const app = new Koa()
const router = new Router()

// mongoose.connect('mongodb://localhost/eac')

router.get('/actors', ctx => {
  actors = [
    {name: "Musée"},
    {name: "Danse"},
  ]
  ctx.set('Content-Type', 'application/json')
  ctx.body = JSON.stringify(actors)
})

app.use(router.routes())
app.listen(4000)
