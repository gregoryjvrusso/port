$(function () {
  var CarouselCMS = function (element, options) {
    this.$element = $(element);
    this.options = options;
    this.$container = this.$element.find('[carousel-slider] > div');
    this.$items = this.$element.find('.unit-carousel');
    this.$nav = this.$element.find('[carousel-nav]');
    this.$next = this.$element.find('[carousel-next]');
    this.$prev = this.$element.find('[carousel-prev]');
    this.init();
  };

  CarouselCMS.prototype.init = function () {
    if (this.options.size > 0)
      this.options.offset = this.$element.width() - this.options.size;
    if (this.options.type === 0) {
      this.cssInput0();
    } else if (this.options.type == 1) {
      this.cssInput1();
    }
    var that = this;
    if (this.options.nav)
      this.nav();
    if (window.outerWidth <= 768) {
      this.mobileNav();
    }
    if (this.$next.length > 0)
      this.$next.unbind('click').click($.proxy(this, 'next'));
    if (this.$prev.length > 0)
      this.$prev.unbind('click').click($.proxy(this, 'prev')).addClass('nav-disable');
  };

  CarouselCMS.prototype.mobileNav = function () {
    var that = this,
      diff = 0;
    this.$element.bind('touchstart', function (e) {
      var initialX = e.changedTouches[0].pageX,
        initialY = e.changedTouches[0].pageY,
        dragging = false;
      that.$element.bind('touchmove', function (e) {
        if (Math.abs(initialY - e.changedTouches[0].pageY) < 10 || dragging == true) {
          if (Math.abs(initialX - e.changedTouches[0].pageX) > 10) {
            that.$container.css("transition", "none");
            $('body').css('overflow-y', 'hidden');
            dragging = true;
            var translate = that.translateCalc();
            diff = initialX - e.changedTouches[0].pageX;
            translate -= diff;
            that.$container.css("transform", "translateX(" + translate + "px)");
          }
          e.preventDefault();
        } else {
          diff = 0;
          that.$element.unbind('touchmove');
        }
      });
    });
    this.$element.bind('touchend', function () {
      that.$element.unbind('touchmove');
      $('body').css('overflow-y', 'auto');
      that.$container.css("transition", "transform " + (that.options.speed / 1000) + "s linear");
      if (diff > 100) {
        that.next();
      } else if (diff < -100) {
        that.prev();
      }
      diff = 0;
      that.moveSlider();
    });
  }

  CarouselCMS.prototype.cssInput0 = function () {
    this.$element.find('[carousel-overflow]').css("overflow", "hidden");
    this.$container.css({
      "display": "flex",
      "flex-direction": "row",
      "transition": "transform " + (this.options.speed / 1000) + "s linear"
    });
    this.$items.css("display", "table");
    this.options.width = (this.$element.width() / this.options.items) - this.options.offset;
    this.$container.width(this.options.width * this.$items.length);
    this.$items.width(this.options.width);
  }

  CarouselCMS.prototype.cssInput1 = function () {
    this.$element.find('[carousel-overflow]').css("overflow", "hidden");
    this.$container.css({
      "display": "flex",
      "flex-direction": "column",
      "flex-wrap": "wrap",
      "transition": "transform " + (this.options.speed / 1000) + "s linear"
    });
    this.$items.css("display", "table");
    this.options.width = (this.$element.width() / this.options.items) - this.options.offset;
    this.$container.height(this.$items.height() * this.options.items + 20);
    this.$items.width(this.options.width);
  }

  CarouselCMS.prototype.next = function () {
    var endNum = this.options.type ? this.$items.length / this.options.items - this.options.items : this.$items.length - this.options.items;
    if (this.options.current < endNum) {
      this.options.current += this.options.scroll;
      this.moveSlider();
    }
  };

  CarouselCMS.prototype.prev = function () {
    if (this.options.current > 0) {
      this.options.current -= this.options.scroll;
      this.moveSlider();
    }
  };
  CarouselCMS.prototype.translateCalc = function () {
    var translate;
    if (this.options.offset !== 0 && this.options.current == (this.$items.length - this.options.items)) {
      translate = this.options.current * this.options.width - this.options.offset;
    } else {
      translate = this.options.current * this.options.width;
    }
    translate = -translate;
    return translate
  }

  CarouselCMS.prototype.moveSlider = function () {
    var translate = this.translateCalc();
    this.$container.css("transform", "translateX(" + translate + "px)");
    if (this.options.type === 0) {
      if (this.options.current === 0) {
        this.$prev.addClass('nav-disable');
      } else {
        this.$prev.removeClass('nav-disable');
      }
      if (this.options.current == (this.$items.length - this.options.items)) {
        this.$next.addClass('nav-disable');
      } else {
        this.$next.removeClass('nav-disable');
      }
    } else if (this.options.type === 1) {
      if (this.options.current === 0) {
        this.$prev.addClass('nav-disable');
      } else {
        this.$prev.removeClass('nav-disable');
      }
      if (this.options.current == (this.$items.length / this.options.scroll - 2)) {
        this.$next.addClass('nav-disable');
      } else {
        this.$next.removeClass('nav-disable');
      }
    }
    this.$nav.find('[data-index]').removeClass('current');
    this.$nav.find('[data-index]').eq(this.options.current / this.options.scroll).addClass('current');
    $(document).trigger('carouselCMS-move');
  };

  CarouselCMS.prototype.goIndex = function (index) {
    this.options.current = index;
    this.moveSlider();
  };

  CarouselCMS.prototype.nav = function () {
    var html = '<div class="carousel-indexs">',
      length = this.$items.length / this.options.scroll;

    for (var index = 0; index < length; index++) {
      var classes = index ? "carousel-index" : "carousel-index current";
      html += '<span data-index="' + index + '" class="' + classes + '"><i class="circle-index"></i></span>'
    };
    html += '</div>';
    this.$nav.html(html);
    var self = this;
    this.$nav.find('[data-index]').click(function () {
      self.goIndex($(this).data('index'));
    });
  };

  CarouselCMS.DEFAULTS = {
    timer: 0,
    current: 0,
    width: 0,
    offset: 0,
    items: 1,
    speed: 300,
    nav: true,
    scroll: 1,
    type: 0,
    size: 0
  };

  $.fn.carouselCMS = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('dft.carouselCMS');
      var options = $.extend({}, CarouselCMS.DEFAULTS, $this.data(), typeof option == 'object' && option);
      if (!data) $this.data('dft.CarouselCMS', (data = new CarouselCMS(this, options)));
      if (typeof option == 'string') data[option](args);
    });
  };

  $('#final-proto-personas-carousel [carousel-cms]').carouselCMS({
    items: 1,
    nav: true,
    scroll: 1,
    type: 0,
    size: 270
  });
  $('#our-final-proto-carousel [carousel-cms]').carouselCMS({
    items: 1,
    nav: true,
    scroll: 1,
    type: 0,
    size: 270
  });
});

