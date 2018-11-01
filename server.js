const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const multer = require('multer');
const pharmacy = require('./models/pharmacy');
const fs = require('fs');
const User = require('./models/user');
const mongoose = require('mongoose');
var nodeoutlook = require('nodejs-nodemailer-outlook');
const MONGODB_URI = "mongodb://GiteshMedi:shastri1@ds263590.mlab.com:63590/medicento";
const PERSON = require('./models/sperson');
const SalesOrder = require('./models/SalesOrder');
const SalesOrderItems = require('./models/SalesOrderItem');
const Products = require('./models/productandmedi');
const Product = require('./models/Product');
const message = require('./models/message');
const VpiInventory = require('./models/vpimedicine');
const Inventoy = require('./models/InventoryProduct');
const Dist = require('./models/Inventory');
mongoose.connect(MONGODB_URI, function () {
    console.log('connected to DB');
});
mongoose.Promise = global.Promise;
var csv = require('fast-csv');
const app = express();
var datah = 'Helow';
var distributor = {};
var pro = [];
const port = process.env.PORT || 3000;
var admin = require("firebase-admin");
var doc1 = undefined;

var serviceAccount = require("./public/medicentomessaging-firebase-adminsdk-rkrq1-df71338e06.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://medicentomessaging.firebaseio.com"
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.locals.moment = moment;
var session = require('express-session');
app.use(session({secret: 'ssshhhhh',resave:false,saveUninitialized:true}));
var upload = multer({dest: 'uploads/'});

app.get('/pharmacy_login', (req, res, next) => {
	res.render('login');
});

app.post('/login', (req, res, next) => {
	User.findOne({ useremail: req.body.email, usercode: req.body.pharmaId }).exec()
	.then( doc => {
		console.log(doc);
		PERSON.findOne({user: doc._id})
		.exec()
		.then(doc2 => {
			doc1 = doc2;
			res.redirect('/pharmacy');
		})
		.catch(err => {
			res.redirect('/pharmacy_login');
		});
	})
	.catch(err => {
		res.redirect('/pharmacy_login');
	});
});


app.get('/pharmacy', (req, res, next) => {
	date = Date.now();
	if(doc1 == undefined) {
		res.redirect('/pharmacy_login')
	}
	const title = 'Dashboard';
	console.log(doc1);
	res.render('index',
	{
		date: date, 
		deliverOrders: [],
		title: title,
		doc: doc1
	});
});

app.get('/pharmacy_orders', (req, res, next) => {
	const title = 'Orders';
	if(doc1 == undefined) {
		res.redirect('/pharmacy_login')
	}
	SalesOrder.find({sales_person_id: doc1._id}).populate('order_items').exec().then(docu => {
		console.log(docu)
		res.render('pharmacy_orders', 
		{
			title: title,
			doc: doc1,
			docu: docu
		}
	);
	}).catch(err => {
		console.log(err);
	});
});

app.get('/pharmacy_product', (req, res, next) => {
	const title = 'Product';
	if(doc1 == undefined) {
		res.redirect('/pharmacy_login')
	}
	Products.find().populate('product_id', 'medicento_name company_name total_stock').populate('inventory_product_id', 'stock_left')
	.exec().then( prod => {
		console.log(prod);
		res.render('pharmacy_products', 
		{
			title: title,	
			doc: doc1,
			prod: prod
		});
	})
	.catch(err => {
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

app.post('/dlogin', (req, res, next) => {
	Dist.findOne( { email: req.body.email, password: req.body.password}).exec().then( doc => {
		if(doc == null) {
			res.redirect('/distributor_login');	
		}
		req.session.dist = doc;
		res.redirect('/distributor');
	}).catch( err => {
		console.log(err);
		res.redirect('/distributor_login');	
	});
});

app.get('/distributor_logout', (req, res, next) => {
	req.session.destroy(function(err) {
		if(err) {
		  console.log(err);
		} else {
			res.redirect('/distributor_login');
		}
	})
});

app.get('/distributor', isLoggedIn ,(req, res, next) =>{
	date = Date.now();
	console.log(req.session.dist);
	res.render('distributor_dashboard', 
	{	
		date: date, 
		title: 'Dashboard',
		distributor: req.session.dist
	});
});

app.get('/distributor_order',isLoggedIn, (req, res, next) => {
	SalesOrder.find().populate('order_items').populate('pharmacy_id').exec().then(docu => {
		VpiInventory.find().exec().then( medicine => {
			console.log(docu[0]);
			res.render('distributor_orders', 
			{
				title:	'Orders',
				doc: doc1,
				docu: docu.reverse(),
				distributor: req.session.dist,
				medicine: medicine
			}
		);
		}).catch( 
	)}).catch(err => {
		console.log(err);
	});
});
app.post('/csvFile', (req, res, next) => {
	SalesOrder.findById(req.body.id)
				.populate('order_items')
				.populate('pharmacy_id')
				.exec()
				.then( order => {
					console.log(order);
					var arr = []
					arr.push(['Order_id', 
					'created_at', 
					'pharmacy_name', 
					'grand_total', 'order_item_id', 'medicine_name', 'quantity', 'price', 'manufacturer_name', 'total_amount'])
					arr.push([order._id, 
						moment(order.created_at).format('YYYY/DD/MM'),
						order.pharmacy_id.pharma_name,order.grand_total,
						order.order_items[0]._id,order.order_items[0].medicento_name, 
						order.order_items[0].quantity,order.order_items[0].paid_price,
						order.order_items[0].company_name,order.order_items[0].total_amount
					])
					if(order.order_items.length > 1) {
					for(var i=1;i<order.order_items.length;i++){
						arr.push([,,,,
							order.order_items[i]._id,order.order_items[i].medicento_name, order.order_items[i].quantity,order.order_items[i].paid_price,
							order.order_items[i].company_name,order.order_items[i].total_amount
						])
						}
					}
					var ws = fs.createWriteStream('./uploads/order.csv');
					csv.write(
						arr
					, {headers: true})
					.pipe(ws);
					nodeoutlook.sendEmail({
						auth: {
							user: "giteshshastri123@outlook.com",
							pass: "shastri@1"
						}, from: 'giteshshastri123@outlook.com',
						to: 'giteshshastri96@gmail.com,Contact.medicento@gmail.com,sale.medicento@gmail.com',
						subject: 'Sales Order - VPI - ' + order.pharmacy_id.pharma_name + ' | ' + 
						moment(order.created_at).format('YYYY/DD/MM'),
						attachments: [{'filename': 'SalesOrder_Medicento_'+order.pharmacy_id.pharma_name+'_'+moment(Date.now()).format('DD-MM-YY')+'.csv', 'path': './uploads/order.csv'}]
					});
				})
				.catch( error => {
					console.log(error);
				});
				res.redirect('/distributor_order');
});


app.post('/upload', isLoggedIn, upload.single('csvdata'), function (req, res, next) {
	const fileRows = [];
	const product = [];
	const comp = [];
	var count1 = 0;
	if(req.session.dist.email == 'contact@vpiindia.com') {
		VpiInventory.remove({}).exec();
	}
	// open uploaded file
	csv.fromPath(req.file.path)
	  .on("data", function (data) {
		fileRows.push(data); // push each row	
		})
	  .on("end", function () {
		var item_name = 0;
		var batch_no = 0; 
		var expiry_date = 0;
		var qty = 0;
		var packing = 0;
		var item_code = 0;
		var mrp = 0;
		var manfc_code = 0;
		var manfc_name = 0;
		for(var i=0;i<fileRows[0].length;i++) {
			if(fileRows[0][i] == 'item_code') {
				item_code = i;
			} else if(fileRows[0][i] == 'Item name') {
				item_name = i;
			} else if(fileRows[0][i] == 'batch_no') {
				batch_no = i;
			} else if(fileRows[0][i] == 'expiry_date') {
				expiry_date = i;
			} else if(fileRows[0][i] == 'balance_qty') {
				qty = i;
			} else if(fileRows[0][i] == 'Packing') {
				packing = i;
			} else if(fileRows[0][i] == 'mrp') {
				mrp = i;
			} else if(fileRows[0][i] == 'mfac code') {
				manfc_code = i;
			} else if(fileRows[0][i] == 'Mfac name') {
				manfc_name = i;
			}
		}
		for(var i=1;i<fileRows.length;i++) {
			var vpi = new VpiInventory();
			vpi.Item_name= fileRows[i][item_name];
			vpi.batch_no = fileRows[i][batch_no];
			vpi.expiry_date = fileRows[i][expiry_date];
			vpi.qty = fileRows[i][qty];
			vpi.packing = fileRows[i][packing];
			vpi.item_code=  fileRows[i][item_code];
			vpi.mrp = fileRows[i][mrp];
			vpi.manfc_code = fileRows[i][manfc_code];
			vpi.manfc_name = fileRows[i][manfc_name];
			vpi.save();	
		}
		console.log("IemCode " + item_code + "\nItemName " + item_name + "\nQty " + qty + "\nMrp " + mrp + "\nBatch " + batch_no + "\nExpiry " + expiry_date + "\nManfCode " + manfc_code + "\nManfName " + manfc_name);
		 message.find().exec().then(mess => {
			mess[0].count = mess[0].count+1;
			mess[0].save();
			console.log(mess[0]);
		}).catch(); 
		datah = fileRows;
		pro = product;		
		res.redirect('/distributor_product');
		// remove temp file	
		//process "fileRows" and respond
	  })
});

app.get('/distributor_product', isLoggedIn , upload.single('csvdata'),(req, res, next) => {
	if(datah == 'Helow'){
		console.log('Not');
	res.render('distributor_product', 
	{
		title: 'Inventoy Product',
		data: datah,
		product1: [],
		distributor: req.session.dist
	}); }else {
		var data = datah;
		datah = 'Helow';
	res.render('distributor_product', 
	{
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

app.get('**', (req, res, next) => {
	res.render('pageNotFound');
});	

function isLoggedIn(req, res, next) {
	if(req.session.dist) {
		next();
	} else {
		res.redirect('/distributor_login');
	}
}

app.listen(port, function() {
	console.log('Server Has Started at port : ' + port); 
});
