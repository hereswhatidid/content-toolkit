if (!jQuery) {
    throw new Error("Bootstrap requires jQuery");
}

+function($) {
    "use strict";
    function transitionEnd() {
        var el = document.createElement("bootstrap");
        var transEndEventNames = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd otransitionend",
            transition: "transitionend"
        };
        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }
    }
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false, $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) $($el).trigger($.support.transition.end);
        };
        setTimeout(callback, duration);
        return this;
    };
    $(function() {
        $.support.transition = transitionEnd();
    });
}(window.jQuery);

+function($) {
    "use strict";
    var dismiss = '[data-dismiss="alert"]';
    var Alert = function(el) {
        $(el).on("click", dismiss, this.close);
    };
    Alert.prototype.close = function(e) {
        var $this = $(this);
        var selector = $this.attr("data-target");
        if (!selector) {
            selector = $this.attr("href");
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, "");
        }
        var $parent = $(selector);
        if (e) e.preventDefault();
        if (!$parent.length) {
            $parent = $this.hasClass("alert") ? $this : $this.parent();
        }
        $parent.trigger(e = $.Event("close.bs.alert"));
        if (e.isDefaultPrevented()) return;
        $parent.removeClass("in");
        function removeElement() {
            $parent.trigger("closed.bs.alert").remove();
        }
        $.support.transition && $parent.hasClass("fade") ? $parent.one($.support.transition.end, removeElement).emulateTransitionEnd(150) : removeElement();
    };
    var old = $.fn.alert;
    $.fn.alert = function(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data("bs.alert");
            if (!data) $this.data("bs.alert", data = new Alert(this));
            if (typeof option == "string") data[option].call($this);
        });
    };
    $.fn.alert.Constructor = Alert;
    $.fn.alert.noConflict = function() {
        $.fn.alert = old;
        return this;
    };
    $(document).on("click.bs.alert.data-api", dismiss, Alert.prototype.close);
}(window.jQuery);

+function($) {
    "use strict";
    var Button = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Button.DEFAULTS, options);
    };
    Button.DEFAULTS = {
        loadingText: "loading..."
    };
    Button.prototype.setState = function(state) {
        var d = "disabled";
        var $el = this.$element;
        var val = $el.is("input") ? "val" : "html";
        var data = $el.data();
        state = state + "Text";
        if (!data.resetText) $el.data("resetText", $el[val]());
        $el[val](data[state] || this.options[state]);
        setTimeout(function() {
            state == "loadingText" ? $el.addClass(d).attr(d, d) : $el.removeClass(d).removeAttr(d);
        }, 0);
    };
    Button.prototype.toggle = function() {
        var $parent = this.$element.closest('[data-toggle="buttons"]');
        if ($parent.length) {
            var $input = this.$element.find("input").prop("checked", !this.$element.hasClass("active")).trigger("change");
            if ($input.prop("type") === "radio") $parent.find(".active").removeClass("active");
        }
        this.$element.toggleClass("active");
    };
    var old = $.fn.button;
    $.fn.button = function(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data("bs.button");
            var options = typeof option == "object" && option;
            if (!data) $this.data("bs.button", data = new Button(this, options));
            if (option == "toggle") data.toggle(); else if (option) data.setState(option);
        });
    };
    $.fn.button.Constructor = Button;
    $.fn.button.noConflict = function() {
        $.fn.button = old;
        return this;
    };
    $(document).on("click.bs.button.data-api", "[data-toggle^=button]", function(e) {
        var $btn = $(e.target);
        if (!$btn.hasClass("btn")) $btn = $btn.closest(".btn");
        $btn.button("toggle");
        e.preventDefault();
    });
}(window.jQuery);

+function($) {
    "use strict";
    var Carousel = function(element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find(".carousel-indicators");
        this.options = options;
        this.paused = this.sliding = this.interval = this.$active = this.$items = null;
        this.options.pause == "hover" && this.$element.on("mouseenter", $.proxy(this.pause, this)).on("mouseleave", $.proxy(this.cycle, this));
    };
    Carousel.DEFAULTS = {
        interval: 5e3,
        pause: "hover",
        wrap: true
    };
    Carousel.prototype.cycle = function(e) {
        e || (this.paused = false);
        this.interval && clearInterval(this.interval);
        this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));
        return this;
    };
    Carousel.prototype.getActiveIndex = function() {
        this.$active = this.$element.find(".item.active");
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };
    Carousel.prototype.to = function(pos) {
        var that = this;
        var activeIndex = this.getActiveIndex();
        if (pos > this.$items.length - 1 || pos < 0) return;
        if (this.sliding) return this.$element.one("slid", function() {
            that.to(pos);
        });
        if (activeIndex == pos) return this.pause().cycle();
        return this.slide(pos > activeIndex ? "next" : "prev", $(this.$items[pos]));
    };
    Carousel.prototype.pause = function(e) {
        e || (this.paused = true);
        if (this.$element.find(".next, .prev").length && $.support.transition.end) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };
    Carousel.prototype.next = function() {
        if (this.sliding) return;
        return this.slide("next");
    };
    Carousel.prototype.prev = function() {
        if (this.sliding) return;
        return this.slide("prev");
    };
    Carousel.prototype.slide = function(type, next) {
        var $active = this.$element.find(".item.active");
        var $next = next || $active[type]();
        var isCycling = this.interval;
        var direction = type == "next" ? "left" : "right";
        var fallback = type == "next" ? "first" : "last";
        var that = this;
        if (!$next.length) {
            if (!this.options.wrap) return;
            $next = this.$element.find(".item")[fallback]();
        }
        this.sliding = true;
        isCycling && this.pause();
        var e = $.Event("slide.bs.carousel", {
            relatedTarget: $next[0],
            direction: direction
        });
        if ($next.hasClass("active")) return;
        if (this.$indicators.length) {
            this.$indicators.find(".active").removeClass("active");
            this.$element.one("slid", function() {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                $nextIndicator && $nextIndicator.addClass("active");
            });
        }
        if ($.support.transition && this.$element.hasClass("slide")) {
            this.$element.trigger(e);
            if (e.isDefaultPrevented()) return;
            $next.addClass(type);
            $next[0].offsetWidth;
            $active.addClass(direction);
            $next.addClass(direction);
            $active.one($.support.transition.end, function() {
                $next.removeClass([ type, direction ].join(" ")).addClass("active");
                $active.removeClass([ "active", direction ].join(" "));
                that.sliding = false;
                setTimeout(function() {
                    that.$element.trigger("slid");
                }, 0);
            }).emulateTransitionEnd(600);
        } else {
            this.$element.trigger(e);
            if (e.isDefaultPrevented()) return;
            $active.removeClass("active");
            $next.addClass("active");
            this.sliding = false;
            this.$element.trigger("slid");
        }
        isCycling && this.cycle();
        return this;
    };
    var old = $.fn.carousel;
    $.fn.carousel = function(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data("bs.carousel");
            var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == "object" && option);
            var action = typeof option == "string" ? option : options.slide;
            if (!data) $this.data("bs.carousel", data = new Carousel(this, options));
            if (typeof option == "number") data.to(option); else if (action) data[action](); else if (options.interval) data.pause().cycle();
        });
    };
    $.fn.carousel.Constructor = Carousel;
    $.fn.carousel.noConflict = function() {
        $.fn.carousel = old;
        return this;
    };
    $(document).on("click.bs.carousel.data-api", "[data-slide], [data-slide-to]", function(e) {
        var $this = $(this), href;
        var $target = $($this.attr("data-target") || (href = $this.attr("href")) && href.replace(/.*(?=#[^\s]+$)/, ""));
        var options = $.extend({}, $target.data(), $this.data());
        var slideIndex = $this.attr("data-slide-to");
        if (slideIndex) options.interval = false;
        $target.carousel(options);
        if (slideIndex = $this.attr("data-slide-to")) {
            $target.data("bs.carousel").to(slideIndex);
        }
        e.preventDefault();
    });
    $(window).on("load", function() {
        $('[data-ride="carousel"]').each(function() {
            var $carousel = $(this);
            $carousel.carousel($carousel.data());
        });
    });
}(window.jQuery);

+function($) {
    "use strict";
    var Collapse = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Collapse.DEFAULTS, options);
        this.transitioning = null;
        if (this.options.parent) this.$parent = $(this.options.parent);
        if (this.options.toggle) this.toggle();
    };
    Collapse.DEFAULTS = {
        toggle: true
    };
    Collapse.prototype.dimension = function() {
        var hasWidth = this.$element.hasClass("width");
        return hasWidth ? "width" : "height";
    };
    Collapse.prototype.show = function() {
        if (this.transitioning || this.$element.hasClass("in")) return;
        var startEvent = $.Event("show.bs.collapse");
        this.$element.trigger(startEvent);
        if (startEvent.isDefaultPrevented()) return;
        var actives = this.$parent && this.$parent.find("> .panel > .in");
        if (actives && actives.length) {
            var hasData = actives.data("bs.collapse");
            if (hasData && hasData.transitioning) return;
            actives.collapse("hide");
            hasData || actives.data("bs.collapse", null);
        }
        var dimension = this.dimension();
        this.$element.removeClass("collapse").addClass("collapsing")[dimension](0);
        this.transitioning = 1;
        var complete = function() {
            this.$element.removeClass("collapsing").addClass("in")[dimension]("auto");
            this.transitioning = 0;
            this.$element.trigger("shown.bs.collapse");
        };
        if (!$.support.transition) return complete.call(this);
        var scrollSize = $.camelCase([ "scroll", dimension ].join("-"));
        this.$element.one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize]);
    };
    Collapse.prototype.hide = function() {
        if (this.transitioning || !this.$element.hasClass("in")) return;
        var startEvent = $.Event("hide.bs.collapse");
        this.$element.trigger(startEvent);
        if (startEvent.isDefaultPrevented()) return;
        var dimension = this.dimension();
        this.$element[dimension](this.$element[dimension]())[0].offsetHeight;
        this.$element.addClass("collapsing").removeClass("collapse").removeClass("in");
        this.transitioning = 1;
        var complete = function() {
            this.transitioning = 0;
            this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse");
        };
        if (!$.support.transition) return complete.call(this);
        this.$element[dimension](0).one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(350);
    };
    Collapse.prototype.toggle = function() {
        this[this.$element.hasClass("in") ? "hide" : "show"]();
    };
    var old = $.fn.collapse;
    $.fn.collapse = function(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data("bs.collapse");
            var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == "object" && option);
            if (!data) $this.data("bs.collapse", data = new Collapse(this, options));
            if (typeof option == "string") data[option]();
        });
    };
    $.fn.collapse.Constructor = Collapse;
    $.fn.collapse.noConflict = function() {
        $.fn.collapse = old;
        return this;
    };
    $(document).on("click.bs.collapse.data-api", "[data-toggle=collapse]", function(e) {
        var $this = $(this), href;
        var target = $this.attr("data-target") || e.preventDefault() || (href = $this.attr("href")) && href.replace(/.*(?=#[^\s]+$)/, "");
        var $target = $(target);
        var data = $target.data("bs.collapse");
        var option = data ? "toggle" : $this.data();
        var parent = $this.attr("data-parent");
        var $parent = parent && $(parent);
        if (!data || !data.transitioning) {
            if ($parent) $parent.find('[data-toggle=collapse][data-parent="' + parent + '"]').not($this).addClass("collapsed");
            $this[$target.hasClass("in") ? "addClass" : "removeClass"]("collapsed");
        }
        $target.collapse(option);
    });
}(window.jQuery);

+function($) {
    "use strict";
    var backdrop = ".dropdown-backdrop";
    var toggle = "[data-toggle=dropdown]";
    var Dropdown = function(element) {
        var $el = $(element).on("click.bs.dropdown", this.toggle);
    };
    Dropdown.prototype.toggle = function(e) {
        var $this = $(this);
        if ($this.is(".disabled, :disabled")) return;
        var $parent = getParent($this);
        var isActive = $parent.hasClass("open");
        clearMenus();
        if (!isActive) {
            if ("ontouchstart" in document.documentElement) {
                $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on("click", clearMenus);
            }
            $parent.trigger(e = $.Event("show.bs.dropdown"));
            if (e.isDefaultPrevented()) return;
            $parent.toggleClass("open").trigger("shown.bs.dropdown");
        }
        $this.focus();
        return false;
    };
    Dropdown.prototype.keydown = function(e) {
        if (!/(38|40|27)/.test(e.keyCode)) return;
        var $this = $(this);
        e.preventDefault();
        e.stopPropagation();
        if ($this.is(".disabled, :disabled")) return;
        var $parent = getParent($this);
        var isActive = $parent.hasClass("open");
        if (!isActive || isActive && e.keyCode == 27) {
            if (e.which == 27) $parent.find(toggle).focus();
            return $this.click();
        }
        var $items = $("[role=menu] li:not(.divider):visible a", $parent);
        if (!$items.length) return;
        var index = $items.index($items.filter(":focus"));
        if (e.keyCode == 38 && index > 0) index--;
        if (e.keyCode == 40 && index < $items.length - 1) index++;
        if (!~index) index = 0;
        $items.eq(index).focus();
    };
    function clearMenus() {
        $(backdrop).remove();
        $(toggle).each(function(e) {
            var $parent = getParent($(this));
            if (!$parent.hasClass("open")) return;
            $parent.trigger(e = $.Event("hide.bs.dropdown"));
            if (e.isDefaultPrevented()) return;
            $parent.removeClass("open").trigger("hidden.bs.dropdown");
        });
    }
    function getParent($this) {
        var selector = $this.attr("data-target");
        if (!selector) {
            selector = $this.attr("href");
            selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, "");
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }
    var old = $.fn.dropdown;
    $.fn.dropdown = function(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data("dropdown");
            if (!data) $this.data("dropdown", data = new Dropdown(this));
            if (typeof option == "string") data[option].call($this);
        });
    };
    $.fn.dropdown.Constructor = Dropdown;
    $.fn.dropdown.noConflict = function() {
        $.fn.dropdown = old;
        return this;
    };
    $(document).on("click.bs.dropdown.data-api", clearMenus).on("click.bs.dropdown.data-api", ".dropdown form", function(e) {
        e.stopPropagation();
    }).on("click.bs.dropdown.data-api", toggle, Dropdown.prototype.toggle).on("keydown.bs.dropdown.data-api", toggle + ", [role=menu]", Dropdown.prototype.keydown);
}(window.jQuery);

+function($) {
    "use strict";
    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element).on("click.dismiss.modal", '[data-dismiss="modal"]', $.proxy(this.hide, this));
        this.$backdrop = this.isShown = null;
        if (this.options.remote) this.$element.load(this.options.remote);
    };
    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };
    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? "show" : "hide"](_relatedTarget);
    };
    Modal.prototype.show = function(_relatedTarget) {
        var that = this;
        var e = $.Event("show.bs.modal", {
            relatedTarget: _relatedTarget
        });
        this.$element.trigger(e);
        if (this.isShown || e.isDefaultPrevented()) return;
        this.isShown = true;
        this.escape();
        this.backdrop(function() {
            var transition = $.support.transition && that.$element.hasClass("fade");
            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body);
            }
            that.$element.show();
            if (transition) {
                that.$element[0].offsetWidth;
            }
            that.$element.addClass("in").attr("aria-hidden", false);
            that.enforceFocus();
            var e = $.Event("shown.bs.modal", {
                relatedTarget: _relatedTarget
            });
            transition ? that.$element.one($.support.transition.end, function() {
                that.$element.focus().trigger(e);
            }).emulateTransitionEnd(300) : that.$element.focus().trigger(e);
        });
    };
    Modal.prototype.hide = function(e) {
        if (e) e.preventDefault();
        e = $.Event("hide.bs.modal");
        this.$element.trigger(e);
        if (!this.isShown || e.isDefaultPrevented()) return;
        this.isShown = false;
        this.escape();
        $(document).off("focusin.bs.modal");
        this.$element.removeClass("in").attr("aria-hidden", true).off("click.dismiss.modal");
        $.support.transition && this.$element.hasClass("fade") ? this.$element.one($.support.transition.end, $.proxy(this.hideModal, this)).emulateTransitionEnd(300) : this.hideModal();
    };
    Modal.prototype.enforceFocus = function() {
        $(document).off("focusin.bs.modal").on("focusin.bs.modal", $.proxy(function(e) {
            if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                this.$element.focus();
            }
        }, this));
    };
    Modal.prototype.escape = function() {
        if (this.isShown && this.options.keyboard) {
            this.$element.on("keyup.dismiss.bs.modal", $.proxy(function(e) {
                e.which == 27 && this.hide();
            }, this));
        } else if (!this.isShown) {
            this.$element.off("keyup.dismiss.bs.modal");
        }
    };
    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function() {
            that.removeBackdrop();
            that.$element.trigger("hidden.bs.modal");
        });
    };
    Modal.prototype.removeBackdrop = function() {
        this.$backdrop && this.$backdrop.remove();
        this.$backdrop = null;
    };
    Modal.prototype.backdrop = function(callback) {
        var that = this;
        var animate = this.$element.hasClass("fade") ? "fade" : "";
        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;
            this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').appendTo(document.body);
            this.$element.on("click.dismiss.modal", $.proxy(function(e) {
                if (e.target !== e.currentTarget) return;
                this.options.backdrop == "static" ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this);
            }, this));
            if (doAnimate) this.$backdrop[0].offsetWidth;
            this.$backdrop.addClass("in");
            if (!callback) return;
            doAnimate ? this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback();
        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass("in");
            $.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback();
        } else if (callback) {
            callback();
        }
    };
    var old = $.fn.modal;
    $.fn.modal = function(option, _relatedTarget) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data("bs.modal");
            var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == "object" && option);
            if (!data) $this.data("bs.modal", data = new Modal(this, options));
            if (typeof option == "string") data[option](_relatedTarget); else if (options.show) data.show(_relatedTarget);
        });
    };
    $.fn.modal.Constructor = Modal;
    $.fn.modal.noConflict = function() {
        $.fn.modal = old;
        return this;
    };
    $(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function(e) {
        var $this = $(this);
        var href = $this.attr("href");
        var $target = $($this.attr("data-target") || href && href.replace(/.*(?=#[^\s]+$)/, ""));
        var option = $target.data("modal") ? "toggle" : $.extend({
            remote: !/#/.test(href) && href
        }, $target.data(), $this.data());
        e.preventDefault();
        $target.modal(option, this).one("hide", function() {
            $this.is(":visible") && $this.focus();
        });
    });
    $(document).on("shown.bs.modal", ".modal", function() {
        $(document.body).addClass("modal-open");
    }).on("hidden.bs.modal", ".modal", function() {
        $(document.body).removeClass("modal-open");
    });
}(window.jQuery);

+function($) {
    "use strict";
    var Tooltip = function(element, options) {
        this.type = this.options = this.enabled = this.timeout = this.hoverState = this.$element = null;
        this.init("tooltip", element, options);
    };
    Tooltip.DEFAULTS = {
        animation: true,
        placement: "top",
        selector: false,
        template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: "hover focus",
        title: "",
        delay: 0,
        html: false,
        container: false
    };
    Tooltip.prototype.init = function(type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);
        var triggers = this.options.trigger.split(" ");
        for (var i = triggers.length; i--; ) {
            var trigger = triggers[i];
            if (trigger == "click") {
                this.$element.on("click." + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != "manual") {
                var eventIn = trigger == "hover" ? "mouseenter" : "focus";
                var eventOut = trigger == "hover" ? "mouseleave" : "blur";
                this.$element.on(eventIn + "." + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + "." + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }
        this.options.selector ? this._options = $.extend({}, this.options, {
            trigger: "manual",
            selector: ""
        }) : this.fixTitle();
    };
    Tooltip.prototype.getDefaults = function() {
        return Tooltip.DEFAULTS;
    };
    Tooltip.prototype.getOptions = function(options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);
        if (options.delay && typeof options.delay == "number") {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }
        return options;
    };
    Tooltip.prototype.getDelegateOptions = function() {
        var options = {};
        var defaults = this.getDefaults();
        this._options && $.each(this._options, function(key, value) {
            if (defaults[key] != value) options[key] = value;
        });
        return options;
    };
    Tooltip.prototype.enter = function(obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
        clearTimeout(self.timeout);
        if (!self.options.delay || !self.options.delay.show) return self.show();
        self.hoverState = "in";
        self.timeout = setTimeout(function() {
            if (self.hoverState == "in") self.show();
        }, self.options.delay.show);
    };
    Tooltip.prototype.leave = function(obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
        clearTimeout(self.timeout);
        if (!self.options.delay || !self.options.delay.hide) return self.hide();
        self.hoverState = "out";
        self.timeout = setTimeout(function() {
            if (self.hoverState == "out") self.hide();
        }, self.options.delay.hide);
    };
    Tooltip.prototype.show = function() {
        var e = $.Event("show.bs." + this.type);
        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);
            if (e.isDefaultPrevented()) return;
            var $tip = this.tip();
            this.setContent();
            if (this.options.animation) $tip.addClass("fade");
            var placement = typeof this.options.placement == "function" ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;
            var autoToken = /\s?auto?\s?/i;
            var autoPlace = autoToken.test(placement);
            if (autoPlace) placement = placement.replace(autoToken, "") || "top";
            $tip.detach().css({
                top: 0,
                left: 0,
                display: "block"
            }).addClass(placement);
            this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
            var pos = this.getPosition();
            var actualWidth = $tip[0].offsetWidth;
            var actualHeight = $tip[0].offsetHeight;
            if (autoPlace) {
                var $parent = this.$element.parent();
                var orgPlacement = placement;
                var docScroll = document.documentElement.scrollTop || document.body.scrollTop;
                var parentWidth = this.options.container == "body" ? window.innerWidth : $parent.outerWidth();
                var parentHeight = this.options.container == "body" ? window.innerHeight : $parent.outerHeight();
                var parentLeft = this.options.container == "body" ? 0 : $parent.offset().left;
                placement = placement == "bottom" && pos.top + pos.height + actualHeight - docScroll > parentHeight ? "top" : placement == "top" && pos.top - docScroll - actualHeight < 0 ? "bottom" : placement == "right" && pos.right + actualWidth > parentWidth ? "left" : placement == "left" && pos.left - actualWidth < parentLeft ? "right" : placement;
                $tip.removeClass(orgPlacement).addClass(placement);
            }
            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);
            this.applyPlacement(calculatedOffset, placement);
            this.$element.trigger("shown.bs." + this.type);
        }
    };
    Tooltip.prototype.applyPlacement = function(offset, placement) {
        var replace;
        var $tip = this.tip();
        var width = $tip[0].offsetWidth;
        var height = $tip[0].offsetHeight;
        var marginTop = parseInt($tip.css("margin-top"), 10);
        var marginLeft = parseInt($tip.css("margin-left"), 10);
        if (isNaN(marginTop)) marginTop = 0;
        if (isNaN(marginLeft)) marginLeft = 0;
        offset.top = offset.top + marginTop;
        offset.left = offset.left + marginLeft;
        $tip.offset(offset).addClass("in");
        var actualWidth = $tip[0].offsetWidth;
        var actualHeight = $tip[0].offsetHeight;
        if (placement == "top" && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }
        if (/bottom|top/.test(placement)) {
            var delta = 0;
            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;
                $tip.offset(offset);
                actualWidth = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }
            this.replaceArrow(delta - width + actualWidth, actualWidth, "left");
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, "top");
        }
        if (replace) $tip.offset(offset);
    };
    Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
        this.arrow().css(position, delta ? 50 * (1 - delta / dimension) + "%" : "");
    };
    Tooltip.prototype.setContent = function() {
        var $tip = this.tip();
        var title = this.getTitle();
        $tip.find(".tooltip-inner")[this.options.html ? "html" : "text"](title);
        $tip.removeClass("fade in top bottom left right");
    };
    Tooltip.prototype.hide = function() {
        var that = this;
        var $tip = this.tip();
        var e = $.Event("hide.bs." + this.type);
        function complete() {
            $tip.detach();
        }
        this.$element.trigger(e);
        if (e.isDefaultPrevented()) return;
        $tip.removeClass("in");
        $.support.transition && this.$tip.hasClass("fade") ? $tip.one($.support.transition.end, complete).emulateTransitionEnd(150) : complete();
        this.$element.trigger("hidden.bs." + this.type);
        return this;
    };
    Tooltip.prototype.fixTitle = function() {
        var $e = this.$element;
        if ($e.attr("title") || typeof $e.attr("data-original-title") != "string") {
            $e.attr("data-original-title", $e.attr("title") || "").attr("title", "");
        }
    };
    Tooltip.prototype.hasContent = function() {
        return this.getTitle();
    };
    Tooltip.prototype.getPosition = function() {
        var el = this.$element[0];
        return $.extend({}, typeof el.getBoundingClientRect == "function" ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };
    Tooltip.prototype.getCalculatedOffset = function(placement, pos, actualWidth, actualHeight) {
        return placement == "bottom" ? {
            top: pos.top + pos.height,
            left: pos.left + pos.width / 2 - actualWidth / 2
        } : placement == "top" ? {
            top: pos.top - actualHeight,
            left: pos.left + pos.width / 2 - actualWidth / 2
        } : placement == "left" ? {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left - actualWidth
        } : {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left + pos.width
        };
    };
    Tooltip.prototype.getTitle = function() {
        var title;
        var $e = this.$element;
        var o = this.options;
        title = $e.attr("data-original-title") || (typeof o.title == "function" ? o.title.call($e[0]) : o.title);
        return title;
    };
    Tooltip.prototype.tip = function() {
        return this.$tip = this.$tip || $(this.options.template);
    };
    Tooltip.prototype.arrow = function() {
        return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow");
    };
    Tooltip.prototype.validate = function() {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options = null;
        }
    };
    Tooltip.prototype.enable = function() {
        this.enabled = true;
    };
    Tooltip.prototype.disable = function() {
        this.enabled = false;
    };
    Tooltip.prototype.toggleEnabled = function() {
        this.enabled = !this.enabled;
    };
    Tooltip.prototype.toggle = function(e) {
        var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type) : this;
        self.tip().hasClass("in") ? self.leave(self) : self.enter(self);
    };
    Tooltip.prototype.destroy = function() {
        this.hide().$element.off("." + this.type).removeData("bs." + this.type);
    };
    var old = $.fn.tooltip;
    $.fn.tooltip = function(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data("bs.tooltip");
            var options = typeof option == "object" && option;
            if (!data) $this.data("bs.tooltip", data = new Tooltip(this, options));
            if (typeof option == "string") data[option]();
        });
    };
    $.fn.tooltip.Constructor = Tooltip;
    $.fn.tooltip.noConflict = function() {
        $.fn.tooltip = old;
        return this;
    };
}(window.jQuery);

