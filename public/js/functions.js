//convrting names to first letter as capital and remaining small
const capitalizeNames = (name) => {
    const list = name.split(' ')
    list.map((el,i) => {
        list[i] = (el[0].toUpperCase() + el.slice(1,).toLowerCase())
    })
    return list.join(' ')
}

//converting every character to upper case
const convUppercase = (data) => data.toUpperCase()

//validating the phone number
const validatePhoneno = (phoneno) => {
	if(phoneno.length == 10 && (!isNaN(phoneno)) && (phoneno[0] == 6 ||phoneno[0] == 7||phoneno[0] == 8||phoneno[0] == 9 )){
		return true;
	}
	return false;
}

//validating the email
const validateEmail = (email) => email.includes('@')

