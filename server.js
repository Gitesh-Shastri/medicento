const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const multer = require('multer');
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

const Inventoy = require('./models/InventoryProduct');

mongoose.connect(MONGODB_URI, function () {
    console.log('connected to DB');
});
mongoose.Promise = global.Promise;

const app = express();
var datah = 'Helow';
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
	if(req.body.email == 'test' && req.body.pharmaId == 'test'){
		res.redirect('/distributor');
	} else {
		res.redirect('/distributor_login');
	}
});

app.get('/distributor_logout', (req, res, next) => {
	res.redirect('/distributor_login');
});

app.get('/distributor', (req, res, next) =>{
	date = Date.now();
	res.render('distributor_dashboard', 
	{	
		date: date, 
		title: 'Dashboard'
	});
});

app.post('/upload', upload.single('csvdata'), function (req, res, next) {
	const fileRows = [];
	const product = [];
	const comp = [];
	// open uploaded file
	csv.fromPath(req.file.path)
	  .on("data", function (data) {
		fileRows.push(data); // push each row
		if(data[0] != 'Item name') {
		const inventoryProduct = new InventoryProduct();
        inventoryProduct.inventory_product_id =  new mongoose.Types.ObjectId();
        inventoryProduct.inventory_id =  "5b2e2e31f739e00600387bdf";
        inventoryProduct.product_name = data[0];
        inventoryProduct.stock_left = data[3];
		inventoryProduct.offer = "-";
		inventoryProduct.save();
    const product = new Product();
        product.product_id = new mongoose.Types.ObjectId();
        product.medicento_name = data[0];
        product.company_name = data[8];
        product.total_stock = data[3];
    product.save();
    const productandmedi = new ProductAndMedi({
        product_id: product._id,
        inventory_product_id: inventoryProduct._id
    });
    productandmedi.save();
    }
	})
	  .on("end", function () {
		datah = fileRows;
		pro = product;
		
			

			
			
			
		
		
			res.redirect('/distributor_product');
			
		// remove temp file	
		//process "fileRows" and respond
	  })
});

app.get('/distributor_product', upload.single('csvdata'),(req, res, next) => {
	if(datah == 'Helow'){
		console.log('Not');
	res.render('distributor_product', 
	{
		title: 'Inventoy Product',
		data: datah,
		product1: []
	}); }else {
		var data = datah;
		datah = 'Helow';
		data[1][5] = 'Manufacturer';
	res.render('distributor_product', 
	{
		title: 'Inventoy Product',
		data: data[1],
		data1: data.slice(2, 20),
		product1: pro.slice(0, 10000) 
		});	
	} 
});

app.get('/distributor_review', (req, res, next) => {
	const title = 'Review';
	res.render('distributor_review');
});

app.listen(port, function() {
	console.log('Server Has Started at port : ' + port); 
});
