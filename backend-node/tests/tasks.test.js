const request = require('supertest');

// Always use the in-memory database for tests
delete process.env.MONGODB_URI;

const app = require('../src/app');
const { connectDb, disconnectDb } = require('../src/db');
const Task = require('../src/models/task');

beforeAll(async () => {
  await connectDb();
});

afterAll(async () => {
  await disconnectDb();
});

beforeEach(async () => {
  await Task.deleteMany({});
});

// Example test - use it as a template for your own tests.
describe('POST /api/tasks', () => {
  it('creates a task', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Write tests' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Write tests');
    expect(res.body.status).toBe('open');
    expect(res.body.id).toBeDefined();
  });
});

describe('Bug 2 - priority sorting', () => {
  it('returns tasks from highest to lowest priority', async () => {
    await request(app)
      .post('/api/tasks')
      .send({ title: 'Low priority', priority: 1 });

    await request(app)
      .post('/api/tasks')
      .send({ title: 'High priority', priority: 10 });

    const res = await request(app)
      .get('/api/tasks?sort=priority&order=desc');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].priority).toBe(10);
    expect(res.body[1].priority).toBe(1);
  });
});