+function($) {
    "use strict";
    var Popover = function(element, options) {
        this.init("popover", element, options);
    };
    if (!$.fn.tooltip) throw new Error("Popover requires tooltip.js");
    Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
        placement: "right",
        trigger: "click",
        content: "",
        template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    });
    Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype);
    Popover.prototype.constructor = Popover;
    Popover.prototype.getDefaults = function() {
        return Popover.DEFAULTS;
    };
    Popover.prototype.setContent = function() {
        var $tip = this.tip();
        var title = this.getTitle();
        var content = this.getContent();
        $tip.find(".popover-title")[this.options.html ? "html" : "text"](title);
        $tip.find(".popover-content")[this.options.html ? "html" : "text"](content);
        $tip.removeClass("fade top bottom left right in");
        if (!$tip.find(".popover-title").html()) $tip.find(".popover-title").hide();
    };
    Popover.prototype.hasContent = function() {
        return this.getTitle() || this.getContent();
    };
    Popover.prototype.getContent = function() {
        var $e = this.$element;
        var o = this.options;
        return $e.attr("data-content") || (typeof o.content == "function" ? o.content.call($e[0]) : o.content);
    };
    Popover.prototype.arrow = function() {
        return this.$arrow = this.$arrow || this.tip().find(".arrow");
    };
    Popover.prototype.tip = function() {
        if (!this.$tip) this.$tip = $(this.options.template);
        return this.$tip;
    };
    var old = $.fn.popover;
    $.fn.popover = function(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data("bs.popover");
            var options = typeof option == "object" && option;
            if (!data) $this.data("bs.popover", data = new Popover(this, options));
            if (typeof option == "string") data[option]();
        });
    };
    $.fn.popover.Constructor = Popover;
    $.fn.popover.noConflict = function() {
        $.fn.popover = old;
        return this;
    };
}(window.jQuery);

+function($) {
    "use strict";
    function ScrollSpy(element, options) {
        var href;
        var process = $.proxy(this.process, this);
        this.$element = $(element).is("body") ? $(window) : $(element);
        this.$body = $("body");
        this.$scrollElement = this.$element.on("scroll.bs.scroll-spy.data-api", process);
        this.options = $.extend({}, ScrollSpy.DEFAULTS, options);
        this.selector = (this.options.target || (href = $(element).attr("href")) && href.replace(/.*(?=#[^\s]+$)/, "") || "") + " .nav li > a";
        this.offsets = $([]);
        this.targets = $([]);
        this.activeTarget = null;
        this.refresh();
        this.process();
    }
    ScrollSpy.DEFAULTS = {
        offset: 10
    };
    ScrollSpy.prototype.refresh = function() {
        var offsetMethod = this.$element[0] == window ? "offset" : "position";
        this.offsets = $([]);
        this.targets = $([]);
        var self = this;
        var $targets = this.$body.find(this.selector).map(function() {
            var $el = $(this);
            var href = $el.data("target") || $el.attr("href");
            var $href = /^#\w/.test(href) && $(href);
            return $href && $href.length && [ [ $href[offsetMethod]().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href ] ] || null;
        }).sort(function(a, b) {
            return a[0] - b[0];
        }).each(function() {
            self.offsets.push(this[0]);
            self.targets.push(this[1]);
        });
    };
    ScrollSpy.prototype.process = function() {
        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset;
        var scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight;
        var maxScroll = scrollHeight - this.$scrollElement.height();
        var offsets = this.offsets;
        var targets = this.targets;
        var activeTarget = this.activeTarget;
        var i;
        if (scrollTop >= maxScroll) {
            return activeTarget != (i = targets.last()[0]) && this.activate(i);
        }
        for (i = offsets.length; i--; ) {
            activeTarget != targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1]) && this.activate(targets[i]);
        }
    };
    ScrollSpy.prototype.activate = function(target) {
        this.activeTarget = target;
        $(this.selector).parents(".active").removeClass("active");
        var selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]';
        var active = $(selector).parents("li").addClass("active");
        if (active.parent(".dropdown-menu").length) {
            active = active.closest("li.dropdown").addClass("active");
        }
        active.trigger("activate");
    };
    var old = $.fn.scrollspy;
    $.fn.scrollspy = function(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data("bs.scrollspy");
            var options = typeof option == "object" && option;
            if (!data) $this.data("bs.scrollspy", data = new ScrollSpy(this, options));
            if (typeof option == "string") data[option]();
        });
    };
    $.fn.scrollspy.Constructor = ScrollSpy;
    $.fn.scrollspy.noConflict = function() {
        $.fn.scrollspy = old;
        return this;
    };
    $(window).on("load", function() {
        $('[data-spy="scroll"]').each(function() {
            var $spy = $(this);
            $spy.scrollspy($spy.data());
        });
    });
}(window.jQuery);

+function($) {
    "use strict";
    var Tab = function(element) {
        this.element = $(element);
    };
    Tab.prototype.show = function() {
        var $this = this.element;
        var $ul = $this.closest("ul:not(.dropdown-menu)");
        var selector = $this.attr("data-target");
        if (!selector) {
            selector = $this.attr("href");
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, "");
        }
        if ($this.parent("li").hasClass("active")) return;
        var previous = $ul.find(".active:last a")[0];
        var e = $.Event("show.bs.tab", {
            relatedTarget: previous
        });
        $this.trigger(e);
        if (e.isDefaultPrevented()) return;
        var $target = $(selector);
        this.activate($this.parent("li"), $ul);
        this.activate($target, $target.parent(), function() {
            $this.trigger({
                type: "shown.bs.tab",
                relatedTarget: previous
            });
        });
    };
    Tab.prototype.activate = function(element, container, callback) {
        var $active = container.find("> .active");
        var transition = callback && $.support.transition && $active.hasClass("fade");
        function next() {
            $active.removeClass("active").find("> .dropdown-menu > .active").removeClass("active");
            element.addClass("active");
            if (transition) {
                element[0].offsetWidth;
                element.addClass("in");
            } else {
                element.removeClass("fade");
            }
            if (element.parent(".dropdown-menu")) {
                element.closest("li.dropdown").addClass("active");
            }
            callback && callback();
        }
        transition ? $active.one($.support.transition.end, next).emulateTransitionEnd(150) : next();
        $active.removeClass("in");
    };
    var old = $.fn.tab;
    $.fn.tab = function(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data("bs.tab");
            if (!data) $this.data("bs.tab", data = new Tab(this));
            if (typeof option == "string") data[option]();
        });
    };
    $.fn.tab.Constructor = Tab;
    $.fn.tab.noConflict = function() {
        $.fn.tab = old;
        return this;
    };
    $(document).on("click.bs.tab.data-api", '[data-toggle="tab"], [data-toggle="pill"]', function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
}(window.jQuery);

+function($) {
    "use strict";
    var Affix = function(element, options) {
        this.options = $.extend({}, Affix.DEFAULTS, options);
        this.$window = $(window).on("scroll.bs.affix.data-api", $.proxy(this.checkPosition, this)).on("click.bs.affix.data-api", $.proxy(this.checkPositionWithEventLoop, this));
        this.$element = $(element);
        this.affixed = this.unpin = null;
        this.checkPosition();
    };
    Affix.RESET = "affix affix-top affix-bottom";
    Affix.DEFAULTS = {
        offset: 0
    };
    Affix.prototype.checkPositionWithEventLoop = function() {
        setTimeout($.proxy(this.checkPosition, this), 1);
    };
    Affix.prototype.checkPosition = function() {
        if (!this.$element.is(":visible")) return;
        var scrollHeight = $(document).height();
        var scrollTop = this.$window.scrollTop();
        var position = this.$element.offset();
        var offset = this.options.offset;
        var offsetTop = offset.top;
        var offsetBottom = offset.bottom;
        if (typeof offset != "object") offsetBottom = offsetTop = offset;
        if (typeof offsetTop == "function") offsetTop = offset.top();
        if (typeof offsetBottom == "function") offsetBottom = offset.bottom();
        var affix = this.unpin != null && scrollTop + this.unpin <= position.top ? false : offsetBottom != null && position.top + this.$element.height() >= scrollHeight - offsetBottom ? "bottom" : offsetTop != null && scrollTop <= offsetTop ? "top" : false;
        if (this.affixed === affix) return;
        if (this.unpin) this.$element.css("top", "");
        this.affixed = affix;
        this.unpin = affix == "bottom" ? position.top - scrollTop : null;
        this.$element.removeClass(Affix.RESET).addClass("affix" + (affix ? "-" + affix : ""));
        if (affix == "bottom") {
            this.$element.offset({
                top: document.body.offsetHeight - offsetBottom - this.$element.height()
            });
        }
    };
    var old = $.fn.affix;
    $.fn.affix = function(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data("bs.affix");
            var options = typeof option == "object" && option;
            if (!data) $this.data("bs.affix", data = new Affix(this, options));
            if (typeof option == "string") data[option]();
        });
    };
    $.fn.affix.Constructor = Affix;
    $.fn.affix.noConflict = function() {
        $.fn.affix = old;
        return this;
    };
    $(window).on("load", function() {
        $('[data-spy="affix"]').each(function() {
            var $spy = $(this);
            var data = $spy.data();
            data.offset = data.offset || {};
            if (data.offsetBottom) data.offset.bottom = data.offsetBottom;
            if (data.offsetTop) data.offset.top = data.offsetTop;
            $spy.affix(data);
        });
    });
}(window.jQuery);

