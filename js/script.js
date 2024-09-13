// Scroll.js

$(window).on('popstate',function(e){
	e.preventDefault();
	var target = window.location.href.split("#")[1];
	if(target != "" && target!=undefined && document.getElementById(target)!=null){
		$('html, body').stop().animate({'scrollTop': $("#"+target).offset().top}, 5, 'swing', function () {
			window.location.hash = target;
		});
	}
});

$(document).ready(function() {
	SF_scripts();
});

function SF_scripts(){

	$(window).resize(function(){
		resizeVideo();
		showMenuBtn();
	});

	$(window).trigger("resize");

	// open menu on mobile

	function showMenuBtn(){
		if($(window).width()<1199.98){
			$(".open_menu").addClass("d-block");
			$("header nav").addClass("d-none");
			$(".navigation_mobile").removeClass("opened");
		}else{
			$(".open_menu").removeClass("d-block");
			$("header nav").removeClass("d-none");
			$(".navigation_mobile").removeClass("opened");
		}
	}

	$(".open_menu").click(function(event){
		event.preventDefault();
		$(".navigation_mobile").addClass("opened");
	});

	$(".close_menu, header, section, footer, .navigation_mobile .inner a").click(function(event){
		$(".navigation_mobile").removeClass("opened");
	});
	
	// Set | remove z-index for sections, that has dropdown
	
	function SF_dropdown_parent(dropdown){
		// Find dropdown's parent nav|header|section|footer
		var section = dropdown;
		var noBreak = true;
		while(noBreak){
			if(
				section[0].tagName=="NAV" || 
				section[0].tagName=="HEADER" || 
				section[0].tagName=="SECTION" || 
				section[0].tagName=="FOOTER" || 
				section[0].tagName=="BODY"
			){
				noBreak = false;
				break;
			}else{
				section = section.parent();				
			}
		}
		return section;
	}
	function SF_highest_zIndex(){
		// Find nav|header|section|footer with highest z-index on page
		var zIndex = 1;
		var currentzIndex;
		var section;
		$("nav, header, section, footer").each(function(){
			currentzIndex = parseInt($(this).css("z-index"));
			if(zIndex < currentzIndex){
				zIndex = currentzIndex;
				section = $(this);
			}
		});
		return [zIndex, section];
	}
	
	// Set highest z-index for section, that has opened dropdown
	$(".dropdown").on("show.bs.dropdown", function () {
		var section = SF_dropdown_parent($(this));
		section.css("z-index",SF_highest_zIndex()[0]+1);	
	});
	
	// Remove z-index for section, where dropdown was closed
	$(".dropdown").on("hidden.bs.dropdown", function () {
		var section = SF_dropdown_parent($(this));
		section.css("z-index","auto");	
	})
	
	// Navigation dropdown popup

	if($(".js-nav-dropdowns").length>0){
		$("body").click(function(event){
			if($(event.target).closest(".navigation_popup").length==0 && $(event.target).closest(".js-open-nav-dropdown").length==0){
				$(".navigation_popup.opened").removeClass("opened");
				$(".js-open-nav-dropdown i.fa-flip-vertical").removeClass("fa-flip-vertical");
			}
		});
		
		$(".js-nav-dropdowns .js-open-nav-dropdown").click(function(event){
			event.preventDefault();
			var id = $(".js-nav-dropdowns .js-open-nav-dropdown").index($(this));
			if($(".navigation_popup").eq(id).hasClass("opened")){
				$(this).find("i").removeClass("fa-flip-vertical");
				$(".navigation_popup").eq(id).removeClass("opened");
			}else{
				$(".navigation_popup.opened").removeClass("opened");
				$(".js-open-nav-dropdown i.fa-flip-vertical").removeClass("fa-flip-vertical");
				$(".navigation_popup").eq(id).addClass("opened");			
				$(this).find("i").addClass("fa-flip-vertical");
				var section = SF_dropdown_parent($(this));
				section.css("z-index",SF_highest_zIndex()[0]+1);				
			}
		});
	}
	
	// Enable AOS plugin (blocks animations)

	if(typeof(AOS) !== 'undefined' && $("body").hasClass("SFG_body")===false){
		AOS.init({
			easing: 'ease-out-cubic',
			once: true,
			offset: 5
		});
		setTimeout(function(){
			if($(".slick-initialized").length>0){
				AOS.refreshHard();
			}
		},10);
	}

	// AJAX send form
	
	var grecaptchaWidgetID;
	
	$("form:not(.SFG)").submit(function(event){
		
		event.preventDefault();
	 
		var form = $(this);
		var grecaptchaContainer = document.getElementById("g-recaptcha");
		if($(grecaptchaContainer).length>0){
			$(".grecaptcha-overlay").fadeIn(1,function(){
				$(".grecaptcha-popup").fadeIn(2,function(){
					if(typeof(grecaptchaWidgetID)=="undefined"){
						grecaptchaWidgetID = grecaptcha.render(grecaptchaContainer, {
							"sitekey": $(grecaptchaContainer).attr("data-sitekey"),
							"callback": function (grecaptchaResponse) {
								if(grecaptchaResponse){
									var grecaptchaInput = form.find('input[name=g-recaptcha-response]');
									if(grecaptchaInput.length>0){
										grecaptchaInput.val(grecaptchaResponse);
									}else{
										form.append('<input name="g-recaptcha-response" value="'+grecaptchaResponse+'" type="hidden" />');						
									}
									submitForm(form);					
								}else{
									grecaptcha.reset(grecaptchaWidgetID);
								}
							},
							"expired-callback": function(){
								grecaptcha.reset(grecaptchaWidgetID);
							},
							"error-callback": function(){
								$(".alert-form-error .message").html("Error: Please, check your internet connection and try again");
								$(".alert-form-error").fadeIn(2).delay(1).fadeOut(2);
								grecaptcha.reset(grecaptchaWidgetID);
							},
						});						
					}else{
						grecaptcha.reset(grecaptchaWidgetID);
					}
				});
			});
		}else{
			submitForm(form);
		}
		function submitForm(form){
		    var	term = form.serialize(),
				url = form.attr("action"),
				required_fields_filled = true;
				
			form.find("input, textarea, select").each(function(){
				if($(this).prop("required") && $(this).val()==""){
					required_fields_filled = false;
				}
			});

			if(required_fields_filled){
				var posting = $.post(url, term);
				posting
				.done(function(data){
					if(data=="ok"){
						$(".alert-form-success").fadeIn(3).delay(5).fadeOut(2);
					}else{
						$(".alert-form-error .message").html(data);
						$(".alert-form-error").fadeIn(2).delay(1).fadeOut(2);
					}
					hidegRecaptchaPopup();
				})
				.fail(function(){
					$(".alert-form-error").fadeIn(2).delay(1).fadeOut(2);
					hidegRecaptchaPopup();
				});
			}else{
				$(".alert-form-check-fields").fadeIn(2).delay(5).fadeOut(2);
				hidegRecaptchaPopup();
			}
		}
	});
	
	// Close gReCaptcha popup
	
	$(".grecaptcha-overlay").click(function(){
		hidegRecaptchaPopup();
	});
	
	function hidegRecaptchaPopup(){
		if($(".grecaptcha-popup").is(":visible")){
			$(".grecaptcha-popup").fadeOut(2, function(){
				$(".grecaptcha-overlay").fadeOut(1);
			});
		}
	}

	// Function to add style to form, when user clicks to input inside it

	function focusForm(formID){
		var form = $("#"+formID);
		if(form.hasClass("focused")){
			form.removeClass("focused");
		}else{
			form.addClass("focused");
		}
	}

	// Resize video, saving aspect ratio

	function resizeVideo(){
		var width, height, ratio;
		$(".video").each(function(){
			ratio = $(this).data("ratio");
			ratio = ratio.split("/");
			ratio = ratio[0]/ratio[1];
			width = $(this).width();
			height = width/ratio;
			$(this).height(height);
		});
	}

	resizeVideo();

	// Play video

	$(".video .play").click(function(){
		var video = $(this).parent().parent().find("video");
		$(this).closest(".poster").fadeOut(3,function(){
			video.fadeIn(3,function(){
				video[0].play();
				video[0].onended = function() {
					$(this).parent().find(".poster").delay(100).fadeIn(300);
				};
			});
		});
	});
	
	// Opening tabs

	function openTab(tab){
		if(tab.hasClass("opened")){
			$(".tab_text").animate({height:0},3);
			tab.removeClass("opened");
		}else{
			var nextTabHeight = tab.next().find("div").outerHeight(true);
			$(".tab_text").not(tab.next()).animate({height:0},3);
			tab.next().animate({height:nextTabHeight},3);
			$(".tab_opener").removeClass("opened");
			tab.addClass("opened");
		}
	}

	$(".tab_opener").click(function(){
		openTab($(this));
	});

	if($(".opening_tabs").length > 0){
		$(".tab_opener").each(function(){
			if($(this).hasClass("opened")){
				$(this).removeClass("opened").trigger("click");
			}
		});
	}

	// Copy text from block

	if($("#copy_from_me").length > 0){
		function copyStringToClipboard (str) {
		   var el = document.createElement('textarea');
		   el.value = str;
		   el.setAttribute('readonly', '');
		   el.style = {position: 'absolute', left: '-9999px'};
		   document.body.appendChild(el);
		   el.select();
		   document.execCommand('copy');
		   document.body.removeChild(el);
		}
		$('.js-copy-btn').click(function(){
			copyStringToClipboard ($("#copy_from_me").text());
		});
	}

	// Add mask to inputs in Forms

	if($(".js-card-mask").length > 0){
		$(".js-card-mask").mask("9");
	}
	if($(".js-expiration-mask").length > 0){
		$(".js-expiration-mask").mask("9 / 9");
	}
	if($(".js-expiration-short-mask").length > 0){
		$(".js-expiration-short-mask").mask("9 / 9");
	}
	if($(".js-cvv-mask").length > 0){
		$(".js-cvv-mask").mask("9");
	}
	
	// Disable / enable blocks in Form 13

	$(".form_13 input[type=radio]").change(function(){
		var choosenBlock = $(".form_13 input[type=radio]:checked").closest(".js-form-block");
		$(".js-form-block").removeClass("active");
		choosenBlock.addClass("active");
	});
	
	// Ecommerce: Quantity selector
	
	$(".quantity_selector .control").click(function(event){
		event.preventDefault();
		var _this = $(this);
		var input = _this.parent().find("input");
		var input_val = parseInt(input.val());
		if(_this.hasClass("greater")){
			if(input_val<parseInt(input.attr("max"))){
				input.val(input_val+1);
				input.trigger("change");
			}
		}
		if(_this.hasClass("less")){
			if(input_val>parseInt(input.attr("min"))){
				input.val(input_val-1);
				input.trigger("change");
			}
		}
	});
	
	// Ecommerce: Remove products from cart
	
	$(".remove_product").click(function(event){
		event.preventDefault();
		var product = $(this).closest(".product");
		console.log(product);
		product.slideUp(3,function(){
			product.remove();
			if(typeof(count_totals_ecommerce_3)=="function"){
				count_totals_ecommerce_3();
			}
			if(typeof(count_totals_ecommerce_36)=="function"){
				count_totals_ecommerce_3();
			}
			if(typeof(count_totals_ecommerce_38)=="function"){
				count_totals_ecommerce_3();
			}
		})
	});
	
	// Ecommerce: Set discount
	
	$(".ecommerce_33 input[name=coupon]").change(function(){
		if($(this).val()!=""){
			var discount = $(".ecommerce_3 .discount").attr("data-discount");
			$(".ecommerce_3 .discount .js-discount-value").text(discount);
		}else{
			$(".ecommerce_3 .discount .js-discount-value").text("0");
		}
		if(typeof(count_totals_ecommerce_33)=="function"){
			count_totals_ecommerce_3();
		}
	});
	
	// Ecommerce: Count total price
	
	if($(".ecommerce_3 .product").length>0){
		$(".ecommerce_3 .quantity_selector input").change(function(){
			count_totals_ecommerce_3();
		});
		function count_totals_ecommerce_3(){
			var total = 0;
			var discount = parseInt($(".ecommerce_33 .discount .js-discount-value").text());
			$(".ecommerce_3 .product").each(function(){
				var product = $(this);
				var price = parseFloat(product.find(".product_price .js-product-price").text());
				var quantity = parseInt(product.find("input[name=quantity]").val());
				product.find(".product_total .js-product-total").text(price*quantity);
				total = total + price*quantity;
			});
			if(!isNaN(discount)){
				total = Math.floor(total*(1-discount)/1);
			}
			$(".ecommerce_3 .total .js-total").text(total);
		}
		count_totals_ecommerce_3();
	}
	
	if($(".ecommerce_3 .product").length>0){
		$(".ecommerce_3 .quantity_selector input").change(function(){
			count_totals_ecommerce_3();
		});
		function count_totals_ecommerce_34(){
			var total = 0;
			var delivery = parseInt($(".ecommerce_3 .delivery .js-product-delivery").text());
			$(".ecommerce_3 .product").each(function(){
				var product = $(this);
				var price = parseFloat(product.find(".product_price .js-product-price").text());
				var quantity = parseInt(product.find("input[name=quantity]").val());
				product.find(".product_total .js-product-total").text(price*quantity);
				total = total + price*quantity;
			});
			$(".ecommerce_34 .subtotal .js-subtotal").text(total);
			if(!isNaN(delivery)){
				total = total+delivery;
			}
			$(".ecommerce_3 .total .js-total").text(total);
		}
		count_totals_ecommerce_3();
	}
	
	if($(".ecommerce_3 .product").length>0){
		$(".ecommerce_3 .quantity_selector input").change(function(){
			count_totals_ecommerce_3();
		});
		function count_totals_ecommerce_3(){
			var total = 0;
			$(".ecommerce_3 .product").each(function(){
				var product = $(this);
				var price = parseFloat(product.find(".product_price .js-product-price").text());
				var quantity = parseInt(product.find("input[name=quantity]").val());
				product.find(".product_total .js-product-total").text(price*quantity);
				total = total + price*quantity;
			});
			$(".ecommerce_3 .total .js-total").text(total);
		}
		count_totals_ecommerce_3();
	}
	
	if($(".ecommerce_36 .product").length>0){
		$(".ecommerce_36 .quantity_selector input, .ecommerce_36 input[name=coupon]").change(function(){
			count_totals_ecommerce_3();
		});
		function count_totals_ecommerce_3(){
			var total = 0;
			var discount = 1;
			if($(".ecommerce_3 input[name=coupon]").val()!=""){
				discount = (1 - parseInt($(".ecommerce_3 input[name=coupon]").attr("data-discount")))/100;
			}
			$(".ecommerce_36 .product").each(function(){
				var product = $(this);
				var price = parseFloat(product.find(".product_price .js-product-price").text());
				var quantity = parseInt(product.find("input[name=quantity]").val());
				total = total + price*quantity;
				total = Math.floor(total*discount);
			});
			$(".ecommerce_3 .total .js-total").text(total);
		}
		count_totals_ecommerce_3();
	}
	
	if($(".ecommerce_3 .product").length>0){
		function count_totals_ecommerce_38(){
			var total = 0;
			var delivery = parseInt($(".ecommerce_3 .delivery .js-delivery").text());
			$(".ecommerce_3 .product").each(function(){
				var product = $(this);
				var price = parseFloat(product.find(".product_total .js-product-total").text());
				total = total + price;
			});
			$(".ecommerce_3 .subtotal .js-subtotal").text(total);
			if(!isNaN(delivery)){
				total = total+delivery;
			}
			$(".ecommerce_3 .total .js-total").text(total);
		}
		count_totals_ecommerce_38();
	}

	// Google maps initialisation

	if($(".js-google-map").length>0){
		$(".js-google-map").each(function(){
			
			var map;
			var map_container = this;
			if($(map_container).attr("data-coords")!=undefined){
				var coords = $(map_container).attr("data-coords").replace(" ","").split(",");
				coords = new google.maps.LatLng(parseFloat(coords[0]), parseFloat(coords[1]));
			}else{
				var coords = new google.maps.LatLng(38, -77);
			}
			if($(map_container).attr("data-marker")!=undefined && $(map_container).attr("data-marker-size")!=undefined){
				var marker_image = $(map_container).attr("data-marker");
				var marker_size = $(map_container).attr("data-marker-size").split("*");
			}
			if($(map_container).attr("data-zoom")!=undefined){
				var zoom = parseInt($(map_container).attr("data-zoom"));
			}else{
				var zoom = 1;
			}

			function init() {
				var mapOptions = {
						zoom: zoom,
						center: coords,				},
					map = new google.maps.Map(map_container, mapOptions);
				if(marker_image){	
					var marker_icon = {
						url: marker_image, 
						scaledSize: new google.maps.Size(marker_size[0], marker_size[1]),
						origin: new google.maps.Point(0,0), 
						anchor: new google.maps.Point(marker_size[0]/1, marker_size[1])
					},
					marker = new google.maps.Marker({
						position: coords,
						map: map,
						icon: marker_icon
					});
				}

			}
			
			init();

		});
	}

	/*
		Sliders
	*/
	
	var slick_slider;

	if($(".header_8 .slider").length>0){
		$(".header_8 .slider").each(function(index){
			slick_slider = $(this);
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					dots: true,
					arrows: true,
					infinite: true,
					speed: 1,
					slidesToShow: 1,
					slidesToScroll: 1,
					autoplay: true,
					autoplaySpeed: 1,
					responsive: [
						{
						  breakpoint: 1,
						  settings: {
							arrows:false
						  }
						}
					]
				});
			}
		});
	}

	if($(".header_1 .slider").length>0){
		$(".header_1 .slider").each(function(index){
			slick_slider = $(this);
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					dots: true,
					arrows: false,
					infinite: true,
					speed: 1,
					slidesToShow: 1,
					slidesToScroll: 1,
					autoplay: true,
					autoplaySpeed: 1,
					vertical: true,
					verticalSwiping: true,
					responsive: [
						{
						  breakpoint: 1,
						  settings: {
							vertical: false,
							verticalSwiping: false
						  }
						}
					]
				});
			}
		});
	}
	
	if($(".navigation_23 .slider").length>0){
		$(".navigation_23 .slider").each(function(index){
			slick_slider = $(this);
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					dots: true,
					arrows: false,
					infinite: true,
					speed: 1,
					slidesToShow: 1,
					slidesToScroll: 1,
					autoplay: true,
					autoplaySpeed: 1,
				});
			}
		});
	}
	if($(".navigation_2 .slider").length>0){
		$(".navigation_2 .slider").each(function(index){
			slick_slider = $(this);
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					dots: true,
					arrows: false,
					infinite: true,
					speed: 1,
					slidesToShow: 1,
					slidesToScroll: 1,
					autoplay: true,
					autoplaySpeed: 1,
				});
			}
		});
	}
	
	if($(".feature_2 .slider").length>0){
		$(".feature_2 .slider").each(function(index){
			slick_slider = $(this);
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					dots: true,
					arrows: false,
					speed: 1,
					slidesToShow: 1,
					slidesToScroll: 1,
					vertical:true,
					verticalSwiping:true,
					adaptiveHeight:true,
					responsive: [
						{
						  breakpoint: 1,
						  settings: {
							vertical:false,
							verticalSwiping:false,
						  }
						}
					]
				});
			}
		});
	}

	if($(".feature_3 .slider").length>0){
		$(".feature_3 .slider").each(function(index){
			slick_slider = $(this);
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					dots: true,
					arrows: false,
					speed: 1,
					slidesToShow: 1,
					slidesToScroll: 1,
					vertical:true,
					verticalSwiping:true,
					responsive: [
						{
						  breakpoint: 1,
						  settings: {
							vertical:false,
							verticalSwiping:false,
						  }
						}
					]
				});
			}
		});
	}

	if($(".form_ .slider").length>0){
		$(".form_1 .slider").each(function(index){
			slick_slider = $(this);
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					slidesToShow: 1,
					slidesToScroll: 1,
					arrows: false,
					fade: true,
					touchMove:false,
					swipe:false,
					adaptiveHeight: true,
					asNavFor: '.form_4 .form_4_menu:eq('+index+')',
				});
				$('.form_4 .form_4_menu:eq('+index+')').slick({
					slidesToShow: 2,
					slidesToScroll: 1,
					asNavFor: '.form_4 .slider:eq('+index+')',
					dots: false,
					arrows: false,
					focusOnSelect: true,
					touchMove:false,
					swipe:false,
				});
			}
		});
	}

	if($(".form_1 .slider").length>0){
		$(".form_1 .slider").each(function(index){
			slick_slider = $(this);
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					slidesToShow: 1,
					slidesToScroll: 1,
					arrows: false,
					fade: true,
					adaptiveHeight: true,
					swipe:false,
					asNavFor: '.form_1 .form_1_menu:eq('+index+')',
				});
				$('.form_11 .form_1_menu:eq('+index+')').slick({
					slidesToShow: 2,
					slidesToScroll: 1,
					asNavFor: '.form_11 .slider:eq('+index+')',
					dots: false,
					arrows: false,
					focusOnSelect: true,
				});
			}
		});
	}
	
	if($(".pricing_table_1 .slider").length>0){
		$(".pricing_table_1 .slider").each(function(index){
			slick_slider = $(this);
			var toggle = $(".pricing_table_1 .custom-toggle:eq("+index+")");
			var togglePin = toggle.find("div");
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					dots: false,
					arrows: false,
					fade: true,
					infinite: true,
					speed: 1,
					touchMove:false,
					swipe:false,
					slidesToShow: 1,
					slidesToScroll: 1,
				});
				$(".pricing_table_1 .slider:eq("+index+")").on('beforeChange',function(){
					if(toggle.hasClass("switched")){
						toggle.removeClass("switched");
						togglePin.animate({left:3},1);
					}else{
						var animate_to = toggle.width() - togglePin.outerWidth(true) - 3;
						toggle.addClass("switched");
						togglePin.animate({left:animate_to},1);
					}
				});
				
			}
			toggle.click(function(){
				$(".pricing_table_6 .slider:eq("+index+")").slick("slickNext");
			});
		});
	}

	if($(".ecommerce_1 .slider").length>0){
		$(".ecommerce_1 .slider").each(function(index){
			slick_slider = $(this);
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					dots: false,
					arrows: true,
					infinite: true,
					speed: 1,
					slidesToShow: 1,
					slidesToScroll: 1,
					autoplay: true,
					autoplaySpeed: 1,
					responsive: [
						{
						  breakpoint: 5,
						  settings: {
							slidesToShow: 2,
							slidesToScroll: 1,
						  }
						},
						{
						  breakpoint: 1,
						  settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						  }
						}
					]
				});
			}
		});
	}
	
	if($(".ecommerce_1 .slider").length>0){
		$(".ecommerce_1 .slider").each(function(index){
			slick_slider = $(this);
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					slidesToShow: 1,
					slidesToScroll: 1,
					arrows: false,
					fade: true,
					asNavFor: '.ecommerce_1 .slider_menu:eq('+index+')',
				});
				$('.ecommerce_15 .slider_menu:eq('+index+')').slick({
					slidesToShow: 6,
					slidesToScroll: 1,
					asNavFor: '.ecommerce_1 .slider:eq('+index+')',
					dots: false,
					arrows: false,
					focusOnSelect: true,
					responsive: [
						{
						  breakpoint: 5,
						  settings: {
							slidesToShow: 5,
							slidesToScroll: 1,
						  }
						},
						{
						  breakpoint: 5,
						  settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						  }
						},
						{
						  breakpoint: 5,
						  settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						  }
						},
						{
						  breakpoint: 5,
						  settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						  }
						},
						{
						  breakpoint: 1,
						  settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						  }
						}
					]
				});
			}
		});
	}
	
	if($(".ecommerce_1 .slider").length>0){
		$(".ecommerce_1 .slider").each(function(index){
			slick_slider = $(this);
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					slidesToShow: 1,
					slidesToScroll: 1,
					arrows: false,
					fade: true,
					asNavFor: '.ecommerce_1 .slider_menu:eq('+index+')',
				});
				$('.ecommerce_1 .slider_menu:eq('+index+')').slick({
					slidesToShow: 1,
					slidesToScroll: 1,
					asNavFor: '.ecommerce_1 .slider:eq('+index+')',
					dots: false,
					arrows: false,
					focusOnSelect: true,
					responsive: [
						{
						  breakpoint: 1,
						  settings: {
							slidesToShow: 4,
							slidesToScroll: 1,
						  }
						},
						{
						  breakpoint: 5,
						  settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						  }
						},
						{
						  breakpoint: 1,
						  settings: {
							slidesToShow: 2,
							slidesToScroll: 1,
						  }
						}
					]
				});
			}
		});
	}
	
	if($(".ecommerce_32 .slider").length>0){
		$(".ecommerce_32 .slider").each(function(index){
			slick_slider = $(this);
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					slidesToShow: 1,
					slidesToScroll: 1,
					arrows: false,
					fade: true,
					asNavFor: '.ecommerce_32 .slider_menu:eq('+index+')',
				});
				$('.ecommerce_32 .slider_menu:eq('+index+')').slick({
					slidesToShow: 4,
					slidesToScroll: 1,
					asNavFor: '.ecommerce_32 .slider:eq('+index+')',
					dots: false,
					arrows: true,
					focusOnSelect: true,
					responsive: [
						{
						  breakpoint: 5,
						  settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						  }
						},
						{
						  breakpoint: 5,
						  settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						  }
						}
					]
				});
			}
		});
	}
	
	if($(".ecommerce_3 .slider").length>0){
		$(".ecommerce_3 .slider").each(function(index){
			slick_slider = $(this);
			if(slick_slider.hasClass("slick-initialized")===false){
				slick_slider.slick({
					slidesToShow: 1,
					slidesToScroll: 1,
					arrows: false,
					fade: true,
					adaptiveHeight: true,
					swipe:false,
					asNavFor: '.ecommerce_35 .slider_menu:eq('+index+')',
				});
				$('.ecommerce_35 .slider_menu:eq('+index+')').slick({
					slidesToShow: 2,
					slidesToScroll: 1,
					asNavFor: '.ecommerce_35 .slider:eq('+index+')',
					dots: false,
					arrows: false,
					focusOnSelect: true,
				});
			}
		});
	}

}; // SF_scripts end
