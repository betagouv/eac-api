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
    const response = await request(app.callback())
      .get(schoolsSearchUrl)
      .set('Accept', 'application/json')
      .expect(200)
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

describe('Test Domains', async () => {
  const domainsUrl = '/domains'
  test(`Get domain list ${domainsUrl}`, async () => {
    const response = await request(app.callback())
      .get(domainsUrl)
      .set('Accept', 'application/json')
      .expect(200)
    expect(response.body.filter(x => ['spectacle vivant', 'cirque'].includes(x)).length).toBe(2)
  })
})

describe('Test actors', async () => {
  const actorsUrl = '/actors'
  const params = {
    address: '1 rue de la paix',
    city: 'Paris',
    postalCode: '75000',
    loc: {
      type: 'Point',
      coordinates: [1, 2]
    },
    name: 'Cirque',
    contactPhone: '0123456789',
    contactName: 'Jane Doo',
    contactEmail: 'test@example.org',
    description: 'Lorem ispum',
    domains: ['cirque']
  }
  let actorId

  test(`Create an actor ${actorsUrl}`, async () => {
    const response = await request(app.callback())
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
    const response = await request(app.callback())
      .get(`${actorsUrl}/${actorId}`)
      .set('Accept', 'application/json')
      .expect(200)
    expect(response.body.name).toBe(params.name)
    expect(response.body.address).toBe(params.address)
  })
})