(function() {
    (function(q) {
        var y = this || (0, eval)("this"), w = y.document, K = y.navigator, u = y.jQuery, B = y.JSON;
        (function(q) {
            "function" === typeof require && "object" === typeof exports && "object" === typeof module ? q(module.exports || exports) : "function" === typeof define && define.amd ? define([ "exports" ], q) : q(y.ko = {});
        })(function(F) {
            function G(a, c) {
                return null === a || typeof a in N ? a === c : !1;
            }
            function H(b, c, d, e) {
                a.d[b] = {
                    init: function(b) {
                        a.a.f.set(b, L, {});
                        return {
                            controlsDescendantBindings: !0
                        };
                    },
                    update: function(b, h, k, m, f) {
                        k = a.a.f.get(b, L);
                        h = a.a.c(h());
                        m = !d !== !h;
                        var p = !k.ob;
                        if (p || c || m !== k.Db) p && (k.ob = a.a.Ya(a.e.childNodes(b), !0)), m ? (p || a.e.S(b, a.a.Ya(k.ob)), 
                        a.Ta(e ? e(f, h) : f, b)) : a.e.Z(b), k.Db = m;
                    }
                };
                a.g.Y[b] = !1;
                a.e.P[b] = !0;
            }
            var a = "undefined" !== typeof F ? F : {};
            a.b = function(b, c) {
                for (var d = b.split("."), e = a, g = 0; g < d.length - 1; g++) e = e[d[g]];
                e[d[d.length - 1]] = c;
            };
            a.s = function(a, c, d) {
                a[c] = d;
            };
            a.version = "3.0.0rc";
            a.b("version", a.version);
            a.a = function() {
                function b(a, b) {
                    for (var f in a) a.hasOwnProperty(f) && b(f, a[f]);
                }
                function c(k, b) {
                    if ("input" !== a.a.v(k) || !k.type || "click" != b.toLowerCase()) return !1;
                    var f = k.type;
                    return "checkbox" == f || "radio" == f;
                }
                var d = {}, e = {};
                d[K && /Firefox\/2/i.test(K.userAgent) ? "KeyboardEvent" : "UIEvents"] = [ "keyup", "keydown", "keypress" ];
                d.MouseEvents = "click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave".split(" ");
                b(d, function(a, b) {
                    if (b.length) for (var f = 0, c = b.length; f < c; f++) e[b[f]] = a;
                });
                var g = {
                    propertychange: !0
                }, h = w && function() {
                    for (var a = 3, b = w.createElement("div"), f = b.getElementsByTagName("i"); b.innerHTML = "<!--[if gt IE " + ++a + "]><i></i><![endif]-->", 
                    f[0]; ) ;
                    return 4 < a ? a : q;
                }();
                return {
                    $a: [ "authenticity_token", /^__RequestVerificationToken(_.*)?$/ ],
                    n: function(a, b) {
                        for (var f = 0, c = a.length; f < c; f++) b(a[f]);
                    },
                    l: function(a, b) {
                        if ("function" == typeof Array.prototype.indexOf) return Array.prototype.indexOf.call(a, b);
                        for (var f = 0, c = a.length; f < c; f++) if (a[f] === b) return f;
                        return -1;
                    },
                    Ua: function(a, b, f) {
                        for (var c = 0, d = a.length; c < d; c++) if (b.call(f, a[c])) return a[c];
                        return null;
                    },
                    ia: function(b, c) {
                        var f = a.a.l(b, c);
                        0 <= f && b.splice(f, 1);
                    },
                    Va: function(b) {
                        b = b || [];
                        for (var c = [], f = 0, d = b.length; f < d; f++) 0 > a.a.l(c, b[f]) && c.push(b[f]);
                        return c;
                    },
                    ha: function(a, b) {
                        a = a || [];
                        for (var f = [], c = 0, d = a.length; c < d; c++) f.push(b(a[c]));
                        return f;
                    },
                    ga: function(a, b) {
                        a = a || [];
                        for (var f = [], c = 0, d = a.length; c < d; c++) b(a[c]) && f.push(a[c]);
                        return f;
                    },
                    X: function(a, b) {
                        if (b instanceof Array) a.push.apply(a, b); else for (var f = 0, c = b.length; f < c; f++) a.push(b[f]);
                        return a;
                    },
                    V: function(b, c, f) {
                        var d = a.a.l(a.a.Ha(b), c);
                        0 > d ? f && b.push(c) : f || b.splice(d, 1);
                    },
                    extend: function(a, b) {
                        if (b) for (var f in b) b.hasOwnProperty(f) && (a[f] = b[f]);
                        return a;
                    },
                    L: b,
                    Da: function(a, b) {
                        if (!a) return a;
                        var f = {}, c;
                        for (c in a) a.hasOwnProperty(c) && (f[c] = b(a[c], c, a));
                        return f;
                    },
                    wa: function(b) {
                        for (;b.firstChild; ) a.removeNode(b.firstChild);
                    },
                    Vb: function(b) {
                        b = a.a.Q(b);
                        for (var c = w.createElement("div"), f = 0, d = b.length; f < d; f++) c.appendChild(a.M(b[f]));
                        return c;
                    },
                    Ya: function(b, c) {
                        for (var f = 0, d = b.length, e = []; f < d; f++) {
                            var h = b[f].cloneNode(!0);
                            e.push(c ? a.M(h) : h);
                        }
                        return e;
                    },
                    S: function(b, c) {
                        a.a.wa(b);
                        if (c) for (var f = 0, d = c.length; f < d; f++) b.appendChild(c[f]);
                    },
                    nb: function(b, c) {
                        var f = b.nodeType ? [ b ] : b;
                        if (0 < f.length) {
                            for (var d = f[0], e = d.parentNode, h = 0, n = c.length; h < n; h++) e.insertBefore(c[h], d);
                            h = 0;
                            for (n = f.length; h < n; h++) a.removeNode(f[h]);
                        }
                    },
                    $: function(a, b) {
                        if (a.length) {
                            for (b = 8 === b.nodeType && b.parentNode || b; a.length && a[0].parentNode !== b; ) a.splice(0, 1);
                            if (1 < a.length) {
                                var f = a[0], c = a[a.length - 1];
                                for (a.length = 0; f !== c; ) if (a.push(f), f = f.nextSibling, !f) return;
                                a.push(c);
                            }
                        }
                        return a;
                    },
                    qb: function(a, b) {
                        7 > h ? a.setAttribute("selected", b) : a.selected = b;
                    },
                    la: function(a) {
                        return null === a || a === q ? "" : a.trim ? a.trim() : a.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
                    },
                    ec: function(b, c) {
                        for (var f = [], d = (b || "").split(c), e = 0, h = d.length; e < h; e++) {
                            var n = a.a.la(d[e]);
                            "" !== n && f.push(n);
                        }
                        return f;
                    },
                    ac: function(a, b) {
                        a = a || "";
                        return b.length > a.length ? !1 : a.substring(0, b.length) === b;
                    },
                    Gb: function(a, b) {
                        if (a === b) return !0;
                        if (b.contains) return b.contains(3 === a.nodeType ? a.parentNode : a);
                        if (b.compareDocumentPosition) return 16 == (b.compareDocumentPosition(a) & 16);
                        for (;a && a != b; ) a = a.parentNode;
                        return !!a;
                    },
                    va: function(b) {
                        return a.a.Gb(b, b.ownerDocument.documentElement);
                    },
                    Ra: function(b) {
                        return !!a.a.Ua(b, a.a.va);
                    },
                    v: function(a) {
                        return a && a.tagName && a.tagName.toLowerCase();
                    },
                    r: function(b, d, f) {
                        var e = h && g[d];
                        if (e || "undefined" == typeof u) if (e || "function" != typeof b.addEventListener) if ("undefined" != typeof b.attachEvent) {
                            var s = function(a) {
                                f.call(b, a);
                            }, l = "on" + d;
                            b.attachEvent(l, s);
                            a.a.C.ea(b, function() {
                                b.detachEvent(l, s);
                            });
                        } else throw Error("Browser doesn't support addEventListener or attachEvent"); else b.addEventListener(d, f, !1); else {
                            if (c(b, d)) {
                                var n = f;
                                f = function(a, b) {
                                    var f = this.checked;
                                    b && (this.checked = !0 !== b.Ab);
                                    n.call(this, a);
                                    this.checked = f;
                                };
                            }
                            u(b).bind(d, f);
                        }
                    },
                    da: function(a, b) {
                        if (!a || !a.nodeType) throw Error("element must be a DOM node when calling triggerEvent");
                        if ("undefined" != typeof u) {
                            var f = [];
                            c(a, b) && f.push({
                                Ab: a.checked
                            });
                            u(a).trigger(b, f);
                        } else if ("function" == typeof w.createEvent) if ("function" == typeof a.dispatchEvent) f = w.createEvent(e[b] || "HTMLEvents"), 
                        f.initEvent(b, !0, !0, y, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, a), a.dispatchEvent(f); else throw Error("The supplied element doesn't support dispatchEvent"); else if ("undefined" != typeof a.fireEvent) c(a, b) && (a.checked = !0 !== a.checked), 
                        a.fireEvent("on" + b); else throw Error("Browser doesn't support triggering events");
                    },
                    c: function(b) {
                        return a.J(b) ? b() : b;
                    },
                    Ha: function(b) {
                        return a.J(b) ? b.t() : b;
                    },
                    ma: function(b, c, f) {
                        if (c) {
                            var d = /\S+/g, e = b.className.match(d) || [];
                            a.a.n(c.match(d), function(b) {
                                a.a.V(e, b, f);
                            });
                            b.className = e.join(" ");
                        }
                    },
                    Ma: function(b, c) {
                        var f = a.a.c(c);
                        if (null === f || f === q) f = "";
                        var d = a.e.firstChild(b);
                        !d || 3 != d.nodeType || a.e.nextSibling(d) ? a.e.S(b, [ w.createTextNode(f) ]) : d.data = f;
                        a.a.Jb(b);
                    },
                    pb: function(a, b) {
                        a.name = b;
                        if (7 >= h) try {
                            a.mergeAttributes(w.createElement("<input name='" + a.name + "'/>"), !1);
                        } catch (f) {}
                    },
                    Jb: function(a) {
                        9 <= h && (a = 1 == a.nodeType ? a : a.parentNode, a.style && (a.style.zoom = a.style.zoom));
                    },
                    Hb: function(a) {
                        if (h) {
                            var b = a.style.width;
                            a.style.width = 0;
                            a.style.width = b;
                        }
                    },
                    Zb: function(b, c) {
                        b = a.a.c(b);
                        c = a.a.c(c);
                        for (var f = [], d = b; d <= c; d++) f.push(d);
                        return f;
                    },
                    Q: function(a) {
                        for (var b = [], c = 0, d = a.length; c < d; c++) b.push(a[c]);
                        return b;
                    },
                    cc: 6 === h,
                    dc: 7 === h,
                    ja: h,
                    ab: function(b, c) {
                        for (var f = a.a.Q(b.getElementsByTagName("input")).concat(a.a.Q(b.getElementsByTagName("textarea"))), d = "string" == typeof c ? function(a) {
                            return a.name === c;
                        } : function(a) {
                            return c.test(a.name);
                        }, e = [], h = f.length - 1; 0 <= h; h--) d(f[h]) && e.push(f[h]);
                        return e;
                    },
                    Wb: function(b) {
                        return "string" == typeof b && (b = a.a.la(b)) ? B && B.parse ? B.parse(b) : new Function("return " + b)() : null;
                    },
                    Na: function(b, c, f) {
                        if (!B || !B.stringify) throw Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
                        return B.stringify(a.a.c(b), c, f);
                    },
                    Xb: function(c, d, f) {
                        f = f || {};
                        var e = f.params || {}, h = f.includeFields || this.$a, g = c;
                        if ("object" == typeof c && "form" === a.a.v(c)) for (var g = c.action, n = h.length - 1; 0 <= n; n--) for (var r = a.a.ab(c, h[n]), v = r.length - 1; 0 <= v; v--) e[r[v].name] = r[v].value;
                        d = a.a.c(d);
                        var t = w.createElement("form");
                        t.style.display = "none";
                        t.action = g;
                        t.method = "post";
                        for (var E in d) c = w.createElement("input"), c.name = E, c.value = a.a.Na(a.a.c(d[E])), 
                        t.appendChild(c);
                        b(e, function(a, b) {
                            var c = w.createElement("input");
                            c.name = a;
                            c.value = b;
                            t.appendChild(c);
                        });
                        w.body.appendChild(t);
                        f.submitter ? f.submitter(t) : t.submit();
                        setTimeout(function() {
                            t.parentNode.removeChild(t);
                        }, 0);
                    }
                };
            }();
            a.b("utils", a.a);
            a.b("utils.arrayForEach", a.a.n);
            a.b("utils.arrayFirst", a.a.Ua);
            a.b("utils.arrayFilter", a.a.ga);
            a.b("utils.arrayGetDistinctValues", a.a.Va);
            a.b("utils.arrayIndexOf", a.a.l);
            a.b("utils.arrayMap", a.a.ha);
            a.b("utils.arrayPushAll", a.a.X);
            a.b("utils.arrayRemoveItem", a.a.ia);
            a.b("utils.extend", a.a.extend);
            a.b("utils.fieldsIncludedWithJsonPost", a.a.$a);
            a.b("utils.getFormFields", a.a.ab);
            a.b("utils.peekObservable", a.a.Ha);
            a.b("utils.postJson", a.a.Xb);
            a.b("utils.parseJson", a.a.Wb);
            a.b("utils.registerEventHandler", a.a.r);
            a.b("utils.stringifyJson", a.a.Na);
            a.b("utils.range", a.a.Zb);
            a.b("utils.toggleDomNodeCssClass", a.a.ma);
            a.b("utils.triggerEvent", a.a.da);
            a.b("utils.unwrapObservable", a.a.c);
            a.b("utils.objectForEach", a.a.L);
            a.b("utils.addOrRemoveItem", a.a.V);
            a.b("unwrap", a.a.c);
            Function.prototype.bind || (Function.prototype.bind = function(a) {
                var c = this, d = Array.prototype.slice.call(arguments);
                a = d.shift();
                return function() {
                    return c.apply(a, d.concat(Array.prototype.slice.call(arguments)));
                };
            });
            a.a.f = new function() {
                function a(b, h) {
                    var k = b[d];
                    if (!k || "null" === k || !e[k]) {
                        if (!h) return q;
                        k = b[d] = "ko" + c++;
                        e[k] = {};
                    }
                    return e[k];
                }
                var c = 0, d = "__ko__" + new Date().getTime(), e = {};
                return {
                    get: function(c, d) {
                        var e = a(c, !1);
                        return e === q ? q : e[d];
                    },
                    set: function(c, d, e) {
                        if (e !== q || a(c, !1) !== q) a(c, !0)[d] = e;
                    },
                    clear: function(a) {
                        var b = a[d];
                        return b ? (delete e[b], a[d] = null, !0) : !1;
                    },
                    D: function() {
                        return c++ + d;
                    }
                };
            }();
            a.b("utils.domData", a.a.f);
            a.b("utils.domData.clear", a.a.f.clear);
            a.a.C = new function() {
                function b(b, c) {
                    var e = a.a.f.get(b, d);
                    e === q && c && (e = [], a.a.f.set(b, d, e));
                    return e;
                }
                function c(d) {
                    var e = b(d, !1);
                    if (e) for (var e = e.slice(0), m = 0; m < e.length; m++) e[m](d);
                    a.a.f.clear(d);
                    "function" == typeof u && "function" == typeof u.cleanData && u.cleanData([ d ]);
                    if (g[d.nodeType]) for (e = d.firstChild; d = e; ) e = d.nextSibling, 8 === d.nodeType && c(d);
                }
                var d = a.a.f.D(), e = {
                    1: !0,
                    8: !0,
                    9: !0
                }, g = {
                    1: !0,
                    9: !0
                };
                return {
                    ea: function(a, c) {
                        if ("function" != typeof c) throw Error("Callback must be a function");
                        b(a, !0).push(c);
                    },
                    mb: function(c, e) {
                        var m = b(c, !1);
                        m && (a.a.ia(m, e), 0 == m.length && a.a.f.set(c, d, q));
                    },
                    M: function(b) {
                        if (e[b.nodeType] && (c(b), g[b.nodeType])) {
                            var d = [];
                            a.a.X(d, b.getElementsByTagName("*"));
                            for (var m = 0, f = d.length; m < f; m++) c(d[m]);
                        }
                        return b;
                    },
                    removeNode: function(b) {
                        a.M(b);
                        b.parentNode && b.parentNode.removeChild(b);
                    }
                };
            }();
            a.M = a.a.C.M;
            a.removeNode = a.a.C.removeNode;
            a.b("cleanNode", a.M);
            a.b("removeNode", a.removeNode);
            a.b("utils.domNodeDisposal", a.a.C);
            a.b("utils.domNodeDisposal.addDisposeCallback", a.a.C.ea);
            a.b("utils.domNodeDisposal.removeDisposeCallback", a.a.C.mb);
            (function() {
                a.a.Fa = function(b) {
                    var c;
                    if ("undefined" != typeof u) if (u.parseHTML) c = u.parseHTML(b) || []; else {
                        if ((c = u.clean([ b ])) && c[0]) {
                            for (b = c[0]; b.parentNode && 11 !== b.parentNode.nodeType; ) b = b.parentNode;
                            b.parentNode && b.parentNode.removeChild(b);
                        }
                    } else {
                        var d = a.a.la(b).toLowerCase();
                        c = w.createElement("div");
                        d = d.match(/^<(thead|tbody|tfoot)/) && [ 1, "<table>", "</table>" ] || !d.indexOf("<tr") && [ 2, "<table><tbody>", "</tbody></table>" ] || (!d.indexOf("<td") || !d.indexOf("<th")) && [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ] || [ 0, "", "" ];
                        b = "ignored<div>" + d[1] + b + d[2] + "</div>";
                        for ("function" == typeof y.innerShiv ? c.appendChild(y.innerShiv(b)) : c.innerHTML = b; d[0]--; ) c = c.lastChild;
                        c = a.a.Q(c.lastChild.childNodes);
                    }
                    return c;
                };
                a.a.Ka = function(b, c) {
                    a.a.wa(b);
                    c = a.a.c(c);
                    if (null !== c && c !== q) if ("string" != typeof c && (c = c.toString()), "undefined" != typeof u) u(b).html(c); else for (var d = a.a.Fa(c), e = 0; e < d.length; e++) b.appendChild(d[e]);
                };
            })();
            a.b("utils.parseHtmlFragment", a.a.Fa);
            a.b("utils.setHtml", a.a.Ka);
            a.u = function() {
                function b(c, e) {
                    if (c) if (8 == c.nodeType) {
                        var g = a.u.jb(c.nodeValue);
                        null != g && e.push({
                            Fb: c,
                            Tb: g
                        });
                    } else if (1 == c.nodeType) for (var g = 0, h = c.childNodes, k = h.length; g < k; g++) b(h[g], e);
                }
                var c = {};
                return {
                    Ca: function(a) {
                        if ("function" != typeof a) throw Error("You can only pass a function to ko.memoization.memoize()");
                        var b = (4294967296 * (1 + Math.random()) | 0).toString(16).substring(1) + (4294967296 * (1 + Math.random()) | 0).toString(16).substring(1);
                        c[b] = a;
                        return "<!--[ko_memo:" + b + "]-->";
                    },
                    ub: function(a, b) {
                        var g = c[a];
                        if (g === q) throw Error("Couldn't find any memo with ID " + a + ". Perhaps it's already been unmemoized.");
                        try {
                            return g.apply(null, b || []), !0;
                        } finally {
                            delete c[a];
                        }
                    },
                    vb: function(c, e) {
                        var g = [];
                        b(c, g);
                        for (var h = 0, k = g.length; h < k; h++) {
                            var m = g[h].Fb, f = [ m ];
                            e && a.a.X(f, e);
                            a.u.ub(g[h].Tb, f);
                            m.nodeValue = "";
                            m.parentNode && m.parentNode.removeChild(m);
                        }
                    },
                    jb: function(a) {
                        return (a = a.match(/^\[ko_memo\:(.*?)\]$/)) ? a[1] : null;
                    }
                };
            }();
            a.b("memoization", a.u);
            a.b("memoization.memoize", a.u.Ca);
            a.b("memoization.unmemoize", a.u.ub);
            a.b("memoization.parseMemoText", a.u.jb);
            a.b("memoization.unmemoizeDomNodeAndDescendants", a.u.vb);
            a.xa = {
                throttle: function(b, c) {
                    b.throttleEvaluation = c;
                    var d = null;
                    return a.h({
                        read: b,
                        write: function(a) {
                            clearTimeout(d);
                            d = setTimeout(function() {
                                b(a);
                            }, c);
                        }
                    });
                },
                notify: function(a, c) {
                    a.equalityComparer = "always" == c ? null : G;
                }
            };
            var N = {
                undefined: 1,
                "boolean": 1,
                number: 1,
                string: 1
            };
            a.b("extenders", a.xa);
            a.sb = function(b, c, d) {
                this.target = b;
                this.qa = c;
                this.Eb = d;
                a.s(this, "dispose", this.B);
            };
            a.sb.prototype.B = function() {
                this.Qb = !0;
                this.Eb();
            };
            a.ca = function() {
                this.F = {};
                a.a.extend(this, a.ca.fn);
                a.s(this, "subscribe", this.T);
                a.s(this, "extend", this.extend);
                a.s(this, "getSubscriptionsCount", this.Lb);
            };
            var I = "change";
            a.ca.fn = {
                T: function(b, c, d) {
                    d = d || I;
                    var e = new a.sb(this, c ? b.bind(c) : b, function() {
                        a.a.ia(this.F[d], e);
                    }.bind(this));
                    this.F[d] || (this.F[d] = []);
                    this.F[d].push(e);
                    return e;
                },
                notifySubscribers: function(b, c) {
                    c = c || I;
                    if (this.cb(c)) try {
                        a.i.Wa();
                        for (var d = this.F[c].slice(0), e = 0, g; g = d[e]; ++e) g && !0 !== g.Qb && g.qa(b);
                    } finally {
                        a.i.end();
                    }
                },
                cb: function(a) {
                    return this.F[a] && this.F[a].length;
                },
                Lb: function() {
                    var b = 0;
                    a.a.L(this.F, function(a, d) {
                        b += d.length;
                    });
                    return b;
                },
                extend: function(b) {
                    var c = this;
                    b && a.a.L(b, function(b, e) {
                        var g = a.xa[b];
                        "function" == typeof g && (c = g(c, e) || c);
                    });
                    return c;
                }
            };
            a.fb = function(a) {
                return null != a && "function" == typeof a.T && "function" == typeof a.notifySubscribers;
            };
            a.b("subscribable", a.ca);
            a.b("isSubscribable", a.fb);
            a.i = function() {
                var b = [];
                return {
                    Wa: function(a) {
                        b.push(a && {
                            qa: a,
                            Za: []
                        });
                    },
                    end: function() {
                        b.pop();
                    },
                    lb: function(c) {
                        if (!a.fb(c)) throw Error("Only subscribable things can act as dependencies");
                        if (0 < b.length) {
                            var d = b[b.length - 1];
                            !d || 0 <= a.a.l(d.Za, c) || (d.Za.push(c), d.qa(c));
                        }
                    },
                    p: function(a, d, e) {
                        try {
                            return b.push(null), a.apply(d, e || []);
                        } finally {
                            b.pop();
                        }
                    }
                };
            }();
            a.q = function(b) {
                function c() {
                    if (0 < arguments.length) return c.equalityComparer && c.equalityComparer(d, arguments[0]) || (c.O(), 
                    d = arguments[0], c.N()), this;
                    a.i.lb(c);
                    return d;
                }
                var d = b;
                a.ca.call(c);
                c.t = function() {
                    return d;
                };
                c.N = function() {
                    c.notifySubscribers(d);
                };
                c.O = function() {
                    c.notifySubscribers(d, "beforeChange");
                };
                a.a.extend(c, a.q.fn);
                a.s(c, "peek", c.t);
                a.s(c, "valueHasMutated", c.N);
                a.s(c, "valueWillMutate", c.O);
                return c;
            };
            a.q.fn = {
                equalityComparer: G
            };
            var C = a.q.Yb = "__ko_proto__";
            a.q.fn[C] = a.q;
            a.ya = function(b, c) {
                return null === b || b === q || b[C] === q ? !1 : b[C] === c ? !0 : a.ya(b[C], c);
            };
            a.J = function(b) {
                return a.ya(b, a.q);
            };
            a.gb = function(b) {
                return "function" == typeof b && b[C] === a.q || "function" == typeof b && b[C] === a.h && b.Nb ? !0 : !1;
            };
            a.b("observable", a.q);
            a.b("isObservable", a.J);
            a.b("isWriteableObservable", a.gb);
            a.ba = function(b) {
                b = b || [];
                if ("object" != typeof b || !("length" in b)) throw Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");
                b = a.q(b);
                a.a.extend(b, a.ba.fn);
                return b.extend({
                    trackArrayChanges: !0
                });
            };
            a.ba.fn = {
                remove: function(b) {
                    for (var c = this.t(), d = [], e = "function" != typeof b || a.J(b) ? function(a) {
                        return a === b;
                    } : b, g = 0; g < c.length; g++) {
                        var h = c[g];
                        e(h) && (0 === d.length && this.O(), d.push(h), c.splice(g, 1), g--);
                    }
                    d.length && this.N();
                    return d;
                },
                removeAll: function(b) {
                    if (b === q) {
                        var c = this.t(), d = c.slice(0);
                        this.O();
                        c.splice(0, c.length);
                        this.N();
                        return d;
                    }
                    return b ? this.remove(function(c) {
                        return 0 <= a.a.l(b, c);
                    }) : [];
                },
                destroy: function(b) {
                    var c = this.t(), d = "function" != typeof b || a.J(b) ? function(a) {
                        return a === b;
                    } : b;
                    this.O();
                    for (var e = c.length - 1; 0 <= e; e--) d(c[e]) && (c[e]._destroy = !0);
                    this.N();
                },
                destroyAll: function(b) {
                    return b === q ? this.destroy(function() {
                        return !0;
                    }) : b ? this.destroy(function(c) {
                        return 0 <= a.a.l(b, c);
                    }) : [];
                },
                indexOf: function(b) {
                    var c = this();
                    return a.a.l(c, b);
                },
                replace: function(a, c) {
                    var d = this.indexOf(a);
                    0 <= d && (this.O(), this.t()[d] = c, this.N());
                }
            };
            a.a.n("pop push reverse shift sort splice unshift".split(" "), function(b) {
                a.ba.fn[b] = function() {
                    var a = this.t();
                    this.O();
                    this.Xa(a, b, arguments);
                    a = a[b].apply(a, arguments);
                    this.N();
                    return a;
                };
            });
            a.a.n([ "slice" ], function(b) {
                a.ba.fn[b] = function() {
                    var a = this();
                    return a[b].apply(a, arguments);
                };
            });
            a.b("observableArray", a.ba);
            var J = "arrayChange";
            a.xa.trackArrayChanges = function(b) {
                function c() {
                    if (!d) {
                        d = !0;
                        var c = b.notifySubscribers;
                        b.notifySubscribers = function(a, b) {
                            b && b !== I || ++g;
                            return c.apply(this, arguments);
                        };
                        var m = [].concat(b.t() || []);
                        e = null;
                        b.T(function(c) {
                            c = [].concat(c || []);
                            if (b.cb(J)) {
                                if (!e || 1 < g) e = a.a.ra(m, c, {
                                    sparse: !0
                                });
                                b.notifySubscribers(e, J);
                            }
                            m = c;
                            e = null;
                            g = 0;
                        });
                    }
                }
                if (!b.Xa) {
                    var d = !1, e = null, g = 0, h = b.T;
                    b.T = b.subscribe = function(a, b, f) {
                        f === J && c();
                        return h.apply(this, arguments);
                    };
                    b.Xa = function(a, b, c) {
                        function h(a, b, c) {
                            s.push({
                                status: a,
                                value: b,
                                index: c
                            });
                        }
                        if (d && !g) {
                            var s = [], l = a.length, n = c.length, r = 0;
                            switch (b) {
                              case "push":
                                r = l;

                              case "unshift":
                                for (b = 0; b < n; b++) h("added", c[b], r + b);
                                break;

                              case "pop":
                                r = l - 1;

                              case "shift":
                                l && h("deleted", a[r], r);
                                break;

                              case "splice":
                                b = Math.min(Math.max(0, 0 > c[0] ? l + c[0] : c[0]), l);
                                for (var l = 1 === n ? l : Math.min(b + (c[1] || 0), l), n = b + n - 2, r = Math.max(l, n), v = 2; b < r; ++b, 
                                ++v) b < l && h("deleted", a[b], b), b < n && h("added", c[v], b);
                                break;

                              default:
                                return;
                            }
                            e = s;
                        }
                    };
                }
            };
            a.h = function(b, c, d) {
                function e() {
                    a.a.n(z, function(a) {
                        a.B();
                    });
                    z = [];
                }
                function g() {
                    var a = k.throttleEvaluation;
                    a && 0 <= a ? (clearTimeout(x), x = setTimeout(h, a)) : h();
                }
                function h() {
                    if (!s) {
                        if (E && E()) {
                            if (!l) {
                                D();
                                p = !0;
                                return;
                            }
                        } else l = !1;
                        s = !0;
                        try {
                            var b = a.a.ha(z, function(a) {
                                return a.target;
                            });
                            a.i.Wa(function(c) {
                                var d;
                                0 <= (d = a.a.l(b, c)) ? b[d] = q : z.push(c.T(g));
                            });
                            for (var d = c ? n.call(c) : n(), e = b.length - 1; 0 <= e; e--) b[e] && z.splice(e, 1)[0].B();
                            p = !0;
                            k.equalityComparer && k.equalityComparer(f, d) || (k.notifySubscribers(f, "beforeChange"), 
                            f = d, k.notifySubscribers(f));
                        } finally {
                            a.i.end(), s = !1;
                        }
                        z.length || D();
                    }
                }
                function k() {
                    if (0 < arguments.length) {
                        if ("function" === typeof r) r.apply(c, arguments); else throw Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");
                        return this;
                    }
                    p || h();
                    a.i.lb(k);
                    return f;
                }
                function m() {
                    return !p || 0 < z.length;
                }
                var f, p = !1, s = !1, l = !1, n = b;
                n && "object" == typeof n ? (d = n, n = d.read) : (d = d || {}, n || (n = d.read));
                if ("function" != typeof n) throw Error("Pass a function that returns the value of the ko.computed");
                var r = d.write, v = d.disposeWhenNodeIsRemoved || d.I || null, t = d.disposeWhen || d.ua, E = t, D = e, z = [], x = null;
                c || (c = d.owner);
                k.t = function() {
                    p || h();
                    return f;
                };
                k.Kb = function() {
                    return z.length;
                };
                k.Nb = "function" === typeof d.write;
                k.B = function() {
                    D();
                };
                k.aa = m;
                a.ca.call(k);
                a.a.extend(k, a.h.fn);
                a.s(k, "peek", k.t);
                a.s(k, "dispose", k.B);
                a.s(k, "isActive", k.aa);
                a.s(k, "getDependenciesCount", k.Kb);
                v && (l = !0, v.nodeType && (E = function() {
                    return !a.a.va(v) || t && t();
                }));
                !0 !== d.deferEvaluation && h();
                v && m() && (D = function() {
                    a.a.C.mb(v, D);
                    e();
                }, a.a.C.ea(v, D));
                return k;
            };
            a.Pb = function(b) {
                return a.ya(b, a.h);
            };
            F = a.q.Yb;
            a.h[F] = a.q;
            a.h.fn = {
                equalityComparer: G
            };
            a.h.fn[F] = a.h;
            a.b("dependentObservable", a.h);
            a.b("computed", a.h);
            a.b("isComputed", a.Pb);
            (function() {
                function b(a, g, h) {
                    h = h || new d();
                    a = g(a);
                    if ("object" != typeof a || null === a || a === q || a instanceof Date || a instanceof String || a instanceof Number || a instanceof Boolean) return a;
                    var k = a instanceof Array ? [] : {};
                    h.save(a, k);
                    c(a, function(c) {
                        var d = g(a[c]);
                        switch (typeof d) {
                          case "boolean":
                          case "number":
                          case "string":
                          case "function":
                            k[c] = d;
                            break;

                          case "object":
                          case "undefined":
                            var p = h.get(d);
                            k[c] = p !== q ? p : b(d, g, h);
                        }
                    });
                    return k;
                }
                function c(b, c) {
                    if (b instanceof Array) {
                        for (var d = 0; d < b.length; d++) c(d);
                        "function" == typeof b.toJSON && c("toJSON");
                    } else for (d in b) ("toJSON" === d || "function" !== typeof b[d] || a.J(b[d])) && c(d);
                }
                function d() {
                    this.keys = [];
                    this.Qa = [];
                }
                a.tb = function(c) {
                    if (0 == arguments.length) throw Error("When calling ko.toJS, pass the object you want to convert.");
                    return b(c, function(b) {
                        for (var c = 0; a.J(b) && 10 > c; c++) b = b();
                        return b;
                    });
                };
                a.toJSON = function(b, c, d) {
                    b = a.tb(b);
                    return a.a.Na(b, c, d);
                };
                d.prototype = {
                    save: function(b, c) {
                        var d = a.a.l(this.keys, b);
                        0 <= d ? this.Qa[d] = c : (this.keys.push(b), this.Qa.push(c));
                    },
                    get: function(b) {
                        b = a.a.l(this.keys, b);
                        return 0 <= b ? this.Qa[b] : q;
                    }
                };
            })();
            a.b("toJS", a.tb);
            a.b("toJSON", a.toJSON);
            (function() {
                a.k = {
                    o: function(b) {
                        switch (a.a.v(b)) {
                          case "option":
                            return !0 === b.__ko__hasDomDataOptionValue__ ? a.a.f.get(b, a.d.options.Ea) : 7 >= a.a.ja ? b.getAttributeNode("value") && b.getAttributeNode("value").specified ? b.value : b.text : b.value;

                          case "select":
                            return 0 <= b.selectedIndex ? a.k.o(b.options[b.selectedIndex]) : q;

                          default:
                            return b.value;
                        }
                    },
                    na: function(b, c) {
                        switch (a.a.v(b)) {
                          case "option":
                            switch (typeof c) {
                              case "string":
                                a.a.f.set(b, a.d.options.Ea, q);
                                "__ko__hasDomDataOptionValue__" in b && delete b.__ko__hasDomDataOptionValue__;
                                b.value = c;
                                break;

                              default:
                                a.a.f.set(b, a.d.options.Ea, c), b.__ko__hasDomDataOptionValue__ = !0, b.value = "number" === typeof c ? c : "";
                            }
                            break;

                          case "select":
                            "" === c && (c = q);
                            if (null === c || c === q) b.selectedIndex = -1;
                            for (var d = b.options.length - 1; 0 <= d; d--) if (a.k.o(b.options[d]) == c) {
                                b.selectedIndex = d;
                                break;
                            }
                            1 < b.size || -1 !== b.selectedIndex || (b.selectedIndex = 0);
                            break;

                          default:
                            if (null === c || c === q) c = "";
                            b.value = c;
                        }
                    }
                };
            })();
            a.b("selectExtensions", a.k);
            a.b("selectExtensions.readValue", a.k.o);
            a.b("selectExtensions.writeValue", a.k.na);
            a.g = function() {
                function b(b) {
                    b = a.a.la(b);
                    123 === b.charCodeAt(0) && (b = b.slice(1, -1));
                    var c = [], d = b.match(e), k, l, n = 0;
                    if (d) {
                        d.push(",");
                        for (var r = 0, v; v = d[r]; ++r) {
                            var t = v.charCodeAt(0);
                            if (44 === t) {
                                if (0 >= n) {
                                    k && c.push(l ? {
                                        key: k,
                                        value: l.join("")
                                    } : {
                                        unknown: k
                                    });
                                    k = l = n = 0;
                                    continue;
                                }
                            } else if (58 === t) {
                                if (!l) continue;
                            } else if (47 === t && r && 1 < v.length) (t = d[r - 1].match(g)) && !h[t[0]] && (b = b.substr(b.indexOf(v) + 1), 
                            d = b.match(e), d.push(","), r = -1, v = "/"); else if (40 === t || 123 === t || 91 === t) ++n; else if (41 === t || 125 === t || 93 === t) --n; else if (!k && !l) {
                                k = 34 === t || 39 === t ? v.slice(1, -1) : v;
                                continue;
                            }
                            l ? l.push(v) : l = [ v ];
                        }
                    }
                    return c;
                }
                var c = [ "true", "false", "null", "undefined" ], d = /^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i, e = RegExp("\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*'|/(?:[^/\\\\]|\\\\.)*/w*|[^\\s:,/][^,\"'{}()/:[\\]]*[^\\s,\"'{}()/:[\\]]|[^\\s]", "g"), g = /[\])"'A-Za-z0-9_$]+$/, h = {
                    "in": 1,
                    "return": 1,
                    "typeof": 1
                }, k = {};
                return {
                    Y: [],
                    U: k,
                    Ga: b,
                    ka: function(e, f) {
                        function g(b, f) {
                            var e, r = a.getBindingHandler(b);
                            if (r && r.preprocess ? f = r.preprocess(f, b, g) : 1) {
                                if (r = k[b]) e = f, 0 <= a.a.l(c, e) ? e = !1 : (r = e.match(d), e = null === r ? !1 : r[1] ? "Object(" + r[1] + ")" + r[2] : e), 
                                r = e;
                                r && l.push("'" + b + "':function(_z){" + e + "=_z}");
                                n && (f = "function(){return " + f + " }");
                                h.push("'" + b + "':" + f);
                            }
                        }
                        f = f || {};
                        var h = [], l = [], n = f.valueAccessors, r = "string" === typeof e ? b(e) : e;
                        a.a.n(r, function(a) {
                            g(a.key || a.unknown, a.value);
                        });
                        l.length && g("_ko_property_writers", "{" + l.join(",") + "}");
                        return h.join(",");
                    },
                    Sb: function(a, b) {
                        for (var c = 0; c < a.length; c++) if (a[c].key == b) return !0;
                        return !1;
                    },
                    oa: function(b, c, d, e, k) {
                        if (b && a.J(b)) !a.gb(b) || k && b.t() === e || b(e); else if ((b = c.get("_ko_property_writers")) && b[d]) b[d](e);
                    }
                };
            }();
            a.b("expressionRewriting", a.g);
            a.b("expressionRewriting.bindingRewriteValidators", a.g.Y);
            a.b("expressionRewriting.parseObjectLiteral", a.g.Ga);
            a.b("expressionRewriting.preProcessBindings", a.g.ka);
            a.b("expressionRewriting._twoWayBindings", a.g.U);
            a.b("jsonExpressionRewriting", a.g);
            a.b("jsonExpressionRewriting.insertPropertyAccessorsIntoJson", a.g.ka);
            (function() {
                function b(a) {
                    return 8 == a.nodeType && h.test(g ? a.text : a.nodeValue);
                }
                function c(a) {
                    return 8 == a.nodeType && k.test(g ? a.text : a.nodeValue);
                }
                function d(a, d) {
                    for (var e = a, k = 1, n = []; e = e.nextSibling; ) {
                        if (c(e) && (k--, 0 === k)) return n;
                        n.push(e);
                        b(e) && k++;
                    }
                    if (!d) throw Error("Cannot find closing comment tag to match: " + a.nodeValue);
                    return null;
                }
                function e(a, b) {
                    var c = d(a, b);
                    return c ? 0 < c.length ? c[c.length - 1].nextSibling : a.nextSibling : null;
                }
                var g = w && "<!--test-->" === w.createComment("test").text, h = g ? /^\x3c!--\s*ko(?:\s+([\s\S]+))?\s*--\x3e$/ : /^\s*ko(?:\s+([\s\S]+))?\s*$/, k = g ? /^\x3c!--\s*\/ko\s*--\x3e$/ : /^\s*\/ko\s*$/, m = {
                    ul: !0,
                    ol: !0
                };
                a.e = {
                    P: {},
                    childNodes: function(a) {
                        return b(a) ? d(a) : a.childNodes;
                    },
                    Z: function(c) {
                        if (b(c)) {
                            c = a.e.childNodes(c);
                            for (var d = 0, e = c.length; d < e; d++) a.removeNode(c[d]);
                        } else a.a.wa(c);
                    },
                    S: function(c, d) {
                        if (b(c)) {
                            a.e.Z(c);
                            for (var e = c.nextSibling, k = 0, n = d.length; k < n; k++) e.parentNode.insertBefore(d[k], e);
                        } else a.a.S(c, d);
                    },
                    kb: function(a, c) {
                        b(a) ? a.parentNode.insertBefore(c, a.nextSibling) : a.firstChild ? a.insertBefore(c, a.firstChild) : a.appendChild(c);
                    },
                    eb: function(c, d, e) {
                        e ? b(c) ? c.parentNode.insertBefore(d, e.nextSibling) : e.nextSibling ? c.insertBefore(d, e.nextSibling) : c.appendChild(d) : a.e.kb(c, d);
                    },
                    firstChild: function(a) {
                        return b(a) ? !a.nextSibling || c(a.nextSibling) ? null : a.nextSibling : a.firstChild;
                    },
                    nextSibling: function(a) {
                        b(a) && (a = e(a));
                        return a.nextSibling && c(a.nextSibling) ? null : a.nextSibling;
                    },
                    Mb: b,
                    bc: function(a) {
                        return (a = (g ? a.text : a.nodeValue).match(h)) ? a[1] : null;
                    },
                    ib: function(d) {
                        if (m[a.a.v(d)]) {
                            var k = d.firstChild;
                            if (k) {
                                do if (1 === k.nodeType) {
                                    var g;
                                    g = k.firstChild;
                                    var h = null;
                                    if (g) {
                                        do if (h) h.push(g); else if (b(g)) {
                                            var n = e(g, !0);
                                            n ? g = n : h = [ g ];
                                        } else c(g) && (h = [ g ]); while (g = g.nextSibling);
                                    }
                                    if (g = h) for (h = k.nextSibling, n = 0; n < g.length; n++) h ? d.insertBefore(g[n], h) : d.appendChild(g[n]);
                                } while (k = k.nextSibling);
                            }
                        }
                    }
                };
            })();
            a.b("virtualElements", a.e);
            a.b("virtualElements.allowedBindings", a.e.P);
            a.b("virtualElements.emptyNode", a.e.Z);
            a.b("virtualElements.insertAfter", a.e.eb);
            a.b("virtualElements.prepend", a.e.kb);
            a.b("virtualElements.setDomNodeChildren", a.e.S);
            (function() {
                a.H = function() {
                    this.zb = {};
                };
                a.a.extend(a.H.prototype, {
                    nodeHasBindings: function(b) {
                        switch (b.nodeType) {
                          case 1:
                            return null != b.getAttribute("data-bind");

                          case 8:
                            return a.e.Mb(b);

                          default:
                            return !1;
                        }
                    },
                    getBindings: function(a, c) {
                        var d = this.getBindingsString(a, c);
                        return d ? this.parseBindingsString(d, c, a) : null;
                    },
                    getBindingAccessors: function(a, c) {
                        var d = this.getBindingsString(a, c);
                        return d ? this.parseBindingsString(d, c, a, {
                            valueAccessors: !0
                        }) : null;
                    },
                    getBindingsString: function(b) {
                        switch (b.nodeType) {
                          case 1:
                            return b.getAttribute("data-bind");

                          case 8:
                            return a.e.bc(b);

                          default:
                            return null;
                        }
                    },
                    parseBindingsString: function(b, c, d, e) {
                        try {
                            var g = this.zb, h = b + (e && e.valueAccessors || ""), k;
                            if (!(k = g[h])) {
                                var m, f = "with($context){with($data||{}){return{" + a.g.ka(b, e) + "}}}";
                                m = new Function("$context", "$element", f);
                                k = g[h] = m;
                            }
                            return k(c, d);
                        } catch (p) {
                            throw p.message = "Unable to parse bindings.\nBindings value: " + b + "\nMessage: " + p.message, 
                            p;
                        }
                    }
                });
                a.H.instance = new a.H();
            })();
            a.b("bindingProvider", a.H);
            (function() {
                function b(a) {
                    return function() {
                        return a;
                    };
                }
                function c(a) {
                    return a();
                }
                function d(b) {
                    return a.a.Da(a.i.p(b), function(a, c) {
                        return function() {
                            return b()[c];
                        };
                    });
                }
                function e(a, b) {
                    return d(this.getBindings.bind(this, a, b));
                }
                function g(b, c, d) {
                    var f, e = a.e.firstChild(c), k = a.H.instance, g = k.preprocessNode;
                    if (g) {
                        for (;f = e; ) e = a.e.nextSibling(f), g.call(k, f);
                        e = a.e.firstChild(c);
                    }
                    for (;f = e; ) e = a.e.nextSibling(f), h(b, f, d);
                }
                function h(b, c, d) {
                    var f = !0, e = 1 === c.nodeType;
                    e && a.e.ib(c);
                    if (e && d || a.H.instance.nodeHasBindings(c)) f = m(c, null, b, d).shouldBindDescendants;
                    f && !p[a.a.v(c)] && g(b, c, !e);
                }
                function k(b) {
                    var c = [], d = {}, f = [];
                    a.a.L(b, function D(e) {
                        if (!d[e]) {
                            var k = a.getBindingHandler(e);
                            k && (k.after && (f.push(e), a.a.n(k.after, function(c) {
                                if (b[c]) {
                                    if (-1 !== a.a.l(f, c)) throw Error("Cannot combine the following bindings, because they have a cyclic dependency: " + f.join(", "));
                                    D(c);
                                }
                            }), f.pop()), c.push({
                                key: e,
                                bb: k
                            }));
                            d[e] = !0;
                        }
                    });
                    return c;
                }
                function m(b, d, f, g) {
                    var h = a.a.f.get(b, s);
                    if (!d) {
                        if (h) throw Error("You cannot apply bindings multiple times to the same element.");
                        a.a.f.set(b, s, !0);
                    }
                    !h && g && a.rb(b, f);
                    var m;
                    if (d && "function" !== typeof d) m = d; else {
                        var p = a.H.instance, l = p.getBindingAccessors || e;
                        if (d || f.A) {
                            var A = a.h(function() {
                                (m = d ? d(f, b) : l.call(p, b, f)) && f.A && f.A();
                                return m;
                            }, null, {
                                I: b
                            });
                            m && A.aa() || (A = null);
                        } else m = a.i.p(l, p, [ b, f ]);
                    }
                    var u;
                    if (m) {
                        var w = A ? function(a) {
                            return function() {
                                return c(A()[a]);
                            };
                        } : function(a) {
                            return m[a];
                        }, y = function() {
                            return a.a.Da(A ? A() : m, c);
                        };
                        y.get = function(a) {
                            return m[a] && c(w(a));
                        };
                        y.has = function(a) {
                            return a in m;
                        };
                        g = k(m);
                        a.a.n(g, function(c) {
                            var d = c.bb.init, e = c.bb.update, k = c.key;
                            if (8 === b.nodeType && !a.e.P[k]) throw Error("The binding '" + k + "' cannot be used with virtual elements");
                            try {
                                "function" == typeof d && a.i.p(function() {
                                    var a = d(b, w(k), y, f.$data, f);
                                    if (a && a.controlsDescendantBindings) {
                                        if (u !== q) throw Error("Multiple bindings (" + u + " and " + k + ") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element.");
                                        u = k;
                                    }
                                }), "function" == typeof e && a.h(function() {
                                    e(b, w(k), y, f.$data, f);
                                }, null, {
                                    I: b
                                });
                            } catch (g) {
                                throw g.message = 'Unable to process binding "' + k + ": " + m[k] + '"\nMessage: ' + g.message, 
                                g;
                            }
                        });
                    }
                    return {
                        shouldBindDescendants: u === q
                    };
                }
                function f(b) {
                    return b && b instanceof a.G ? b : new a.G(b);
                }
                a.d = {};
                var p = {
                    script: !0
                };
                a.getBindingHandler = function(b) {
                    return a.d[b];
                };
                a.G = function(b, c, d, f) {
                    var e = this, k = "function" == typeof b, g, h = a.h(function() {
                        var g = k ? b() : b;
                        c ? (c.A && c.A(), a.a.extend(e, c), h && (e.A = h)) : (e.$parents = [], e.$root = g, 
                        e.ko = a);
                        e.$rawData = b;
                        e.$data = g;
                        d && (e[d] = g);
                        f && f(e, c, g);
                        return e.$data;
                    }, null, {
                        ua: function() {
                            return g && !a.a.Ra(g);
                        },
                        I: !0
                    });
                    h.aa() && (e.A = h, h.equalityComparer = null, g = [], h.wb = function(b) {
                        g.push(b);
                        a.a.C.ea(b, function(b) {
                            a.a.ia(g, b);
                            g.length || (h.B(), e.A = h = q);
                        });
                    });
                };
                a.G.prototype.createChildContext = function(b, c, d) {
                    return new a.G(b, this, c, function(a, b) {
                        a.$parentContext = b;
                        a.$parent = b.$data;
                        a.$parents = (b.$parents || []).slice(0);
                        a.$parents.unshift(a.$parent);
                        d && d(a);
                    });
                };
                a.G.prototype.extend = function(b) {
                    return new a.G(this.$rawData, this, null, function(c) {
                        a.a.extend(c, "function" == typeof b ? b() : b);
                    });
                };
                var s = a.a.f.D(), l = a.a.f.D();
                a.rb = function(b, c) {
                    if (2 == arguments.length) a.a.f.set(b, l, c), c.A && c.A.wb(b); else return a.a.f.get(b, l);
                };
                a.pa = function(b, c, d) {
                    1 === b.nodeType && a.e.ib(b);
                    return m(b, c, f(d), !0);
                };
                a.xb = function(c, e, k) {
                    k = f(k);
                    return a.pa(c, "function" === typeof e ? d(e.bind(null, k, c)) : a.a.Da(e, b), k);
                };
                a.Ta = function(a, b) {
                    1 !== b.nodeType && 8 !== b.nodeType || g(f(a), b, !0);
                };
                a.Sa = function(a, b) {
                    if (b && 1 !== b.nodeType && 8 !== b.nodeType) throw Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node");
                    b = b || y.document.body;
                    h(f(a), b, !0);
                };
                a.ta = function(b) {
                    switch (b.nodeType) {
                      case 1:
                      case 8:
                        var c = a.rb(b);
                        if (c) return c;
                        if (b.parentNode) return a.ta(b.parentNode);
                    }
                    return q;
                };
                a.Cb = function(b) {
                    return (b = a.ta(b)) ? b.$data : q;
                };
                a.b("bindingHandlers", a.d);
                a.b("applyBindings", a.Sa);
                a.b("applyBindingsToDescendants", a.Ta);
                a.b("applyBindingAccessorsToNode", a.pa);
                a.b("applyBindingsToNode", a.xb);
                a.b("contextFor", a.ta);
                a.b("dataFor", a.Cb);
            })();
            var M = {
                "class": "className",
                "for": "htmlFor"
            };
            a.d.attr = {
                update: function(b, c) {
                    var d = a.a.c(c()) || {};
                    a.a.L(d, function(c, d) {
                        d = a.a.c(d);
                        var h = !1 === d || null === d || d === q;
                        h && b.removeAttribute(c);
                        8 >= a.a.ja && c in M ? (c = M[c], h ? b.removeAttribute(c) : b[c] = d) : h || b.setAttribute(c, d.toString());
                        "name" === c && a.a.pb(b, h ? "" : d.toString());
                    });
                }
            };
            (function() {
                a.d.checked = {
                    after: [ "value", "attr" ],
                    init: function(b, c, d) {
                        function e() {
                            return d.has("checkedValue") ? a.a.c(d.get("checkedValue")) : b.value;
                        }
                        function g() {
                            var k = b.checked, g = s ? e() : k;
                            if (l && (!m || k)) {
                                var h = a.i.p(c);
                                f ? p !== g ? (k && (a.a.V(h, g, !0), a.a.V(h, p, !1)), p = g) : a.a.V(h, g, k) : a.g.oa(h, d, "checked", g, !0);
                            }
                        }
                        function h() {
                            var d = a.a.c(c());
                            b.checked = f ? 0 <= a.a.l(d, e()) : k ? d : e() === d;
                        }
                        var k = "checkbox" == b.type, m = "radio" == b.type;
                        if (k || m) {
                            var f = k && a.a.c(c()) instanceof Array, p = f ? e() : q, s = m || f, l = !1;
                            m && !b.name && a.d.uniqueName.init(b, function() {
                                return !0;
                            });
                            a.h(g, null, {
                                I: b
                            });
                            a.a.r(b, "click", g);
                            a.h(h, null, {
                                I: b
                            });
                            l = !0;
                        }
                    }
                };
                a.g.U.checked = !0;
                a.d.checkedValue = {
                    update: function(b, c) {
                        b.value = a.a.c(c());
                    }
                };
            })();
            a.d.css = {
                update: function(b, c) {
                    var d = a.a.c(c());
                    "object" == typeof d ? a.a.L(d, function(c, d) {
                        d = a.a.c(d);
                        a.a.ma(b, c, d);
                    }) : (d = String(d || ""), a.a.ma(b, b.__ko__cssValue, !1), b.__ko__cssValue = d, 
                    a.a.ma(b, d, !0));
                }
            };
            a.d.enable = {
                update: function(b, c) {
                    var d = a.a.c(c());
                    d && b.disabled ? b.removeAttribute("disabled") : d || b.disabled || (b.disabled = !0);
                }
            };
            a.d.disable = {
                update: function(b, c) {
                    a.d.enable.update(b, function() {
                        return !a.a.c(c());
                    });
                }
            };
            a.d.event = {
                init: function(b, c, d, e, g) {
                    var h = c() || {};
                    a.a.L(h, function(k) {
                        "string" == typeof k && a.a.r(b, k, function(b) {
                            var f, h = c()[k];
                            if (h) {
                                try {
                                    var s = a.a.Q(arguments);
                                    e = g.$data;
                                    s.unshift(e);
                                    f = h.apply(e, s);
                                } finally {
                                    !0 !== f && (b.preventDefault ? b.preventDefault() : b.returnValue = !1);
                                }
                                !1 === d.get(k + "Bubble") && (b.cancelBubble = !0, b.stopPropagation && b.stopPropagation());
                            }
                        });
                    });
                }
            };
            a.d.foreach = {
                hb: function(b) {
                    return function() {
                        var c = b(), d = a.a.Ha(c);
                        if (!d || "number" == typeof d.length) return {
                            foreach: c,
                            templateEngine: a.K.Aa
                        };
                        a.a.c(c);
                        return {
                            foreach: d.data,
                            as: d.as,
                            includeDestroyed: d.includeDestroyed,
                            afterAdd: d.afterAdd,
                            beforeRemove: d.beforeRemove,
                            afterRender: d.afterRender,
                            beforeMove: d.beforeMove,
                            afterMove: d.afterMove,
                            templateEngine: a.K.Aa
                        };
                    };
                },
                init: function(b, c) {
                    return a.d.template.init(b, a.d.foreach.hb(c));
                },
                update: function(b, c, d, e, g) {
                    return a.d.template.update(b, a.d.foreach.hb(c), d, e, g);
                }
            };
            a.g.Y.foreach = !1;
            a.e.P.foreach = !0;
            a.d.hasfocus = {
                init: function(b, c, d) {
                    function e(e) {
                        b.__ko_hasfocusUpdating = !0;
                        var g = b.ownerDocument;
                        if ("activeElement" in g) {
                            var f;
                            try {
                                f = g.activeElement;
                            } catch (h) {
                                f = g.body;
                            }
                            e = f === b;
                        }
                        g = c();
                        a.g.oa(g, d, "hasfocus", e, !0);
                        b.__ko_hasfocusLastValue = e;
                        b.__ko_hasfocusUpdating = !1;
                    }
                    var g = e.bind(null, !0), h = e.bind(null, !1);
                    a.a.r(b, "focus", g);
                    a.a.r(b, "focusin", g);
                    a.a.r(b, "blur", h);
                    a.a.r(b, "focusout", h);
                },
                update: function(b, c) {
                    var d = !!a.a.c(c());
                    b.__ko_hasfocusUpdating || b.__ko_hasfocusLastValue === d || (d ? b.focus() : b.blur(), 
                    a.i.p(a.a.da, null, [ b, d ? "focusin" : "focusout" ]));
                }
            };
            a.g.U.hasfocus = !0;
            a.d.hasFocus = a.d.hasfocus;
            a.g.U.hasFocus = !0;
            a.d.html = {
                init: function() {
                    return {
                        controlsDescendantBindings: !0
                    };
                },
                update: function(b, c) {
                    a.a.Ka(b, c());
                }
            };
            var L = a.a.f.D();
            H("if");
            H("ifnot", !1, !0);
            H("with", !0, !1, function(a, c) {
                return a.createChildContext(c);
            });
            a.d.options = {
                init: function(b) {
                    if ("select" !== a.a.v(b)) throw Error("options binding applies only to SELECT elements");
                    for (;0 < b.length; ) b.remove(0);
                    return {
                        controlsDescendantBindings: !0
                    };
                },
                update: function(b, c, d) {
                    function e() {
                        return b.selectedOptions || a.a.ga(b.options, function(a) {
                            return a.selected;
                        });
                    }
                    function g(a, b, c) {
                        var d = typeof b;
                        return "function" == d ? b(a) : "string" == d ? a[b] : c;
                    }
                    function h(c, d) {
                        if (p.length) {
                            var f = 0 <= a.a.l(p, a.k.o(d[0]));
                            a.a.qb(d[0], f);
                            l && !f && a.i.p(a.a.da, null, [ b, "change" ]);
                        }
                    }
                    var k = 0 != b.length && b.multiple ? b.scrollTop : null;
                    c = a.a.c(c());
                    var m = d.get("optionsIncludeDestroyed"), f = {}, p;
                    p = b.multiple ? a.a.ha(e(), a.k.o) : 0 <= b.selectedIndex ? [ a.k.o(b.options[b.selectedIndex]) ] : [];
                    if (c) {
                        "undefined" == typeof c.length && (c = [ c ]);
                        var s = a.a.ga(c, function(b) {
                            return m || b === q || null === b || !a.a.c(b._destroy);
                        });
                        d.has("optionsCaption") && (c = a.a.c(d.get("optionsCaption")), null !== c && c !== q && s.unshift(f));
                    } else c = [];
                    var l = !1;
                    c = h;
                    d.has("optionsAfterRender") && (c = function(b, c) {
                        h(0, c);
                        a.i.p(d.get("optionsAfterRender"), null, [ c[0], b !== f ? b : q ]);
                    });
                    a.a.Ja(b, s, function(b, c, e) {
                        e.length && (p = e[0].selected ? [ a.k.o(e[0]) ] : [], l = !0);
                        c = w.createElement("option");
                        b === f ? (a.a.Ma(c, d.get("optionsCaption")), a.k.na(c, q)) : (e = g(b, d.get("optionsValue"), b), 
                        a.k.na(c, a.a.c(e)), b = g(b, d.get("optionsText"), e), a.a.Ma(c, b));
                        return [ c ];
                    }, null, c);
                    (b.multiple ? p.length && e().length < p.length : p.length && 0 <= b.selectedIndex ? a.k.o(b.options[b.selectedIndex]) !== p[0] : p.length || 0 <= b.selectedIndex) && a.i.p(a.a.da, null, [ b, "change" ]);
                    a.a.Hb(b);
                    k && 20 < Math.abs(k - b.scrollTop) && (b.scrollTop = k);
                }
            };
            a.d.options.Ea = a.a.f.D();
            a.d.selectedOptions = {
                after: [ "options", "foreach" ],
                init: function(b, c, d) {
                    a.a.r(b, "change", function() {
                        var e = c(), g = [];
                        a.a.n(b.getElementsByTagName("option"), function(b) {
                            b.selected && g.push(a.k.o(b));
                        });
                        a.g.oa(e, d, "selectedOptions", g);
                    });
                },
                update: function(b, c) {
                    if ("select" != a.a.v(b)) throw Error("values binding applies only to SELECT elements");
                    var d = a.a.c(c());
                    d && "number" == typeof d.length && a.a.n(b.getElementsByTagName("option"), function(b) {
                        var c = 0 <= a.a.l(d, a.k.o(b));
                        a.a.qb(b, c);
                    });
                }
            };
            a.g.U.selectedOptions = !0;
            a.d.style = {
                update: function(b, c) {
                    var d = a.a.c(c() || {});
                    a.a.L(d, function(c, d) {
                        d = a.a.c(d);
                        b.style[c] = d || "";
                    });
                }
            };
            a.d.submit = {
                init: function(b, c, d, e, g) {
                    if ("function" != typeof c()) throw Error("The value for a submit binding must be a function");
                    a.a.r(b, "submit", function(a) {
                        var d, e = c();
                        try {
                            d = e.call(g.$data, b);
                        } finally {
                            !0 !== d && (a.preventDefault ? a.preventDefault() : a.returnValue = !1);
                        }
                    });
                }
            };
            a.d.text = {
                init: function() {
                    return {
                        controlsDescendantBindings: !0
                    };
                },
                update: function(b, c) {
                    a.a.Ma(b, c());
                }
            };
            a.e.P.text = !0;
            a.d.uniqueName = {
                init: function(b, c) {
                    if (c()) {
                        var d = "ko_unique_" + ++a.d.uniqueName.Bb;
                        a.a.pb(b, d);
                    }
                }
            };
            a.d.uniqueName.Bb = 0;
            a.d.value = {
                after: [ "options", "foreach" ],
                init: function(b, c, d) {
                    function e() {
                        k = !1;
                        var e = c(), f = a.k.o(b);
                        a.g.oa(e, d, "value", f);
                    }
                    var g = [ "change" ], h = d.get("valueUpdate"), k = !1;
                    h && ("string" == typeof h && (h = [ h ]), a.a.X(g, h), g = a.a.Va(g));
                    !a.a.ja || "input" != b.tagName.toLowerCase() || "text" != b.type || "off" == b.autocomplete || b.form && "off" == b.form.autocomplete || -1 != a.a.l(g, "propertychange") || (a.a.r(b, "propertychange", function() {
                        k = !0;
                    }), a.a.r(b, "blur", function() {
                        k && e();
                    }));
                    a.a.n(g, function(c) {
                        var d = e;
                        a.a.ac(c, "after") && (d = function() {
                            setTimeout(e, 0);
                        }, c = c.substring(5));
                        a.a.r(b, c, d);
                    });
                },
                update: function(b, c) {
                    var d = "select" === a.a.v(b), e = a.a.c(c()), g = a.k.o(b);
                    e !== g && (g = function() {
                        a.k.na(b, e);
                    }, g(), d && (e !== a.k.o(b) ? a.i.p(a.a.da, null, [ b, "change" ]) : setTimeout(g, 0)));
                }
            };
            a.g.U.value = !0;
            a.d.visible = {
                update: function(b, c) {
                    var d = a.a.c(c()), e = "none" != b.style.display;
                    d && !e ? b.style.display = "" : !d && e && (b.style.display = "none");
                }
            };
            (function(b) {
                a.d[b] = {
                    init: function(c, d, e, g, h) {
                        return a.d.event.init.call(this, c, function() {
                            var a = {};
                            a[b] = d();
                            return a;
                        }, e, g, h);
                    }
                };
            })("click");
            a.w = function() {};
            a.w.prototype.renderTemplateSource = function() {
                throw Error("Override renderTemplateSource");
            };
            a.w.prototype.createJavaScriptEvaluatorBlock = function() {
                throw Error("Override createJavaScriptEvaluatorBlock");
            };
            a.w.prototype.makeTemplateSource = function(b, c) {
                if ("string" == typeof b) {
                    c = c || w;
                    var d = c.getElementById(b);
                    if (!d) throw Error("Cannot find template with ID " + b);
                    return new a.m.j(d);
                }
                if (1 == b.nodeType || 8 == b.nodeType) return new a.m.W(b);
                throw Error("Unknown template type: " + b);
            };
            a.w.prototype.renderTemplate = function(a, c, d, e) {
                a = this.makeTemplateSource(a, e);
                return this.renderTemplateSource(a, c, d);
            };
            a.w.prototype.isTemplateRewritten = function(a, c) {
                return !1 === this.allowTemplateRewriting ? !0 : this.makeTemplateSource(a, c).data("isRewritten");
            };
            a.w.prototype.rewriteTemplate = function(a, c, d) {
                a = this.makeTemplateSource(a, d);
                c = c(a.text());
                a.text(c);
                a.data("isRewritten", !0);
            };
            a.b("templateEngine", a.w);
            a.Oa = function() {
                function b(b, c, d, k) {
                    b = a.g.Ga(b);
                    for (var m = a.g.Y, f = 0; f < b.length; f++) {
                        var p = b[f].key;
                        if (m.hasOwnProperty(p)) {
                            var s = m[p];
                            if ("function" === typeof s) {
                                if (p = s(b[f].value)) throw Error(p);
                            } else if (!s) throw Error("This template engine does not support the '" + p + "' binding within its templates");
                        }
                    }
                    d = "ko.__tr_ambtns(function($context,$element){return(function(){return{ " + a.g.ka(b, {
                        valueAccessors: !0
                    }) + " } })()},'" + d.toLowerCase() + "')";
                    return k.createJavaScriptEvaluatorBlock(d) + c;
                }
                var c = /(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi, d = /\x3c!--\s*ko\b\s*([\s\S]*?)\s*--\x3e/g;
                return {
                    Ib: function(b, c, d) {
                        c.isTemplateRewritten(b, d) || c.rewriteTemplate(b, function(b) {
                            return a.Oa.Ub(b, c);
                        }, d);
                    },
                    Ub: function(a, g) {
                        return a.replace(c, function(a, c, d, f, e) {
                            return b(e, c, d, g);
                        }).replace(d, function(a, c) {
                            return b(c, "<!-- ko -->", "#comment", g);
                        });
                    },
                    yb: function(b, c) {
                        return a.u.Ca(function(d, k) {
                            var m = d.nextSibling;
                            m && m.nodeName.toLowerCase() === c && a.pa(m, b, k);
                        });
                    }
                };
            }();
            a.b("__tr_ambtns", a.Oa.yb);
            (function() {
                a.m = {};
                a.m.j = function(a) {
                    this.j = a;
                };
                a.m.j.prototype.text = function() {
                    var b = a.a.v(this.j), b = "script" === b ? "text" : "textarea" === b ? "value" : "innerHTML";
                    if (0 == arguments.length) return this.j[b];
                    var c = arguments[0];
                    "innerHTML" === b ? a.a.Ka(this.j, c) : this.j[b] = c;
                };
                var b = a.a.f.D() + "_";
                a.m.j.prototype.data = function(c) {
                    if (1 === arguments.length) return a.a.f.get(this.j, b + c);
                    a.a.f.set(this.j, b + c, arguments[1]);
                };
                var c = a.a.f.D();
                a.m.W = function(a) {
                    this.j = a;
                };
                a.m.W.prototype = new a.m.j();
                a.m.W.prototype.text = function() {
                    if (0 == arguments.length) {
                        var b = a.a.f.get(this.j, c) || {};
                        b.Pa === q && b.sa && (b.Pa = b.sa.innerHTML);
                        return b.Pa;
                    }
                    a.a.f.set(this.j, c, {
                        Pa: arguments[0]
                    });
                };
                a.m.j.prototype.nodes = function() {
                    if (0 == arguments.length) return (a.a.f.get(this.j, c) || {}).sa;
                    a.a.f.set(this.j, c, {
                        sa: arguments[0]
                    });
                };
                a.b("templateSources", a.m);
                a.b("templateSources.domElement", a.m.j);
                a.b("templateSources.anonymousTemplate", a.m.W);
            })();
            (function() {
                function b(b, c, d) {
                    var e;
                    for (c = a.e.nextSibling(c); b && (e = b) !== c; ) b = a.e.nextSibling(e), d(e, b);
                }
                function c(c, d) {
                    if (c.length) {
                        var f = c[0], e = c[c.length - 1], g = f.parentNode, h = a.H.instance, n = h.preprocessNode;
                        if (n) {
                            b(f, e, function(a, b) {
                                var c = a.previousSibling, d = n.call(h, a);
                                d && (a === f && (f = d[0] || b), a === e && (e = d[d.length - 1] || c));
                            });
                            c.length = 0;
                            if (!f) return;
                            f === e ? c.push(f) : (c.push(f, e), a.a.$(c, g));
                        }
                        b(f, e, function(b) {
                            1 !== b.nodeType && 8 !== b.nodeType || a.Sa(d, b);
                        });
                        b(f, e, function(b) {
                            1 !== b.nodeType && 8 !== b.nodeType || a.u.vb(b, [ d ]);
                        });
                        a.a.$(c, g);
                    }
                }
                function d(a) {
                    return a.nodeType ? a : 0 < a.length ? a[0] : null;
                }
                function e(b, e, f, h, s) {
                    s = s || {};
                    var l = b && d(b), l = l && l.ownerDocument, n = s.templateEngine || g;
                    a.Oa.Ib(f, n, l);
                    f = n.renderTemplate(f, h, s, l);
                    if ("number" != typeof f.length || 0 < f.length && "number" != typeof f[0].nodeType) throw Error("Template engine must return an array of DOM nodes");
                    l = !1;
                    switch (e) {
                      case "replaceChildren":
                        a.e.S(b, f);
                        l = !0;
                        break;

                      case "replaceNode":
                        a.a.nb(b, f);
                        l = !0;
                        break;

                      case "ignoreTargetNode":
                        break;

                      default:
                        throw Error("Unknown renderMode: " + e);
                    }
                    l && (c(f, h), s.afterRender && a.i.p(s.afterRender, null, [ f, h.$data ]));
                    return f;
                }
                var g;
                a.La = function(b) {
                    if (b != q && !(b instanceof a.w)) throw Error("templateEngine must inherit from ko.templateEngine");
                    g = b;
                };
                a.Ia = function(b, c, f, h, s) {
                    f = f || {};
                    if ((f.templateEngine || g) == q) throw Error("Set a template engine before calling renderTemplate");
                    s = s || "replaceChildren";
                    if (h) {
                        var l = d(h);
                        return a.h(function() {
                            var g = c && c instanceof a.G ? c : new a.G(a.a.c(c)), r = "function" == typeof b ? b(g.$data, g) : b, g = e(h, s, r, g, f);
                            "replaceNode" == s && (h = g, l = d(h));
                        }, null, {
                            ua: function() {
                                return !l || !a.a.va(l);
                            },
                            I: l && "replaceNode" == s ? l.parentNode : l
                        });
                    }
                    return a.u.Ca(function(d) {
                        a.Ia(b, c, f, d, "replaceNode");
                    });
                };
                a.$b = function(b, d, f, g, h) {
                    function l(a, b) {
                        c(b, r);
                        f.afterRender && f.afterRender(b, a);
                    }
                    function n(a, c) {
                        r = h.createChildContext(a, f.as, function(a) {
                            a.$index = c;
                        });
                        var d = "function" == typeof b ? b(a, r) : b;
                        return e(null, "ignoreTargetNode", d, r, f);
                    }
                    var r;
                    return a.h(function() {
                        var b = a.a.c(d) || [];
                        "undefined" == typeof b.length && (b = [ b ]);
                        b = a.a.ga(b, function(b) {
                            return f.includeDestroyed || b === q || null === b || !a.a.c(b._destroy);
                        });
                        a.i.p(a.a.Ja, null, [ g, b, n, f, l ]);
                    }, null, {
                        I: g
                    });
                };
                var h = a.a.f.D();
                a.d.template = {
                    init: function(b, c) {
                        var d = a.a.c(c());
                        "string" == typeof d || d.name ? a.e.Z(b) : (d = a.e.childNodes(b), d = a.a.Vb(d), 
                        new a.m.W(b).nodes(d));
                        return {
                            controlsDescendantBindings: !0
                        };
                    },
                    update: function(b, c, d, e, g) {
                        c = a.a.c(c());
                        d = {};
                        e = !0;
                        var l, n = null;
                        "string" != typeof c && (d = c, c = a.a.c(d.name), "if" in d && (e = a.a.c(d["if"])), 
                        e && "ifnot" in d && (e = !a.a.c(d.ifnot)), l = a.a.c(d.data));
                        "foreach" in d ? n = a.$b(c || b, e && d.foreach || [], d, b, g) : e ? (g = "data" in d ? g.createChildContext(l, d.as) : g, 
                        n = a.Ia(c || b, g, d, b)) : a.e.Z(b);
                        g = n;
                        (l = a.a.f.get(b, h)) && "function" == typeof l.B && l.B();
                        a.a.f.set(b, h, g && g.aa() ? g : q);
                    }
                };
                a.g.Y.template = function(b) {
                    b = a.g.Ga(b);
                    return 1 == b.length && b[0].unknown || a.g.Sb(b, "name") ? null : "This template engine does not support anonymous templates nested within its templates";
                };
                a.e.P.template = !0;
            })();
            a.b("setTemplateEngine", a.La);
            a.b("renderTemplate", a.Ia);
            a.a.ra = function() {
                function a(b, d, e, g, h) {
                    var k = Math.min, m = Math.max, f = [], p, q = b.length, l, n = d.length, r = n - q || 1, v = q + n + 1, t, u, w;
                    for (p = 0; p <= q; p++) for (u = t, f.push(t = []), w = k(n, p + r), l = m(0, p - 1); l <= w; l++) t[l] = l ? p ? b[p - 1] === d[l - 1] ? u[l - 1] : k(u[l] || v, t[l - 1] || v) + 1 : l + 1 : p + 1;
                    k = [];
                    m = [];
                    r = [];
                    p = q;
                    for (l = n; p || l; ) n = f[p][l] - 1, l && n === f[p][l - 1] ? m.push(k[k.length] = {
                        status: e,
                        value: d[--l],
                        index: l
                    }) : p && n === f[p - 1][l] ? r.push(k[k.length] = {
                        status: g,
                        value: b[--p],
                        index: p
                    }) : (--l, --p, h.sparse || k.push({
                        status: "retained",
                        value: d[l]
                    }));
                    if (m.length && r.length) {
                        b = 10 * q;
                        var z;
                        for (d = e = 0; (h.dontLimitMoves || d < b) && (z = m[e]); e++) {
                            for (g = 0; f = r[g]; g++) if (z.value === f.value) {
                                z.moved = f.index;
                                f.moved = z.index;
                                r.splice(g, 1);
                                d = g = 0;
                                break;
                            }
                            d += g;
                        }
                    }
                    return k.reverse();
                }
                return function(c, d, e) {
                    e = "boolean" === typeof e ? {
                        dontLimitMoves: e
                    } : e || {};
                    c = c || [];
                    d = d || [];
                    return c.length <= d.length ? a(c, d, "added", "deleted", e) : a(d, c, "deleted", "added", e);
                };
            }();
            a.b("utils.compareArrays", a.a.ra);
            (function() {
                function b(b, c, g, h, k) {
                    var m = [], f = a.h(function() {
                        var f = c(g, k, a.a.$(m, b)) || [];
                        0 < m.length && (a.a.nb(m, f), h && a.i.p(h, null, [ g, f, k ]));
                        m.splice(0, m.length);
                        a.a.X(m, f);
                    }, null, {
                        I: b,
                        ua: function() {
                            return !a.a.Ra(m);
                        }
                    });
                    return {
                        R: m,
                        h: f.aa() ? f : q
                    };
                }
                var c = a.a.f.D();
                a.a.Ja = function(d, e, g, h, k) {
                    function m(b, c) {
                        x = s[c];
                        t !== c && (z[b] = x);
                        x.za(t++);
                        a.a.$(x.R, d);
                        r.push(x);
                        w.push(x);
                    }
                    function f(b, c) {
                        if (b) for (var d = 0, e = c.length; d < e; d++) c[d] && a.a.n(c[d].R, function(a) {
                            b(a, d, c[d].fa);
                        });
                    }
                    e = e || [];
                    h = h || {};
                    var p = a.a.f.get(d, c) === q, s = a.a.f.get(d, c) || [], l = a.a.ha(s, function(a) {
                        return a.fa;
                    }), n = a.a.ra(l, e, h.dontLimitMoves), r = [], v = 0, t = 0, u = [], w = [];
                    e = [];
                    for (var z = [], l = [], x, A = 0, y, B; y = n[A]; A++) switch (B = y.moved, y.status) {
                      case "deleted":
                        B === q && (x = s[v], x.h && x.h.B(), u.push.apply(u, a.a.$(x.R, d)), h.beforeRemove && (e[A] = x, 
                        w.push(x)));
                        v++;
                        break;

                      case "retained":
                        m(A, v++);
                        break;

                      case "added":
                        B !== q ? m(A, B) : (x = {
                            fa: y.value,
                            za: a.q(t++)
                        }, r.push(x), w.push(x), p || (l[A] = x));
                    }
                    f(h.beforeMove, z);
                    a.a.n(u, h.beforeRemove ? a.M : a.removeNode);
                    for (var A = 0, p = a.e.firstChild(d), C; x = w[A]; A++) {
                        x.R || a.a.extend(x, b(d, g, x.fa, k, x.za));
                        for (v = 0; n = x.R[v]; p = n.nextSibling, C = n, v++) n !== p && a.e.eb(d, n, C);
                        !x.Ob && k && (k(x.fa, x.R, x.za), x.Ob = !0);
                    }
                    f(h.beforeRemove, e);
                    f(h.afterMove, z);
                    f(h.afterAdd, l);
                    a.a.f.set(d, c, r);
                };
            })();
            a.b("utils.setDomNodeChildrenFromArrayMapping", a.a.Ja);
            a.K = function() {
                this.allowTemplateRewriting = !1;
            };
            a.K.prototype = new a.w();
            a.K.prototype.renderTemplateSource = function(b) {
                var c = (9 > a.a.ja ? 0 : b.nodes) ? b.nodes() : null;
                if (c) return a.a.Q(c.cloneNode(!0).childNodes);
                b = b.text();
                return a.a.Fa(b);
            };
            a.K.Aa = new a.K();
            a.La(a.K.Aa);
            a.b("nativeTemplateEngine", a.K);
            (function() {
                a.Ba = function() {
                    var a = this.Rb = function() {
                        if ("undefined" == typeof u || !u.tmpl) return 0;
                        try {
                            if (0 <= u.tmpl.tag.tmpl.open.toString().indexOf("__")) return 2;
                        } catch (a) {}
                        return 1;
                    }();
                    this.renderTemplateSource = function(b, e, g) {
                        g = g || {};
                        if (2 > a) throw Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");
                        var h = b.data("precompiled");
                        h || (h = b.text() || "", h = u.template(null, "{{ko_with $item.koBindingContext}}" + h + "{{/ko_with}}"), 
                        b.data("precompiled", h));
                        b = [ e.$data ];
                        e = u.extend({
                            koBindingContext: e
                        }, g.templateOptions);
                        e = u.tmpl(h, b, e);
                        e.appendTo(w.createElement("div"));
                        u.fragments = {};
                        return e;
                    };
                    this.createJavaScriptEvaluatorBlock = function(a) {
                        return "{{ko_code ((function() { return " + a + " })()) }}";
                    };
                    this.addTemplate = function(a, b) {
                        w.write("<script type='text/html' id='" + a + "'>" + b + "</script>");
                    };
                    0 < a && (u.tmpl.tag.ko_code = {
                        open: "__.push($1 || '');"
                    }, u.tmpl.tag.ko_with = {
                        open: "with($1) {",
                        close: "} "
                    });
                };
                a.Ba.prototype = new a.w();
                var b = new a.Ba();
                0 < b.Rb && a.La(b);
                a.b("jqueryTmplTemplateEngine", a.Ba);
            })();
        });
    })();
})();

