const express = require('express');
const Task = require('../modals/task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks/create', auth, async (req, res) => {
	const task = new Task({
		...req.body,
		author: req.user._id,
	});

	try {
		await task.save();
		res.status(201).send(task);
	} catch (e) {
		res.status(400).send(e);
	}
});

// GET /tasks?completed=boolean
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res) => {
	const match = {};
	const sort = {};

	// Get query parameter for completed
	if (req.query.completed) {
		match.completed = req.query.completed === 'true';
	}

	// Get query parameter for sortBy
	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(':');
		sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
	}

	try {
		// This is also a way to fetch tasks for particular user
		// const tasks = await Task.find({ author: req.user._id });

		// This is second way to populate tasks by a particular user from virtual
		await req.user
			.populate({
				path: 'tasks',
				match,
				options: {
					limit: parseInt(req.query.limit),
					skip: parseInt(req.query.skip),
					sort,
				},
			})
			.execPopulate();
		res.send(req.user.tasks);
	} catch (e) {
		res.status(500).send();
	}
});

router.get('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id;

	try {
		const task = await Task.findOne({ _id, author: req.user._id });

		if (!task) {
			return res.status(404).send({ message: 'Nothing Found!' });
		}
		res.send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

router.patch('/tasks/:id', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['description', 'completed'];
	const isValidOperation = updates.every((every) => allowedUpdates.includes(every));

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!' });
	}

	try {
		const task = await Task.findOne({ _id: req.params.id, author: req.user._id });

		if (!task) {
			return res.status(404).send({ message: 'Nothing Found!' });
		}

		updates.forEach((update) => (task[update] = req.body[update]));
		await task.save();
		res.send(task);
	} catch (e) {
		res.status(400).send(e);
	}
});

router.delete('/tasks/:id', auth, async (req, res) => {
	try {
		const task = await Task.findOneAndDelete({ _id: req.params.id, author: req.user._id });
		if (!task) {
			return res.status(404).send({ message: 'No such task available!' });
		}
		res.send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;
