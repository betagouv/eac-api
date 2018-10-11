/* global describe, test, expect, afterAll */
const app = require('../app')
const request = require('supertest')
const mongoose = require('mongoose')

afterAll(() => {
  mongoose.disconnect()
})

describe('Test Feedbacks', async () => {
  const feedbacksUrl = '/feedbacks'

  test(`Create a feedback ${feedbacksUrl}`, async () => {
    const response = await request(app)
      .post(feedbacksUrl)
      .send({
        actionId: '117bd6016088b774c9115c00',
        email: 'foo@example.com',
        participation: false
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
    expect(response.body.feedback.email).toBe('foo@example.com')
    expect(response.body.feedback.participation).toBe(false)
  })

  test(`Get feedbacks list ${feedbacksUrl}`, async () => {
    const response = await request(app)
      .get(feedbacksUrl)
      .set('Accept', 'application/json')
      .expect(200)
    expect(response.body.length).toBeGreaterThan(0)
  })

  test(`Get one feedback ${feedbacksUrl}`, async () => {
    const response = await request(app)
      .get(feedbacksUrl + '?action=117bd6016088b774c9115c00')
      .set('Accept', 'application/json')
      .expect(200)
    expect(response.body.length).toBeGreaterThan(0)
  })

  test(`Get no feedback ${feedbacksUrl}`, async () => {
    const response = await request(app)
      .get(feedbacksUrl + '?action=337bd6016088b554c9115c44')
      .set('Accept', 'application/json')
      .expect(200)
    expect(response.body.length).toBe(0)
  })
})
