$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
 });
 $("#menu-toggle-2").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled-2");
    $('#menu ul').hide();
 });
 //
 // $('#searchField').keyup(function(e){
 //
 //   clearTimeout($.data(this ,'timer'));
 //   if(e.keyCode == 13)
 //   {
 //     search(true);
 //     $("#searchStatus").val() = "Enter Hit!";
 //   }
 //   else
 //   $(this).data('timer',setTimeout(search , 500));
 //  });

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
