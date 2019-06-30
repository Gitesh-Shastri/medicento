const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const multer = require('multer');
const pharmacy = require('./models/pharmacy');
const area = require('./models/area');
const fs = require('fs');
const User = require('./models/user');
const mongoose = require('mongoose');
var nodeoutlook = require('nodejs-nodemailer-outlook');
const MONGODB_URI = 'mongodb://GiteshMedi:shastri1@ds263590.mlab.com:63590/medicento';
const PERSON = require('./models/sperson');
const SalesOrder = require('./models/SalesOrder');
const SalesOrderItems = require('./models/SalesOrderItem');
const Products = require('./models/productandmedi');
const Product = require('./models/Product');
const message = require('./models/message');
const VpiInventory = require('./models/vpimedicine');
const Inventoy = require('./models/InventoryProduct');
const tulsimedicines = require('./models/tulsimedicines');
const medicento_medicines = require('./models/medicento_medicine');
const Dist = require('./models/Inventory');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true }, function() {
	console.log('connected to DB');
});
const Medicento_pharmacy = require('./models/medicento_pharmacy');

mongoose.Promise = global.Promise;
var tulsipharma = require('./models/tulsimedicines');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var csv = require('fast-csv');
var ObjectId = require('mongodb').ObjectID;
const app = express();
var datah = 'Helow';
var distributor = {};
var pro = [];
const port = process.env.PORT || 9000;
var admin = require('firebase-admin');
var doc1 = undefined;

var serviceAccount = require('./public/medicentomessaging-firebase-adminsdk-rkrq1-df71338e06.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://medicentomessaging.firebaseio.com'
});

app.use(express.static(__dirname + '/public'));
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.locals.moment = moment;
var session = require('express-session');
app.use(
	session({
		secret: 'ssshhhhh',
		resave: false,
		saveUninitialized: true
	})
);
var upload = multer({
	dest: 'uploads/'
});
const upload1 = multer();

app.get('/searchMedi/:searchString', (req, res, next) => {
	const itemName = req.params.searchString;
	VpiInventory.find({ Item_name: new RegExp('' + itemName + '', 'i') })
		.limit(5)
		.sort({ Item_name: 1 })
		.exec()
		.then((data) => {
			console.log('Received on search: ' + itemName + data);
			res.status(200).json(data);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: 'Not Found'
			});
		});
});

app.get('/update', (req, res, next) => {
	pharmacy
		.updateMany({}, { $set: { area: '5c4b6197948420095c947a49' } })
		.exec()
		.then((doc) => {
			console.log(doc);
			res.status(200).json(doc);
		})
		.catch((err) => {
			console.log(err);
			res.redirect('/');
		});
});

app.get('/pharmacy_creation', (req, res, next) => {
	var pharmacy = new Medicento_pharmacy({
		area: 'Karol Bagh',
		city: 'Central Delhi',
		state: 'Delhi',
		pharma_name: 'Medicento Test Gitesh',
		pharma_address: '16/563 H Bapa Nagar Hardhyan Singh Road Karol Bagh New Delhi - 110005',
		gst_license: 'GST1323',
		pharma_code: '6000',
		password: 'Shastri@1',
		drug_license: 'GST1212',
		email: 'giteshshastri96@gmail.com',
		contact: '9911806266',
		owner_name: 'Gitesh Shastri',
		pincode: '110006',
		pan_card: 'Gitesh1199',
		distributor: 'all',
		distributor_Code: '-'
	});

	pharmacy.save();
	res.status(200).json({ pharmacy: pharmacy });
});

app.get('/pharmacy_login', (req, res, next) => {
	res.render('login');
});

app.get('/code', (req, res, next) => {
	pharmacy
		.findOne({
			_id: req.query.email
		})
		.exec()
		.then((doc) => {
			PERSON.findOne({
				Allocated_Pharma: doc._id
			})
				.populate('user')
				.exec()
				.then((doc2) => {
					doc1 = doc2;
					res.redirect('/pharmacy');
				})
				.catch((err) => {
					res.redirect('/pharmacy_login');
				});
		})
		.catch((err) => {
			res.redirect('/pharmacy_login');
		});
});

