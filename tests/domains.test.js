/* global describe, test, expect, afterAll */
const app = require('../app')
const request = require('supertest')
const mongoose = require('mongoose')

afterAll(() => {
  mongoose.disconnect()
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
