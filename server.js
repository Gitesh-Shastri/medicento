const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const multer = require('multer');
const pharmacy = require('./models/pharmacy');
const csv = require('fast-csv');
const fs = require('fs');
const User = require('./models/user');
const mongoose = require('mongoose');
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

app.get('/distributor_order', isLoggedIn, (req, res, next) => {
	SalesOrder.find().populate('order_items').populate('pharmacy_id').exec().then(docu => {
		console.log(docu[0].pharmacy_id);
		res.render('distributor_orders', 
		{
			title:	'Orders',
			doc: doc1,
			docu: docu,
			distributor: req.session.dist
		}
	);
	}).catch(err => {
		console.log(err);
	});
});

app.post('/upload', isLoggedIn, upload.single('csvdata'), function (req, res, next) {
	const fileRows = [];
	const product = [];
	const comp = [];
	var count1 = 0;
	// open uploaded file
	csv.fromPath(req.file.path)
	  .on("data", function (data) {
		fileRows.push(data); // push each row
			if(data[3] != 'balance_qty') {
				var vpi = new VpiInventory();
				vpi.Item_name= data[0];
				vpi.batch_no = data[1];
				vpi.expiry_date = data[2];
				vpi.qty = data[3];
				vpi.packing = data[4];
				vpi.item_code=  data[5];
				vpi.mrp = data[6];
				vpi.manfc_code = data[7];
				vpi.manfc_name = data[8];
				vpi.save();	
			}
				})
	  .on("end", function () {
		datah = fileRows;
		message
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
		distributor: {}
	}); }else {
		var data = datah;
		datah = 'Helow';
	res.render('distributor_product', 
	{
		title: 'Inventoy Product',
		data: data[0],
		distributor: {},
		product1: data.slice(1, 1000) 
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