app.post('/login', (req, res, next) => {
	User.findOne({
		useremail: req.body.email,
		usercode: req.body.pharmaId
	})
		.exec()
		.then((doc) => {
			console.log(doc);
			PERSON.findOne({
				user: doc._id
			})
				.populate('user')
				.exec()
				.then((doc2) => {
					doc1 = doc2;
					res.redirect('/pharmacy');
				})
				.catch((err) => {
					res.redirect('/pharmacy_login');
				});
		})
		.catch((err) => {
			res.redirect('/pharmacy_login');
		});
});

app.get('/pharmacy', (req, res, next) => {
	SalesOrderItems.find().exec().then(function(salesorders) {
		SalesOrder.find().exec().then(function(orders) {
			var orderDict = {},
				OrderitemsArray = [];
			// res.status(200).json(orders);
			var totalOrders = 0,
				totalSales = 0;
			var statusActive = 0,
				statusCanceled = 0,
				statusDelivered = 0,
				statusNotDelivered = 0,
				statusShipped = 0,
				totalQuantity = 0,
				statusPacked = 0;
			var orderList = [];
			orders.forEach((order) => {
				if (order.pharmacy_id.equals(doc1.Allocated_Pharma) == true) {
					var orderarray = order.order_items;
					for (var i = 0; i < orderarray.length; i++) {
						// console.log("item",item);
						salesorders.forEach((itm) => {
							if (itm._id.equals(orderarray[i]) == true) {
								console.log('found', itm);
								if (orderDict[itm.medicento_name] != undefined) {
									orderDict[itm.medicento_name] += Number(itm.quantity);
									totalQuantity += Number(itm.quantity);
								} else {
									totalQuantity += Number(itm.quantity);
									orderDict[itm.medicento_name] = Number(itm.quantity);
								}
								// if(i==orderarray.length-1){
								//   OrderitemsArray = Object.keys(orderDict).map(function(key) {
								//       return [key, orderDict[key]];
								//     });
								//     // Sort the array based on the second element
								//     OrderitemsArray.sort(function(first, second) {
								//       return second[1] - first[1];
								//     });
								// };
							}
						});
						SalesOrderItems.find({ _id: ObjectId(orderarray[i]) }).exec().then(function(itm) {});
					}
					// order.order_items.forEach((item)=>{
					// });

					// .then(function(){
					//   OrderitemsArray = Object.keys(orderDict).map(function(key) {
					//     return [key, orderDict[key]];
					//   });
					//   // Sort the array based on the second element
					//   OrderitemsArray.sort(function(first, second) {
					//     return second[1] - first[1];
					//   });
					// });
					orderList.push(order);
					totalOrders++;
					totalSales += Number(order.grand_total);
					if (order.status === 'Active') statusActive++;
					else if (order.status === 'Delivered') statusDelivered++;
					else if (order.status === 'Canceled') statusCanceled++;
					else if (order.status === 'Not Delivered') statusNotDelivered++;
					else if (order.status === 'Packed') statusPacked++;
					else if (order.status === 'Shipped') statusShipped++;
				}
				// console.log("dict",orderDict);

				// console.log(totalOrders,statusActive,statusPacked,statusShipped);
			});
			console.log('dict', orderDict);
			OrderitemsArray = Object.keys(orderDict).map(function(key) {
				return [ key, orderDict[key] ];
			});
			// Sort the array based on the second element
			OrderitemsArray.sort(function(first, second) {
				return second[1] - first[1];
			});
			orderList.sort(function(a, b) {
				return Date(a.delivery_date) - Date(b.delivery_date);
			});
			orderList.reverse();
			// console.log(orderList);
			date = Date.now();
			if (doc1 == undefined) {
				res.redirect('/pharmacy_login');
			}
			const title = 'Dashboard';
			console.log(doc1);
			res.render('index', {
				date: date,
				deliverOrders: [],
				title: title,
				doc: doc1,
				totalOrders: totalOrders,
				statusActive: statusActive,
				statusCanceled: statusCanceled,
				statusDelivered: statusDelivered,
				statusActive: statusActive,
				statusNotDelivered: statusNotDelivered,
				statusShipped: statusShipped,
				statusPacked: statusPacked,
				totalSales: totalSales,
				order1: orderList[0],
				order2: orderList[1],
				order3: orderList[2],
				orderDict: orderDict,
				totalQuantity: totalQuantity,
				OrderitemsArray: OrderitemsArray
				// totalQuantity:totalQuantity
			});
		});
	});
});

