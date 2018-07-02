const app = require('./app')
const request = require('supertest')
const mongoose = require('mongoose')

describe('Test Schools Route', () => {
  const School = require('./models/school')
  School.create({ 
    name: 'Lycée Liberté',
    city: 'Paris',
    loc: { type: 'Point', coordinates: [1, 2] },
  })
  const schoolsSearchUrl = '/schools/search/Lycée Liberté Nantes'
  afterAll(() => {
    mongoose.disconnect()
  })
  test('respond with json', async () => {
    return request(app.callback())
      .get(schoolsSearchUrl)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(res => {
        res.body[0].name = 'Lycée Liberté'
        res.body[0].city = 'Paris'
      })
  })
  
})