(function(e) {
    "function" === typeof require && "object" === typeof exports && "object" === typeof module ? e(require("knockout"), exports) : "function" === typeof define && define.amd ? define([ "knockout", "exports" ], e) : e(ko, ko.mapping = {});
})(function(e, f) {
    function y(b, c) {
        var a, d;
        for (d in c) if (c.hasOwnProperty(d) && c[d]) if (a = f.getType(b[d]), d && b[d] && "array" !== a && "string" !== a) y(b[d], c[d]); else if ("array" === f.getType(b[d]) && "array" === f.getType(c[d])) {
            a = b;
            for (var e = d, l = b[d], n = c[d], t = {}, g = l.length - 1; 0 <= g; --g) t[l[g]] = l[g];
            for (g = n.length - 1; 0 <= g; --g) t[n[g]] = n[g];
            l = [];
            n = void 0;
            for (n in t) l.push(t[n]);
            a[e] = l;
        } else b[d] = c[d];
    }
    function E(b, c) {
        var a = {};
        y(a, b);
        y(a, c);
        return a;
    }
    function z(b, c) {
        for (var a = E({}, b), e = L.length - 1; 0 <= e; e--) {
            var f = L[e];
            a[f] && (a[""] instanceof Object || (a[""] = {}), a[""][f] = a[f], delete a[f]);
        }
        c && (a.ignore = h(c.ignore, a.ignore), a.include = h(c.include, a.include), a.copy = h(c.copy, a.copy), 
        a.observe = h(c.observe, a.observe));
        a.ignore = h(a.ignore, j.ignore);
        a.include = h(a.include, j.include);
        a.copy = h(a.copy, j.copy);
        a.observe = h(a.observe, j.observe);
        a.mappedProperties = a.mappedProperties || {};
        a.copiedProperties = a.copiedProperties || {};
        return a;
    }
    function h(b, c) {
        "array" !== f.getType(b) && (b = "undefined" === f.getType(b) ? [] : [ b ]);
        "array" !== f.getType(c) && (c = "undefined" === f.getType(c) ? [] : [ c ]);
        return e.utils.arrayGetDistinctValues(b.concat(c));
    }
    function F(b, c, a, d, k, l, n) {
        var t = "array" === f.getType(e.utils.unwrapObservable(c));
        l = l || "";
        if (f.isMapped(b)) {
            var g = e.utils.unwrapObservable(b)[p];
            a = E(g, a);
        }
        var j = n || k, h = function() {
            return a[d] && a[d].create instanceof Function;
        }, x = function(b) {
            var f = G, g = e.dependentObservable;
            e.dependentObservable = function(a, b, c) {
                c = c || {};
                a && "object" == typeof a && (c = a);
                var d = c.deferEvaluation, M = !1;
                c.deferEvaluation = !0;
                a = new H(a, b, c);
                if (!d) {
                    var g = a, d = e.dependentObservable;
                    e.dependentObservable = H;
                    a = e.isWriteableObservable(g);
                    e.dependentObservable = d;
                    d = H({
                        read: function() {
                            M || (e.utils.arrayRemoveItem(f, g), M = !0);
                            return g.apply(g, arguments);
                        },
                        write: a && function(a) {
                            return g(a);
                        },
                        deferEvaluation: !0
                    });
                    d.__DO = g;
                    a = d;
                    f.push(a);
                }
                return a;
            };
            e.dependentObservable.fn = H.fn;
            e.computed = e.dependentObservable;
            b = e.utils.unwrapObservable(k) instanceof Array ? a[d].create({
                data: b || c,
                parent: j,
                skip: N
            }) : a[d].create({
                data: b || c,
                parent: j
            });
            e.dependentObservable = g;
            e.computed = e.dependentObservable;
            return b;
        }, u = function() {
            return a[d] && a[d].update instanceof Function;
        }, v = function(b, f) {
            var g = {
                data: f || c,
                parent: j,
                target: e.utils.unwrapObservable(b)
            };
            e.isWriteableObservable(b) && (g.observable = b);
            return a[d].update(g);
        };
        if (n = I.get(c)) return n;
        d = d || "";
        if (t) {
            var t = [], s = !1, m = function(a) {
                return a;
            };
            a[d] && a[d].key && (m = a[d].key, s = !0);
            e.isObservable(b) || (b = e.observableArray([]), b.mappedRemove = function(a) {
                var c = "function" == typeof a ? a : function(b) {
                    return b === m(a);
                };
                return b.remove(function(a) {
                    return c(m(a));
                });
            }, b.mappedRemoveAll = function(a) {
                var c = C(a, m);
                return b.remove(function(a) {
                    return -1 != e.utils.arrayIndexOf(c, m(a));
                });
            }, b.mappedDestroy = function(a) {
                var c = "function" == typeof a ? a : function(b) {
                    return b === m(a);
                };
                return b.destroy(function(a) {
                    return c(m(a));
                });
            }, b.mappedDestroyAll = function(a) {
                var c = C(a, m);
                return b.destroy(function(a) {
                    return -1 != e.utils.arrayIndexOf(c, m(a));
                });
            }, b.mappedIndexOf = function(a) {
                var c = C(b(), m);
                a = m(a);
                return e.utils.arrayIndexOf(c, a);
            }, b.mappedGet = function(a) {
                return b()[b.mappedIndexOf(a)];
            }, b.mappedCreate = function(a) {
                if (-1 !== b.mappedIndexOf(a)) throw Error("There already is an object with the key that you specified.");
                var c = h() ? x(a) : a;
                u() && (a = v(c, a), e.isWriteableObservable(c) ? c(a) : c = a);
                b.push(c);
                return c;
            });
            n = C(e.utils.unwrapObservable(b), m).sort();
            g = C(c, m);
            s && g.sort();
            s = e.utils.compareArrays(n, g);
            n = {};
            var J, A = e.utils.unwrapObservable(c), y = {}, z = !0, g = 0;
            for (J = A.length; g < J; g++) {
                var r = m(A[g]);
                if (void 0 === r || r instanceof Object) {
                    z = !1;
                    break;
                }
                y[r] = A[g];
            }
            var A = [], B = 0, g = 0;
            for (J = s.length; g < J; g++) {
                var r = s[g], q, w = l + "[" + g + "]";
                switch (r.status) {
                  case "added":
                    var D = z ? y[r.value] : K(e.utils.unwrapObservable(c), r.value, m);
                    q = F(void 0, D, a, d, b, w, k);
                    h() || (q = e.utils.unwrapObservable(q));
                    w = O(e.utils.unwrapObservable(c), D, n);
                    q === N ? B++ : A[w - B] = q;
                    n[w] = !0;
                    break;

                  case "retained":
                    D = z ? y[r.value] : K(e.utils.unwrapObservable(c), r.value, m);
                    q = K(b, r.value, m);
                    F(q, D, a, d, b, w, k);
                    w = O(e.utils.unwrapObservable(c), D, n);
                    A[w] = q;
                    n[w] = !0;
                    break;

                  case "deleted":
                    q = K(b, r.value, m);
                }
                t.push({
                    event: r.status,
                    item: q
                });
            }
            b(A);
            a[d] && a[d].arrayChanged && e.utils.arrayForEach(t, function(b) {
                a[d].arrayChanged(b.event, b.item);
            });
        } else if (P(c)) {
            b = e.utils.unwrapObservable(b);
            if (!b) {
                if (h()) return s = x(), u() && (s = v(s)), s;
                if (u()) return v(s);
                b = {};
            }
            u() && (b = v(b));
            I.save(c, b);
            if (u()) return b;
            Q(c, function(d) {
                var f = l.length ? l + "." + d : d;
                if (-1 == e.utils.arrayIndexOf(a.ignore, f)) if (-1 != e.utils.arrayIndexOf(a.copy, f)) b[d] = c[d]; else if ("object" != typeof c[d] && "array" != typeof c[d] && 0 < a.observe.length && -1 == e.utils.arrayIndexOf(a.observe, f)) b[d] = c[d], 
                a.copiedProperties[f] = !0; else {
                    var g = I.get(c[d]), k = F(b[d], c[d], a, d, b, f, b), g = g || k;
                    if (0 < a.observe.length && -1 == e.utils.arrayIndexOf(a.observe, f)) b[d] = g(), 
                    a.copiedProperties[f] = !0; else {
                        if (e.isWriteableObservable(b[d])) {
                            if (g = e.utils.unwrapObservable(g), b[d]() !== g) b[d](g);
                        } else g = void 0 === b[d] ? g : e.utils.unwrapObservable(g), b[d] = g;
                        a.mappedProperties[f] = !0;
                    }
                }
            });
        } else switch (f.getType(c)) {
          case "function":
            u() ? e.isWriteableObservable(c) ? (c(v(c)), b = c) : b = v(c) : b = c;
            break;

          default:
            if (e.isWriteableObservable(b)) return q = u() ? v(b) : e.utils.unwrapObservable(c), 
            b(q), q;
            h() || u();
            b = h() ? x() : e.observable(e.utils.unwrapObservable(c));
            u() && b(v(b));
        }
        return b;
    }
    function O(b, c, a) {
        for (var d = 0, e = b.length; d < e; d++) if (!0 !== a[d] && b[d] === c) return d;
        return null;
    }
    function R(b, c) {
        var a;
        c && (a = c(b));
        "undefined" === f.getType(a) && (a = b);
        return e.utils.unwrapObservable(a);
    }
    function K(b, c, a) {
        b = e.utils.unwrapObservable(b);
        for (var d = 0, f = b.length; d < f; d++) {
            var l = b[d];
            if (R(l, a) === c) return l;
        }
        throw Error("When calling ko.update*, the key '" + c + "' was not found!");
    }
    function C(b, c) {
        return e.utils.arrayMap(e.utils.unwrapObservable(b), function(a) {
            return c ? R(a, c) : a;
        });
    }
    function Q(b, c) {
        if ("array" === f.getType(b)) for (var a = 0; a < b.length; a++) c(a); else for (a in b) c(a);
    }
    function P(b) {
        var c = f.getType(b);
        return ("object" === c || "array" === c) && null !== b;
    }
    function T() {
        var b = [], c = [];
        this.save = function(a, d) {
            var f = e.utils.arrayIndexOf(b, a);
            0 <= f ? c[f] = d : (b.push(a), c.push(d));
        };
        this.get = function(a) {
            a = e.utils.arrayIndexOf(b, a);
            return 0 <= a ? c[a] : void 0;
        };
    }
    function S() {
        var b = {}, c = function(a) {
            var c;
            try {
                c = a;
            } catch (e) {
                c = "$$$";
            }
            a = b[c];
            void 0 === a && (a = new T(), b[c] = a);
            return a;
        };
        this.save = function(a, b) {
            c(a).save(a, b);
        };
        this.get = function(a) {
            return c(a).get(a);
        };
    }
    var p = "__ko_mapping__", H = e.dependentObservable, B = 0, G, I, L = [ "create", "update", "key", "arrayChanged" ], N = {}, x = {
        include: [ "_destroy" ],
        ignore: [],
        copy: [],
        observe: []
    }, j = x;
    f.isMapped = function(b) {
        return (b = e.utils.unwrapObservable(b)) && b[p];
    };
    f.fromJS = function(b) {
        if (0 == arguments.length) throw Error("When calling ko.fromJS, pass the object you want to convert.");
        try {
            B++ || (G = [], I = new S());
            var c, a;
            2 == arguments.length && (arguments[1][p] ? a = arguments[1] : c = arguments[1]);
            3 == arguments.length && (c = arguments[1], a = arguments[2]);
            a && (c = E(c, a[p]));
            c = z(c);
            var d = F(a, b, c);
            a && (d = a);
            if (!--B) for (;G.length; ) {
                var e = G.pop();
                e && (e(), e.__DO.throttleEvaluation = e.throttleEvaluation);
            }
            d[p] = E(d[p], c);
            return d;
        } catch (f) {
            throw B = 0, f;
        }
    };
    f.fromJSON = function(b) {
        var c = e.utils.parseJson(b);
        arguments[0] = c;
        return f.fromJS.apply(this, arguments);
    };
    f.updateFromJS = function() {
        throw Error("ko.mapping.updateFromJS, use ko.mapping.fromJS instead. Please note that the order of parameters is different!");
    };
    f.updateFromJSON = function() {
        throw Error("ko.mapping.updateFromJSON, use ko.mapping.fromJSON instead. Please note that the order of parameters is different!");
    };
    f.toJS = function(b, c) {
        j || f.resetDefaultOptions();
        if (0 == arguments.length) throw Error("When calling ko.mapping.toJS, pass the object you want to convert.");
        if ("array" !== f.getType(j.ignore)) throw Error("ko.mapping.defaultOptions().ignore should be an array.");
        if ("array" !== f.getType(j.include)) throw Error("ko.mapping.defaultOptions().include should be an array.");
        if ("array" !== f.getType(j.copy)) throw Error("ko.mapping.defaultOptions().copy should be an array.");
        c = z(c, b[p]);
        return f.visitModel(b, function(a) {
            return e.utils.unwrapObservable(a);
        }, c);
    };
    f.toJSON = function(b, c) {
        var a = f.toJS(b, c);
        return e.utils.stringifyJson(a);
    };
    f.defaultOptions = function() {
        if (0 < arguments.length) j = arguments[0]; else return j;
    };
    f.resetDefaultOptions = function() {
        j = {
            include: x.include.slice(0),
            ignore: x.ignore.slice(0),
            copy: x.copy.slice(0)
        };
    };
    f.getType = function(b) {
        if (b && "object" === typeof b) {
            if (b.constructor === Date) return "date";
            if (b.constructor === Array) return "array";
        }
        return typeof b;
    };
    f.visitModel = function(b, c, a) {
        a = a || {};
        a.visitedObjects = a.visitedObjects || new S();
        var d, k = e.utils.unwrapObservable(b);
        if (P(k)) a = z(a, k[p]), c(b, a.parentName), d = "array" === f.getType(k) ? [] : {}; else return c(b, a.parentName);
        a.visitedObjects.save(b, d);
        var l = a.parentName;
        Q(k, function(b) {
            if (!(a.ignore && -1 != e.utils.arrayIndexOf(a.ignore, b))) {
                var j = k[b], g = a, h = l || "";
                "array" === f.getType(k) ? l && (h += "[" + b + "]") : (l && (h += "."), h += b);
                g.parentName = h;
                if (!(-1 === e.utils.arrayIndexOf(a.copy, b) && -1 === e.utils.arrayIndexOf(a.include, b) && k[p] && k[p].mappedProperties && !k[p].mappedProperties[b] && k[p].copiedProperties && !k[p].copiedProperties[b] && "array" !== f.getType(k))) switch (f.getType(e.utils.unwrapObservable(j))) {
                  case "object":
                  case "array":
                  case "undefined":
                    g = a.visitedObjects.get(j);
                    d[b] = "undefined" !== f.getType(g) ? g : f.visitModel(j, c, a);
                    break;

                  default:
                    d[b] = c(j, a.parentName);
                }
            }
        });
        return d;
    };
});

