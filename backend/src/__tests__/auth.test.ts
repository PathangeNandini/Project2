import request from 'supertest';
import app from '../app';

describe('Auth API', () => {
  it('should return 400 if required fields missing on register', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Missing required fields');
  });

  it('should return 401 for invalid login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('should return 401 for missing token on protected route', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });
});