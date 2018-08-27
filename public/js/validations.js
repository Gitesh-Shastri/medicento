const myForm = document.querySelector('form')

//------- adding event listener to form--------
    myForm.addEventListener('submit',(e) => {
    status = validate(e.target.elements)
    if(status){
        renderError(status)
        e.preventDefault()
    }else{
        
    }
})

//--------- error rendering on the screen----------- 
function renderError(err){
    divEl = document.createElement('div')
    divEl.setAttribute('class','alert alert-danger')
    divEl.setAttribute('role','alert')
    divEl.textContent = err
    document.querySelector('#error').appendChild(divEl)
}


//----------validating and updating data------------
function validate(data){
    let error = ''
     //----------- capitalizing the values----------------
    data.owner.value = capitalizeNames(data.owner.value)
    
    data.shopName.value = capitalizeNames(data.shopName.value)
    
    data.address1.value = capitalizeNames(data.address1.value)
    
    data.area.value = capitalizeNames(data.area.value)
    
    data.city.value = capitalizeNames(data.city.value)
    
    data.state.value = capitalizeNames(data.state.value)
    
    if(data.address2){
         data.address2.value = capitalizeNames(data.address2.value)
    }
    //------------- converting to uppercase ----------
    data.gstNo.value = convUppercase(data.gstNo.value)
    
    data.dlNo.value = convUppercase(data.dlNo.value)
       
    //-------------validations--------------------
    if(validatePhoneno(data.phoneno.value)){
        data.phoneno.value = parseInt(data.phoneno.value)
    }else{
        error = 'enter a valid phone number'
        return error
    }
    
    if(!validateEmail(data.email.value)){
        error = 'enter a valid email id'
        return error
    }
    
    

}