app.get('/pharmacy_orders', (req, res, next) => {
	const title = 'Orders';
	if (doc1 == undefined) {
		res.redirect('/pharmacy_login');
	}
	SalesOrder.find({
		sales_person_id: doc1._id
	})
		.populate('order_items')
		.exec()
		.then((docu) => {
			console.log(docu);
			res.render('pharmacy_orders', {
				title: title,
				doc: doc1,
				docu: docu
			});
		})
		.catch((err) => {
			console.log(err);
		});
});

app.get('/pharmacy_home', (req, res, next) => {
	const title = 'Home';
	// if (doc1 == undefined) {
	// 	res.redirect('/pharmacy_login');
	// }
	active = 'index';
	activeOrders = [];
	cancelOrders = [];
	Products.find()
		.populate('pharmacy_id')
		.populate('order_items')
		.exec()
		.then((orders) => {
			orders.forEach((order) => {
				if (order.status == 'Active') {
					activeOrders.push(order);
				}
				if (order.status == 'Canceled') {
					cancelOrders.push(order);
				}
			});
			res.render('pharmacy_home', {
				title: title,
				doc: doc1,
				orders: orders,
				active: active,
				activeOrders: activeOrders,
				cancelOrders: cancelOrders
			});
		})
		.catch((err) => {
			console.log(err);
		});
});

app.get('/pharmacy_product', (req, res, next) => {
	const title = 'Product';
	if (doc1 == undefined) {
		res.redirect('/pharmacy_login');
	}
	Products.find()
		.populate('product_id', 'medicento_name company_name total_stock')
		.populate('inventory_product_id', 'stock_left')
		.exec()
		.then((prod) => {
			console.log(prod);
			res.render('pharmacy_products', {
				title: title,
				doc: doc1,
				prod: prod
			});
		})
		.catch((err) => {
			console.log(err);
		});
});

app.get('/logout', (req, res, next) => {
	doc1 = undefined;
	res.redirect('/pharmacy_login');
});

app.get('/distributor_login', (req, res, next) => {
	res.render('distributor_login');
});

app.get('/distributor_sign_up', (req, res, next) => {
	res.render('distributor-sign-up');
});

app.get('/distributor_add_retailer', (req, res, next) => {
	res.render('distributor_add_retailer');
});

app.get('/distributor_product_tulsi', (req, res, next) => {
	if (datah == 'Helow') {
		console.log('Not');
		res.render('distributor_product_tulsi', {
			title: 'Inventoy Product',
			data: datah,
			product1: []
		});
	} else {
		var data = datah;
		datah = 'Helow';
		res.render('distributor_product_tulsi', {
			title: 'Inventoy Product',
			data: data[0],
			product1: data.slice(1, 100)
		});
	}
});

app.post('/dlogin', (req, res, next) => {
	if (req.body.email == 'medicento@test.com' && req.body.password == 'test') {
		res.redirect('/distributor_static');
	} else {
		Dist.findOne({
			email: req.body.email,
			password: req.body.password
		})
			.exec()
			.then((doc) => {
				console.log(doc);
				if (doc == null) {
					res.redirect('/distributor_login');
				} else {
					console.log(doc);
					req.session.dist = doc;
					res.redirect('/distributor');
				}
			})
			.catch((err) => {
				console.log(err);
				res.redirect('/distributor_login');
			});
	}
});

app.get('/distributor_static', (req, res, next) => {
	res.render('distributor_static', {
		date: new Date(),
		title: 'Dashboard'
	});
});

app.get('/distributor_tulsi', (req, res, next) => {
	res.render('distributor_tulsi', {
		date: new Date(),
		title: 'Dashboard'
	});
});

app.get('/distributor_order_tulsi', (req, res, next) => {
	res.render('distributor_order_tulsi', {
		title: 'Orders'
	});
});

app.get('/updateRetailer', (req, res, next) => {
	pharmacy
		.findById('5c51eaa09b640104a9c071ea')
		.exec()
		.then((doc) => {
			console.log(doc);
			doc.area = '5c51d855f846e70257eb1939';
			doc.distributor = 'tulsi';
			doc.distributor_Code = '77864';
			doc.save();
			console.log(doc);
			res.status(200).json({ message: 'updated', pharmacy: doc });
		})
		.catch((err) => {
			console.log(err);
			res.status(200).json({ message: 'not updated' });
		});
});

