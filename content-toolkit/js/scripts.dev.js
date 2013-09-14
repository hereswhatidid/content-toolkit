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
    function F(q) {
        return function() {
            return q;
        };
    }
    (function(q) {
        var w = this || (0, eval)("this"), s = w.document, H = w.navigator, t = w.jQuery, y = w.JSON;
        (function(q) {
            "function" === typeof require && "object" === typeof exports && "object" === typeof module ? q(module.exports || exports) : "function" === typeof define && define.amd ? define([ "exports" ], q) : q(w.ko = {});
        })(function(C) {
            function G(b, c, d, f) {
                a.d[b] = {
                    init: function(b) {
                        a.a.f.set(b, I, {});
                        return {
                            controlsDescendantBindings: !0
                        };
                    },
                    update: function(b, e, m, h, k) {
                        m = a.a.f.get(b, I);
                        e = a.a.c(e());
                        h = !d !== !e;
                        var l = !m.fb;
                        if (l || c || h !== m.vb) l && (m.fb = a.a.Oa(a.e.childNodes(b), !0)), h ? (l || a.e.P(b, a.a.Oa(m.fb)), 
                        a.Ja(f ? f(k, e) : k, b)) : a.e.ba(b), m.vb = h;
                    }
                };
                a.g.S[b] = !1;
                a.e.L[b] = !0;
            }
            function J(b, c, d) {
                d && c !== a.h.n(b) && a.h.W(b, c);
                c !== a.h.n(b) && a.q.I(a.a.Ga, null, [ b, "change" ]);
            }
            var a = "undefined" !== typeof C ? C : {};
            a.b = function(b, c) {
                for (var d = b.split("."), f = a, g = 0; g < d.length - 1; g++) f = f[d[g]];
                f[d[d.length - 1]] = c;
            };
            a.r = function(a, c, d) {
                a[c] = d;
            };
            a.version = "2.3.0";
            a.b("version", a.version);
            a.a = function() {
                function b(a, b) {
                    for (var e in a) a.hasOwnProperty(e) && b(e, a[e]);
                }
                function c(b, e) {
                    if ("input" !== a.a.u(b) || !b.type || "click" != e.toLowerCase()) return !1;
                    var k = b.type;
                    return "checkbox" == k || "radio" == k;
                }
                var d = {}, f = {};
                d[H && /Firefox\/2/i.test(H.userAgent) ? "KeyboardEvent" : "UIEvents"] = [ "keyup", "keydown", "keypress" ];
                d.MouseEvents = "click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave".split(" ");
                b(d, function(a, b) {
                    if (b.length) for (var e = 0, c = b.length; e < c; e++) f[b[e]] = a;
                });
                var g = {
                    propertychange: !0
                }, e = s && function() {
                    for (var a = 3, b = s.createElement("div"), e = b.getElementsByTagName("i"); b.innerHTML = "<!--[if gt IE " + ++a + "]><i></i><![endif]-->", 
                    e[0]; ) ;
                    return 4 < a ? a : q;
                }();
                return {
                    Ta: [ "authenticity_token", /^__RequestVerificationToken(_.*)?$/ ],
                    p: function(a, b) {
                        for (var e = 0, c = a.length; e < c; e++) b(a[e]);
                    },
                    k: function(a, b) {
                        if ("function" == typeof Array.prototype.indexOf) return Array.prototype.indexOf.call(a, b);
                        for (var e = 0, c = a.length; e < c; e++) if (a[e] === b) return e;
                        return -1;
                    },
                    La: function(a, b, e) {
                        for (var c = 0, d = a.length; c < d; c++) if (b.call(e, a[c])) return a[c];
                        return null;
                    },
                    ka: function(b, e) {
                        var c = a.a.k(b, e);
                        0 <= c && b.splice(c, 1);
                    },
                    Ma: function(b) {
                        b = b || [];
                        for (var e = [], c = 0, d = b.length; c < d; c++) 0 > a.a.k(e, b[c]) && e.push(b[c]);
                        return e;
                    },
                    Z: function(a, b) {
                        a = a || [];
                        for (var e = [], c = 0, d = a.length; c < d; c++) e.push(b(a[c]));
                        return e;
                    },
                    Y: function(a, b) {
                        a = a || [];
                        for (var e = [], c = 0, d = a.length; c < d; c++) b(a[c]) && e.push(a[c]);
                        return e;
                    },
                    R: function(a, b) {
                        if (b instanceof Array) a.push.apply(a, b); else for (var e = 0, c = b.length; e < c; e++) a.push(b[e]);
                        return a;
                    },
                    ja: function(b, e, c) {
                        var d = b.indexOf ? b.indexOf(e) : a.a.k(b, e);
                        0 > d ? c && b.push(e) : c || b.splice(d, 1);
                    },
                    extend: function(a, b) {
                        if (b) for (var e in b) b.hasOwnProperty(e) && (a[e] = b[e]);
                        return a;
                    },
                    w: b,
                    oa: function(b) {
                        for (;b.firstChild; ) a.removeNode(b.firstChild);
                    },
                    Mb: function(b) {
                        b = a.a.N(b);
                        for (var e = s.createElement("div"), c = 0, d = b.length; c < d; c++) e.appendChild(a.H(b[c]));
                        return e;
                    },
                    Oa: function(b, e) {
                        for (var c = 0, d = b.length, g = []; c < d; c++) {
                            var f = b[c].cloneNode(!0);
                            g.push(e ? a.H(f) : f);
                        }
                        return g;
                    },
                    P: function(b, e) {
                        a.a.oa(b);
                        if (e) for (var c = 0, d = e.length; c < d; c++) b.appendChild(e[c]);
                    },
                    eb: function(b, e) {
                        var c = b.nodeType ? [ b ] : b;
                        if (0 < c.length) {
                            for (var d = c[0], g = d.parentNode, f = 0, r = e.length; f < r; f++) g.insertBefore(e[f], d);
                            f = 0;
                            for (r = c.length; f < r; f++) a.removeNode(c[f]);
                        }
                    },
                    hb: function(a, b) {
                        7 > e ? a.setAttribute("selected", b) : a.selected = b;
                    },
                    F: function(a) {
                        return null === a || a === q ? "" : a.trim ? a.trim() : a.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
                    },
                    Wb: function(b, e) {
                        for (var c = [], d = (b || "").split(e), g = 0, f = d.length; g < f; g++) {
                            var r = a.a.F(d[g]);
                            "" !== r && c.push(r);
                        }
                        return c;
                    },
                    Tb: function(a, b) {
                        a = a || "";
                        return b.length > a.length ? !1 : a.substring(0, b.length) === b;
                    },
                    yb: function(a, b) {
                        if (b.compareDocumentPosition) return 16 == (b.compareDocumentPosition(a) & 16);
                        for (;null != a; ) {
                            if (a == b) return !0;
                            a = a.parentNode;
                        }
                        return !1;
                    },
                    aa: function(b) {
                        return a.a.yb(b, b.ownerDocument);
                    },
                    pb: function(b) {
                        return !!a.a.La(b, a.a.aa);
                    },
                    u: function(a) {
                        return a && a.tagName && a.tagName.toLowerCase();
                    },
                    o: function(b, d, k) {
                        var f = e && g[d];
                        if (f || "undefined" == typeof t) if (f || "function" != typeof b.addEventListener) if ("undefined" != typeof b.attachEvent) {
                            var n = function(a) {
                                k.call(b, a);
                            }, p = "on" + d;
                            b.attachEvent(p, n);
                            a.a.C.ia(b, function() {
                                b.detachEvent(p, n);
                            });
                        } else throw Error("Browser doesn't support addEventListener or attachEvent"); else b.addEventListener(d, k, !1); else {
                            if (c(b, d)) {
                                var r = k;
                                k = function(a, b) {
                                    var e = this.checked;
                                    b && (this.checked = !0 !== b.sb);
                                    r.call(this, a);
                                    this.checked = e;
                                };
                            }
                            t(b).bind(d, k);
                        }
                    },
                    Ga: function(a, b) {
                        if (!a || !a.nodeType) throw Error("element must be a DOM node when calling triggerEvent");
                        if ("undefined" != typeof t) {
                            var e = [];
                            c(a, b) && e.push({
                                sb: a.checked
                            });
                            t(a).trigger(b, e);
                        } else if ("function" == typeof s.createEvent) if ("function" == typeof a.dispatchEvent) e = s.createEvent(f[b] || "HTMLEvents"), 
                        e.initEvent(b, !0, !0, w, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, a), a.dispatchEvent(e); else throw Error("The supplied element doesn't support dispatchEvent"); else if ("undefined" != typeof a.fireEvent) c(a, b) && (a.checked = !0 !== a.checked), 
                        a.fireEvent("on" + b); else throw Error("Browser doesn't support triggering events");
                    },
                    c: function(b) {
                        return a.T(b) ? b() : b;
                    },
                    ya: function(b) {
                        return a.T(b) ? b.t() : b;
                    },
                    ga: function(b, e, c) {
                        if (e) {
                            var d = /\S+/g, g = b.className.match(d) || [];
                            a.a.p(e.match(d), function(b) {
                                a.a.ja(g, b, c);
                            });
                            b.className = g.join(" ");
                        }
                    },
                    ib: function(b, e) {
                        var c = a.a.c(e);
                        if (null === c || c === q) c = "";
                        var d = a.e.firstChild(b);
                        !d || 3 != d.nodeType || a.e.nextSibling(d) ? a.e.P(b, [ s.createTextNode(c) ]) : d.data = c;
                        a.a.Bb(b);
                    },
                    gb: function(a, b) {
                        a.name = b;
                        if (7 >= e) try {
                            a.mergeAttributes(s.createElement("<input name='" + a.name + "'/>"), !1);
                        } catch (c) {}
                    },
                    Bb: function(a) {
                        9 <= e && (a = 1 == a.nodeType ? a : a.parentNode, a.style && (a.style.zoom = a.style.zoom));
                    },
                    zb: function(a) {
                        if (e) {
                            var b = a.style.width;
                            a.style.width = 0;
                            a.style.width = b;
                        }
                    },
                    Qb: function(b, e) {
                        b = a.a.c(b);
                        e = a.a.c(e);
                        for (var c = [], d = b; d <= e; d++) c.push(d);
                        return c;
                    },
                    N: function(a) {
                        for (var b = [], e = 0, c = a.length; e < c; e++) b.push(a[e]);
                        return b;
                    },
                    Ub: 6 === e,
                    Vb: 7 === e,
                    ca: e,
                    Ua: function(b, e) {
                        for (var c = a.a.N(b.getElementsByTagName("input")).concat(a.a.N(b.getElementsByTagName("textarea"))), d = "string" == typeof e ? function(a) {
                            return a.name === e;
                        } : function(a) {
                            return e.test(a.name);
                        }, g = [], f = c.length - 1; 0 <= f; f--) d(c[f]) && g.push(c[f]);
                        return g;
                    },
                    Nb: function(b) {
                        return "string" == typeof b && (b = a.a.F(b)) ? y && y.parse ? y.parse(b) : new Function("return " + b)() : null;
                    },
                    Ca: function(b, e, c) {
                        if (!y || !y.stringify) throw Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
                        return y.stringify(a.a.c(b), e, c);
                    },
                    Ob: function(e, c, d) {
                        d = d || {};
                        var g = d.params || {}, f = d.includeFields || this.Ta, p = e;
                        if ("object" == typeof e && "form" === a.a.u(e)) for (var p = e.action, r = f.length - 1; 0 <= r; r--) for (var z = a.a.Ua(e, f[r]), D = z.length - 1; 0 <= D; D--) g[z[D].name] = z[D].value;
                        c = a.a.c(c);
                        var q = s.createElement("form");
                        q.style.display = "none";
                        q.action = p;
                        q.method = "post";
                        for (var v in c) e = s.createElement("input"), e.name = v, e.value = a.a.Ca(a.a.c(c[v])), 
                        q.appendChild(e);
                        b(g, function(a, b) {
                            var e = s.createElement("input");
                            e.name = a;
                            e.value = b;
                            q.appendChild(e);
                        });
                        s.body.appendChild(q);
                        d.submitter ? d.submitter(q) : q.submit();
                        setTimeout(function() {
                            q.parentNode.removeChild(q);
                        }, 0);
                    }
                };
            }();
            a.b("utils", a.a);
            a.b("utils.arrayForEach", a.a.p);
            a.b("utils.arrayFirst", a.a.La);
            a.b("utils.arrayFilter", a.a.Y);
            a.b("utils.arrayGetDistinctValues", a.a.Ma);
            a.b("utils.arrayIndexOf", a.a.k);
            a.b("utils.arrayMap", a.a.Z);
            a.b("utils.arrayPushAll", a.a.R);
            a.b("utils.arrayRemoveItem", a.a.ka);
            a.b("utils.extend", a.a.extend);
            a.b("utils.fieldsIncludedWithJsonPost", a.a.Ta);
            a.b("utils.getFormFields", a.a.Ua);
            a.b("utils.peekObservable", a.a.ya);
            a.b("utils.postJson", a.a.Ob);
            a.b("utils.parseJson", a.a.Nb);
            a.b("utils.registerEventHandler", a.a.o);
            a.b("utils.stringifyJson", a.a.Ca);
            a.b("utils.range", a.a.Qb);
            a.b("utils.toggleDomNodeCssClass", a.a.ga);
            a.b("utils.triggerEvent", a.a.Ga);
            a.b("utils.unwrapObservable", a.a.c);
            a.b("utils.objectForEach", a.a.w);
            a.b("utils.addOrRemoveItem", a.a.ja);
            a.b("unwrap", a.a.c);
            Function.prototype.bind || (Function.prototype.bind = function(a) {
                var c = this, d = Array.prototype.slice.call(arguments);
                a = d.shift();
                return function() {
                    return c.apply(a, d.concat(Array.prototype.slice.call(arguments)));
                };
            });
            a.a.f = new function() {
                var b = 0, c = "__ko__" + new Date().getTime(), d = {};
                return {
                    get: function(b, c) {
                        var e = a.a.f.pa(b, !1);
                        return e === q ? q : e[c];
                    },
                    set: function(b, c, e) {
                        if (e !== q || a.a.f.pa(b, !1) !== q) a.a.f.pa(b, !0)[c] = e;
                    },
                    pa: function(a, g) {
                        var e = a[c];
                        if (!e || "null" === e || !d[e]) {
                            if (!g) return q;
                            e = a[c] = "ko" + b++;
                            d[e] = {};
                        }
                        return d[e];
                    },
                    clear: function(a) {
                        var b = a[c];
                        return b ? (delete d[b], a[c] = null, !0) : !1;
                    }
                };
            }();
            a.b("utils.domData", a.a.f);
            a.b("utils.domData.clear", a.a.f.clear);
            a.a.C = new function() {
                function b(b, c) {
                    var g = a.a.f.get(b, d);
                    g === q && c && (g = [], a.a.f.set(b, d, g));
                    return g;
                }
                function c(e) {
                    var d = b(e, !1);
                    if (d) for (var d = d.slice(0), f = 0; f < d.length; f++) d[f](e);
                    a.a.f.clear(e);
                    "function" == typeof t && "function" == typeof t.cleanData && t.cleanData([ e ]);
                    if (g[e.nodeType]) for (d = e.firstChild; e = d; ) d = e.nextSibling, 8 === e.nodeType && c(e);
                }
                var d = "__ko_domNodeDisposal__" + new Date().getTime(), f = {
                    1: !0,
                    8: !0,
                    9: !0
                }, g = {
                    1: !0,
                    9: !0
                };
                return {
                    ia: function(a, c) {
                        if ("function" != typeof c) throw Error("Callback must be a function");
                        b(a, !0).push(c);
                    },
                    cb: function(e, c) {
                        var g = b(e, !1);
                        g && (a.a.ka(g, c), 0 == g.length && a.a.f.set(e, d, q));
                    },
                    H: function(b) {
                        if (f[b.nodeType] && (c(b), g[b.nodeType])) {
                            var d = [];
                            a.a.R(d, b.getElementsByTagName("*"));
                            for (var h = 0, k = d.length; h < k; h++) c(d[h]);
                        }
                        return b;
                    },
                    removeNode: function(b) {
                        a.H(b);
                        b.parentNode && b.parentNode.removeChild(b);
                    }
                };
            }();
            a.H = a.a.C.H;
            a.removeNode = a.a.C.removeNode;
            a.b("cleanNode", a.H);
            a.b("removeNode", a.removeNode);
            a.b("utils.domNodeDisposal", a.a.C);
            a.b("utils.domNodeDisposal.addDisposeCallback", a.a.C.ia);
            a.b("utils.domNodeDisposal.removeDisposeCallback", a.a.C.cb);
            (function() {
                a.a.xa = function(b) {
                    var c;
                    if ("undefined" != typeof t) if (t.parseHTML) c = t.parseHTML(b) || []; else {
                        if ((c = t.clean([ b ])) && c[0]) {
                            for (b = c[0]; b.parentNode && 11 !== b.parentNode.nodeType; ) b = b.parentNode;
                            b.parentNode && b.parentNode.removeChild(b);
                        }
                    } else {
                        var d = a.a.F(b).toLowerCase();
                        c = s.createElement("div");
                        d = d.match(/^<(thead|tbody|tfoot)/) && [ 1, "<table>", "</table>" ] || !d.indexOf("<tr") && [ 2, "<table><tbody>", "</tbody></table>" ] || (!d.indexOf("<td") || !d.indexOf("<th")) && [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ] || [ 0, "", "" ];
                        b = "ignored<div>" + d[1] + b + d[2] + "</div>";
                        for ("function" == typeof w.innerShiv ? c.appendChild(w.innerShiv(b)) : c.innerHTML = b; d[0]--; ) c = c.lastChild;
                        c = a.a.N(c.lastChild.childNodes);
                    }
                    return c;
                };
                a.a.fa = function(b, c) {
                    a.a.oa(b);
                    c = a.a.c(c);
                    if (null !== c && c !== q) if ("string" != typeof c && (c = c.toString()), "undefined" != typeof t) t(b).html(c); else for (var d = a.a.xa(c), f = 0; f < d.length; f++) b.appendChild(d[f]);
                };
            })();
            a.b("utils.parseHtmlFragment", a.a.xa);
            a.b("utils.setHtml", a.a.fa);
            a.s = function() {
                function b(c, f) {
                    if (c) if (8 == c.nodeType) {
                        var g = a.s.$a(c.nodeValue);
                        null != g && f.push({
                            xb: c,
                            Kb: g
                        });
                    } else if (1 == c.nodeType) for (var g = 0, e = c.childNodes, m = e.length; g < m; g++) b(e[g], f);
                }
                var c = {};
                return {
                    va: function(a) {
                        if ("function" != typeof a) throw Error("You can only pass a function to ko.memoization.memoize()");
                        var b = (4294967296 * (1 + Math.random()) | 0).toString(16).substring(1) + (4294967296 * (1 + Math.random()) | 0).toString(16).substring(1);
                        c[b] = a;
                        return "<!--[ko_memo:" + b + "]-->";
                    },
                    mb: function(a, b) {
                        var g = c[a];
                        if (g === q) throw Error("Couldn't find any memo with ID " + a + ". Perhaps it's already been unmemoized.");
                        try {
                            return g.apply(null, b || []), !0;
                        } finally {
                            delete c[a];
                        }
                    },
                    nb: function(c, f) {
                        var g = [];
                        b(c, g);
                        for (var e = 0, m = g.length; e < m; e++) {
                            var h = g[e].xb, k = [ h ];
                            f && a.a.R(k, f);
                            a.s.mb(g[e].Kb, k);
                            h.nodeValue = "";
                            h.parentNode && h.parentNode.removeChild(h);
                        }
                    },
                    $a: function(a) {
                        return (a = a.match(/^\[ko_memo\:(.*?)\]$/)) ? a[1] : null;
                    }
                };
            }();
            a.b("memoization", a.s);
            a.b("memoization.memoize", a.s.va);
            a.b("memoization.unmemoize", a.s.mb);
            a.b("memoization.parseMemoText", a.s.$a);
            a.b("memoization.unmemoizeDomNodeAndDescendants", a.s.nb);
            a.Sa = {
                throttle: function(b, c) {
                    b.throttleEvaluation = c;
                    var d = null;
                    return a.j({
                        read: b,
                        write: function(a) {
                            clearTimeout(d);
                            d = setTimeout(function() {
                                b(a);
                            }, c);
                        }
                    });
                },
                notify: function(b, c) {
                    b.equalityComparer = "always" == c ? F(!1) : a.m.fn.equalityComparer;
                    return b;
                }
            };
            a.b("extenders", a.Sa);
            a.kb = function(b, c, d) {
                this.target = b;
                this.la = c;
                this.wb = d;
                a.r(this, "dispose", this.B);
            };
            a.kb.prototype.B = function() {
                this.Hb = !0;
                this.wb();
            };
            a.V = function() {
                this.G = {};
                a.a.extend(this, a.V.fn);
                a.r(this, "subscribe", this.Da);
                a.r(this, "extend", this.extend);
                a.r(this, "getSubscriptionsCount", this.Db);
            };
            a.V.fn = {
                Da: function(b, c, d) {
                    d = d || "change";
                    var f = new a.kb(this, c ? b.bind(c) : b, function() {
                        a.a.ka(this.G[d], f);
                    }.bind(this));
                    this.G[d] || (this.G[d] = []);
                    this.G[d].push(f);
                    return f;
                },
                notifySubscribers: function(b, c) {
                    c = c || "change";
                    this.G[c] && a.q.I(function() {
                        a.a.p(this.G[c].slice(0), function(a) {
                            a && !0 !== a.Hb && a.la(b);
                        });
                    }, this);
                },
                Db: function() {
                    var b = 0;
                    a.a.w(this.G, function(a, d) {
                        b += d.length;
                    });
                    return b;
                },
                extend: function(b) {
                    var c = this;
                    b && a.a.w(b, function(b, f) {
                        var g = a.Sa[b];
                        "function" == typeof g && (c = g(c, f));
                    });
                    return c;
                }
            };
            a.Wa = function(a) {
                return null != a && "function" == typeof a.Da && "function" == typeof a.notifySubscribers;
            };
            a.b("subscribable", a.V);
            a.b("isSubscribable", a.Wa);
            a.q = function() {
                var b = [];
                return {
                    rb: function(a) {
                        b.push({
                            la: a,
                            Ra: []
                        });
                    },
                    end: function() {
                        b.pop();
                    },
                    bb: function(c) {
                        if (!a.Wa(c)) throw Error("Only subscribable things can act as dependencies");
                        if (0 < b.length) {
                            var d = b[b.length - 1];
                            !d || 0 <= a.a.k(d.Ra, c) || (d.Ra.push(c), d.la(c));
                        }
                    },
                    I: function(a, d, f) {
                        try {
                            return b.push(null), a.apply(d, f || []);
                        } finally {
                            b.pop();
                        }
                    }
                };
            }();
            var L = {
                undefined: !0,
                "boolean": !0,
                number: !0,
                string: !0
            };
            a.m = function(b) {
                function c() {
                    if (0 < arguments.length) return c.equalityComparer && c.equalityComparer(d, arguments[0]) || (c.K(), 
                    d = arguments[0], c.J()), this;
                    a.q.bb(c);
                    return d;
                }
                var d = b;
                a.V.call(c);
                c.t = function() {
                    return d;
                };
                c.J = function() {
                    c.notifySubscribers(d);
                };
                c.K = function() {
                    c.notifySubscribers(d, "beforeChange");
                };
                a.a.extend(c, a.m.fn);
                a.r(c, "peek", c.t);
                a.r(c, "valueHasMutated", c.J);
                a.r(c, "valueWillMutate", c.K);
                return c;
            };
            a.m.fn = {
                equalityComparer: function(a, c) {
                    return null === a || typeof a in L ? a === c : !1;
                }
            };
            var A = a.m.Pb = "__ko_proto__";
            a.m.fn[A] = a.m;
            a.qa = function(b, c) {
                return null === b || b === q || b[A] === q ? !1 : b[A] === c ? !0 : a.qa(b[A], c);
            };
            a.T = function(b) {
                return a.qa(b, a.m);
            };
            a.Xa = function(b) {
                return "function" == typeof b && b[A] === a.m || "function" == typeof b && b[A] === a.j && b.Eb ? !0 : !1;
            };
            a.b("observable", a.m);
            a.b("isObservable", a.T);
            a.b("isWriteableObservable", a.Xa);
            a.U = function(b) {
                b = b || [];
                if ("object" != typeof b || !("length" in b)) throw Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");
                b = a.m(b);
                a.a.extend(b, a.U.fn);
                return b;
            };
            a.U.fn = {
                remove: function(a) {
                    for (var c = this.t(), d = [], f = "function" == typeof a ? a : function(e) {
                        return e === a;
                    }, g = 0; g < c.length; g++) {
                        var e = c[g];
                        f(e) && (0 === d.length && this.K(), d.push(e), c.splice(g, 1), g--);
                    }
                    d.length && this.J();
                    return d;
                },
                removeAll: function(b) {
                    if (b === q) {
                        var c = this.t(), d = c.slice(0);
                        this.K();
                        c.splice(0, c.length);
                        this.J();
                        return d;
                    }
                    return b ? this.remove(function(c) {
                        return 0 <= a.a.k(b, c);
                    }) : [];
                },
                destroy: function(a) {
                    var c = this.t(), d = "function" == typeof a ? a : function(c) {
                        return c === a;
                    };
                    this.K();
                    for (var f = c.length - 1; 0 <= f; f--) d(c[f]) && (c[f]._destroy = !0);
                    this.J();
                },
                destroyAll: function(b) {
                    return b === q ? this.destroy(F(!0)) : b ? this.destroy(function(c) {
                        return 0 <= a.a.k(b, c);
                    }) : [];
                },
                indexOf: function(b) {
                    var c = this();
                    return a.a.k(c, b);
                },
                replace: function(a, c) {
                    var d = this.indexOf(a);
                    0 <= d && (this.K(), this.t()[d] = c, this.J());
                }
            };
            a.a.p("pop push reverse shift sort splice unshift".split(" "), function(b) {
                a.U.fn[b] = function() {
                    var a = this.t();
                    this.K();
                    a = a[b].apply(a, arguments);
                    this.J();
                    return a;
                };
            });
            a.a.p([ "slice" ], function(b) {
                a.U.fn[b] = function() {
                    var a = this();
                    return a[b].apply(a, arguments);
                };
            });
            a.b("observableArray", a.U);
            a.j = function(b, c, d) {
                function f() {
                    a.a.p(v, function(a) {
                        a.B();
                    });
                    v = [];
                }
                function g() {
                    var a = m.throttleEvaluation;
                    a && 0 <= a ? (clearTimeout(t), t = setTimeout(e, a)) : e();
                }
                function e() {
                    if (!n) if (l && D()) x(); else {
                        n = !0;
                        try {
                            var b = a.a.Z(v, function(a) {
                                return a.target;
                            });
                            a.q.rb(function(e) {
                                var c;
                                0 <= (c = a.a.k(b, e)) ? b[c] = q : v.push(e.Da(g));
                            });
                            for (var e = p.call(c), d = b.length - 1; 0 <= d; d--) b[d] && v.splice(d, 1)[0].B();
                            l = !0;
                            m.notifySubscribers(k, "beforeChange");
                            k = e;
                            m.notifySubscribers(k);
                        } finally {
                            a.q.end(), n = !1;
                        }
                        v.length || x();
                    }
                }
                function m() {
                    if (0 < arguments.length) {
                        if ("function" === typeof r) r.apply(c, arguments); else throw Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");
                        return this;
                    }
                    l || e();
                    a.q.bb(m);
                    return k;
                }
                function h() {
                    return !l || 0 < v.length;
                }
                var k, l = !1, n = !1, p = b;
                p && "object" == typeof p ? (d = p, p = d.read) : (d = d || {}, p || (p = d.read));
                if ("function" != typeof p) throw Error("Pass a function that returns the value of the ko.computed");
                var r = d.write, z = d.disposeWhenNodeIsRemoved || d.$ || null, D = d.disposeWhen || d.Qa || F(!1), x = f, v = [], t = null;
                c || (c = d.owner);
                m.t = function() {
                    l || e();
                    return k;
                };
                m.Cb = function() {
                    return v.length;
                };
                m.Eb = "function" === typeof d.write;
                m.B = function() {
                    x();
                };
                m.ta = h;
                a.V.call(m);
                a.a.extend(m, a.j.fn);
                a.r(m, "peek", m.t);
                a.r(m, "dispose", m.B);
                a.r(m, "isActive", m.ta);
                a.r(m, "getDependenciesCount", m.Cb);
                !0 !== d.deferEvaluation && e();
                if (z && h()) {
                    x = function() {
                        a.a.C.cb(z, x);
                        f();
                    };
                    a.a.C.ia(z, x);
                    var s = D, D = function() {
                        return !a.a.aa(z) || s();
                    };
                }
                return m;
            };
            a.Gb = function(b) {
                return a.qa(b, a.j);
            };
            C = a.m.Pb;
            a.j[C] = a.m;
            a.j.fn = {};
            a.j.fn[C] = a.j;
            a.b("dependentObservable", a.j);
            a.b("computed", a.j);
            a.b("isComputed", a.Gb);
            (function() {
                function b(a, g, e) {
                    e = e || new d();
                    a = g(a);
                    if ("object" != typeof a || null === a || a === q || a instanceof Date || a instanceof String || a instanceof Number || a instanceof Boolean) return a;
                    var m = a instanceof Array ? [] : {};
                    e.save(a, m);
                    c(a, function(c) {
                        var d = g(a[c]);
                        switch (typeof d) {
                          case "boolean":
                          case "number":
                          case "string":
                          case "function":
                            m[c] = d;
                            break;

                          case "object":
                          case "undefined":
                            var l = e.get(d);
                            m[c] = l !== q ? l : b(d, g, e);
                        }
                    });
                    return m;
                }
                function c(a, b) {
                    if (a instanceof Array) {
                        for (var e = 0; e < a.length; e++) b(e);
                        "function" == typeof a.toJSON && b("toJSON");
                    } else for (e in a) b(e);
                }
                function d() {
                    this.keys = [];
                    this.Ha = [];
                }
                a.lb = function(c) {
                    if (0 == arguments.length) throw Error("When calling ko.toJS, pass the object you want to convert.");
                    return b(c, function(b) {
                        for (var e = 0; a.T(b) && 10 > e; e++) b = b();
                        return b;
                    });
                };
                a.toJSON = function(b, c, e) {
                    b = a.lb(b);
                    return a.a.Ca(b, c, e);
                };
                d.prototype = {
                    save: function(b, c) {
                        var e = a.a.k(this.keys, b);
                        0 <= e ? this.Ha[e] = c : (this.keys.push(b), this.Ha.push(c));
                    },
                    get: function(b) {
                        b = a.a.k(this.keys, b);
                        return 0 <= b ? this.Ha[b] : q;
                    }
                };
            })();
            a.b("toJS", a.lb);
            a.b("toJSON", a.toJSON);
            (function() {
                a.h = {
                    n: function(b) {
                        switch (a.a.u(b)) {
                          case "option":
                            return !0 === b.__ko__hasDomDataOptionValue__ ? a.a.f.get(b, a.d.options.wa) : 7 >= a.a.ca ? b.getAttributeNode("value") && b.getAttributeNode("value").specified ? b.value : b.text : b.value;

                          case "select":
                            return 0 <= b.selectedIndex ? a.h.n(b.options[b.selectedIndex]) : q;

                          default:
                            return b.value;
                        }
                    },
                    W: function(b, c) {
                        switch (a.a.u(b)) {
                          case "option":
                            switch (typeof c) {
                              case "string":
                                a.a.f.set(b, a.d.options.wa, q);
                                "__ko__hasDomDataOptionValue__" in b && delete b.__ko__hasDomDataOptionValue__;
                                b.value = c;
                                break;

                              default:
                                a.a.f.set(b, a.d.options.wa, c), b.__ko__hasDomDataOptionValue__ = !0, b.value = "number" === typeof c ? c : "";
                            }
                            break;

                          case "select":
                            "" === c && (c = q);
                            if (null === c || c === q) b.selectedIndex = -1;
                            for (var d = b.options.length - 1; 0 <= d; d--) if (a.h.n(b.options[d]) == c) {
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
            a.b("selectExtensions", a.h);
            a.b("selectExtensions.readValue", a.h.n);
            a.b("selectExtensions.writeValue", a.h.W);
            a.g = function() {
                function b(a, b) {
                    for (var d = null; a != d; ) d = a, a = a.replace(c, function(a, c) {
                        return b[c];
                    });
                    return a;
                }
                var c = /\@ko_token_(\d+)\@/g, d = [ "true", "false", "null", "undefined" ], f = /^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i;
                return {
                    S: [],
                    da: function(c) {
                        var e = a.a.F(c);
                        if (3 > e.length) return [];
                        "{" === e.charAt(0) && (e = e.substring(1, e.length - 1));
                        c = [];
                        for (var d = null, f, k = 0; k < e.length; k++) {
                            var l = e.charAt(k);
                            if (null === d) switch (l) {
                              case '"':
                              case "'":
                              case "/":
                                d = k, f = l;
                            } else if (l == f && "\\" !== e.charAt(k - 1)) {
                                l = e.substring(d, k + 1);
                                c.push(l);
                                var n = "@ko_token_" + (c.length - 1) + "@", e = e.substring(0, d) + n + e.substring(k + 1), k = k - (l.length - n.length), d = null;
                            }
                        }
                        f = d = null;
                        for (var p = 0, r = null, k = 0; k < e.length; k++) {
                            l = e.charAt(k);
                            if (null === d) switch (l) {
                              case "{":
                                d = k;
                                r = l;
                                f = "}";
                                break;

                              case "(":
                                d = k;
                                r = l;
                                f = ")";
                                break;

                              case "[":
                                d = k, r = l, f = "]";
                            }
                            l === r ? p++ : l === f && (p--, 0 === p && (l = e.substring(d, k + 1), c.push(l), 
                            n = "@ko_token_" + (c.length - 1) + "@", e = e.substring(0, d) + n + e.substring(k + 1), 
                            k -= l.length - n.length, d = null));
                        }
                        f = [];
                        e = e.split(",");
                        d = 0;
                        for (k = e.length; d < k; d++) p = e[d], r = p.indexOf(":"), 0 < r && r < p.length - 1 ? (l = p.substring(r + 1), 
                        f.push({
                            key: b(p.substring(0, r), c),
                            value: b(l, c)
                        })) : f.push({
                            unknown: b(p, c)
                        });
                        return f;
                    },
                    ea: function(b) {
                        var e = "string" === typeof b ? a.g.da(b) : b, c = [];
                        b = [];
                        for (var h, k = 0; h = e[k]; k++) if (0 < c.length && c.push(","), h.key) {
                            var l;
                            a: {
                                l = h.key;
                                var n = a.a.F(l);
                                switch (n.length && n.charAt(0)) {
                                  case "'":
                                  case '"':
                                    break a;

                                  default:
                                    l = "'" + n + "'";
                                }
                            }
                            h = h.value;
                            c.push(l);
                            c.push(":");
                            c.push(h);
                            h = a.a.F(h);
                            0 <= a.a.k(d, a.a.F(h).toLowerCase()) ? h = !1 : (n = h.match(f), h = null === n ? !1 : n[1] ? "Object(" + n[1] + ")" + n[2] : h);
                            h && (0 < b.length && b.push(", "), b.push(l + " : function(__ko_value) { " + h + " = __ko_value; }"));
                        } else h.unknown && c.push(h.unknown);
                        e = c.join("");
                        0 < b.length && (e = e + ", '_ko_property_writers' : { " + b.join("") + " } ");
                        return e;
                    },
                    Jb: function(b, c) {
                        for (var d = 0; d < b.length; d++) if (a.a.F(b[d].key) == c) return !0;
                        return !1;
                    },
                    ha: function(b, c, d, f, k) {
                        if (b && a.T(b)) !a.Xa(b) || k && b.t() === f || b(f); else if ((b = c()._ko_property_writers) && b[d]) b[d](f);
                    }
                };
            }();
            a.b("expressionRewriting", a.g);
            a.b("expressionRewriting.bindingRewriteValidators", a.g.S);
            a.b("expressionRewriting.parseObjectLiteral", a.g.da);
            a.b("expressionRewriting.preProcessBindings", a.g.ea);
            a.b("jsonExpressionRewriting", a.g);
            a.b("jsonExpressionRewriting.insertPropertyAccessorsIntoJson", a.g.ea);
            (function() {
                function b(a) {
                    return 8 == a.nodeType && (g ? a.text : a.nodeValue).match(e);
                }
                function c(a) {
                    return 8 == a.nodeType && (g ? a.text : a.nodeValue).match(m);
                }
                function d(a, e) {
                    for (var d = a, g = 1, f = []; d = d.nextSibling; ) {
                        if (c(d) && (g--, 0 === g)) return f;
                        f.push(d);
                        b(d) && g++;
                    }
                    if (!e) throw Error("Cannot find closing comment tag to match: " + a.nodeValue);
                    return null;
                }
                function f(a, b) {
                    var c = d(a, b);
                    return c ? 0 < c.length ? c[c.length - 1].nextSibling : a.nextSibling : null;
                }
                var g = s && "<!--test-->" === s.createComment("test").text, e = g ? /^\x3c!--\s*ko(?:\s+(.+\s*\:[\s\S]*))?\s*--\x3e$/ : /^\s*ko(?:\s+(.+\s*\:[\s\S]*))?\s*$/, m = g ? /^\x3c!--\s*\/ko\s*--\x3e$/ : /^\s*\/ko\s*$/, h = {
                    ul: !0,
                    ol: !0
                };
                a.e = {
                    L: {},
                    childNodes: function(a) {
                        return b(a) ? d(a) : a.childNodes;
                    },
                    ba: function(c) {
                        if (b(c)) {
                            c = a.e.childNodes(c);
                            for (var e = 0, d = c.length; e < d; e++) a.removeNode(c[e]);
                        } else a.a.oa(c);
                    },
                    P: function(c, e) {
                        if (b(c)) {
                            a.e.ba(c);
                            for (var d = c.nextSibling, g = 0, f = e.length; g < f; g++) d.parentNode.insertBefore(e[g], d);
                        } else a.a.P(c, e);
                    },
                    ab: function(a, c) {
                        b(a) ? a.parentNode.insertBefore(c, a.nextSibling) : a.firstChild ? a.insertBefore(c, a.firstChild) : a.appendChild(c);
                    },
                    Va: function(c, e, d) {
                        d ? b(c) ? c.parentNode.insertBefore(e, d.nextSibling) : d.nextSibling ? c.insertBefore(e, d.nextSibling) : c.appendChild(e) : a.e.ab(c, e);
                    },
                    firstChild: function(a) {
                        return b(a) ? !a.nextSibling || c(a.nextSibling) ? null : a.nextSibling : a.firstChild;
                    },
                    nextSibling: function(a) {
                        b(a) && (a = f(a));
                        return a.nextSibling && c(a.nextSibling) ? null : a.nextSibling;
                    },
                    ob: function(a) {
                        return (a = b(a)) ? a[1] : null;
                    },
                    Za: function(e) {
                        if (h[a.a.u(e)]) {
                            var d = e.firstChild;
                            if (d) {
                                do if (1 === d.nodeType) {
                                    var g;
                                    g = d.firstChild;
                                    var m = null;
                                    if (g) {
                                        do if (m) m.push(g); else if (b(g)) {
                                            var r = f(g, !0);
                                            r ? g = r : m = [ g ];
                                        } else c(g) && (m = [ g ]); while (g = g.nextSibling);
                                    }
                                    if (g = m) for (m = d.nextSibling, r = 0; r < g.length; r++) m ? e.insertBefore(g[r], m) : e.appendChild(g[r]);
                                } while (d = d.nextSibling);
                            }
                        }
                    }
                };
            })();
            a.b("virtualElements", a.e);
            a.b("virtualElements.allowedBindings", a.e.L);
            a.b("virtualElements.emptyNode", a.e.ba);
            a.b("virtualElements.insertAfter", a.e.Va);
            a.b("virtualElements.prepend", a.e.ab);
            a.b("virtualElements.setDomNodeChildren", a.e.P);
            (function() {
                a.M = function() {
                    this.Na = {};
                };
                a.a.extend(a.M.prototype, {
                    nodeHasBindings: function(b) {
                        switch (b.nodeType) {
                          case 1:
                            return null != b.getAttribute("data-bind");

                          case 8:
                            return null != a.e.ob(b);

                          default:
                            return !1;
                        }
                    },
                    getBindings: function(a, c) {
                        var d = this.getBindingsString(a, c);
                        return d ? this.parseBindingsString(d, c, a) : null;
                    },
                    getBindingsString: function(b) {
                        switch (b.nodeType) {
                          case 1:
                            return b.getAttribute("data-bind");

                          case 8:
                            return a.e.ob(b);

                          default:
                            return null;
                        }
                    },
                    parseBindingsString: function(b, c, d) {
                        try {
                            var f;
                            if (!(f = this.Na[b])) {
                                var g = this.Na, e, m = "with($context){with($data||{}){return{" + a.g.ea(b) + "}}}";
                                e = new Function("$context", "$element", m);
                                f = g[b] = e;
                            }
                            return f(c, d);
                        } catch (h) {
                            throw h.message = "Unable to parse bindings.\nBindings value: " + b + "\nMessage: " + h.message, 
                            h;
                        }
                    }
                });
                a.M.instance = new a.M();
            })();
            a.b("bindingProvider", a.M);
            (function() {
                function b(b, e, d) {
                    for (var f = a.e.firstChild(e); e = f; ) f = a.e.nextSibling(e), c(b, e, d);
                }
                function c(c, e, f) {
                    var h = !0, k = 1 === e.nodeType;
                    k && a.e.Za(e);
                    if (k && f || a.M.instance.nodeHasBindings(e)) h = d(e, null, c, f).Sb;
                    h && b(c, e, !k);
                }
                function d(b, c, d, h) {
                    function k(a) {
                        return function() {
                            return p[a];
                        };
                    }
                    function l() {
                        return p;
                    }
                    var n = 0, p, r, z = a.a.f.get(b, f);
                    if (!c) {
                        if (z) throw Error("You cannot apply bindings multiple times to the same element.");
                        a.a.f.set(b, f, !0);
                    }
                    a.j(function() {
                        var f = d && d instanceof a.A ? d : new a.A(a.a.c(d)), x = f.$data;
                        !z && h && a.jb(b, f);
                        if (p = ("function" == typeof c ? c(f, b) : c) || a.M.instance.getBindings(b, f)) 0 === n && (n = 1, 
                        a.a.w(p, function(c) {
                            var e = a.d[c];
                            if (e && 8 === b.nodeType && !a.e.L[c]) throw Error("The binding '" + c + "' cannot be used with virtual elements");
                            if (e && "function" == typeof e.init && (e = (0, e.init)(b, k(c), l, x, f)) && e.controlsDescendantBindings) {
                                if (r !== q) throw Error("Multiple bindings (" + r + " and " + c + ") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element.");
                                r = c;
                            }
                        }), n = 2), 2 === n && a.a.w(p, function(c) {
                            var e = a.d[c];
                            e && "function" == typeof e.update && (0, e.update)(b, k(c), l, x, f);
                        });
                    }, null, {
                        $: b
                    });
                    return {
                        Sb: r === q
                    };
                }
                a.d = {};
                a.A = function(b, c, d) {
                    c ? (a.a.extend(this, c), this.$parentContext = c, this.$parent = c.$data, this.$parents = (c.$parents || []).slice(0), 
                    this.$parents.unshift(this.$parent)) : (this.$parents = [], this.$root = b, this.ko = a);
                    this.$data = b;
                    d && (this[d] = b);
                };
                a.A.prototype.createChildContext = function(b, c) {
                    return new a.A(b, this, c);
                };
                a.A.prototype.extend = function(b) {
                    var c = a.a.extend(new a.A(), this);
                    return a.a.extend(c, b);
                };
                var f = "__ko_boundElement";
                a.jb = function(b, c) {
                    if (2 == arguments.length) a.a.f.set(b, "__ko_bindingContext__", c); else return a.a.f.get(b, "__ko_bindingContext__");
                };
                a.Ka = function(b, c, f) {
                    1 === b.nodeType && a.e.Za(b);
                    return d(b, c, f, !0);
                };
                a.Ja = function(a, c) {
                    1 !== c.nodeType && 8 !== c.nodeType || b(a, c, !0);
                };
                a.Ia = function(a, b) {
                    if (b && 1 !== b.nodeType && 8 !== b.nodeType) throw Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node");
                    b = b || w.document.body;
                    c(a, b, !0);
                };
                a.na = function(b) {
                    switch (b.nodeType) {
                      case 1:
                      case 8:
                        var c = a.jb(b);
                        if (c) return c;
                        if (b.parentNode) return a.na(b.parentNode);
                    }
                    return q;
                };
                a.ub = function(b) {
                    return (b = a.na(b)) ? b.$data : q;
                };
                a.b("bindingHandlers", a.d);
                a.b("applyBindings", a.Ia);
                a.b("applyBindingsToDescendants", a.Ja);
                a.b("applyBindingsToNode", a.Ka);
                a.b("contextFor", a.na);
                a.b("dataFor", a.ub);
            })();
            var K = {
                "class": "className",
                "for": "htmlFor"
            };
            a.d.attr = {
                update: function(b, c) {
                    var d = a.a.c(c()) || {};
                    a.a.w(d, function(c, d) {
                        d = a.a.c(d);
                        var e = !1 === d || null === d || d === q;
                        e && b.removeAttribute(c);
                        8 >= a.a.ca && c in K ? (c = K[c], e ? b.removeAttribute(c) : b[c] = d) : e || b.setAttribute(c, d.toString());
                        "name" === c && a.a.gb(b, e ? "" : d.toString());
                    });
                }
            };
            a.d.checked = {
                init: function(b, c, d) {
                    a.a.o(b, "click", function() {
                        var f;
                        if ("checkbox" == b.type) f = b.checked; else if ("radio" == b.type && b.checked) f = b.value; else return;
                        var g = c(), e = a.a.c(g);
                        "checkbox" == b.type && e instanceof Array ? a.a.ja(g, b.value, b.checked) : a.g.ha(g, d, "checked", f, !0);
                    });
                    "radio" != b.type || b.name || a.d.uniqueName.init(b, F(!0));
                },
                update: function(b, c) {
                    var d = a.a.c(c());
                    "checkbox" == b.type ? b.checked = d instanceof Array ? 0 <= a.a.k(d, b.value) : d : "radio" == b.type && (b.checked = b.value == d);
                }
            };
            a.d.css = {
                update: function(b, c) {
                    var d = a.a.c(c());
                    "object" == typeof d ? a.a.w(d, function(c, d) {
                        d = a.a.c(d);
                        a.a.ga(b, c, d);
                    }) : (d = String(d || ""), a.a.ga(b, b.__ko__cssValue, !1), b.__ko__cssValue = d, 
                    a.a.ga(b, d, !0));
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
                init: function(b, c, d, f) {
                    var g = c() || {};
                    a.a.w(g, function(e) {
                        "string" == typeof e && a.a.o(b, e, function(b) {
                            var g, k = c()[e];
                            if (k) {
                                var l = d();
                                try {
                                    var n = a.a.N(arguments);
                                    n.unshift(f);
                                    g = k.apply(f, n);
                                } finally {
                                    !0 !== g && (b.preventDefault ? b.preventDefault() : b.returnValue = !1);
                                }
                                !1 === l[e + "Bubble"] && (b.cancelBubble = !0, b.stopPropagation && b.stopPropagation());
                            }
                        });
                    });
                }
            };
            a.d.foreach = {
                Ya: function(b) {
                    return function() {
                        var c = b(), d = a.a.ya(c);
                        if (!d || "number" == typeof d.length) return {
                            foreach: c,
                            templateEngine: a.D.sa
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
                            templateEngine: a.D.sa
                        };
                    };
                },
                init: function(b, c) {
                    return a.d.template.init(b, a.d.foreach.Ya(c));
                },
                update: function(b, c, d, f, g) {
                    return a.d.template.update(b, a.d.foreach.Ya(c), d, f, g);
                }
            };
            a.g.S.foreach = !1;
            a.e.L.foreach = !0;
            a.d.hasfocus = {
                init: function(b, c, d) {
                    function f(e) {
                        b.__ko_hasfocusUpdating = !0;
                        var f = b.ownerDocument;
                        if ("activeElement" in f) {
                            var g;
                            try {
                                g = f.activeElement;
                            } catch (l) {
                                g = f.body;
                            }
                            e = g === b;
                        }
                        f = c();
                        a.g.ha(f, d, "hasfocus", e, !0);
                        b.__ko_hasfocusLastValue = e;
                        b.__ko_hasfocusUpdating = !1;
                    }
                    var g = f.bind(null, !0), e = f.bind(null, !1);
                    a.a.o(b, "focus", g);
                    a.a.o(b, "focusin", g);
                    a.a.o(b, "blur", e);
                    a.a.o(b, "focusout", e);
                },
                update: function(b, c) {
                    var d = !!a.a.c(c());
                    b.__ko_hasfocusUpdating || b.__ko_hasfocusLastValue === d || (d ? b.focus() : b.blur(), 
                    a.q.I(a.a.Ga, null, [ b, d ? "focusin" : "focusout" ]));
                }
            };
            a.d.hasFocus = a.d.hasfocus;
            a.d.html = {
                init: function() {
                    return {
                        controlsDescendantBindings: !0
                    };
                },
                update: function(b, c) {
                    a.a.fa(b, c());
                }
            };
            var I = "__ko_withIfBindingData";
            G("if");
            G("ifnot", !1, !0);
            G("with", !0, !1, function(a, c) {
                return a.createChildContext(c);
            });
            a.d.options = {
                init: function(b) {
                    if ("select" !== a.a.u(b)) throw Error("options binding applies only to SELECT elements");
                    for (;0 < b.length; ) b.remove(0);
                    return {
                        controlsDescendantBindings: !0
                    };
                },
                update: function(b, c, d) {
                    function f(a, b, c) {
                        var d = typeof b;
                        return "function" == d ? b(a) : "string" == d ? a[b] : c;
                    }
                    function g(b, c) {
                        if (p) {
                            var d = 0 <= a.a.k(p, a.h.n(c[0]));
                            a.a.hb(c[0], d);
                        }
                    }
                    var e = 0 == b.length, m = !e && b.multiple ? b.scrollTop : null;
                    c = a.a.c(c());
                    var h = d(), k = h.optionsIncludeDestroyed, l = {}, n, p;
                    b.multiple ? p = a.a.Z(b.selectedOptions || a.a.Y(b.childNodes, function(b) {
                        return b.tagName && "option" === a.a.u(b) && b.selected;
                    }), function(b) {
                        return a.h.n(b);
                    }) : 0 <= b.selectedIndex && (p = [ a.h.n(b.options[b.selectedIndex]) ]);
                    if (c) {
                        "undefined" == typeof c.length && (c = [ c ]);
                        var r = a.a.Y(c, function(b) {
                            return k || b === q || null === b || !a.a.c(b._destroy);
                        });
                        "optionsCaption" in h && (n = a.a.c(h.optionsCaption), null !== n && n !== q && r.unshift(l));
                    } else c = [];
                    d = g;
                    h.optionsAfterRender && (d = function(b, c) {
                        g(0, c);
                        a.q.I(h.optionsAfterRender, null, [ c[0], b !== l ? b : q ]);
                    });
                    a.a.Aa(b, r, function(b, c, d) {
                        d.length && (p = d[0].selected && [ a.h.n(d[0]) ]);
                        c = s.createElement("option");
                        b === l ? (a.a.fa(c, n), a.h.W(c, q)) : (d = f(b, h.optionsValue, b), a.h.W(c, a.a.c(d)), 
                        b = f(b, h.optionsText, d), a.a.ib(c, b));
                        return [ c ];
                    }, null, d);
                    p = null;
                    e && "value" in h && J(b, a.a.ya(h.value), !0);
                    a.a.zb(b);
                    m && 20 < Math.abs(m - b.scrollTop) && (b.scrollTop = m);
                }
            };
            a.d.options.wa = "__ko.optionValueDomData__";
            a.d.selectedOptions = {
                init: function(b, c, d) {
                    a.a.o(b, "change", function() {
                        var f = c(), g = [];
                        a.a.p(b.getElementsByTagName("option"), function(b) {
                            b.selected && g.push(a.h.n(b));
                        });
                        a.g.ha(f, d, "selectedOptions", g);
                    });
                },
                update: function(b, c) {
                    if ("select" != a.a.u(b)) throw Error("values binding applies only to SELECT elements");
                    var d = a.a.c(c());
                    d && "number" == typeof d.length && a.a.p(b.getElementsByTagName("option"), function(b) {
                        var c = 0 <= a.a.k(d, a.h.n(b));
                        a.a.hb(b, c);
                    });
                }
            };
            a.d.style = {
                update: function(b, c) {
                    var d = a.a.c(c() || {});
                    a.a.w(d, function(c, d) {
                        d = a.a.c(d);
                        b.style[c] = d || "";
                    });
                }
            };
            a.d.submit = {
                init: function(b, c, d, f) {
                    if ("function" != typeof c()) throw Error("The value for a submit binding must be a function");
                    a.a.o(b, "submit", function(a) {
                        var d, m = c();
                        try {
                            d = m.call(f, b);
                        } finally {
                            !0 !== d && (a.preventDefault ? a.preventDefault() : a.returnValue = !1);
                        }
                    });
                }
            };
            a.d.text = {
                update: function(b, c) {
                    a.a.ib(b, c());
                }
            };
            a.e.L.text = !0;
            a.d.uniqueName = {
                init: function(b, c) {
                    if (c()) {
                        var d = "ko_unique_" + ++a.d.uniqueName.tb;
                        a.a.gb(b, d);
                    }
                }
            };
            a.d.uniqueName.tb = 0;
            a.d.value = {
                init: function(b, c, d) {
                    function f() {
                        m = !1;
                        var e = c(), f = a.h.n(b);
                        a.g.ha(e, d, "value", f);
                    }
                    var g = [ "change" ], e = d().valueUpdate, m = !1;
                    e && ("string" == typeof e && (e = [ e ]), a.a.R(g, e), g = a.a.Ma(g));
                    !a.a.ca || "input" != b.tagName.toLowerCase() || "text" != b.type || "off" == b.autocomplete || b.form && "off" == b.form.autocomplete || -1 != a.a.k(g, "propertychange") || (a.a.o(b, "propertychange", function() {
                        m = !0;
                    }), a.a.o(b, "blur", function() {
                        m && f();
                    }));
                    a.a.p(g, function(c) {
                        var d = f;
                        a.a.Tb(c, "after") && (d = function() {
                            setTimeout(f, 0);
                        }, c = c.substring(5));
                        a.a.o(b, c, d);
                    });
                },
                update: function(b, c) {
                    var d = "select" === a.a.u(b), f = a.a.c(c()), g = a.h.n(b);
                    f !== g && (g = function() {
                        a.h.W(b, f);
                    }, g(), d && setTimeout(g, 0));
                    d && 0 < b.length && J(b, f, !1);
                }
            };
            a.d.visible = {
                update: function(b, c) {
                    var d = a.a.c(c()), f = "none" != b.style.display;
                    d && !f ? b.style.display = "" : !d && f && (b.style.display = "none");
                }
            };
            (function(b) {
                a.d[b] = {
                    init: function(c, d, f, g) {
                        return a.d.event.init.call(this, c, function() {
                            var a = {};
                            a[b] = d();
                            return a;
                        }, f, g);
                    }
                };
            })("click");
            a.v = function() {};
            a.v.prototype.renderTemplateSource = function() {
                throw Error("Override renderTemplateSource");
            };
            a.v.prototype.createJavaScriptEvaluatorBlock = function() {
                throw Error("Override createJavaScriptEvaluatorBlock");
            };
            a.v.prototype.makeTemplateSource = function(b, c) {
                if ("string" == typeof b) {
                    c = c || s;
                    var d = c.getElementById(b);
                    if (!d) throw Error("Cannot find template with ID " + b);
                    return new a.l.i(d);
                }
                if (1 == b.nodeType || 8 == b.nodeType) return new a.l.Q(b);
                throw Error("Unknown template type: " + b);
            };
            a.v.prototype.renderTemplate = function(a, c, d, f) {
                a = this.makeTemplateSource(a, f);
                return this.renderTemplateSource(a, c, d);
            };
            a.v.prototype.isTemplateRewritten = function(a, c) {
                return !1 === this.allowTemplateRewriting ? !0 : this.makeTemplateSource(a, c).data("isRewritten");
            };
            a.v.prototype.rewriteTemplate = function(a, c, d) {
                a = this.makeTemplateSource(a, d);
                c = c(a.text());
                a.text(c);
                a.data("isRewritten", !0);
            };
            a.b("templateEngine", a.v);
            a.Ea = function() {
                function b(b, c, d, m) {
                    b = a.g.da(b);
                    for (var h = a.g.S, k = 0; k < b.length; k++) {
                        var l = b[k].key;
                        if (h.hasOwnProperty(l)) {
                            var n = h[l];
                            if ("function" === typeof n) {
                                if (l = n(b[k].value)) throw Error(l);
                            } else if (!n) throw Error("This template engine does not support the '" + l + "' binding within its templates");
                        }
                    }
                    d = "ko.__tr_ambtns(function($context,$element){return(function(){return{ " + a.g.ea(b) + " } })()},'" + d.toLowerCase() + "')";
                    return m.createJavaScriptEvaluatorBlock(d) + c;
                }
                var c = /(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi, d = /\x3c!--\s*ko\b\s*([\s\S]*?)\s*--\x3e/g;
                return {
                    Ab: function(b, c, d) {
                        c.isTemplateRewritten(b, d) || c.rewriteTemplate(b, function(b) {
                            return a.Ea.Lb(b, c);
                        }, d);
                    },
                    Lb: function(a, g) {
                        return a.replace(c, function(a, c, d, f, l) {
                            return b(l, c, d, g);
                        }).replace(d, function(a, c) {
                            return b(c, "<!-- ko -->", "#comment", g);
                        });
                    },
                    qb: function(b, c) {
                        return a.s.va(function(d, m) {
                            var h = d.nextSibling;
                            h && h.nodeName.toLowerCase() === c && a.Ka(h, b, m);
                        });
                    }
                };
            }();
            a.b("__tr_ambtns", a.Ea.qb);
            (function() {
                a.l = {};
                a.l.i = function(a) {
                    this.i = a;
                };
                a.l.i.prototype.text = function() {
                    var b = a.a.u(this.i), b = "script" === b ? "text" : "textarea" === b ? "value" : "innerHTML";
                    if (0 == arguments.length) return this.i[b];
                    var c = arguments[0];
                    "innerHTML" === b ? a.a.fa(this.i, c) : this.i[b] = c;
                };
                a.l.i.prototype.data = function(b) {
                    if (1 === arguments.length) return a.a.f.get(this.i, "templateSourceData_" + b);
                    a.a.f.set(this.i, "templateSourceData_" + b, arguments[1]);
                };
                a.l.Q = function(a) {
                    this.i = a;
                };
                a.l.Q.prototype = new a.l.i();
                a.l.Q.prototype.text = function() {
                    if (0 == arguments.length) {
                        var b = a.a.f.get(this.i, "__ko_anon_template__") || {};
                        b.Fa === q && b.ma && (b.Fa = b.ma.innerHTML);
                        return b.Fa;
                    }
                    a.a.f.set(this.i, "__ko_anon_template__", {
                        Fa: arguments[0]
                    });
                };
                a.l.i.prototype.nodes = function() {
                    if (0 == arguments.length) return (a.a.f.get(this.i, "__ko_anon_template__") || {}).ma;
                    a.a.f.set(this.i, "__ko_anon_template__", {
                        ma: arguments[0]
                    });
                };
                a.b("templateSources", a.l);
                a.b("templateSources.domElement", a.l.i);
                a.b("templateSources.anonymousTemplate", a.l.Q);
            })();
            (function() {
                function b(b, c, d) {
                    var f;
                    for (c = a.e.nextSibling(c); b && (f = b) !== c; ) b = a.e.nextSibling(f), 1 !== f.nodeType && 8 !== f.nodeType || d(f);
                }
                function c(c, d) {
                    if (c.length) {
                        var f = c[0], g = c[c.length - 1];
                        b(f, g, function(b) {
                            a.Ia(d, b);
                        });
                        b(f, g, function(b) {
                            a.s.nb(b, [ d ]);
                        });
                    }
                }
                function d(a) {
                    return a.nodeType ? a : 0 < a.length ? a[0] : null;
                }
                function f(b, f, h, k, l) {
                    l = l || {};
                    var n = b && d(b), n = n && n.ownerDocument, p = l.templateEngine || g;
                    a.Ea.Ab(h, p, n);
                    h = p.renderTemplate(h, k, l, n);
                    if ("number" != typeof h.length || 0 < h.length && "number" != typeof h[0].nodeType) throw Error("Template engine must return an array of DOM nodes");
                    n = !1;
                    switch (f) {
                      case "replaceChildren":
                        a.e.P(b, h);
                        n = !0;
                        break;

                      case "replaceNode":
                        a.a.eb(b, h);
                        n = !0;
                        break;

                      case "ignoreTargetNode":
                        break;

                      default:
                        throw Error("Unknown renderMode: " + f);
                    }
                    n && (c(h, k), l.afterRender && a.q.I(l.afterRender, null, [ h, k.$data ]));
                    return h;
                }
                var g;
                a.Ba = function(b) {
                    if (b != q && !(b instanceof a.v)) throw Error("templateEngine must inherit from ko.templateEngine");
                    g = b;
                };
                a.za = function(b, c, h, k, l) {
                    h = h || {};
                    if ((h.templateEngine || g) == q) throw Error("Set a template engine before calling renderTemplate");
                    l = l || "replaceChildren";
                    if (k) {
                        var n = d(k);
                        return a.j(function() {
                            var g = c && c instanceof a.A ? c : new a.A(a.a.c(c)), r = "function" == typeof b ? b(g.$data, g) : b, g = f(k, l, r, g, h);
                            "replaceNode" == l && (k = g, n = d(k));
                        }, null, {
                            Qa: function() {
                                return !n || !a.a.aa(n);
                            },
                            $: n && "replaceNode" == l ? n.parentNode : n
                        });
                    }
                    return a.s.va(function(d) {
                        a.za(b, c, h, d, "replaceNode");
                    });
                };
                a.Rb = function(b, d, g, k, l) {
                    function n(a, b) {
                        c(b, r);
                        g.afterRender && g.afterRender(b, a);
                    }
                    function p(c, d) {
                        r = l.createChildContext(a.a.c(c), g.as);
                        r.$index = d;
                        var k = "function" == typeof b ? b(c, r) : b;
                        return f(null, "ignoreTargetNode", k, r, g);
                    }
                    var r;
                    return a.j(function() {
                        var b = a.a.c(d) || [];
                        "undefined" == typeof b.length && (b = [ b ]);
                        b = a.a.Y(b, function(b) {
                            return g.includeDestroyed || b === q || null === b || !a.a.c(b._destroy);
                        });
                        a.q.I(a.a.Aa, null, [ k, b, p, g, n ]);
                    }, null, {
                        $: k
                    });
                };
                a.d.template = {
                    init: function(b, c) {
                        var d = a.a.c(c());
                        "string" == typeof d || d.name || 1 != b.nodeType && 8 != b.nodeType || (d = 1 == b.nodeType ? b.childNodes : a.e.childNodes(b), 
                        d = a.a.Mb(d), new a.l.Q(b).nodes(d));
                        return {
                            controlsDescendantBindings: !0
                        };
                    },
                    update: function(b, c, d, f, g) {
                        c = a.a.c(c());
                        d = {};
                        f = !0;
                        var n, p = null;
                        "string" != typeof c && (d = c, c = a.a.c(d.name), "if" in d && (f = a.a.c(d["if"])), 
                        f && "ifnot" in d && (f = !a.a.c(d.ifnot)), n = a.a.c(d.data));
                        "foreach" in d ? p = a.Rb(c || b, f && d.foreach || [], d, b, g) : f ? (g = "data" in d ? g.createChildContext(n, d.as) : g, 
                        p = a.za(c || b, g, d, b)) : a.e.ba(b);
                        g = p;
                        (n = a.a.f.get(b, "__ko__templateComputedDomDataKey__")) && "function" == typeof n.B && n.B();
                        a.a.f.set(b, "__ko__templateComputedDomDataKey__", g && g.ta() ? g : q);
                    }
                };
                a.g.S.template = function(b) {
                    b = a.g.da(b);
                    return 1 == b.length && b[0].unknown || a.g.Jb(b, "name") ? null : "This template engine does not support anonymous templates nested within its templates";
                };
                a.e.L.template = !0;
            })();
            a.b("setTemplateEngine", a.Ba);
            a.b("renderTemplate", a.za);
            a.a.Pa = function() {
                function a(b, d, f, g, e) {
                    var m = Math.min, h = Math.max, k = [], l, n = b.length, p, r = d.length, q = r - n || 1, t = n + r + 1, s, v, w;
                    for (l = 0; l <= n; l++) for (v = s, k.push(s = []), w = m(r, l + q), p = h(0, l - 1); p <= w; p++) s[p] = p ? l ? b[l - 1] === d[p - 1] ? v[p - 1] : m(v[p] || t, s[p - 1] || t) + 1 : p + 1 : l + 1;
                    m = [];
                    h = [];
                    q = [];
                    l = n;
                    for (p = r; l || p; ) r = k[l][p] - 1, p && r === k[l][p - 1] ? h.push(m[m.length] = {
                        status: f,
                        value: d[--p],
                        index: p
                    }) : l && r === k[l - 1][p] ? q.push(m[m.length] = {
                        status: g,
                        value: b[--l],
                        index: l
                    }) : (m.push({
                        status: "retained",
                        value: d[--p]
                    }), --l);
                    if (h.length && q.length) {
                        b = 10 * n;
                        var E;
                        for (d = f = 0; (e || d < b) && (E = h[f]); f++) {
                            for (g = 0; k = q[g]; g++) if (E.value === k.value) {
                                E.moved = k.index;
                                k.moved = E.index;
                                q.splice(g, 1);
                                d = g = 0;
                                break;
                            }
                            d += g;
                        }
                    }
                    return m.reverse();
                }
                return function(c, d, f) {
                    c = c || [];
                    d = d || [];
                    return c.length <= d.length ? a(c, d, "added", "deleted", f) : a(d, c, "deleted", "added", f);
                };
            }();
            a.b("utils.compareArrays", a.a.Pa);
            (function() {
                function b(b) {
                    for (;b.length && !a.a.aa(b[0]); ) b.splice(0, 1);
                    if (1 < b.length) {
                        for (var c = b[0], g = b[b.length - 1], e = [ c ]; c !== g; ) {
                            c = c.nextSibling;
                            if (!c) return;
                            e.push(c);
                        }
                        Array.prototype.splice.apply(b, [ 0, b.length ].concat(e));
                    }
                    return b;
                }
                function c(c, f, g, e, m) {
                    var h = [];
                    c = a.j(function() {
                        var c = f(g, m, b(h)) || [];
                        0 < h.length && (a.a.eb(h, c), e && a.q.I(e, null, [ g, c, m ]));
                        h.splice(0, h.length);
                        a.a.R(h, c);
                    }, null, {
                        $: c,
                        Qa: function() {
                            return !a.a.pb(h);
                        }
                    });
                    return {
                        O: h,
                        j: c.ta() ? c : q
                    };
                }
                a.a.Aa = function(d, f, g, e, m) {
                    function h(a, c) {
                        u = n[c];
                        x !== c && (E[a] = u);
                        u.ra(x++);
                        b(u.O);
                        t.push(u);
                        w.push(u);
                    }
                    function k(b, c) {
                        if (b) for (var d = 0, e = c.length; d < e; d++) c[d] && a.a.p(c[d].O, function(a) {
                            b(a, d, c[d].X);
                        });
                    }
                    f = f || [];
                    e = e || {};
                    var l = a.a.f.get(d, "setDomNodeChildrenFromArrayMapping_lastMappingResult") === q, n = a.a.f.get(d, "setDomNodeChildrenFromArrayMapping_lastMappingResult") || [], p = a.a.Z(n, function(a) {
                        return a.X;
                    }), r = a.a.Pa(p, f, e.dontLimitMoves), t = [], s = 0, x = 0, v = [], w = [];
                    f = [];
                    for (var E = [], p = [], u, B = 0, y, A; y = r[B]; B++) switch (A = y.moved, y.status) {
                      case "deleted":
                        A === q && (u = n[s], u.j && u.j.B(), v.push.apply(v, b(u.O)), e.beforeRemove && (f[B] = u, 
                        w.push(u)));
                        s++;
                        break;

                      case "retained":
                        h(B, s++);
                        break;

                      case "added":
                        A !== q ? h(B, A) : (u = {
                            X: y.value,
                            ra: a.m(x++)
                        }, t.push(u), w.push(u), l || (p[B] = u));
                    }
                    k(e.beforeMove, E);
                    a.a.p(v, e.beforeRemove ? a.H : a.removeNode);
                    for (var B = 0, l = a.e.firstChild(d), C; u = w[B]; B++) {
                        u.O || a.a.extend(u, c(d, g, u.X, m, u.ra));
                        for (s = 0; r = u.O[s]; l = r.nextSibling, C = r, s++) r !== l && a.e.Va(d, r, C);
                        !u.Fb && m && (m(u.X, u.O, u.ra), u.Fb = !0);
                    }
                    k(e.beforeRemove, f);
                    k(e.afterMove, E);
                    k(e.afterAdd, p);
                    a.a.f.set(d, "setDomNodeChildrenFromArrayMapping_lastMappingResult", t);
                };
            })();
            a.b("utils.setDomNodeChildrenFromArrayMapping", a.a.Aa);
            a.D = function() {
                this.allowTemplateRewriting = !1;
            };
            a.D.prototype = new a.v();
            a.D.prototype.renderTemplateSource = function(b) {
                var c = (9 > a.a.ca ? 0 : b.nodes) ? b.nodes() : null;
                if (c) return a.a.N(c.cloneNode(!0).childNodes);
                b = b.text();
                return a.a.xa(b);
            };
            a.D.sa = new a.D();
            a.Ba(a.D.sa);
            a.b("nativeTemplateEngine", a.D);
            (function() {
                a.ua = function() {
                    var a = this.Ib = function() {
                        if ("undefined" == typeof t || !t.tmpl) return 0;
                        try {
                            if (0 <= t.tmpl.tag.tmpl.open.toString().indexOf("__")) return 2;
                        } catch (a) {}
                        return 1;
                    }();
                    this.renderTemplateSource = function(b, f, g) {
                        g = g || {};
                        if (2 > a) throw Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");
                        var e = b.data("precompiled");
                        e || (e = b.text() || "", e = t.template(null, "{{ko_with $item.koBindingContext}}" + e + "{{/ko_with}}"), 
                        b.data("precompiled", e));
                        b = [ f.$data ];
                        f = t.extend({
                            koBindingContext: f
                        }, g.templateOptions);
                        f = t.tmpl(e, b, f);
                        f.appendTo(s.createElement("div"));
                        t.fragments = {};
                        return f;
                    };
                    this.createJavaScriptEvaluatorBlock = function(a) {
                        return "{{ko_code ((function() { return " + a + " })()) }}";
                    };
                    this.addTemplate = function(a, b) {
                        s.write("<script type='text/html' id='" + a + "'>" + b + "</script>");
                    };
                    0 < a && (t.tmpl.tag.ko_code = {
                        open: "__.push($1 || '');"
                    }, t.tmpl.tag.ko_with = {
                        open: "with($1) {",
                        close: "} "
                    });
                };
                a.ua.prototype = new a.v();
                var b = new a.ua();
                0 < b.Ib && a.Ba(b);
                a.b("jqueryTmplTemplateEngine", a.ua);
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
                    console.log(temp);
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
        ko.mapping.fromJS(data, PostTypeMapping, this);
        self.originalPostData = ko.mapping.fromJS(data, PostTypeMapping);
        self.modifiedPostTypes = ko.observableArray();
        self.posttypeedit = ko.observable();
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
                return postTypeName === item.name();
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