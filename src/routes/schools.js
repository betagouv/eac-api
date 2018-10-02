const router = require('express').Router()
const { renderFormat } = require('../utils')
const { allowDepartmentsFilter } = require('../query')

const School = require('../models/school')

router
  .get('/', async (req, res) => {
    const criteria = allowDepartmentsFilter(req)
    const schools = await School.find(criteria).limit(Number(req.query.limit) || 30)
    renderFormat(req, res, schools)
  })

  .get('/search/:q?', async (req, res) => {
    // Perform a _logical AND_ search
    const words = req.params.q
    const limit = Number(req.query.limit) || 20
    const criteria = !words ? {} : {
      $text: {
        $search: words.replace(/\s+/, ' ').split(' ').map(w => `"${w}"`).join(' ')
      }
    }
    let schools = await School.find(criteria).limit(limit)
    schools = schools.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    renderFormat(req, res, schools)
  })

  .get('/count', async (req, res) => {
    const criteria = allowDepartmentsFilter(req)
    res.send(`${await School.count(criteria)}`)
  })

  .get('/:id', async (req, res) => {
    const school = await School.findOne({
      _id: req.params.id
    })
    res.send(school)
  })

module.exports = router