app.get('/retailer_page', isLoggedIn, (req, res, next) => {
	if (req.session.dist.email == 'tulsipharma@yahoo.co.in') {
		pharmacy
			.find({ distributor: 'tulsi' })
			.populate('area')
			.exec()
			.then((doc) => {
				res.render('retailer', {
					title: 'Retailers',
					retailers: doc
				});
			})
			.catch((err) => {
				console.log(err);
				res.render('retailer', {
					title: 'Retailers',
					retailers: []
				});
			});
	} else {
		pharmacy
			.find({ distributor: { $not: /^tulsi.*/ } })
			.populate('area')
			.exec()
			.then((doc) => {
				res.render('retailer', {
					title: 'Retailers',
					retailers: doc
				});
			})
			.catch((err) => {
				console.log(err);
				res.render('retailer', {
					title: 'Retailers',
					retailers: []
				});
			});
	}
});

app.post('/api/upload', upload.single('csvdata'), function(req, res) {
	if (req.session.dist.email == 'swara@gmail.com') {
		VpiInventory.remove({ distributor: 'swara' }).exec();
		csv
			.fromPath(req.file.path)
			.on('data', function(data) {
				var vpi = new VpiInventory();
				vpi.Item_name = data[2];
				vpi.item_code = data[3];
				vpi.manfc_name = data[1];
				vpi.packing = '-';
				vpi.mrp = 0;
				vpi.distributor = 'swara';
				vpi.created_at = Date.now();
				vpi.save();
			})
			.on('end', function() {
				res.status(200).json('Uploaded');
			});
	} else if (req.session.dist.email == 'sriparshva') {
		VpiInventory.remove({ distributor: 'parshva' }).exec();
		csv
			.fromPath(req.file.path)
			.on('data', function(data) {
				var vpi = new VpiInventory();
				vpi.Item_name = data[1];
				vpi.item_code = data[0];
				vpi.manfc_name = data[3];
				vpi.packing = data[4];
				vpi.mrp = data[5];
				vpi.distributor = 'parshva';
				vpi.created_at = Date.now();
				vpi.save();
			})
			.on('end', function() {
				res.status(200).json('Uploaded');
			});
	}
});

app.get('/distributor_with_pass', (req, res, next) => {
	Dist.find()
		.exec()
		.then((doc) => {
			res.status(200).json(doc);
		})
		.catch((err) => {});
});

app.post('/upload_tulsi', upload.single('csvdata'), function(req, res, next) {
	// const fileRows = [];
	// const product = [];
	// const comp = [];
	// var count1 = 0;
	// VpiInventory.remove({}).exec();
	// csv
	// 	.fromPath(req.file.path)
	// 	.on('data', function(data) {
	// 		let data_new = data[0].split('|');
	// 		let tulsipharma1 = new VpiInventory();
	// 		vpi.Item_name = data[1];
	// 		vpi.item_code = data[0];
	// 		vpi.manfc_name = data[8];
	// 		vpi.packing = data[3];
	// 		vpi.mrp = data[5];
	// 		vpi.distributor = 'tulsi';
	// 		vpi.created_at = Date.now();
	// 		tulsipharma1.save();
	// 	})
	// 	.on('end', function() {
	// 		message
	// 			.find()
	// 			.exec()
	// 			.then((mess) => {
	// 				mess[0].count = mess[0].count + 1;
	// 				mess[0].save();
	// 				console.log(mess[0]);
	// 			})
	// 			.catch();
	// 		datah = fileRows.splice(0, 100);
	// 		res.status(200).json(datah);
	// 		// remove temp file
	// 		//process "fileRows" and respond
	// 	});
});

app.post('/upload_parshva', upload.single('csvdata'), function(req, res, next) {
	// console.log(req.file);

	// try {
	// 	const csvFile = req.file.buffer.toString();
	// 	const rows = csvFile.split('\n');

	// 	for (let row of rows) {
	// 		const columns = row.replace(/"/g, '').split('|');
	// 		console.log(columns);
	// 	}

	// 	res.sendStatus(200);
	// } catch (err) {
	// 	console.log(err);
	// 	res.sendStatus(400);
	// }

	const fileRows = [];
	const product = [];
	const comp = [];
	var count1 = 0;
	csv
		.fromPath(req.file.path)
		.on('data', function(data) {
			if (data[0] != 'Code') {
				var vpi = new VpiInventory();
				vpi.Item_name = data[1];
				vpi.item_code = data[0];
				vpi.manfc_name = data[3];
				vpi.packing = data[4];
				vpi.mrp = data[5];
				vpi.distributor = 'parshva';
				vpi.created_at = Date.now();
				vpi.save();
			}
			fileRows.push(data);
		})
		.on('end', function() {
			message
				.find()
				.exec()
				.then((mess) => {
					mess[0].count = mess[0].count + 1;
					mess[0].save();
					console.log(mess[0]);
				})
				.catch();
			datah = fileRows.splice(0, 100);
			res.status(200).json(datah);
			// remove temp file
			//process "fileRows" and respond
		});
});