(function(window, $) {
    var pagerJsModule = function($, ko) {
        "use strict";
        var makeComputed = function(fn, scope) {
            return function() {
                var args = arguments;
                return ko.computed(function() {
                    return fn.apply(scope, args);
                });
            };
        };
        var pager = {};
        pager.page = null;
        pager.now = function() {
            if (!Date.now) {
                return new Date().valueOf();
            } else {
                return Date.now();
            }
        };
        pager.extendWithPage = function(viewModel) {
            var page = new pager.Page();
            viewModel["$__page__"] = page;
            pager.page = page;
            pager.activePage$ = makeComputed(pager.getActivePage, pager)();
        };
        var fire = function(scope, name, options) {
            options = options || {};
            options.page = scope;
            pager[name].fire(options);
            if (scope.val(name)) {
                scope.val(name)(options);
            }
        };
        $.each([ "onBindingError", "onSourceError", "onNoMatch", "onMatch", "beforeRemove", "afterRemove", "beforeHide", "afterHide", "beforeShow", "afterShow" ], function(i, n) {
            pager[n] = $.Callbacks();
        });
        pager.showChild = function(route) {
            var trimmedRoute = route && route.length === 1 && route[0] === "" ? [] : route;
            pager.page.showPage(trimmedRoute);
        };
        pager.getParentPage = function(bindingContext) {
            while (bindingContext) {
                if (bindingContext.$page && bindingContext.$page.val("urlToggle") !== "none") {
                    return bindingContext.$page;
                } else if (bindingContext.$data && bindingContext.$data.$__page__) {
                    return bindingContext.$data.$__page__;
                }
                bindingContext = bindingContext.$parentContext;
            }
            return null;
        };
        var goToKey = null;
        var currentAsyncDeferred = null;
        var goTo = function(path) {
            if (currentAsyncDeferred) {
                currentAsyncDeferred.reject({
                    cancel: true
                });
            }
            goToKey = null;
            if (path.substring(0, pager.Href.hash.length) === pager.Href.hash) {
                path = path.slice(pager.Href.hash.length);
            }
            var hashRoute = parseHash(path);
            pager.showChild(hashRoute);
        };
        pager.goTo = goTo;
        pager.navigate = function(path) {
            if (pager.useHTML5history) {
                pager.Href5.history.pushState(null, null, path);
            } else {
                location.hash = path;
            }
        };
        var parseHash = function(hash) {
            return $.map(hash.replace(/\+/g, " ").split("/"), decodeURIComponent);
        };
        var _ko = {};
        _ko.value = ko.utils.unwrapObservable;
        _ko.arrayValue = function(arr) {
            return $.map(arr, function(e) {
                return _ko.value(e);
            });
        };
        var parseStringAsParameters = function(query) {
            var match, urlParams = {}, search = /([^&=]+)=?([^&]*)/g;
            while (match = search.exec(query)) {
                urlParams[match[1]] = match[2];
            }
            return urlParams;
        };
        var splitRoutePartIntoNameAndParameters = function(routePart) {
            if (!routePart) {
                return {
                    name: null,
                    params: {}
                };
            }
            var routeSplit = routePart.split("?");
            var name = routeSplit[0];
            var paramsString = routeSplit[1];
            var params = {};
            if (paramsString) {
                params = parseStringAsParameters(paramsString);
            }
            return {
                name: name,
                params: params
            };
        };
        pager.ChildManager = function(children, page) {
            this.currentChildO = ko.observable(null);
            var me = this;
            this.page = page;
            this.timeStamp = pager.now();
            this.hideChild = function() {
                var currentChild = me.currentChildO();
                if (currentChild) {
                    currentChild.hidePage(function() {});
                    me.currentChildO(null);
                }
            };
            this.showChild = function(route) {
                var showOnlyStart = route.length === 0;
                this.timeStamp = pager.now();
                var timeStamp = this.timeStamp;
                var oldCurrentChild = me.currentChildO();
                var currentChild = null;
                var match = false;
                var currentRoutePair = splitRoutePartIntoNameAndParameters(route[0]);
                var currentRoute = currentRoutePair.name;
                var wildcard = null;
                $.each(children(), function(childIndex, child) {
                    if (!match) {
                        var id = child.getId();
                        if (id === currentRoute || (currentRoute === "" || currentRoute == null) && child.isStartPage()) {
                            match = true;
                            currentChild = child;
                        }
                        if (id === "?") {
                            wildcard = child;
                        }
                    }
                });
                var isModal = false;
                var currentChildManager = me;
                var findMatchModalOrWildCard = function(childIndex, child) {
                    if (!match) {
                        var id = child.getId();
                        var modal = child.getValue().modal;
                        if (modal) {
                            if (id === currentRoute || (currentRoute === "" || currentRoute == null) && child.isStartPage()) {
                                match = true;
                                currentChild = child;
                                isModal = true;
                            }
                            if (id === "?" && !wildcard) {
                                wildcard = child;
                                isModal = true;
                            }
                        }
                    }
                };
                while (!currentChild && currentChildManager.page.parentPage && !currentChildManager.page.getValue().modal) {
                    var parentChildren = currentChildManager.page.parentPage.children;
                    $.each(parentChildren(), findMatchModalOrWildCard);
                    if (!currentChild) {
                        currentChildManager = currentChildManager.page.parentPage.childManager;
                    }
                }
                if (!currentChild && wildcard && !showOnlyStart) {
                    currentChild = wildcard;
                }
                me.currentChildO(currentChild);
                if (currentChild) {
                    if (isModal) {
                        currentChild.currentParentPage(me.page);
                    } else {
                        currentChild.currentParentPage(null);
                    }
                }
                var onFailed = function() {
                    fire(me.page, "onNoMatch", {
                        route: route
                    });
                };
                var showCurrentChild = function() {
                    fire(me.page, "onMatch", {
                        route: route
                    });
                    var guard = _ko.value(currentChild.getValue().guard);
                    if (guard) {
                        guard(currentChild, route, function() {
                            if (me.timeStamp === timeStamp) {
                                currentChild.showPage(route.slice(1), currentRoutePair, route[0]);
                            }
                        }, oldCurrentChild);
                    } else {
                        currentChild.showPage(route.slice(1), currentRoutePair, route[0]);
                    }
                };
                if (oldCurrentChild && oldCurrentChild === currentChild) {
                    showCurrentChild();
                } else if (oldCurrentChild) {
                    oldCurrentChild.hidePage(function() {
                        if (currentChild) {
                            showCurrentChild();
                        } else {
                            onFailed();
                        }
                    });
                } else if (currentChild) {
                    showCurrentChild();
                } else {
                    onFailed();
                }
            };
        };
        pager.Page = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            this.element = element;
            this.valueAccessor = valueAccessor;
            this.allBindingsAccessor = allBindingsAccessor;
            this.viewModel = viewModel;
            this.bindingContext = bindingContext;
            this.children = ko.observableArray([]);
            this.childManager = new pager.ChildManager(this.children, this);
            this.parentPage = null;
            this.currentId = null;
            this.getCurrentId = ko.observable();
            this.ctx = null;
            this.currentParentPage = ko.observable(null);
            this.isVisible = ko.observable(false);
            this.originalRoute = ko.observable(null);
            this.route = null;
        };
        var p = pager.Page.prototype;
        p.val = function(key) {
            return _ko.value(this.getValue()[key]);
        };
        p.currentChildPage = function() {
            return this.childManager.currentChildO;
        };
        p.find = function(key) {
            var k = _ko.value(key);
            var currentRoot = this;
            if (k.substring(0, 1) === "/") {
                currentRoot = pager.page;
                k = k.slice(1);
            } else {
                while (k.substring(0, 3) === "../") {
                    currentRoot = currentRoot.currentParentPage && currentRoot.currentParentPage() ? currentRoot.currentParentPage() : currentRoot.parentPage;
                    k = k.slice(3);
                }
            }
            var route = parseHash(k);
            $.each(route, function(_, r) {
                currentRoot = currentRoot.child(r)();
            });
            return currentRoot;
        };
        p.find$ = function(key) {
            return makeComputed(this.find, this)(key);
        };
        var absolutePathToRealPath = function(path) {
            if (pager.useHTML5history) {
                return $("base").attr("href") + path;
            } else {
                return pager.Href.hash + path;
            }
        };
        p.path = function(path) {
            var me = this;
            var p = _ko.value(path);
            if (p && typeof p === "object" && p.path && p.params && !(p instanceof pager.Page)) {
                var objectPath = p.path;
                var params = p.params;
                return me.path(objectPath) + "?" + $.param(params);
            } else {
                var page;
                if (p == null || p === "") {
                    page = me;
                } else if (p instanceof pager.Page) {
                    page = p;
                } else {
                    if (p.substring(0, 1) === "/") {
                        var pagePath = pager.page.getFullRoute()().join("/") + p.substring(1);
                        return absolutePathToRealPath(pagePath);
                    }
                    var parentsToTrim = 0;
                    while (p.substring(0, 3) === "../") {
                        parentsToTrim++;
                        p = p.slice(3);
                    }
                    var fullRoute = me.getFullRoute()();
                    var parentPath = fullRoute.slice(0, fullRoute.length - parentsToTrim).join("/");
                    var fullPathWithoutHash = (parentPath === "" ? "" : parentPath + "/") + p;
                    return absolutePathToRealPath(fullPathWithoutHash);
                }
                return absolutePathToRealPath(page.getFullRoute()().join("/"));
            }
        };
        p.path$ = function(path) {
            return makeComputed(this.path, this)(path);
        };
        p.async = function(fn, ok, notOk, state) {
            var me = this;
            return function() {
                if (currentAsyncDeferred) {
                    currentAsyncDeferred.reject({
                        cancel: true
                    });
                }
                var result = fn();
                currentAsyncDeferred = result;
                if (state) {
                    state(result.state());
                }
                var key = Math.random();
                goToKey = key;
                result.done(function() {
                    if (state) {
                        state(result.state());
                    }
                    if (key === goToKey) {
                        pager.navigate(me.path(ok));
                    }
                });
                result.fail(function(data) {
                    if (state) {
                        state(result.state());
                    }
                    var cancel = data && data.cancel;
                    if (key === goToKey) {
                        if (!cancel && notOk) {
                            pager.navigate(me.path(notOk));
                        }
                    }
                });
            };
        };
        p.showPage = function(route, pageRoute, originalRoute) {
            var m = this, currentId = m.currentId, params = m.pageRoute ? m.pageRoute.params : null, isVisible = m.isVisible();
            m.currentId = pageRoute ? pageRoute.name || "" : "";
            m.getCurrentId(m.currentId);
            m.isVisible(true);
            if (originalRoute) {
                m.originalRoute(originalRoute);
            }
            m.route = route;
            m.pageRoute = pageRoute;
            if (!isVisible) {
                m.setParams();
                m.show();
            } else {
                if (m.getId() === "?" && currentId !== m.currentId) {
                    m.show();
                }
                if (pageRoute && params !== pageRoute.params) {
                    m.setParams();
                }
            }
            m.childManager.showChild(route);
        };
        p.setParams = function() {
            if (this.pageRoute && this.pageRoute.params) {
                var params = this.pageRoute.params;
                var vm = this.ctx;
                var userParams = this.val("params") || {};
                if ($.isArray(userParams)) {
                    $.each(userParams, function(index, key) {
                        var value = params[key];
                        if (vm[key]) {
                            vm[key](value);
                        } else {
                            vm[key] = ko.observable(value);
                        }
                    });
                } else {
                    $.each(userParams, function(key, defaultValue) {
                        var value = params[key];
                        var runtimeValue;
                        if (value == null) {
                            runtimeValue = _ko.value(defaultValue);
                        } else {
                            runtimeValue = value;
                        }
                        if (vm[key]) {
                            vm[key](runtimeValue);
                        } else {
                            vm[key] = ko.observable(runtimeValue);
                        }
                    });
                }
            }
            if (this.pageRoute) {
                var nameParam = this.getValue()["nameParam"];
                if (nameParam) {
                    if (typeof nameParam === "string") {
                        if (this.ctx[nameParam]) {
                            this.ctx[nameParam](this.currentId);
                        } else {
                            this.ctx[nameParam] = ko.observable(this.currentId);
                        }
                    } else {
                        nameParam(this.currentId);
                    }
                }
            }
        };
        p.hidePage = function(callback) {
            var m = this;
            if ("show" !== m.val("urlToggle")) {
                m.hideElementWrapper(callback);
                m.childManager.hideChild();
            } else {
                if (callback) {
                    callback();
                }
            }
        };
        var applyBindingsToDescendants = function(page) {
            try {
                ko.applyBindingsToDescendants(page.childBindingContext, page.element);
            } catch (e) {
                fire(page, "onBindingError", {
                    error: e
                });
            }
        };
        p.init = function() {
            var m = this;
            var urlToggle = m.val("urlToggle");
            var id = m.val("id");
            if (id !== "?") {
                m.getCurrentId(id);
            }
            var existingPage = ko.utils.domData.get(m.element, "__ko_pagerjsBindingData");
            if (existingPage) {
                return {
                    controlsDescendantBindings: true
                };
            } else {
                ko.utils.domData.set(m.element, "__ko_pagerjsBindingData", m);
            }
            ko.utils.domNodeDisposal.addDisposeCallback(m.element, function() {
                fire(m, "beforeRemove");
                if (m.parentPage) {
                    m.parentPage.children.remove(m);
                }
                fire(m, "afterRemove");
            });
            var value = m.getValue();
            if (urlToggle !== "none") {
                m.parentPage = m.getParentPage();
                m.parentPage.children.push(this);
                m.hideElement();
            }
            if (m.val("source")) {
                m.loadSource(m.val("source"));
            }
            m.ctx = null;
            if (value.withOnShow) {
                m.ctx = {};
                m.childBindingContext = m.bindingContext.createChildContext(m.ctx);
                ko.utils.extend(m.childBindingContext, {
                    $page: this
                });
            } else {
                var context = value["with"] || m.bindingContext["$observableData"] || m.viewModel;
                m.ctx = _ko.value(context);
                m.augmentContext();
                if (ko.isObservable(context)) {
                    var dataInContext = ko.observable(m.ctx);
                    m.childBindingContext = m.bindingContext.createChildContext(dataInContext);
                    ko.utils.extend(m.childBindingContext, {
                        $page: this,
                        $observableData: context
                    });
                    applyBindingsToDescendants(m);
                    context.subscribe(function() {
                        dataInContext(_ko.value(context));
                    });
                } else {
                    m.childBindingContext = m.bindingContext.createChildContext(m.ctx);
                    ko.utils.extend(m.childBindingContext, {
                        $page: this,
                        $observableData: undefined
                    });
                    applyBindingsToDescendants(m);
                }
            }
            if (urlToggle !== "none") {
                var parent = m.parentPage;
                if (parent.route && (parent.route[0] === m.getId() || parent.route.length && m.getId() === "?")) {
                    setTimeout(function() {
                        parent.showPage(parent.route);
                    }, 0);
                }
            } else {
                var display = function() {
                    if ($(m.element).is(":visible")) {
                        m.showPage([]);
                    }
                };
                setTimeout(display, 0);
                m.getParentPage().isVisible.subscribe(function(x) {
                    if (x) {
                        setTimeout(display, 0);
                    }
                });
            }
            var bind = m.getValue()["bind"];
            if (ko.isObservable(bind)) {
                bind(m);
            }
            return {
                controlsDescendantBindings: true
            };
        };
        p.augmentContext = function() {
            var m = this;
            var params = m.val("params");
            if (params) {
                if ($.isArray(params)) {
                    $.each(params, function(index, param) {
                        if (!m.ctx[param]) {
                            m.ctx[param] = ko.observable();
                        }
                    });
                } else {
                    $.each(params, function(key, value) {
                        if (!m.ctx[key]) {
                            if (ko.isObservable(value)) {
                                m.ctx[key] = value;
                            } else if (value === null) {
                                params[key] = ko.observable(null);
                                m.ctx[key] = ko.observable(null);
                            } else {
                                m.ctx[key] = ko.observable(value);
                            }
                        }
                    });
                }
            }
            if (this.val("vars")) {
                $.each(this.val("vars"), function(key, value) {
                    if (ko.isObservable(value)) {
                        m.ctx[key] = value;
                    } else {
                        m.ctx[key] = ko.observable(value);
                    }
                });
            }
            var nameParam = this.getValue()["nameParam"];
            if (nameParam && typeof nameParam === "string") {
                m.ctx[nameParam] = ko.observable(null);
            }
            this.setParams();
        };
        p.getValue = function() {
            if (this.valueAccessor) {
                return _ko.value(this.valueAccessor());
            } else {
                return {};
            }
        };
        p.getParentPage = function() {
            return pager.getParentPage(this.bindingContext);
        };
        p.getId = function() {
            return this.val("id");
        };
        p.id = function() {
            var currentId = this.getCurrentId();
            if (currentId == null || currentId === "") {
                return this.getId();
            } else {
                return currentId;
            }
        };
        p.sourceUrl = function(source) {
            var me = this;
            if (this.getId() === "?") {
                return ko.computed(function() {
                    var path;
                    if (me.val("deep")) {
                        path = [ me.currentId ].concat(me.route).join("/");
                    } else {
                        path = me.currentId;
                    }
                    return _ko.value(source).replace("{1}", path);
                });
            } else {
                return ko.computed(function() {
                    return _ko.value(source);
                });
            }
        };
        p.loadWithOnShow = function() {
            var me = this;
            if (!me.withOnShowLoaded || me.val("sourceCache") !== true) {
                me.withOnShowLoaded = true;
                me.val("withOnShow")(function(vm) {
                    var childBindingContext = me.bindingContext.createChildContext(vm);
                    me.ctx = vm;
                    me.childBindingContext = childBindingContext;
                    me.augmentContext();
                    ko.utils.extend(childBindingContext, {
                        $page: me
                    });
                    applyBindingsToDescendants(me);
                    if (me.route) {
                        me.childManager.showChild(me.route);
                    }
                }, me);
            }
        };
        p.loadSource = function(source) {
            var value = this.getValue();
            var me = this;
            var element = this.element;
            var loader = null;
            var loaderMethod = value.loader || pager.loader;
            if (value.frame === "iframe") {
                var iframe = $("iframe", $(element));
                if (iframe.length === 0) {
                    iframe = $("<iframe></iframe>");
                    $(element).append(iframe);
                }
                if (loaderMethod) {
                    loader = _ko.value(loaderMethod)(me, iframe);
                    loader.load();
                }
                iframe.one("load", function() {
                    if (loader) {
                        loader.unload();
                    }
                    if (value.sourceLoaded) {
                        value.sourceLoaded(me);
                    }
                });
                ko.applyBindingsToNode(iframe[0], {
                    attr: {
                        src: this.sourceUrl(source)
                    }
                });
            } else {
                if (loaderMethod) {
                    loader = _ko.value(loaderMethod)(me, me.element);
                    loader.load();
                }
                var onLoad = function() {
                    if (loader) {
                        loader.unload();
                    }
                    if (!me.val("withOnShow")) {
                        applyBindingsToDescendants(me);
                    } else if (me.val("withOnShow")) {
                        me.loadWithOnShow();
                    }
                    if (value.sourceLoaded) {
                        value.sourceLoaded(me);
                    }
                    if (me.route) {
                        me.childManager.showChild(me.route);
                    }
                };
                if (typeof _ko.value(source) === "string") {
                    var s = _ko.value(this.sourceUrl(source));
                    koLoad(element, s, function() {
                        onLoad();
                    }, me);
                } else {
                    var childrenToRemove = $(element).children();
                    _ko.value(source)(this, function() {
                        $.each(childrenToRemove, function(i, c) {
                            ko.utils.domNodeDisposal.removeNode(c);
                        });
                        onLoad();
                    });
                }
            }
        };
        var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
        var koLoad = function(element, url, callback, page) {
            var selector, response, self = $(element), off = url.indexOf(" ");
            if (off >= 0) {
                selector = url.slice(off, url.length);
                url = url.slice(0, off);
            }
            var loadPromise = jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                complete: function(jqXHR, status) {
                    if (callback) {
                        self.each(callback, response || [ jqXHR.responseText, status, jqXHR ]);
                    }
                }
            }).done(function(responseText) {
                response = arguments;
                $.each(self.children(), function(i, c) {
                    ko.utils.domNodeDisposal.removeNode(c);
                });
                self.html(selector ? jQuery("<div>").append(responseText.replace(rscript, "")).find(selector) : responseText);
            });
            loadPromise.fail(function() {
                fire(page, "onSourceError", {
                    url: url,
                    xhrPromise: loadPromise
                });
            });
            return self;
        };
        p.show = function(callback) {
            var element = this.element;
            var me = this;
            me.showElementWrapper(callback);
            if (me.val("title")) {
                window.document.title = me.val("title");
            }
            if (me.val("sourceOnShow")) {
                if (!me.val("sourceCache") || !element.__pagerLoaded__ || typeof me.val("sourceCache") === "number" && element.__pagerLoaded__ + me.val("sourceCache") * 1e3 < pager.now()) {
                    element.__pagerLoaded__ = pager.now();
                    me.loadSource(me.val("sourceOnShow"));
                }
            } else if (me.val("withOnShow")) {
                me.loadWithOnShow();
            }
        };
        p.titleOrId = function() {
            return this.val("title") || this.id();
        };
        p.showElementWrapper = function(callback) {
            var me = this;
            fire(me, "beforeShow");
            me.showElement(callback);
            if (me.val("scrollToTop")) {
                me.element.scrollIntoView();
            }
            fire(me, "afterShow");
        };
        p.showElement = function(callback) {
            if (this.val("showElement")) {
                this.val("showElement")(this, callback);
            } else if (this.val("fx")) {
                pager.fx[this.val("fx")].showElement(this, callback);
            } else if (pager.showElement) {
                pager.showElement(this, callback);
            } else {
                $(this.element).show(callback);
            }
        };
        p.hideElementWrapper = function(callback) {
            this.isVisible(false);
            fire(this, "beforeHide");
            this.hideElement(callback);
            fire(this, "afterHide");
        };
        p.hideElement = function(callback) {
            if (this.val("hideElement")) {
                this.val("hideElement")(this, callback);
            } else if (this.val("fx")) {
                pager.fx[this.val("fx")].hideElement(this, callback);
            } else if (pager.hideElement) {
                pager.hideElement(this, callback);
            } else {
                $(this.element).hide();
                if (callback) {
                    callback();
                }
            }
        };
        p.getFullRoute = function() {
            if (this._fullRoute) {
                return this._fullRoute;
            } else {
                this._fullRoute = ko.computed(function() {
                    var res = null;
                    if (this.currentParentPage && this.currentParentPage()) {
                        res = this.currentParentPage().getFullRoute()().slice(0);
                        res.push(this.originalRoute() || this.getId());
                        return res;
                    } else if (this.parentPage) {
                        res = this.parentPage.getFullRoute()().slice(0);
                        res.push(this.originalRoute() || this.getId());
                        return res;
                    } else {
                        return [];
                    }
                }, this);
                return this._fullRoute;
            }
        };
        p.getRole = function() {
            return this.val("role") || "next";
        };
        p.isStartPage = function() {
            return this.getId() === "start" || this.getRole() === "start";
        };
        p.nullObject = new pager.Page();
        p.nullObject.children = ko.observableArray([]);
        p.child = function(key) {
            var me = this;
            if (me._child == null) {
                me._child = {};
            }
            if (!me._child[key]) {
                me._child[key] = ko.computed(function() {
                    var child = $.grep(this.children(), function(c) {
                        return c.id() === key;
                    })[0];
                    return child || this.nullObject;
                }, this);
            }
            return me._child[key];
        };
        pager.getActivePage = function() {
            var active = pager.page;
            while (active.currentChildPage()() != null) {
                active = active.currentChildPage()();
            }
            return active;
        };
        ko.bindingHandlers.page = {
            init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var page = null;
                if (_ko.value(valueAccessor()) instanceof pager.Page) {
                    page = _ko.value(valueAccessor());
                    page.element = element;
                    if (page.allBindingsAccessor == null) {
                        page.allBindingsAccessor = allBindingsAccessor;
                    }
                    if (page.viewModel == null) {
                        page.viewModel = viewModel;
                    }
                    if (page.bindingContext == null) {
                        page.bindingContext = bindingContext;
                    }
                } else {
                    page = new pager.Page(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                }
                return page.init();
            }
        };
        pager.useHTML5history = false;
        pager.rootURI = "/";
        pager.Href = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            this.element = element;
            this.bindingContext = bindingContext;
            this.path = ko.observable();
            this.pageOrRelativePath = ko.observable(valueAccessor);
        };
        var hp = pager.Href.prototype;
        hp.getParentPage = function() {
            return pager.getParentPage(this.bindingContext);
        };
        hp.init = function() {
            var me = this;
            var page = me.getParentPage();
            me.path = ko.computed(function() {
                var value = _ko.value(me.pageOrRelativePath()());
                return page.path(value);
            });
        };
        pager.Href.hash = "#";
        hp.bind = function() {
            ko.applyBindingsToNode(this.element, {
                attr: {
                    href: this.path
                }
            });
        };
        hp.update = function(valueAccessor) {
            this.pageOrRelativePath(valueAccessor);
        };
        pager.Href5 = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            pager.Href.apply(this, arguments);
        };
        pager.Href5.prototype = new pager.Href();
        pager.Href5.history = window.History;
        pager.Href5.prototype.bind = function() {
            var self = this;
            ko.applyBindingsToNode(self.element, {
                attr: {
                    href: self.path
                },
                click: function() {
                    var path = self.path();
                    if (path === "" || path === "/") {
                        path = $("base").attr("href");
                    }
                    pager.Href5.history.pushState(null, null, path);
                }
            });
        };
        ko.bindingHandlers["page-href"] = {
            init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var Cls = pager.useHTML5history ? pager.Href5 : pager.Href;
                var href = new Cls(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                href.init();
                href.bind();
                element.__ko__page = href;
            },
            update: function(element, valueAccessor) {
                element.__ko__page.update(valueAccessor);
            }
        };
        pager.fx = {};
        pager.fx.cssAsync = function(css) {
            return {
                showElement: function(page, callback) {
                    var $e = $(page.element);
                    $e.addClass(css);
                    $e.show();
                    var i = setInterval(function() {
                        clearInterval(i);
                        $e.addClass(css + "-in");
                    }, 10);
                    var i2 = setInterval(function() {
                        clearInterval(i2);
                        if (callback) {
                            callback();
                        }
                    }, 300);
                },
                hideElement: function(page, callback) {
                    var $e = $(page.element);
                    if (!page.pageHiddenOnce) {
                        page.pageHiddenOnce = true;
                        $e.hide();
                    } else {
                        $e.removeClass(css + "-in");
                        var i = setInterval(function() {
                            clearInterval(i);
                            if (callback) {
                                callback();
                            }
                            $e.hide();
                        }, 300);
                    }
                }
            };
        };
        pager.fx.zoom = pager.fx.cssAsync("pagerjs-fx-zoom");
        pager.fx.flip = pager.fx.cssAsync("pagerjs-fx-flip");
        pager.fx.popout = pager.fx.cssAsync("pagerjs-fx-popout-modal");
        pager.fx.jQuerySync = function(show, hide) {
            return {
                showElement: function(page, callback) {
                    show.call($(page.element), 300, callback);
                },
                hideElement: function(page, callback) {
                    hide.call($(page.element), 300, function() {
                        $(page.element).hide();
                    });
                    if (callback) {
                        callback();
                    }
                }
            };
        };
        pager.fx.slide = pager.fx.jQuerySync($.fn.slideDown, $.fn.slideUp);
        pager.fx.fade = pager.fx.jQuerySync($.fn.fadeIn, $.fn.fadeOut);
        pager.startHistoryJs = function(options) {
            var id = typeof options === "string" ? options : null;
            if (id) {
                pager.Href5.history.pushState(null, null, id);
            }
            pager.Href5.history.Adapter.bind(window, "statechange", function() {
                var relativeUrl = pager.Href5.history.getState().url.replace(pager.Href5.history.getBaseUrl(), "");
                goTo(relativeUrl);
            });
            pager.Href5.history.Adapter.bind(window, "anchorchange", function() {
                goTo(location.hash);
            });
            if (!options || !options.noGo) {
                goTo(pager.Href5.history.getState().url.replace(pager.Href5.history.getBaseUrl(), ""));
            }
        };
        pager.start = function(options) {
            var id = typeof options === "string" ? options : null;
            if (id) {
                window.location.hash = pager.Href.hash + id;
            }
            var onHashChange = function() {
                goTo(window.location.hash);
            };
            $(window).bind("hashchange", onHashChange);
            if (!options || !options.noGo) {
                onHashChange();
            }
        };
        return pager;
    };
    var define = window.define;
    if (typeof define === "function" && typeof define.amd === "object" && define.amd) {
        define("pager", [ "knockout", "jquery" ], function(ko, $) {
            return pagerJsModule($, ko);
        });
    } else {
        window.pager = pagerJsModule($, ko);
    }
})(window, jQuery);

