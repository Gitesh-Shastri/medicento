const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.locals.moment = moment;

var active = {
		isActiveD: false,
		isActiveO: false,
		isActiveR: false,
		isActiveP: false,
		isActiveA: false,
		isActiveB: false
	};
var isActivePD = false,isActivePO = false,isActivePP = false,isActivePS = false,isActivePI = false, isActivePR = false, isActivePS = false, isActivePRO = false;
app.get('/pharmacy_login', (req, res, next) => {
	res.render('login');
});

app.post('/login', (req, res, next) => {
	if(req.body.email == 'test' && req.body.pharmaId == '2008'){
		res.redirect('/');
	} else {
		res.redirect('/pharmacy_login');
	}
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

app.get('/pharmacy_orders', (req, res, next) => {
	res.render('pharmacy_orders');
});

app.get('/pharmacy_product', (req, res, next) => {
	res.render('pharmacy_products');
});

app.get('/logout', (req, res, next) => {
	res.redirect('/pharmacy_login');
});

app.get('/distributor', (req, res, next) =>{
	date = Date.now();
	active.isActiveD = true;
	res.render('distributor_dashboard', 
	{	
		date: date, 
		active: active
	});
});

app.get('/distributor_review', (req, res, next) => {
	res.render('distributor_review');
});

app.get('/', (req, res, next) => {
	date = Date.now();
	isActivePD = true;
	res.render('index',
	{
		date: date, 
		deliverOrders: []
	});
});

app.listen(port, function() {
	console.log('Server Has Started at port : ' + port); 
});