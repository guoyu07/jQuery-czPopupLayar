/**
 * $.czCheckedbox
 * @extends jquery.1.4.2
 * @fileOverview Make popup layar more beautiful and functional
 * @author Lancer
 * @email lancer.he@gmail.com
 * @site crackedzone.com
 * @version 1.0
 * @date 2013-01-18
 * Copyright (c) 2011-2012 Lancer
 * @example
 *    $("#pop").czPopopLayer();
 */


(function($) {
	var czUI = czUI || {}

	$.fn.czPopupLayar = function( options ){
		
		var PNAME = 'czPopupLayar';
		var objData = $(this).data(PNAME);
		
		//get instance object
		if (typeof options == 'string' && options == 'instance') {
			return objData;
		}
		
		var options = $.extend( {}, czUI.czPopupLayar.defaults, options || {} );
		
		return $(this).each(function (){
			
			var czPopupLayar = new czUI.czPopupLayar( options );
			czPopupLayar.$element = $(this);
			czPopupLayar.init();
			$(this).data( PNAME, czPopupLayar );
			
		});
	}

	czUI.czPopupLayar = function( options ) {
		this.NAME    = 'czPopupLayar';
		this.VERSION = '1.0';
		this.options = options;
		this.$element= null;
		this.$wrap   = null;
		this.hasOpen = false;
	}
	
	czUI.czPopupLayar.defaults = {
		title        : '',
		className    : '',
		zIndex       : 90000,
		shade        : true,
		shadeBgColor : '#333',
		shadeOpacity : '0.6',
		fix          : true,
		type         : 'center',
		left         : 0,
		top          : 0,
		initCallback : null,
		showCallback : null,
		hideCallback : null
	}

	czUI.czPopupLayar.prototype = {
		
		init: function() {
			//create a wrap html for tip and tip html
			this._create();
			
			this._bindEvent();
			
			this._callback('init');
			
			this.hide(true);
		},
		
		debug : function( $message ) {
			
			if ( typeof $message == 'undefined') $message = this;
			
			if (window.console && window.console.log)
				window.console.log($message);
			else
				alert($message);
		},
		
		_callback: function(evt) {
			if( typeof this.options[evt + 'Callback'] != 'function')
				return;
			this.options[evt + 'Callback'].call(this);
		},
		
		_create: function() {
			
			if ( this.options.shade == true ) {
				this.$shade = $('<div></div>').css({
					position: 'fixed',
					height  : $(document).height(),
					width   : '100%',
					height  : '100%',
					top     : 0,
					left    : 0,
					zIndex  : this.options.zIndex,
					backgroundColor : this.options.shadeBgColor
				});
				
				if ($.browser.msie && $.browser.version == "6.0" && (! $.support.style) ) {
					this.$shade.css({position: 'absolute', height: $(document).height()});
				}
				this.$shade.appendTo('body').fadeTo( 0, this.options.shadeOpacity ).hide();
			}


			this.$element.show();
			this.$wrap = $('<div></div>').css({zIndex  : this.options.zIndex + 1});
			

			if (this.options.type == 'center' && this.options.fix == true) {
				this.$wrap.appendTo('body');
				this._isIE6() ? this.$wrap.css({position: 'absolute'}) : this.$wrap.css({position: 'fixed'});
			} else if (this.options.type == 'dropdown') {
				this.$wrap.appendTo(this.$element.parent());
				this.$wrap.css({
					position: 'absolute',
					top : this.options.top, 
					left: this.options.left
				});
			}
			this.$wrap.html('<div class="czPopupLayar '+this.options.className+'">\
						<div class="popup_title"><a class="close"></a><span>'+this.options.title+'</span></div>\
						<div class="popup_content"></div>\
					</div>');
			this.$popup = this.$wrap.find('.popup_content');
			this.$close = this.$wrap.find('.close');
			this.$element.appendTo( this.$popup );
		},
		
		setTitle: function(title) {
			this.$wrap.find('.popup_title span').html(title);
		},

		_getPositionPos : function() {
			
			if ( this.$wrap.width() > $(window).width() )
				this.leftPos = 0;
			else
				this.leftPos = ($(window).width() - this.$wrap.width()) / 2;
			
			if ( $(window).height() >= this.$wrap.height()) {
				if ( this._isIE6() )
					this.topPos  = $(document).scrollTop() + ($(window).height() - this.$wrap.height()) / 2;
				else {
					this.topPos  = ($(window).height() - this.$wrap.height()) / 2;
				}
			} else {
				if ( this._isIE6() )
					this.topPos  = $(document).scrollTop();
				else {
					this.topPos  = 0;
				}
			}
			
			if ( this.$wrap.height() + $(document).scrollTop() > $(document).height())
				this.topPos = $(document).height() - this.$wrap.height();

		},
		
		_isIE6 : function() {
			if ($.browser.msie && $.browser.version == "6.0" && (! $.support.style) ) {
				return true;
			}
			return false;
		},
		
		_positionScroll: function() {
			this.$wrap.stop().animate({
				top : this.topPos,
				left: this.leftPos
			},100);
		},

		_positionFix: function() {

			if (this.options.type == 'center') {
				
				this._getPositionPos();
				this.$wrap.css({top : this.topPos, left: this.leftPos});

			} else if ( this.options.type == 'dropdown' ) {
				
				offset = this.$wrap.offset();
				
				mgBottom = $(window).height() - (this.$wrap.height() + offset.top - $(document).scrollTop());
				if ( mgBottom < 0 ) {
					var scrollToBottom = $(document).scrollTop() +  mgBottom;
					$("html,body").animate({scrollTop: scrollToBottom}, 1000);
				}
				
				tableMarginRight = $(window).width() - (offset.left + this.$wrap.width());
				
				if ( tableMarginRight < 0 ) {
					this.$wrap.animate({
						left: tableMarginRight
					},100);
				}
				//this.debug(offset.left + this.$wrap.width());
				//this.debug($(window).width());
			}
	
		},
		
		_bindEvent : function() {
			var self = this;
			
			this.$close.bind('click', function(){
				self.hide();
			});
			
			//bind scroll event;
			$(window).scroll(function() {
				if ( self.options.fix == true && self.options.type == 'center' && self.$wrap.is(':visible') == true && self._isIE6() ) {
					self._getPositionPos();
					self._positionScroll();
				}
			});
			
			$(window).resize(function() {
				if ( self.options.fix == true && self.options.type == 'center' && self.$wrap.is(':visible') == true ) {
					self._getPositionPos();
					self._positionScroll();
				}
			});
		},
		
		hide : function(init) {
			if ( this.$wrap.is(':visible') == false )
				return false;

			if ( this.options.shade == true )
				this.$shade.hide();

			this.$wrap.hide();

			if (init != true)
				this._callback('hide');
		},

		show : function(init) {
			if ( this.$wrap.is(':visible') == true )
				return false;

			if ( this.options.shade == true )
				this.$shade.show();

			this.$wrap.show();
			this._positionFix();

			if (init != true)
				this._callback('show');

			if (init != true && ! this.hasOpen)
				this.hasOpen = true;
		},

		hasOpen: function() {
			return this.hasOpen;
		}	
	}
	
})(jQuery);