var PostType = function(data) {
    this.postType = ko.observable(data.name);
    this.label = ko.observable(data.label);
    this.labels = {
        name: ko.observable(data.labels.name),
        singularName: ko.observable(data.labels.singular_name),
        menuName: ko.observable(data.labels.menu_name),
        allItems: ko.observable(data.labels.all_items),
        addNew: ko.observable(data.labels.add_new),
        addNewItem: ko.observable(data.labels.add_new_item),
        editItem: ko.observable(data.labels.edit_item),
        newItem: ko.observable(data.labels.new_item),
        viewItem: ko.observable(data.labels.view_item),
        searchItems: ko.observable(data.labels.search_items),
        notFound: ko.observable(data.labels.not_found),
        notFoundInTrash: ko.observable(data.labels.not_found_in_trash),
        parentItemColon: ko.observable(data.labels.parent_item_colon)
    };
    this.description = ko.observable(data.description);
    this.public = ko.observable(data.public);
    this.excludeFromSearch = ko.observable(data.exclude_from_search);
    this.publiclyQueryable = ko.observable(data.publicly_queryable);
    this.showUI = ko.observable(data.show_ui);
    this.showInNavMenus = ko.observable(data.show_in_nav_menus);
    this.showInMenu = ko.observable(data.show_in_menu);
    this.showInAdminBar = ko.observable(data.show_in_menu_bar);
    this.menuPosition = ko.observable(data.menu_position);
    this.menuIcon = ko.observable(data.menu_icon);
    this.capabilityType = ko.observable(data.capability_type);
    this.capabilities = {
        createPosts: ko.observable(data.cap.create_posts),
        deleteOthersPosts: ko.observable(data.cap.delete_others_posts),
        deletePost: ko.observable(data.cap.delete_post),
        deletePosts: ko.observable(data.cap.delete_posts),
        deletePrivatePosts: ko.observable(data.cap.delete_private_posts),
        deletePublishedPosts: ko.observable(data.cap.delete_published_posts),
        editOthersPosts: ko.observable(data.cap.edit_others_posts),
        editPost: ko.observable(data.cap.edit_post),
        editPosts: ko.observable(data.cap.edit_posts),
        editPrivatePosts: ko.observable(data.cap.edit_private_posts),
        editPublishedPosts: ko.observable(data.cap.edit_published_posts),
        publishPosts: ko.observable(data.cap.publish_posts),
        read: ko.observable(data.cap.read),
        readPost: ko.observable(data.cap.read_post),
        readPrivatePosts: ko.observable(data.cap.read_private_posts)
    };
    this.mapMetaCap = ko.observable(data.map_meta_cap);
    this.hierarchical = ko.observable(data.hierarchical);
    this.supports = ko.observableArray(data.supports);
    this.hasArchive = ko.observable(data.has_archive);
    this.rewrite = ko.observable(data.rewrite);
    this.rewriteArgs = {
        slug: ko.observable(data.rewrite_slug),
        withFront: ko.observable(data.rewrite_with_front),
        feeds: ko.observable(data.rewrite_feeds),
        pages: ko.observable(data.rewrite_pages)
    };
    this.queryVar = ko.observable(data.query_var);
    this.canExport = ko.observable(data.can_export);
    this.dirtyFlag = ko.dirtyFlag(this, false);
    this.source = ko.observable(data.source);
    this.taxonomies = ko.observableArray(data.taxonomies);
};

