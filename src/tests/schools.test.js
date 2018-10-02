/* global describe, test, expect, afterAll */
const app = require('../app')
const request = require('supertest')
const mongoose = require('mongoose')

afterAll(() => {
  mongoose.disconnect()
})

describe('Test Schools Route', async () => {
  const schoolsSearchUrl = '/schools/search/Lycée Liberté Paris'
  test(`Ask for ${schoolsSearchUrl}`, async () => {
    const response = await request(app)
      .get(schoolsSearchUrl)
      .set('Accept', 'application/json')
      .expect(200)
    expect(response.body[0].name).toBe('Lycée Liberté')
    expect(response.body[0].city).toBe('Paris')
    const id = response.body[0]._id
    await request(app)
      .get(`/schools/${id}`)
      .set('Accept', 'application/json')
      .expect(200)
      .expect(r => expect(r.body._id).toBe(id))
  })
})
