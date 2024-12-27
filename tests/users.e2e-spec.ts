// import { App } from '../src/app';
// import { boot } from '../src/main';
// import request from 'supertest';
//
// let application: App;
//
// beforeAll(async () => {
//   const { app } = await boot;
//   application = app;
// });
//
// describe('Users e2e', () => {
//   // it('register error', async () => {
//   //   const res = await request(application.app)
//   //     .post('/users/register')register
//   //     .send({ email: 'test6@fr.com', password: '2' });
//   //   expect(res.statusCode).toBe(422);
//   // });
//
//   it('Login success', async () => {
//     const res = await request(application.app)
//       .post('/users/login')
//       .send({ email: 'test6@fr.com', password: 'asasas1' });
//     console.log('res.body', res.body);
//     expect(res.body.jwt).not.toBeUndefined();
//   });
// });
//
// afterAll(() => {
//   application.close();
// });
