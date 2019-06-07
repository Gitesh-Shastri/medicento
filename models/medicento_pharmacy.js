const mongoose = require('mongoose');

const pharmacySchema = mongoose.Schema({
	area: {
		type: String,
		default: '-'
	},
	state: {
		type: String,
		default: '-'
	},
	city: {
		type: String,
		default: '-'
	},
	pharma_name: {
		type: String,
		default: '-'
	},
	pharma_address: {
		type: String,
		default: '-'
	},
	gst_license: {
		type: String,
		default: '-'
	},
	pharma_code: {
		type: String,
		default: '-',
		unique: true
	},
	password: {
		type: String,
		default: '-'
	},
	drug_license: {
		type: String,
		default: '-'
	},
	email: {
		type: String,
		default: '-'
	},
	contact: {
		type: String,
		default: '-'
	},
	owner_name: {
		type: String,
		default: '-'
	},
	pincode: {
		type: String,
		default: '-'
	},
	pan_card: {
		type: String,
		default: '-'
	},
	distributor: {
		type: String,
		default: '-'
	},
	distributor_Code: {
		type: String,
		default: '-'
	},
	created_at: {
		type: Date,
		default: Date.now()
	},
	last_login: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('MedicentoPharmacy', pharmacySchema);
