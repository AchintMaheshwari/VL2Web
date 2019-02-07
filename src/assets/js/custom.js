$(document).ready(function (){
	//alert();
	$('.dropdown-toggle').dropdown()
	//alert('111');
	
	//$('body').click(function (){
//		if ($('.indexLeftPanel').hasClass('pawan')){
//			$('.indexLeftPanel').toggleClass('pawan');
//		} else {
//		}
//	});
	
	$('.filterBtn').click(function (){
		alert('222');
		//$('.indexLeftPanel').css('display' , 'block');
		$('.indexLeftPanel').toggleClass('pawan');
		$('.indexLeftPanel').toggleClass('col-lg-3');
		alert('3333');
		//$('.indexLeftPanel').css('position' , 'absolute');
		//menu-wrap
	});
	
	$('.indexLeftPanel button.doneBtn').click(function (){
		$('.indexLeftPanel').toggleClass('pawan');
	});
	
	// $("#recentFeedback").owlCarousel({
	// 	autoPlay : 3000,
	// 	stopOnHover : true,
	// 	navigation : true,
	// 	navigationText :	["" , ""],
	// 	pagination : false,
	// 	paginationSpeed : 1000,
	// 	//goToFirstSpeed : 2000,
	// 	singleItem : true,
	// 	autoHeight : true
	// 	///transitionStyle:"fade"
	// });
});

(function($){
	$(window).on("load",function(){
		$("#content-1").mCustomScrollbar({
			autoHideScrollbar:true,
			theme:"rounded"
		});
	});
})(jQuery);
