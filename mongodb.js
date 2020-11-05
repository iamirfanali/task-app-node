// CRUD = Create, Read, Update, Delete

const { MongoClient, ObjectID } = require('mongodb');

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

// const id = new ObjectID();
// console.log(id);

MongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
	if (error) {
		return console.log('Unable to connect to database!');
	}

	const db = client.db(databaseName);

	// db.collection('users').insertOne(
	// 	{
	// 		_id: id,
	// 		name: 'Irfan',
	// 		age: 24,
	// 	},
	// 	(error, result) => {
	// 		if (error) {
	// 			return console.log('Unable to insert user!');
	// 		}
	// 		console.log(result.ops);
	// 	}
	// );

	// db.collection('users').insertMany([
	//   {
	// 		name: 'Irfan',
	// 		age: 24,
	//   },
	//   {
	//     name: 'Ali',
	//     age: 24
	//   }
	// ],
	// 	(error, result) => {
	// 		if(error) {
	//       return console.log('Unable to insert user!')
	//     }
	// 		console.log(result.ops);
	// 	}
	// );

	// db.collection('tasks').insertMany([
	//   {
	// 		description: 'Clean the house',
	// 		completed: true,
	//   },
	//   {
	//     description: 'Renew inspection',
	//     completed: false
	//   },
	//   {
	// 		description: 'Pot plans',
	// 		completed: false,
	//   },
	// ],
	// 	(error, result) => {
	// 		if(error) {
	//       return console.log('Unable to insert tasks!')
	//     }
	// 		console.log(result.ops);
	// 	}
	// );

	// db.collection('users').findOne({ name: 'Ali' }, (error, user) => {
	// 	if (error) {
	// 		console.log('Unable to fetch');
	// 	}
	// 	console.log(user);
	// });

	// db.collection('users').find({ age: 24 }).toArray((error, users) => {
	// 	if (error) {
	// 		console.log('Unable to fetch');
	// 	}
	// 	console.log(users);
	// });

	// db.collection('tasks').findOne({ _id: new ObjectID('5fa029a11e5d44a2c94ed904') }, (error, task) => {
	// 	if (error) {
	// 		console.log('Unable to fetch');
	// 	}
	// 	console.log(task);
	// });

	// db.collection('tasks').find({ completed: false }).toArray((error, tasks) => {
	// 	if (error) {
	// 		console.log('Unable to fetch');
	// 	}
	// 	console.log(tasks);
	// });

	// db.collection('users')
	// 	.updateOne(
	// 		{
	// 			_id: new ObjectID('5fa0250dd3411b9fc0d1b1d4'),
	// 		},
	// 		{
	// 			$set: {
	// 				name: 'Mike',
	// 			},
	// 		}
	// 	)
	// 	.then((result) => {
	// 		console.log(result);
	// 	})
	// 	.catch((error) => {
	// 		console.log(error);
	// 	});

	// db.collection('tasks')
	// 	.updateMany(
	// 		{
	// 			completed: false,
	// 		},
	// 		{
	// 			$set: {
	// 				completed: true,
	// 			},
	// 		}
	// 	)
	// 	.then((result) => {
	// 		console.log(result);
	// 	})
	// 	.catch((error) => {
	// 		console.log(error);
	// 	});

	// db.collection('users')
	// 	.deleteMany({
	// 		age: 25,
	// 	})
	// 	.then((result) => {
	// 		console.log(result);
	// 	})
	// 	.catch((error) => {
	// 		console.log(error);
	// 	});

	db.collection('tasks')
		.deleteOne({
			_id:new ObjectID('5fa029a11e5d44a2c94ed902'),
		})
		.then((result) => {
			console.log(result);
		})
		.catch((error) => {
			console.log(error);
		});
});
