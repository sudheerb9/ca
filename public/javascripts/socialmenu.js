$(document).ready(function() {
  $("#navMenu").click(function() {
   //$(".nav").toggleClass("small");
    if ($(".nav").hasClass("small")) {
      $(".nav").removeClass("small");
    } else {
      $(".nav").addClass("small");
    }
  });
});
