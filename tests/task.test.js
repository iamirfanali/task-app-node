const request = require('supertest');
const app = require('../src/app');
const Task = require('../src//modals/task');
const { userOneId, userTwoId, userOne, taskOne, taskTwo, taskThree, setupDatabase, userTwo } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
	const response = await request(app)
		.post('/tasks/create')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			description: 'From my test',
		})
		.expect(201);

	// Assert to check the task is created successfully
	const task = await Task.findById(response.body._id);
	expect(task).not.toBeNull();
	expect(task.completed).toEqual(false);
});

test('Should fetch user tasks', async () => {
	const response = await request(app)
		.get('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	// Assert to check the number of tasks for user-one
	expect(response.body.length).toEqual(2);
});

test('Should not delete other users tasks', async () => {
	const response = await request(app)
		.delete(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
		.send()
		.expect(404);

	// Assert the task is still in database
	const task = Task.findById(taskOne._id);
	expect(task).not.toBeNull();
});