PostType.prototype.revertPostType = function() {
    return true;
};

var PostTypes = function(postTypes) {
    this.postTypes = ko.observableArray(ko.utils.arrayMap(postTypes, function(postType) {
        return new PostType(postType);
    }));
};

if (typeof DEBUG === "undefined") {
    window.DEBUG = true;
}

var PostTypes = "", temp;

(function($, ko) {
    $(document).ready(function() {
        var params = {
            action: "getposttypes"
        };
        $.ajax({
            method: "POST",
            data: params,
            url: ajaxurl,
            dataType: "json",
            success: function(result) {
                temp = ko.mapping.fromJS(result, {});
                if (DEBUG) {
                    console.log("Results: ", result);
                }
                PostTypes = new PostTypesViewModel(result);
                pager.extendWithPage(PostTypes);
                ko.applyBindings(PostTypes, document.getElementById("devToolkitApp"));
                pager.start();
            },
            error: function(jqXHR, textStatus, errorMessage) {
                console.log("Error: ", errorMessage);
            }
        });
    });
    ko.dirtyFlag = function(root, isInitiallyDirty) {
        var result = function() {}, _initialState = ko.observable(ko.toJSON(root)), _isInitiallyDirty = ko.observable(isInitiallyDirty);
        result.isDirty = ko.computed(function() {
            return _isInitiallyDirty() || _initialState() !== ko.toJSON(root);
        });
        result.reset = function() {
            _initialState(ko.toJSON(root));
            _isInitiallyDirty(false);
        };
        return result;
    };
    ko.bindingHandlers.checkboxList = {
        init: function(element, valueAccessor, allBindingsAccessor) {
            var observable = valueAccessor(), options = allBindingsAccessor(), inputs = element.getElementsByTagName("input");
            for (var i = 0, max = inputs.length; i < max; i++) {
                if (inputs[i].type === "checkbox") {
                    if (observable.indexOf(inputs[i].value) > -1) {
                        inputs[i].checked = true;
                    }
                    ko.utils.registerEventHandler(inputs[i], "click", function() {
                        var observable = valueAccessor(), newValue = $(this).val();
                        if (this.checked) {
                            if (observable.indexOf(this.value) < 0) {
                                observable.push(this.value);
                            }
                        } else {
                            if (observable.indexOf(this.value) > -1) {
                                observable.remove(this.value);
                            }
                        }
                        if (DEBUG) {
                            console.log("Checked: ", this.checked);
                        }
                    });
                }
            }
        },
        update: function(element, valueAccessor, allBindingsAccessor) {
            var observable = valueAccessor(), options = allBindingsAccessor(), inputs = element.getElementsByTagName("input");
            for (var i = 0, max = inputs.length; i < max; i++) {
                if (inputs[i].type === "checkbox") {
                    if (observable.indexOf(inputs[i].value) > -1) {
                        inputs[i].checked = true;
                    }
                }
            }
            if (DEBUG) {
                console.log("Observable: ", observable());
            }
        }
    };
    ko.bindingHandlers.selectWithOther = {
        init: function(element, valueAccessor, allBindingsAccessor) {
            var observable = valueAccessor(), options = allBindingsAccessor().selectWithOtherOptions, selectInput = {}, textInput = {}, interceptor = ko.computed({
                read: function() {
                    return observable().toString();
                },
                write: function(newValue) {
                    if (newValue === "true") {
                        observable(true);
                    } else if (newValue === "false") {
                        observable(false);
                    } else {
                        observable(newValue);
                    }
                }
            });
            if (options !== "undefined") {
                element.selectInput = $(options.selectField)[0];
                if (element.selectInput.length === 0) {
                    element.selectInput = $(element).find("select")[0];
                }
                element.textInput = $(options.textField)[0];
                if (element.textInput.length === 0) {
                    element.textInput = $(element).find('input[type="text"]')[0];
                }
            } else {
                element.selectInput = $(element).find("select")[0];
                element.textInput = $(element).find('input[type="text"]')[0];
            }
            for (var i = 0; i < element.selectInput.options.length; i++) {
                if (element.selectInput.options[i].value === observable().toString()) {
                    element.selectInput.selectedIndex = i;
                    element.textInput.disabled = true;
                    break;
                }
            }
            if (element.textInput.disabled) {
                $(element.selectInput).val(observable().toString());
            } else {
                $(element.selectInput).val("other");
                $(element.textInput).val(observable().toString());
            }
            ko.utils.registerEventHandler(element.selectInput, "change", function() {
                var observable = valueAccessor(), newValue = $(this).val();
                if (newValue !== "other") {
                    observable(newValue);
                    element.textInput.disabled = true;
                } else {
                    observable($(element.textInput).val());
                    element.textInput.disabled = false;
                }
            });
            ko.utils.registerEventHandler(textInput, "change", function() {
                var observable = valueAccessor(), newValue = $(this).val();
                observable(newValue);
            });
            ko.applyBindingsToNode(element, {
                value: interceptor
            });
        },
        update: function(element, valueAccessor, allBindingsAccessor) {
            var observable = valueAccessor(), options = allBindingsAccessor().selectWithOtherOptions, selectInput = {}, textInput = {};
            element.textInput.disabled = false;
            for (var i = 0; i < element.selectInput.options.length; i++) {
                if (element.selectInput.options[i].value === observable().toString()) {
                    element.selectInput.selectedIndex = i;
                    element.textInput.disabled = true;
                    break;
                }
            }
            if (element.textInput.disabled) {
                $(element.selectInput).val(observable().toString());
            } else {
                $(element.selectInput).val("other");
                $(element.textInput).val(observable());
            }
        }
    };
    ko.bindingHandlers.booleanValue = {
        init: function(element, valueAccessor, allBindingsAccessor) {
            var observable = valueAccessor(), interceptor = ko.computed({
                read: function() {
                    return observable().toString();
                },
                write: function(newValue) {
                    if (newValue === "true") {
                        observable(true);
                    } else if (newValue === "false") {
                        observable(false);
                    } else {
                        observable(newValue);
                    }
                }
            });
            ko.applyBindingsToNode(element, {
                value: interceptor
            });
        }
    };
    var PostTypeMapping = {
        postTypes: {
            create: function(data) {
                return new PostTypeViewModel(data.data);
            }
        }
    };
    var PostTypeViewModel = function(data) {
        ko.mapping.fromJS(data, {}, this);
        this.originalPostData = data;
        this.editPostType = function(koObject, event) {
            PostTypes.posttypeedit(koObject);
        };
        this.revertPostType = function(koObject, event) {
            if (DEBUG) {
                console.log("Revert data:", ko.mapping.fromJS(this.originalPostData, {}, this));
            }
            ko.mapping.fromJS(this.originalPostData, {}, this);
        };
        this.source = ko.computed(function() {
            if (this._builtin() === true) {
                return "Core";
            } else {
                return "Plugin";
            }
        }, this);
        this.dirtyFlag = ko.dirtyFlag(this, false);
    };
    var PostTypesViewModel = function(data) {
        var self = this;
        self.originalPostData = ko.mapping.fromJS(data, PostTypeMapping);
        self.modifiedPostTypes = ko.observableArray();
        self.posttypeedit = ko.observable();
        self.postTypes = ko.observableArray(ko.utils.arrayMap(data.postTypes, function(postType) {
            return new PostType(postType);
        }));
        self.isDetailView = ko.observable(false);
        self.postTypeName = ko.observable();
        self.postTypeName.subscribe(function(newValue) {
            self.posttypeedit(self.getByName(newValue));
        });
        self.addSupports = function(koObject, event, d) {
            if (self.posttypeedit().supports.indexOf(event.target.value) !== -1) {
                self.posttypeedit().supports.remove(event.target.value);
            } else {
                self.posttypeedit().supports.push(event.target.value);
            }
            return true;
        };
        self.addTaxonomy = function(koObject, event, d) {
            if (self.posttypeedit().taxonomies.indexOf(event.target.value) !== -1) {
                self.posttypeedit().taxonomies.remove(event.target.value);
            } else {
                self.posttypeedit().taxonomies.push(event.target.value);
            }
            return true;
        };
        self.getByName = function(postTypeName) {
            var match = ko.utils.arrayFirst(self.postTypes(), function(item) {
                return postTypeName === item.postType();
            });
            return match;
        };
        self.editPostType = function(koObject, event) {
            self.posttypeedit(koObject);
            $(".tooltip-item").tooltip();
            return true;
        };
        self.setEditMode = function(page) {
            self.isDetailView(page.page.currentId !== "viewall");
        };
        self.clearEditPostType = function(koObject, event) {
            self.posttypeedit(null);
        };
    };
})(jQuery, ko);