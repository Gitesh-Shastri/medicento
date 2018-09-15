const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const moment = require('moment');
const multer = require('multer');
const csv = require('fast-csv');
const fs = require('fs');

const app = express();
var data = 'Helow';
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
  
	// open uploaded file
	csv.fromPath(req.file.path)
	  .on("data", function (data) {
		fileRows.push(data); // push each row
	  })
	  .on("end", function () {
		data = fileRows;
		res.redirect('/distributor_product');
		fs.unlinkSync(req.file.path);   // remove temp file
		//process "fileRows" and respond
	  })
});

app.get('/distributor_product', upload.single('csvdata'),(req, res, next) => {
	if(data == 'Helow'){
		console.log('Not');
	res.render('distributor_product', 
	{
		title: 'Products',
		data: data
	}); }else {
	res.render('distributor_product', 
	{
		title: 'Products',
		data: data[0],
		data1: data.slice(0)
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