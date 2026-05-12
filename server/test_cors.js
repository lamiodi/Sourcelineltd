const app = require('./index');
const request = require('supertest');

request(app)
  .get('/')
  .set('Origin', 'https://www.sourcelineltd.com')
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
    console.log(res.status, res.headers);
  });