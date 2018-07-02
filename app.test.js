const app = require('./app')
const request = require('supertest')
const mongoose = require('mongoose')

async function waitForIndexes() {
  const Actor = require('./models/actor')
  const School = require('./models/school')
  await Actor.ensureIndexes()
  await School.ensureIndexes()
}
waitForIndexes()

describe('Test Schools Route', () => {
  const School = require('./models/school')
  School.create({ 
    name: 'Lycée Liberté',
    city: 'Paris',
    loc: { type: 'Point', coordinates: [1, 2] },
  })
  const schoolsSearchUrl = '/schools/search/Lycée Liberté Paris'
  afterAll(() => {
    mongoose.disconnect()
  })
  test('respond with json', async () => {
    return await request(app.callback())
      .get(schoolsSearchUrl)
      .set('Accept', 'application/json')
      .expect(200)
      .expect(res => {
        expect(res.body[0].name).toBe('Lycée Liberté')
        expect(res.body[0].city).toBe('Paris')
      })
  })
  
})