app.post('/upload_mercury', upload.single('csvdata'), function(req, res, next) {
	// console.log(req.file);

	// try {
	// 	const csvFile = req.file.buffer.toString();
	// 	const rows = csvFile.split('\n');

	// 	for (let row of rows) {
	// 		const columns = row.replace(/"/g, '').split('|');
	// 		console.log(columns);
	// 	}

	// 	res.sendStatus(200);
	// } catch (err) {
	// 	console.log(err);
	// 	res.sendStatus(400);
	// }

	const fileRows = [];
	const product = [];
	const comp = [];
	var count1 = 0;
	VpiInventory.remove({}).exec();
	csv
		.fromPath(req.file.path)
		.on('data', function(data) {
			if (data[0] != 'Code') {
				if (data[4] != '') {
					var vpi = new VpiInventory();
					vpi.Item_name = data[1];
					vpi.item_code = data[0];
					vpi.manfc_name = comp[comp.length - 1];
					vpi.packing = data[2];
					vpi.mrp = data[3];
					vpi.distributor = 'mercury';
					vpi.created_at = Date.now();
					vpi.save();
				} else {
					comp.push(data[1]);
				}
				fileRows.push(data);
			}
		})
		.on('end', function() {
			message
				.find()
				.exec()
				.then((mess) => {
					mess[0].count = mess[0].count + 1;
					mess[0].save();
					console.log(mess[0]);
				})
				.catch();
			datah = fileRows.splice(0, 100);
			res.status(200).json(datah);
			// remove temp file
			//process "fileRows" and respond
		});
});

app.get('/distributor_order_static', (req, res, next) => {
	SalesOrder.find()
		.populate('order_items')
		.populate('pharmacy_id')
		.populate('sales_person_id')
		.exec()
		.then((docu) => {
			console.log(docu[0]);
			res.render('distributor_order_static', {
				title: 'Orders',
				doc: doc1,
				docu: docu.reverse(),
				distributor: req.session.dist
			});
		})
		.catch((err) => {
			console.log(err);
		});
});

app.get('/distributor_logout', (req, res, next) => {
	req.session.destroy(function(err) {
		if (err) {
			console.log(err);
		} else {
			res.redirect('/distributor_login');
		}
	});
});

app.get('/list', (req, res, next) => {
	var list = [];
	pharmacy.find().exec().then(function(pharm) {
		pharm.forEach((member) => {
			list.push({
				pharma_name: member.pharma_name,
				id: member._id.toString(),
				totalAmount: 0
			});
		});
		SalesOrder.find().exec().then(function(order_items) {
			var total = 0;
			order_items.forEach((item) => {
				list.forEach((member) => {
					if (member.id === item.pharmacy_id.toString()) {
						member.totalAmount += Number(item.grand_total) + 0;
						total += Number(item.grand_total) + 0;
					}
				});
			});
			list.sort(function(a, b) {
				return parseFloat(a.totalAmount) - parseFloat(b.totalAmount);
			});
			list.reverse();
			res.status(200).json(list);
			console.log(total * (95 / 126));
		});
		// console.log(list);
		// res.status(200).json(list);
	});
});

