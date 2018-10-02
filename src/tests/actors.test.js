/* global describe, test, expect, afterAll */
const app = require('../app')
const request = require('supertest')
const mongoose = require('mongoose')
const actorParams = require('./helpers').actorParams

afterAll(() => {
  mongoose.disconnect()
})

describe('Test actors', async () => {
  const actorsUrl = '/actors'
  const params = actorParams
  let actorId

  test(`Create an actor ${actorsUrl}`, async () => {
    const response = await request(app)
      .post(actorsUrl)
      .send(params)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
    expect(response.body.name).toBe(params.name)
    expect(response.body.address).toBe(params.address)
    actorId = response.body.id
  })

  test(`Get an actor ${actorsUrl}/${actorId}`, async () => {
    const response = await request(app)
      .get(`${actorsUrl}/${actorId}`)
      .set('Accept', 'application/json')
      .expect(200)
    expect(response.body.name).toBe(params.name)
    expect(response.body.address).toBe(params.address)
  })
})
