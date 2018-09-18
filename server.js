const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const multer = require('multer');
const csv = require('fast-csv');
const fs = require('fs');

const app = express();
var datah = 'Helow';
var pro = [];
const port = process.env.PORT || 3000;

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
	if(req.body.email == 'test' && req.body.pharmaId == '2008'){
		res.redirect('/pharmacy');
	} else {
		res.redirect('/pharmacy_login');
	}
});


app.get('/pharmacy', (req, res, next) => {
	date = Date.now();
	const title = 'Dashboard';
	res.render('index',
	{
		date: date, 
		deliverOrders: [],
		title: title
	});
});

app.get('/pharmacy_orders', (req, res, next) => {
	const title = 'Orders';
	res.render('pharmacy_orders', 
	{
		title: title
	});
});

app.get('/pharmacy_product', (req, res, next) => {
	const title = 'Product';
	res.render('pharmacy_products', 
	{
		title: title
	});
});

app.get('/logout', (req, res, next) => {
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
		if(data[0] != '' && data[2] != '' && data[10] == ''){
			comp.push(data[2]);
		}
		if(data[0] != '' && data[2] != '' && data[10] != '') {
			data[3] = comp[comp.length-1];
			product.push(data);
		} 
		fileRows.push(data); // push each row
		})
	  .on("end", function () {
		datah = fileRows;
		pro = product;
			res.redirect('/distributor_product');
			fs.unlinkSync(req.file.path);   // remove temp file	
		//process "fileRows" and respond
	  })
});

app.get('/distributor_product', upload.single('csvdata'),(req, res, next) => {
	if(datah == 'Helow'){
		console.log('Not');
	res.render('distributor_product', 
	{
		title: 'Inventoy Product',
		data: datah
	}); }else {
		var data = datah;
		datah = 'Helow';
		data[1][5] = 'Manufacturer';
	res.render('distributor_product', 
	{
		title: 'Inventoy Product',
		data: data[1],
		data1: data.slice(2, 20),
		product1: pro.slice(0, 8000) 
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