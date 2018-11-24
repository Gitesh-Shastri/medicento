$('document').ready(()=>{
    $('#create').css('margin','1rem 5rem')
})

const order = []
const createRow = () => {
    //creating a row
    const rowEl = $('<div></div>').attr('class','form-group col-xs-12')
    $('.section').append(rowEl)
    //creating elements in a row
    const productEl = $('<input>').attr({'class':'form-control product','type':'text','placeholder':'product'}).css({'width':'40%','margin':'5px 10px 0 0'})
    const quantityEl = $('<input>').attr({'class':'form-control quantity','type':'number','placeholder':'quantity','min':'1'}).css({'width':'10%','margin':'5px 10px 0 0'})
    const removeEl = $('<button></button>').attr('class','btn btn-rounded btn-danger btn-md').text('remove')
    rowEl.append(productEl,quantityEl,removeEl)
    //remove button to delete a row
    removeEl.click(()=>{
        rowEl.remove()
    })
    //adding submit button for order
    console.log($('.submit').children().length > 0)
    if(!$('.submit').children().length > 0){
       var submitEl = $("<button></button>").attr({'class':'btn btn-success btn-rounded btn-lg','id':'submitButton'}).text('submit order').css({'margin':'5px 5rem'})
       var cancelEl = $("<button></button>").attr({'class':'btn btn-danger btn-rounded btn-lg','id':'cancelButton'}).text('cancel order').css({'margin':'5px 10rem'})
        $('.submit').append(cancelEl,submitEl)
       submitEl.click(submitOrder)
        cancelEl.click(cancelOrder)

    }
    
}

const submitOrder = ()=>{
//   console.log('submit order') 
//  console.log($('.form-group'))
    const productList = document.querySelectorAll('.form-group')
    productList.forEach((row)=>{
        const productName = row.children[0].value
        let quantity = row.children[1].value
        quantity = parseInt(quantity,10)
        order.push({productName,quantity})
    })
    console.log(order)
    
}

const cancelOrder = ()=>{
//   console.log("cancel order")
    alert('are you sure to cancel')
    $('#name').empty()
    $('#add').empty()
    $('.section').empty()
    $('.submit').empty()
    $('#create').toggle()
}




$('#create').click(function(){
    const retailerInput = $('<input>').attr({'class':'form-control product','type':'text','placeholder':'retailer'}).css({'width':'70%','margin':'10px 10px'})
    $("#name").append(retailerInput)
    $(this).toggle()
    const addEl = $('<button></button>').attr("class","btn btn-rounded btn-primary btn-lg").text("Add product +").css({'display':'block','margin':'5px 20%'})
    $('#add').append(addEl)
    addEl.click(createRow)
})

$('.form-inline').click((e) => {e.preventDefault()})