app.get('/distributor', isLoggedIn, (req, res, next) => {
	var today = new Date();
	var month1 = today.getMonth() + 1;
	today.setMonth(today.getMonth() - 1);
	var month2 = today.getMonth() + 1;
	today.setMonth(today.getMonth() - 1);
	var month3 = today.getMonth() + 1;
	today.setMonth(today.getMonth() - 1);
	var month4 = today.getMonth() + 1;
	today.setMonth(today.getMonth() - 1);
	var month5 = today.getMonth() + 1;
	today.setMonth(today.getMonth() - 1);
	var month6 = today.getMonth() + 1;
	today.setMonth(today.getMonth() - 1);
	var month7 = today.getMonth() + 1;
	today.setMonth(today.getMonth() - 1);
	var month8 = today.getMonth() + 1;
	today.setMonth(today.getMonth() - 1);
	var month9 = today.getMonth() + 1;
	// console.log(month1,month2,month3,month4,month5);
	var months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	function monthNumToName(monthnum) {
		return months[monthnum - 1] || '';
	}
	var monthsName = [
		monthNumToName(month1),
		monthNumToName(month2),
		monthNumToName(month3),
		monthNumToName(month4),
		monthNumToName(month5),
		monthNumToName(month6),
		monthNumToName(month7),
		monthNumToName(month8),
		monthNumToName(month9)
	];
	var monthsNumber = [ month1, month2, month3, month4, month5, month6, month7, month8, month9 ];
	var monthRevenue = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	var maxOrderSize = 0,
		totalOrders = 0,
		total = 0;
	var statusActive = 0,
		statusCanceled = 0,
		statusDelivered = 0,
		statusActive = 0,
		statusNotDelivered = 0,
		statusShipped = 0,
		statusPacked = 0;
	var list = [];
	pharmacy.find({ distributor: req.session.dist.ph_name }).exec().then(function(pharm) {
		pharm.forEach((member) => {
			list.push({
				pharma_name: member.pharma_name,
				id: member._id.toString(),
				totalAmount: 0
			});
		});
		var totalPharmacy = list.length;
		SalesOrder.find().exec().then(function(order_items) {
			order_items.forEach((order) => {
				list.forEach((member) => {
					if (member.id === order.pharmacy_id.toString()) {
						member.totalAmount += Number(95 / 126 * order.grand_total) + 0;
					}
				});
				switch (order.created_at.getMonth() + 1) {
					case month1:
						monthRevenue[0] += 95 / 126 * Number(order.grand_total);
						break;
					case month2:
						monthRevenue[1] += 95 / 126 * Number(order.grand_total);
						break;
					case month3:
						monthRevenue[2] += 95 / 126 * Number(order.grand_total);
						break;
					case month4:
						monthRevenue[3] += 95 / 126 * Number(order.grand_total);
						break;
					case month5:
						monthRevenue[4] += 95 / 126 * Number(order.grand_total);
						break;
					case month6:
						monthRevenue[5] += 95 / 126 * Number(order.grand_total);
						break;
					case month7:
						monthRevenue[6] += 95 / 126 * Number(order.grand_total);
						break;
					case month8:
						monthRevenue[7] += 95 / 126 * Number(order.grand_total);
						break;
					case month9:
						monthRevenue[8] += 95 / 126 * Number(order.grand_total);
						break;
				}
				if (order.status === 'Active') statusActive++;
				else if (order.status === 'Delivered') statusDelivered++;
				else if (order.status === 'Canceled') statusCanceled++;
				else if (order.status === 'Not Delivered') statusNotDelivered++;
				else if (order.status === 'Packed') statusPacked++;
				else if (order.status === 'Shipped') statusShipped++;
				totalOrders += 1;
				total += 95 / 126 * Number(order.grand_total);
				if (95 / 126 * Number(order.grand_total) > maxOrderSize) {
					maxOrderSize = (95 / 126 * Number(order.grand_total)).toFixed(2);
				}
			});
			list.sort(function(a, b) {
				return parseFloat(a.totalAmount) - parseFloat(b.totalAmount);
			});
			list.reverse();
			total = total.toFixed(2);
			console.log(monthRevenue);
			statusActive += statusNotDelivered;
			date = Date.now();
			res.render('distributor_dashboard', {
				date: date,
				title: 'Dashboard',
				distributor: req.session.dist,
				maxOrderSize: maxOrderSize,
				totalOrders: totalOrders - statusCanceled,
				statusActive: statusActive,
				statusCanceled: statusCanceled,
				statusDelivered: statusDelivered,
				statusActive: statusActive,
				statusNotDelivered: statusNotDelivered,
				statusShipped: statusShipped,
				statusPacked: statusPacked,
				total: total,
				monthlyRevenue: monthRevenue,
				monthsName: monthsName,
				monthsNumber: monthsNumber,
				list: list,
				totalPharmacy: totalPharmacy
			});
		});
	});

	console.log(req.session.dist);
});

app.get('/distributor_state', (req, res, next) => {
	pharmacy
		.find()
		.populate('area')
		.exec()
		.then((docs) => {
			res.status(200).json({ docs: docs });
		})
		.catch((err) => {
			res.status(200).json({ err: err });
		});
});

