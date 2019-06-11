$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
 });
 $("#menu-toggle-2").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled-2");
    $('#menu ul').hide();
 });




    $('#searchField').keyup(function(e){
      clearTimeout($.data(this,'timer'));
      if(e.keycode == 13)
        search(true);
      else {
        $(this).data('timer', setTimeout(search,100));
      }
    });

      function search(force)
      {
          $('#searchResult').empty();
          var searchString = $('#searchField').val();
          if( !force &&  searchString.length < 3)
            {
              $("#searchStatus").val('Returned Due to less Chars or Not Enter!');
              return;
            }

          var url = '/searchMedi/' + searchString ;
          $.ajax({
           url : url,
           type : 'GET',
           data : { search : searchString },
           dataType : 'json',
           success : function(result){
                      $('#searchResult').empty();
                      $(result).each(function(){
                      $('#searchResult').append(' <span style=" width : 450px; height : 15px; font-size : 12px; text-align : left; display : inline-block; padding : 1%;  "  >' + this.Item_name +
                        '</span>  <span>' +   this.mrp +'</span></br>');
                      });

                    });
      }

     $('#searchResult').on( 'click' , 'span', function(){
       alert($(this).val());

     });




 function initMenu() {
    $('#menu ul').hide();
    $('#menu ul').children('.current').parent().show();
    //$('#menu ul:first').show();
    $('#menu li a').click(
       function() {
          var checkElement = $(this).next();
          if ((checkElement.is('ul')) && (checkElement.is(':visible'))) {
             return false;
          }
          if ((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
             $('#menu ul:visible').slideUp('normal');
             checkElement.slideDown('normal');
             return false;
          }
       }
    );
 }
 $(document).ready(function() {
    initMenu();
 });
