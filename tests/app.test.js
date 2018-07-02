const app = require('../app')
const request = require('supertest')
const mongoose = require('mongoose')


describe('Test Schools Route', async () => {
  afterAll(() => {
    mongoose.disconnect()
  })
  const schoolsSearchUrl = '/schools/search/Lycée Liberté Paris'
  test(`Ask for ${schoolsSearchUrl}`, async () => {
    const response = await request(app.callback())
      .get(schoolsSearchUrl)
      .set('Accept', 'application/json')
      .expect(200);
    expect(response.body[0].name).toBe('Lycée Liberté')
    expect(response.body[0].city).toBe('Paris')
    const id = response.body[0]._id
    await request(app.callback())
      .get(`/schools/${id}`)
      .set('Accept', 'application/json')
      .expect(200)
      .expect(r => expect(r.body._id).toBe(id))
  })
})