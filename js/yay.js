/*!
 * Yay
 * Advanced Sidebar for Bootstrap
 * http://nkdev.info
 * @author nK
 * @version 1.1.0
 * Copyright 2015.
 */
/*
 *
 * YAY sidebar
 *
 */
!function($) {
  "use strict";

  var YAY = function(element, options) {
    this.options    = options;
    this.$yay       = $(element);
    this.$content   = this.$yay.find('~ .content-wrap');
    this.$nano      = this.$yay.find(".nano");
    this.$html      = $('html');
    this.$body      = $('body');
    this.$window    = $(window);

    // set in true when first time were clicked on toggle button
    this.changed    = false;

    this.init();
  };

  YAY.DEFAULTS = {
    // duration od animations
    duration: 300,

    // set small sidebar when window width < resizeWnd
    resizeWnd: 1000
  };

  YAY.prototype.init = function() {
    var _this = this;

    // no transition enable
    _this.$body.addClass('yay-notransition');

    // init Nano Scroller
    _this.$nano.nanoScroller({ preventPageScrolling: true });

    // sidebar toggle
    $('.yay-toggle').on( 'click', function(e) {
      e.preventDefault();
      _this.toggleYay();
    });

    // hide sidebar when push content overlay
    _this.$content.on( 'click', function() {
      if( _this.isHideOnContentClick() ) {
        _this.hideYay();
      }
    })

    // toggle sub menus
    _this.$yay.on('click', 'li a.yay-sub-toggle', function(e) {
      e.preventDefault();
      _this.toggleSub($(this));
    });

    if( _this.showType() == 'push' && _this.isShow()) {
      _this.$body.css('overflow', 'hidden');
    }

    // init gesture swipes
    if( _this.$yay.hasClass('yay-gestures') ) {
      _this.useGestures();
    }

    // on window resize - set small sidebar
    _this.$window.on('resize', function() {
      _this.windowResize();
    });
    
    _this.windowResize();

    // no transition disable
    setTimeout(function() {
      _this.$body.removeClass('yay-notransition');
    }, 1);
  }

  YAY.prototype.isShow = function() {
    return !this.$body.hasClass('yay-hide');
  }

  // check show type
  YAY.prototype.showType = function() {
    if(this.$yay.hasClass('yay-overlay')) return 'overlay';
    if(this.$yay.hasClass('yay-push')) return 'push';
    if(this.$yay.hasClass('yay-shrink')) return 'shrink';
  };


  // check if hide on content click
  YAY.prototype.isHideOnContentClick = function() {
    return this.$yay.hasClass('yay-overlap-content');
  }

  // check if sidebar static position
  YAY.prototype.isStatic = function() {
    return this.$yay.hasClass('yay-static');
  }


  YAY.prototype.toggleYay = function(type) {
    var _this = this;
    var show = !_this.isShow();

    if(type) {
      if(
        (type=='show' && !show)
        || (type=='hide' && show)) {
        return;
      }
    }

    _this.options.changed = true;

    if( show ) {
      _this.showYay();
    } else {
      _this.hideYay();
    }
  }

  YAY.prototype.showYay = function() {
    var _this = this;

    _this.$body.removeClass('yay-hide');

    if( _this.showType() == 'push'/* && !_this.isStatic() */) {
      _this.$body.css('overflow', 'hidden');
    }

    setTimeout(function() {
      // restore scroller on normal sidebar after end animation (300ms)
      _this.$nano.nanoScroller();

      // resize for charts reinit
      _this.$window.resize();
    }, _this.options.duration);
  }

  YAY.prototype.hideYay = function() {
    var _this = this;

    _this.$body.addClass('yay-hide');

    // destroy scroller on hidden sidebar
    _this.$nano.nanoScroller({ destroy: true });

    // resize for charts reinit
    setTimeout(function() {
      if( _this.showType() == 'push'/* && !_this.isStatic() */) {
        _this.$body.css('overflow', 'visible');
      }
      _this.$window.resize();
    }, _this.options.duration);
  }


  // toggle submenu [open or close]
  YAY.prototype.toggleSub = function(toggle) {
    var _this = this;

    var toggleParent = toggle.parent();
    var subMenu = toggleParent.find('> ul');
    var opened = toggleParent.hasClass('open');

    if(!subMenu.length) {
      return;
    }

    // close
    if(opened) {
      _this.closeSub(subMenu);
    }

    // open
    else {
      _this.openSub(subMenu, toggleParent);
    }
  }

  // close submenus
  YAY.prototype.closeSub = function(subMenu) {
    var _this = this;

    subMenu.css('display', 'block').stop()
      .slideUp(_this.options.duration, 'swing', function() {
      // close child dropdowns
      $(this).find('li a.yay-sub-toggle').next().attr('style', '');

      // reinit nano scroller
      _this.$nano.nanoScroller();
    });
    
    subMenu.parent().removeClass('open');
    subMenu.find('li a.yay-sub-toggle').parent().removeClass('open');
  }

  // open submenus
  YAY.prototype.openSub = function(subMenu, toggleParent) {
    var _this = this;

    subMenu
      .css('display', 'none').stop()
      .slideDown(_this.options.duration, 'swing', function() {
        // reinit nano scroller
        _this.$nano.nanoScroller();
      });
    toggleParent.addClass('open');

    _this.closeSub( toggleParent.siblings('.open').find('> ul') );
  }

  // use gestures for show / hide menu
  YAY.prototype.useGestures = function() {
    var _this = this;
    var touchStart = 0;
    var startPoint = 0; // x position
    var endPoint = 0; // x position

    // on touch start
    _this.$window.on('touchstart', function(e) {
      startPoint = (e.originalEvent.touches?e.originalEvent.touches[0]:e).pageX;
      endPoint = (e.originalEvent.touches?e.originalEvent.touches[0]:e).pageX;
      touchStart = 1;
    });

    // on swipe start
    _this.$window.on('touchmove', function(e) {
      if( touchStart ) {
        endPoint = (e.originalEvent.touches?e.originalEvent.touches[0]:e).pageX;
      }
    });

    // on swipe end
    _this.$window.on('touchend', function(e) {
      if( touchStart ) {
        var resultSwipe = startPoint - endPoint,
            rtl = _this.$html.hasClass('rtl');

        touchStart = 0;

        // swipe min width 100px
        if( Math.abs( resultSwipe ) < 100 ) {
          return;
        }

        // change values if rtl
        if( rtl ) {
          resultSwipe *= -1;
          startPoint = _this.$window.width() - startPoint;
        }

        // from left to right
        if(resultSwipe < 0) {
          // show only when touch started from left corner
          if( startPoint < 40 ) {
            _this.showYay();
          }
        }

        // from right to left
        else {
          _this.hideYay();
        }
      }
    });
  }

  // on resize window and on start
  var resizeTimer;
  YAY.prototype.windowResize = function() {
    var _this = this;

    // if user currently changed size of sidebar, stop change it
    if(!_this.options.changed) {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if(_this.$window.width() < _this.options.resizeWnd) {
          _this.toggleYay('hide');
        }
      }, 50);
    }
  };




  // init
  $('.yaybar').each(function() {
    var options = $.extend({}, YAY.DEFAULTS, $(this).data(), typeof option == 'object' && option);
    var curyay = new YAY(this, options);
  });

}(jQuery);