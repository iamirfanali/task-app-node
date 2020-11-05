const sharp = require('sharp');
const multer = require('multer');
const express = require('express');
const User = require('../modals/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

const router = new express.Router();

// POST Signup Route
router.post('/users/signup', async (req, res) => {
	const user = new User(req.body);

	try {
		await user.save();
		sendWelcomeEmail(user.email, user.name);
		const token = await user.generateAuthToken();
		res.status(201).send({ user, token });
	} catch (e) {
		res.status(400).send(e);
	}
});

// POST Login Route
router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();
		res.send({ user, token });
	} catch (e) {
		res.status(400).send({ message: 'Unable to login!' });
	}
});

// POST Logout Route
router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});
		await req.user.save();

		res.send({ message: 'Logout successfully!' });
	} catch (e) {
		res.status(500).send({ message: 'Something went wrong!' });
	}
});

// POST LogoutAll Route
router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send({ message: 'Logout successfully from all sessions!' });
	} catch (e) {
		res.status(500).send({ message: 'Something went wrong!' });
	}
});

// GET User Profile Route
router.get('/users/profile', auth, async (req, res) => {
	res.send(req.user);
});

// PATCH User Profile Route
router.patch('/users/profile', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['name', 'email', 'password', 'age'];
	const isValidOperation = updates.every((every) => allowedUpdates.includes(every));

	if (!isValidOperation) {
		return res.status(400).send({ message: 'Invalid updates!' });
	}

	try {
		updates.forEach((update) => (req.user[update] = req.body[update]));
		await req.user.save();
		res.send(req.user);
	} catch (e) {
		res.status(400).send(e);
	}
});

// DELETE User Profile Route
router.delete('/users/profile', auth, async (req, res) => {
	try {
		await req.user.remove();
		sendCancelationEmail(req.user.email, req.user.name);
		res.send(req.user);
	} catch (e) {
		res.status(500).send(e);
	}
});

// Configuring user avatar upload with multer
const upload = multer({
	limits: {
		fileSize: 1000000,
	},
	fileFilter(req, file, callback) {
		if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
			return callback(new Error('Please upload an image!'));
		}
		callback(undefined, true);
	},
});

// POST User Profile Avatar Upload Route
router.post(
	'/users/profile/avatar',
	auth,
	upload.single('avatar'),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
		req.user.avatar = buffer;

		await req.user.save();
		res.send({ message: 'Avatar uploaded successfully!' });
	},
	(error, req, res, next) => {
		// Handle errors when the upload is in process
		res.status(400).send({ error: error.message });
	}
);

// DELET User Profile Avatar Route
router.delete('/users/profile/avatar', auth, async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.send({ message: 'Avatar removed successfully!' });
});

// GET User Profile Image Route
router.get('/users/:id/avatar', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user || !user.avatar) {
			throw new Error('No such file available!');
		}

		res.set('Content-Type', 'image/png');
		res.send(user.avatar);
	} catch (e) {
		res.status(404).send();
	}
});

module.exports = router;