app.get('/distributor_inventory', (req, res, next) => {
	res.render('add_distributor_inventory');
});

app.post('/test', upload1.single('csvFile'), async (req, res) => {
	console.log(req.file);

	try {
		const csvFile = req.file.buffer.toString();
		const rows = csvFile.split('\n');

		for (let row of rows) {
			const columns = row.replace(/"/g, '').split('|');
			console.log(columns);
		}

		res.sendStatus(200);
	} catch (err) {
		console.log(err);
		res.sendStatus(400);
	}
});

app.get('/distributor_order', isLoggedIn, (req, res, next) => {
	SalesOrder.find()
		.populate('order_items')
		.populate('pharmacy_id')
		.populate('sales_person_id')
		.exec()
		.then((docu) => {
			res.render('distributor_orders', {
				title: 'Orders',
				doc: doc1,
				docu: docu.reverse(),
				distributor: req.session.dist
			});
		})
		.catch((err) => {
			console.log(err);
		});
});

app.get('/inventory_distributor', (req, res, next) => {
	res.render('add_distributor_inventory');
});

app.post('/csvFile', (req, res, next) => {
	SalesOrder.findById(req.body.id)
		.populate('order_items')
		.populate('pharmacy_id')
		.exec()
		.then((order) => {
			console.log(order.pharmacy_id.distributor_Code);
			var arr = [];
			arr.push([
				'Order|' +
					'DATE|' +
					'PARTYCODE|' +
					'PARTY NAME|' +
					'0|' +
					'PRODUCT CODE' +
					'PRODUCTNAME||' +
					'QTY|' +
					'FREE|' +
					'REPL|' +
					'PTR|' +
					'MRP|'
			]);
			arr.push([
				order.sales_order_code +
					'|' +
					moment(order.created_at).format('DD-MMM-YYYY') +
					'|' +
					order.pharmacy_id.distributor +
					'|' +
					order.pharmacy_id.pharma_name +
					'|' +
					'0|' +
					order.order_items[0].code +
					'|' +
					order.order_items[0].medicento_name +
					'||' +
					order.order_items[0].quantity +
					'|' +
					'0|' +
					'0|' +
					order.order_items[0].paid_price +
					order.order_items[0].paid_price
			]);
			console.log(arr);
			if (order.order_items.length > 1) {
				for (var i = 1; i < order.order_items.length; i++) {
					arr.push([
						order.sales_order_code +
							'|' +
							moment(order.created_at).format('DD-MMM-YYYY') +
							'|' +
							order.pharmacy_id.distributor_Code +
							'|' +
							order.pharmacy_id.pharma_name +
							'|' +
							'0|' +
							order.order_items[i].code +
							'|' +
							order.order_items[i].medicento_name +
							'||' +
							order.order_items[i].quantity +
							'|' +
							'0|' +
							'0|' +
							order.order_items[i].paid_price +
							order.order_items[i].paid_price
					]);
				}
			}
			var ws = fs.createWriteStream('./uploads/order.csv');
			csv
				.write(arr, {
					headers: true
				})
				.pipe(ws);
			nodeoutlook.sendEmail({
				auth: {
					user: 'Team.medicento@outlook.com',
					pass: 'med4lyf@51'
				},
				from: 'Team.medicento@outlook.com',
				to: 'giteshshastri96@gmail.com,Contact.medicento@gmail.com,sale.medicento@gmail.com',
				subject:
					'Sales Order - VPI - ' +
					order.pharmacy_id.pharma_name +
					' | ' +
					moment(order.created_at).format('YYYY/DD/MM'),
				attachments: [
					{
						filename:
							'SalesOrder_Medicento_' +
							order.pharmacy_id.pharma_name +
							'_' +
							moment(Date.now()).format('DD-MM-YY') +
							'.csv',
						path: './uploads/order.csv'
					}
				]
			});
		})
		.catch((error) => {
			console.log(error);
		});
	res.redirect('/distributor_order');
});

app.post('/upload', isLoggedIn, upload.single('csvdata'), function(req, res, next) {
	const fileRows = [];
	const product = [];
	const comp = [];
	var count1 = 0;
	if (req.session.dist.email == 'contact@vpiindia.com') {
		VpiInventory.remove({}).exec();
		csv
			.fromPath(req.file.path)
			.on('data', function(data) {
				fileRows.push(data); // push each row
				if (data[1] != 'Item name') {
					var vpi = new VpiInventory();
					vpi.Item_name = data[0];
					vpi.batch_no = data[1];
					vpi.expiry_date = data[2];
					vpi.qty = data[3];
					vpi.packing = data[4];
					vpi.item_code = data[9];
					vpi.mrp = data[6];
					vpi.manfc_code = data[7];
					vpi.manfc_name = data[8];
					vpi.save();
				}
			})
			.on('end', function() {
				message
					.find()
					.exec()
					.then((mess) => {
						mess[0].count = mess[0].count + 1;
						mess[0].save();
						console.log(mess[0]);
					})
					.catch();
				datah = fileRows;
				pro = product;
				res.redirect('/distributor_product');
				// remove temp file
				//process "fileRows" and respond
			});
	} else if (req.session.dist.email == 'tulsipharma@yahoo.co.in') {
		const fileRows = [];
		const product = [];
		const comp = [];
		var count1 = 0;
		let data_heading = [];
		data_heading.push('Item  Code');
		data_heading.push('Product');
		data_heading.push('Packing');
		data_heading.push('PTR');
		data_heading.push('MRP');
		data_heading.push('QTY');
		data_heading.push('Scheme');
		data_heading.push('-');
		data_heading.push('Manufacturer');
		data_heading.push('-');

		fileRows.push(data_heading);
		tulsimedicines.remove({}).exec();
		csv
			.fromPath(req.file.path)
			.on('data', function(data) {
				let data_new = data[0].split('|');
				let tulsipharma1 = new tulsimedicines();
				tulsipharma1.Item_name = data_new[1];
				tulsipharma1.item_code = data_new[0];
				tulsipharma1.manfc_name = data_new[8];
				tulsipharma1.packing = data_new[2];
				tulsipharma1.qty = data_new[5];
				tulsipharma1.mrp = data_new[3];
				tulsipharma1.ptr = data_new[4];
				tulsipharma1.scheme = data_new[6];
				tulsipharma1.save();
				fileRows.push(data_new);
			})
			.on('end', function() {
				message
					.find()
					.exec()
					.then((mess) => {
						mess[0].count = mess[0].count + 1;
						mess[0].save();
						console.log(mess[0]);
					})
					.catch((err) => {
						console.log(err);
					});
				datah = fileRows.splice(0, 100);
				pro = datah;
				res.redirect('/distributor_product');
				// remove temp file
				//process "fileRows" and respond
			});
	}
	// open uploaded file
});

app.get('/vpimediceine', (Req, res, next) => {
	tulsimedicines
		.find({})
		.sort({ Item_name: 1 })
		.then(function(items) {
			var mediceines = [];
			mediceines.push([ 'Item_Name', 'Manf_Name', 'Qty', 'Id' ]);
			for (var i = 0; i < items.length; i++) {
				mediceines.push([ items[i].Item_name, items[i].manfc_name, items[i].qty, items[i]._id ]);
				if (i == items.length - 1) {
					var ws = fs.createWriteStream('./uploads/tulsimedicines.csv');
					csv
						.write(mediceines, {
							headers: true
						})
						.pipe(ws);
					res.status(200).json({ count: mediceines.length });
					break;
				}
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(200).json(err);
		});
});

app.get('/distributor_product', upload.single('csvdata'), (req, res, next) => {
	if (datah == 'Helow') {
		console.log('Not');
		res.render('distributor_product', {
			title: 'Inventoy Product',
			data: datah,
			product1: [],
			distributor: req.session.dist
		});
	} else {
		var data = datah;
		datah = 'Helow';
		res.render('distributor_product', {
			title: 'Inventoy Product',
			data: data[0],
			distributor: req.session.dist,
			product1: data.slice(1, 100)
		});
	}
});

app.get('/distributor_review', (req, res, next) => {
	const title = 'Review';
	res.render('distributor_review');
});

app.get('/tulsijson', (req, res, next) => {
	tulsipharma
		.find()
		.exec()
		.then((doc) => {
			res.status(200).json({ Items: doc });
		})
		.catch((err) => {
			res.status(400).json({ err: err });
		});
});

app.get('**', (req, res, next) => {
	res.render('pageNotFound');
});

function isLoggedIn(req, res, next) {
	if (req.session.dist) {
		next();
	} else {
		res.redirect('/distributor_login');
	}
}

app.listen(port, function() {
	console.log('Server Has Started at port : ' + port);
});
