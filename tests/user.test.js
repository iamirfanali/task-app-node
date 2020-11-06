const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modals/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
	const response = await request(app)
		.post('/users/signup')
		.send({
			name: 'Irfan',
			email: 'irfan@example.com',
			password: 'N0thing123$',
		})
		.expect(201);

	// Assert that the database was changed correctly
	const user = await User.findById(response.body.user._id);
	expect(user).not.toBeNull();

	// Assertions about the response
	expect(response.body).toMatchObject({
		user: {
			name: 'Irfan',
			email: 'irfan@example.com',
		},
		token: user.tokens[0].token,
	});

	// Assesrt about the password is not saved as text
	expect(user.password).not.toBe('N0thing123$');
});

test('Should login existing user', async () => {
	const response = await request(app)
		.post('/users/login')
		.send({
			email: userOne.email,
			password: userOne.password,
		})
		.expect(200);

	// Assert about the token saved for the user during login
	const user = await User.findById(userOneId);
	expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login nonexistent user', async () => {
	await request(app)
		.post('/users/login')
		.send({
			email: userOne.email,
			password: 'N0thing123',
		})
		.expect(400);
});

test('Should get profile for user', async () => {
	await request(app).get('/users/profile').set('Authorization', `Bearer ${userOne.tokens[0].token}`).send().expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
	await request(app).get('/users/profile').send().expect(401);
});

test('Should delete profile for user', async () => {
	await request(app)
		.delete('/users/profile')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	// Assert that the user is removed successfully
	const user = await User.findById(userOneId);
	expect(user).toBeNull();
});

test('Should not delete profile for unauthenticated user', async () => {
	await request(app).delete('/users/profile').send().expect(401);
});

test('Should upload avatar', async () => {
	await request(app)
		.post('/users/profile/avatar')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.attach('avatar', 'tests/fixtures/150.png')
		.expect(200);

	// Assert the user avatar uploaded successfully
	const user = await User.findById(userOneId);
	expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should test valid user fields', async () => {
	await request(app)
		.patch('/users/profile')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			name: 'Jess',
		})
		.expect(200);

	// Assert the user name updated to the database as provided up
	const user = await User.findById(userOneId);
	expect(user.name).toEqual('Jess');
});

test('Should not update invalid user fields', async () => {
	await request(app)
		.patch('/users/profile')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			location: 'Lahore',
		})
		.expect(400);
});
