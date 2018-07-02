const app = require('./app')
const request = require('supertest')
const mongoose = require('mongoose')

describe('Test Schools Route', async () => {

  const Actor = require('./models/actor')
  const School = require('./models/school')

  const schoolsSearchUrl = '/schools/search/Lycée Liberté Paris'

  ;(async () => {
    await Actor.ensureIndexes()
    await School.ensureIndexes()
    School.create({
      name: 'Lycée Liberté',
      city: 'Paris',
      loc: {
        type: 'Point',
        coordinates: [1, 2]
      },
    })
  })()

  afterAll(() => {
    mongoose.disconnect()
  })

  test('respond with json', async () => {
    return request(app.callback())
      .get(schoolsSearchUrl)
      .set('Accept', 'application/json')
      .expect(200)
      .expect(res => {
        expect(res.body[0].name).toBe('Lycée Liberté')
        expect(res.body[0].city).toBe('Paris')
      })
      done()
  })
})