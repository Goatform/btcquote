/*! BTCQuote 0.1.1 */
var BTCQuote = function () {
	var self = this;

	self._dataNames = ['last', 'bid', 'ask'];
	self._elements = {};
	self._data = {};
	self._history = [];

	self.initialize = function () {
		if (!self.isLoaded()) return;

		self._widget = document.getElementById("btc-quote");
		if (self._widget === null) {
			throw 'Please include a tag with the ID "btc-quote"';
		}

		self.createWidget();

		self.BTCRef = new Firebase("https://publicdata-cryptocurrency.firebaseio.com/btcquote");
		self.BTCRef.child("last").on("value", self.receiveBTCData);
		self.BTCRef.child("bid").on("value", self.receiveBTCData);
		self.BTCRef.child("ask").on("value", self.receiveBTCData);
	};

	self.addScript = function (src, callback) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');

		script.onload = function () {
			callback(src);
		};

		// For older browsers from http://stackoverflow.com/a/6806773/1570248
		script.onreadystatechange = function() {
			var r = script.readyState;
			if (r === 'loaded' || r === 'complete') {
				callback(src);
				script.onreadystatechange = null;
			}
		};

		script.type = 'text/javascript';
		script.src = src;
		head.appendChild(script);
	};

	self.receiveBTCData = function (snapshot) {
		var name = snapshot.name();
		var value = parseFloat(snapshot.val());
		var oldValue = parseFloat(self._data[name]); 

		self.updateData(name, self.formatFloat(value));
		self.updateWidget();
		
		if (name == "last") {
			self.updateHistory(value);
			self.updateColor(oldValue, parseFloat(value));
		}

		if (self._data.bid && self._data.ask && self._data.last) {
			self.removeClassToElement(self._elements.slider, "btc-is-loading");
		}
	};

	self.isLoaded = function () {
		return window.Firebase !== null;
	};

	self.updateColor = function (oldPrice, newPrice) {
		if (newPrice < oldPrice) {
			self.addClassToElement(self._elements.lastWrapper, "btc-red");
		}else if (newPrice > oldPrice) {
			self.addClassToElement(self._elements.lastWrapper, "btc-green");
		}else{
			self.resetColor();
		}

		setTimeout(function () {
			self.resetColor();
		}, 2000);
	};

	self.updateData = function (name, value) {
		self._data[name] = value;
	};

	self.updateWidget = function () {
		for (var nameIndex=0; nameIndex<self._dataNames.length; nameIndex++) {
			var name = self._dataNames[nameIndex];
			var value = self._data[name]? self._data[name]:"";
			self._elements[name].innerHTML = value;
		}
	};

	self.createWidget = function () {
		self._widget.innerHTML = self._template;
		self._elements.bid = document.getElementById("btc-bid-field");
		self._elements.ask = document.getElementById("btc-ask-field");
		self._elements.last = document.getElementById("btc-last-field");
		self._elements.lastWrapper = document.getElementById("btc-last-wrapper");
		self._elements.slider = document.getElementById("btc-slider");

		self._elements.last.innerHTML = 0;

		if (!self.isOldBrowser) {
			new Odometer({el: self._elements.last, format: 'ddddd.dd'});
		}
	};

	self.updateHistory = function (value) {
		if (self._history.length === 0) {
			for (var i=0; i<50; i++) {
				self._history.push(value);
			}
		}
		self._history.push(value);
	};

	self.formatFloat = function (number) {
		var split = number.toString().split('.');
		var decimal = (split[1] !== undefined? split[1] : '') + (new Array(3-(split[1] !== undefined? split[1].length : 0))).join('0');
		return split[0] + '.' + decimal;
	};

	self.resetColor = function () {
		self.removeClassToElement(self._elements.lastWrapper, "btc-green");
		self.removeClassToElement(self._elements.lastWrapper, "btc-red");
	};

	// (add|remove)ClassFromElement from http://stackoverflow.com/a/6787464/1570248
	self.addClassToElement = function(el, className){
		el.className += ' '+className;   
	};

	self.removeClassToElement = function(el, className){
		var elClass = ' '+el.className+' ';
		while(elClass.indexOf(' '+className+' ') != -1)
			elClass = elClass.replace(' '+className+' ', '');
		el.className = elClass;
	};

	// Very vaguely determine if this is an older browser
	self.isOldBrowser = document.addEventListener === undefined;

	if (!self.isOldBrowser) {
		// 
(function() {
  var COUNT_FRAMERATE, COUNT_MS_PER_FRAME, DIGIT_FORMAT, DIGIT_HTML, DIGIT_SPEEDBOOST, DURATION, FORMAT_MARK_HTML, FORMAT_PARSER, FRAMERATE, FRAMES_PER_VALUE, MS_PER_FRAME, MutationObserver, Odometer, RIBBON_HTML, TRANSITION_END_EVENTS, TRANSITION_SUPPORT, VALUE_HTML, addClass, createFromHTML, fractionalPart, now, removeClass, requestAnimationFrame, round, transitionCheckStyles, trigger, truncate, wrapJQuery, _jQueryWrapped, _old, _ref, _ref1,
    __slice = [].slice;

  VALUE_HTML = '<span class="odometer-value"></span>';

  RIBBON_HTML = '<span class="odometer-ribbon"><span class="odometer-ribbon-inner">' + VALUE_HTML + '</span></span>';

  DIGIT_HTML = '<span class="odometer-digit"><span class="odometer-digit-spacer">8</span><span class="odometer-digit-inner">' + RIBBON_HTML + '</span></span>';

  FORMAT_MARK_HTML = '<span class="odometer-formatting-mark"></span>';

  DIGIT_FORMAT = '(,ddd).dd';

  FORMAT_PARSER = /^\(?([^)]*)\)?(?:(.)(d+))?$/;

  FRAMERATE = 30;

  DURATION = 2000;

  COUNT_FRAMERATE = 20;

  FRAMES_PER_VALUE = 2;

  DIGIT_SPEEDBOOST = .5;

  MS_PER_FRAME = 1000 / FRAMERATE;

  COUNT_MS_PER_FRAME = 1000 / COUNT_FRAMERATE;

  TRANSITION_END_EVENTS = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd';

  transitionCheckStyles = document.createElement('div').style;

  TRANSITION_SUPPORT = (transitionCheckStyles.transition != null) || (transitionCheckStyles.webkitTransition != null) || (transitionCheckStyles.mozTransition != null) || (transitionCheckStyles.oTransition != null);

  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

  createFromHTML = function(html) {
    var el;
    el = document.createElement('div');
    el.innerHTML = html;
    return el.children[0];
  };

  removeClass = function(el, name) {
    return el.className = el.className.replace(new RegExp("(^| )" + (name.split(' ').join('|')) + "( |$)", 'gi'), ' ');
  };

  addClass = function(el, name) {
    removeClass(el, name);
    return el.className += " " + name;
  };

  trigger = function(el, name) {
    var evt;
    if (document.createEvent != null) {
      evt = document.createEvent('HTMLEvents');
      evt.initEvent(name, true, true);
      return el.dispatchEvent(evt);
    }
  };

  now = function() {
    var _ref, _ref1;
    return (_ref = (_ref1 = window.performance) != null ? typeof _ref1.now === "function" ? _ref1.now() : void 0 : void 0) != null ? _ref : +(new Date);
  };

  round = function(val, precision) {
    if (precision == null) {
      precision = 0;
    }
    if (!precision) {
      return Math.round(val);
    }
    val *= Math.pow(10, precision);
    val += 0.5;
    val = Math.floor(val);
    return val /= Math.pow(10, precision);
  };

  truncate = function(val) {
    if (val < 0) {
      return Math.ceil(val);
    } else {
      return Math.floor(val);
    }
  };

  fractionalPart = function(val) {
    return val - round(val);
  };

  _jQueryWrapped = false;

  (wrapJQuery = function() {
    var property, _i, _len, _ref, _results;
    if (_jQueryWrapped) {
      return;
    }
    if (window.jQuery != null) {
      _jQueryWrapped = true;
      _ref = ['html', 'text'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        property = _ref[_i];
        _results.push((function(property) {
          var old;
          old = window.jQuery.fn[property];
          return window.jQuery.fn[property] = function(val) {
            var _ref1;
            if ((val == null) || (((_ref1 = this[0]) != null ? _ref1.odometer : void 0) == null)) {
              return old.apply(this, arguments);
            }
            return this[0].odometer.update(val);
          };
        })(property));
      }
      return _results;
    }
  })();

  setTimeout(wrapJQuery, 0);

  Odometer = (function() {
    function Odometer(options) {
      var e, k, property, v, _base, _i, _len, _ref, _ref1, _ref2,
        _this = this;
      this.options = options;
      this.el = this.options.el;
      if (this.el.odometer != null) {
        return this.el.odometer;
      }
      this.el.odometer = this;
      _ref = Odometer.options;
      for (k in _ref) {
        v = _ref[k];
        if (this.options[k] == null) {
          this.options[k] = v;
        }
      }
      if ((_base = this.options).duration == null) {
        _base.duration = DURATION;
      }
      this.MAX_VALUES = ((this.options.duration / MS_PER_FRAME) / FRAMES_PER_VALUE) | 0;
      this.resetFormat();
      this.value = this.cleanValue((_ref1 = this.options.value) != null ? _ref1 : '');
      this.renderInside();
      this.render();
      try {
        _ref2 = ['innerHTML', 'innerText', 'textContent'];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          property = _ref2[_i];
          if (this.el[property] != null) {
            (function(property) {
              return Object.defineProperty(_this.el, property, {
                get: function() {
                  var _ref3;
                  if (property === 'innerHTML') {
                    return _this.inside.outerHTML;
                  } else {
                    return (_ref3 = _this.inside.innerText) != null ? _ref3 : _this.inside.textContent;
                  }
                },
                set: function(val) {
                  return _this.update(val);
                }
              });
            })(property);
          }
        }
      } catch (_error) {
        e = _error;
        this.watchForMutations();
      }
      this;
    }

    Odometer.prototype.renderInside = function() {
      this.inside = document.createElement('div');
      this.inside.className = 'odometer-inside';
      this.el.innerHTML = '';
      return this.el.appendChild(this.inside);
    };

    Odometer.prototype.watchForMutations = function() {
      var e,
        _this = this;
      if (MutationObserver == null) {
        return;
      }
      try {
        if (this.observer == null) {
          this.observer = new MutationObserver(function(mutations) {
            var newVal;
            newVal = _this.el.innerText;
            _this.renderInside();
            _this.render(_this.value);
            return _this.update(newVal);
          });
        }
        this.watchMutations = true;
        return this.startWatchingMutations();
      } catch (_error) {
        e = _error;
      }
    };

    Odometer.prototype.startWatchingMutations = function() {
      if (this.watchMutations) {
        return this.observer.observe(this.el, {
          childList: true
        });
      }
    };

    Odometer.prototype.stopWatchingMutations = function() {
      var _ref;
      return (_ref = this.observer) != null ? _ref.disconnect() : void 0;
    };

    Odometer.prototype.cleanValue = function(val) {
      var _ref;
      if (typeof val === 'string') {
        val = val.replace((_ref = this.format.radix) != null ? _ref : '.', '<radix>');
        val = val.replace(/[.,]/g, '');
        val = val.replace('<radix>', '.');
        val = parseFloat(val, 10) || 0;
      }
      return round(val, this.format.precision);
    };

    Odometer.prototype.bindTransitionEnd = function() {
      var event, renderEnqueued, _i, _len, _ref, _results,
        _this = this;
      if (this.transitionEndBound) {
        return;
      }
      this.transitionEndBound = true;
      renderEnqueued = false;
      _ref = TRANSITION_END_EVENTS.split(' ');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        _results.push(this.el.addEventListener(event, function() {
          if (renderEnqueued) {
            return true;
          }
          renderEnqueued = true;
          setTimeout(function() {
            _this.render();
            renderEnqueued = false;
            return trigger(_this.el, 'odometerdone');
          }, 0);
          return true;
        }, false));
      }
      return _results;
    };

    Odometer.prototype.resetFormat = function() {
      var format, fractional, parsed, precision, radix, repeating, _ref, _ref1;
      format = (_ref = this.options.format) != null ? _ref : DIGIT_FORMAT;
      format || (format = 'd');
      parsed = FORMAT_PARSER.exec(format);
      if (!parsed) {
        throw new Error("Odometer: Unparsable digit format");
      }
      _ref1 = parsed.slice(1, 4), repeating = _ref1[0], radix = _ref1[1], fractional = _ref1[2];
      precision = (fractional != null ? fractional.length : void 0) || 0;
      return this.format = {
        repeating: repeating,
        radix: radix,
        precision: precision
      };
    };

    Odometer.prototype.render = function(value) {
      var classes, cls, digit, match, newClasses, theme, wholePart, _i, _j, _len, _len1, _ref;
      if (value == null) {
        value = this.value;
      }
      this.stopWatchingMutations();
      this.resetFormat();
      this.inside.innerHTML = '';
      theme = this.options.theme;
      classes = this.el.className.split(' ');
      newClasses = [];
      for (_i = 0, _len = classes.length; _i < _len; _i++) {
        cls = classes[_i];
        if (!cls.length) {
          continue;
        }
        if (match = /^odometer-theme-(.+)$/.exec(cls)) {
          theme = match[1];
          continue;
        }
        if (/^odometer(-|$)/.test(cls)) {
          continue;
        }
        newClasses.push(cls);
      }
      newClasses.push('odometer');
      if (!TRANSITION_SUPPORT) {
        newClasses.push('odometer-no-transitions');
      }
      if (theme) {
        newClasses.push("odometer-theme-" + theme);
      } else {
        newClasses.push("odometer-auto-theme");
      }
      this.el.className = newClasses.join(' ');
      this.ribbons = {};
      this.digits = [];
      wholePart = !this.format.precision || !fractionalPart(value) || false;
      _ref = value.toString().split('').reverse();
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        digit = _ref[_j];
        if (digit === '.') {
          wholePart = true;
        }
        this.addDigit(digit, wholePart);
      }
      return this.startWatchingMutations();
    };

    Odometer.prototype.update = function(newValue) {
      var diff,
        _this = this;
      newValue = this.cleanValue(newValue);
      if (!(diff = newValue - this.value)) {
        return;
      }
      removeClass(this.el, 'odometer-animating-up odometer-animating-down odometer-animating');
      if (diff > 0) {
        addClass(this.el, 'odometer-animating-up');
      } else {
        addClass(this.el, 'odometer-animating-down');
      }
      this.stopWatchingMutations();
      this.animate(newValue);
      this.startWatchingMutations();
      setTimeout(function() {
        _this.el.offsetHeight;
        return addClass(_this.el, 'odometer-animating');
      }, 0);
      return this.value = newValue;
    };

    Odometer.prototype.renderDigit = function() {
      return createFromHTML(DIGIT_HTML);
    };

    Odometer.prototype.insertDigit = function(digit, before) {
      if (before != null) {
        return this.inside.insertBefore(digit, before);
      } else if (!this.inside.children.length) {
        return this.inside.appendChild(digit);
      } else {
        return this.inside.insertBefore(digit, this.inside.children[0]);
      }
    };

    Odometer.prototype.addSpacer = function(chr, before, extraClasses) {
      var spacer;
      spacer = createFromHTML(FORMAT_MARK_HTML);
      spacer.innerHTML = chr;
      if (extraClasses) {
        addClass(spacer, extraClasses);
      }
      return this.insertDigit(spacer, before);
    };

    Odometer.prototype.addDigit = function(value, repeating) {
      var chr, digit, resetted, _ref;
      if (repeating == null) {
        repeating = true;
      }
      if (value === '-') {
        return this.addSpacer(value, null, 'odometer-negation-mark');
      }
      if (value === '.') {
        return this.addSpacer((_ref = this.format.radix) != null ? _ref : '.', null, 'odometer-radix-mark');
      }
      if (repeating) {
        resetted = false;
        while (true) {
          if (!this.format.repeating.length) {
            if (resetted) {
              throw new Error("Bad odometer format without digits");
            }
            this.resetFormat();
            resetted = true;
          }
          chr = this.format.repeating[this.format.repeating.length - 1];
          this.format.repeating = this.format.repeating.substring(0, this.format.repeating.length - 1);
          if (chr === 'd') {
            break;
          }
          this.addSpacer(chr);
        }
      }
      digit = this.renderDigit();
      digit.querySelector('.odometer-value').innerHTML = value;
      this.digits.push(digit);
      return this.insertDigit(digit);
    };

    Odometer.prototype.animate = function(newValue) {
      if (!TRANSITION_SUPPORT || this.options.animation === 'count') {
        return this.animateCount(newValue);
      } else {
        return this.animateSlide(newValue);
      }
    };

    Odometer.prototype.animateCount = function(newValue) {
      var cur, diff, last, start, tick,
        _this = this;
      if (!(diff = +newValue - this.value)) {
        return;
      }
      start = last = now();
      cur = this.value;
      return (tick = function() {
        var delta, dist, fraction;
        if ((now() - start) > _this.options.duration) {
          _this.value = newValue;
          _this.render();
          trigger(_this.el, 'odometerdone');
          return;
        }
        delta = now() - last;
        if (delta > COUNT_MS_PER_FRAME) {
          last = now();
          fraction = delta / _this.options.duration;
          dist = diff * fraction;
          cur += dist;
          _this.render(Math.round(cur));
        }
        if (requestAnimationFrame != null) {
          return requestAnimationFrame(tick);
        } else {
          return setTimeout(tick, COUNT_MS_PER_FRAME);
        }
      })();
    };

    Odometer.prototype.getDigitCount = function() {
      var i, max, value, values, _i, _len;
      values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (i = _i = 0, _len = values.length; _i < _len; i = ++_i) {
        value = values[i];
        values[i] = Math.abs(value);
      }
      max = Math.max.apply(Math, values);
      return Math.ceil(Math.log(max + 1) / Math.log(10));
    };

    Odometer.prototype.getFractionalDigitCount = function() {
      var i, parser, parts, value, values, _i, _len;
      values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      parser = /^\-?\d*\.(\d*?)0*$/;
      for (i = _i = 0, _len = values.length; _i < _len; i = ++_i) {
        value = values[i];
        values[i] = value.toString();
        parts = parser.exec(values[i]);
        if (parts == null) {
          values[i] = 0;
        } else {
          values[i] = parts[1].length;
        }
      }
      return Math.max.apply(Math, values);
    };

    Odometer.prototype.resetDigits = function() {
      this.digits = [];
      this.ribbons = [];
      this.inside.innerHTML = '';
      return this.resetFormat();
    };

    Odometer.prototype.animateSlide = function(newValue) {
      var boosted, cur, diff, digitCount, digits, dist, end, fractionalCount, frame, frames, i, incr, j, mark, numEl, oldValue, start, _base, _i, _j, _k, _l, _len, _len1, _len2, _m, _ref, _results;
      oldValue = this.value;
      fractionalCount = this.getFractionalDigitCount(oldValue, newValue);
      if (fractionalCount) {
        newValue = newValue * Math.pow(10, fractionalCount);
        oldValue = oldValue * Math.pow(10, fractionalCount);
      }
      if (!(diff = newValue - oldValue)) {
        return;
      }
      this.bindTransitionEnd();
      digitCount = this.getDigitCount(oldValue, newValue);
      digits = [];
      boosted = 0;
      for (i = _i = 0; 0 <= digitCount ? _i < digitCount : _i > digitCount; i = 0 <= digitCount ? ++_i : --_i) {
        start = truncate(oldValue / Math.pow(10, digitCount - i - 1));
        end = truncate(newValue / Math.pow(10, digitCount - i - 1));
        dist = end - start;
        if (Math.abs(dist) > this.MAX_VALUES) {
          frames = [];
          incr = dist / (this.MAX_VALUES + this.MAX_VALUES * boosted * DIGIT_SPEEDBOOST);
          cur = start;
          while ((dist > 0 && cur < end) || (dist < 0 && cur > end)) {
            frames.push(Math.round(cur));
            cur += incr;
          }
          if (frames[frames.length - 1] !== end) {
            frames.push(end);
          }
          boosted++;
        } else {
          frames = (function() {
            _results = [];
            for (var _j = start; start <= end ? _j <= end : _j >= end; start <= end ? _j++ : _j--){ _results.push(_j); }
            return _results;
          }).apply(this);
        }
        for (i = _k = 0, _len = frames.length; _k < _len; i = ++_k) {
          frame = frames[i];
          frames[i] = Math.abs(frame % 10);
        }
        digits.push(frames);
      }
      this.resetDigits();
      _ref = digits.reverse();
      for (i = _l = 0, _len1 = _ref.length; _l < _len1; i = ++_l) {
        frames = _ref[i];
        if (!this.digits[i]) {
          this.addDigit(' ', i >= fractionalCount);
        }
        if ((_base = this.ribbons)[i] == null) {
          _base[i] = this.digits[i].querySelector('.odometer-ribbon-inner');
        }
        this.ribbons[i].innerHTML = '';
        if (diff < 0) {
          frames = frames.reverse();
        }
        for (j = _m = 0, _len2 = frames.length; _m < _len2; j = ++_m) {
          frame = frames[j];
          numEl = document.createElement('div');
          numEl.className = 'odometer-value';
          numEl.innerHTML = frame;
          this.ribbons[i].appendChild(numEl);
          if (j === frames.length - 1) {
            addClass(numEl, 'odometer-last-value');
          }
          if (j === 0) {
            addClass(numEl, 'odometer-first-value');
          }
        }
      }
      if (start < 0) {
        this.addDigit('-');
      }
      mark = this.inside.querySelector('.odometer-radix-mark');
      if (mark != null) {
        mark.parent.removeChild(mark);
      }
      if (fractionalCount) {
        return this.addSpacer(this.format.radix, this.digits[fractionalCount - 1], 'odometer-radix-mark');
      }
    };

    return Odometer;

  })();

  Odometer.options = (_ref = window.odometerOptions) != null ? _ref : {};

  setTimeout(function() {
    var k, v, _base, _ref1, _results;
    if (window.odometerOptions) {
      _ref1 = window.odometerOptions;
      _results = [];
      for (k in _ref1) {
        v = _ref1[k];
        _results.push((_base = Odometer.options)[k] != null ? (_base = Odometer.options)[k] : _base[k] = v);
      }
      return _results;
    }
  }, 0);

  Odometer.init = function() {
    var el, elements, _i, _len, _ref1, _results;
    if (document.querySelectorAll == null) {
      return;
    }
    elements = document.querySelectorAll(Odometer.options.selector || '.odometer');
    _results = [];
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
      el = elements[_i];
      _results.push(el.odometer = new Odometer({
        el: el,
        value: (_ref1 = el.innerText) != null ? _ref1 : el.textContent
      }));
    }
    return _results;
  };

  if ((((_ref1 = document.documentElement) != null ? _ref1.doScroll : void 0) != null) && (document.createEventObject != null)) {
    _old = document.onreadystatechange;
    document.onreadystatechange = function() {
      if (document.readyState === 'complete' && Odometer.options.auto !== false) {
        Odometer.init();
      }
      return _old != null ? _old.apply(this, arguments) : void 0;
    };
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      if (Odometer.options.auto !== false) {
        return Odometer.init();
      }
    }, false);
  }

  if (typeof define === 'function' && define.amd) {
    define(['jquery'], function() {
      return Odometer;
    });
  } else if (typeof exports === !'undefined') {
    module.exports = Odometer;
  } else {
    window.Odometer = Odometer;
  }

}).call(this);

	}

	// Initialize widget by loading Firebase.js
	self.addScript('https://cdn.firebase.com/v0/firebase.js', self.initialize);

	// Template/Image data
	var BITCOIN_LOGO = "data:image/png;base64,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G0i7VL7P4P8Otpv5/+3t7fCOiH14pvfHTCN9QZsgvNLinPZH/J5WHcs3vJeRXvd9PpNp0p66si3nHPjo/p9p5v/sO32eTEr4sOxY7SbHVMpQ9zP9VN4jr/TfqB1n/67wSh8f1vlsDiAeZeT9J+89itb4P4XNmG/p5/lugO2xYfbr7Jv0vXw3GI0V+T6a/T/HkPRVliXLO6vvEo+irfyPL/Ft9rWeTn8v6ONJjrXZ92bzUdaD/Hp7yPE802TM6TbpZJlu+Tvor9rK/6WyUb4Dlm37e3v3Ne0k/cD7BGnRpnjmFP9nPMYk8iLNXr4lPer8r5RSSimlnlOX2ufNdO9lL/nWlOsgl7BhfRvNvmv699RftfZ5tT+sOdSayWzNeo3S/31tI7/zR9/8S2shrJv082soyznqR/zjMbu/lN7oepbXLK1RvybubM1pVua/iv2y3PsjX9Y88pz2wjO5zp5tJPdeOWcNl3s5JrB3sya82zrLmeuJdY/1Ztaa+rpShfc61r1MK21Xx/QZkFdeox6nxHol90mXve6lMp+j7pdsb6P+z1obtmY/vms09le83Mct6COs860JP1Yv7JdjXv+3IfchEHsZdcy1yrRVptnzGtm3/xNBnNH9kf9HZT5Hff4/xf8Zf/b+kHbinL0Zjvgz/8lYE35qvfqcl3sC+HpUp/RBt09ez/LKsNE+E/ezP3OdeY/KfK628H/fRymfUKY8LzHWMX4yltGe14afUi/CGDf4jwAb074Qc233fx9zco/ymP/5fyLzKPX73f+zMp+rY/7PuR079H6SdS318Sl9g7+Iyzy2Vfgxu2cYtuT9OudhxnDiYue0NXud+DP3KI+Vg39r8SFtJ23KntnI/6Myn/MuyH5b1il9R9/OumKP0VhF3Eyv59f92fvBmnDCluqVYdSDuaT7N+fy0TcYz/fnRnn1MNpA34tMGxM/856Vufe1S2hpvUA9vvS/UkoppZRSSimllFJKXU07EREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREZE75B+Hl45q2TuOnAAAAVNta0JU+s7K/gB/pYUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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";
	var BACKGROUND_GRADIENT = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAA8KCgsLCw8MDA8WDw0PFhkTDw8TGR4XFxcXFx4eFxoaGhoXHh0iIyQjIh0sLC8vLCw7Ojo6Ozs7Ozs7Ozs7Ozv/2wBDARAPDxESERYSEhYXEhQSFx0YGBgYHScdHR0dHScuJCAgICAkLiotJycnLSozMy4uMzM7Ozo7Ozs7Ozs7Ozs7Ozv/wgARCABGAAEDAREAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAIG/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB0IJJJJAB/8QAFBABAAAAAAAAAAAAAAAAAAAAMP/aAAgBAQABBQIf/8QAFBEBAAAAAAAAAAAAAAAAAAAAMP/aAAgBAwEBPwEf/8QAFBEBAAAAAAAAAAAAAAAAAAAAMP/aAAgBAgEBPwEf/8QAFBABAAAAAAAAAAAAAAAAAAAAMP/aAAgBAQAGPwIf/8QAFxAAAwEAAAAAAAAAAAAAAAAAABARIP/aAAgBAQABPyFUpc//2gAMAwEAAgADAAAAEIIBJJ//xAAUEQEAAAAAAAAAAAAAAAAAAAAw/9oACAEDAQE/EB//xAAUEQEAAAAAAAAAAAAAAAAAAAAw/9oACAECAQE/EB//xAAWEAADAAAAAAAAAAAAAAAAAAAAETD/2gAIAQEAAT8QHAf/2Q==";

	self._template = [
		'<style>',
			'#btc-last-wrapper {transition: 0.2s linear color; -o-transition: 0.2s linear color; -moz-transition: 0.2s linear color; -webkit-transition: 0.2s linear color; color: #4B4B4B;}',
			'#btc-last-wrapper.btc-red {color: red;}', 
			'#btc-last-wrapper.btc-green {color: green;}',
			'#btc-slider {transition: 0.1s ease-in top; -o-transition: 0.1s ease-in top; -moz-transition: 0.1s ease-in top; -webkit-transition: 0.1s ease-in top; top: 0px; position: relative;}',
			'#btc-slider.btc-is-loading {top: -72px;}',
			'.odometer .odometer-inside {position: relative; top: -5px;}',
			'.odometer.odometer-auto-theme, .odometer.odometer-theme-minimal { display: -moz-inline-stack; display: inline-block; vertical-align: middle; *vertical-align: auto; zoom: 1; *display: inline; position: relative; }',
			'.odometer.odometer-auto-theme .odometer-digit, .odometer.odometer-theme-minimal .odometer-digit { display: -moz-inline-stack; display: inline-block; vertical-align: middle; *vertical-align: auto; zoom: 1; *display: inline; position: relative; }',
			'.odometer.odometer-auto-theme .odometer-digit .odometer-digit-spacer, .odometer.odometer-theme-minimal .odometer-digit .odometer-digit-spacer { display: -moz-inline-stack; display: inline-block; vertical-align: middle; *vertical-align: auto; zoom: 1; *display: inline; visibility: hidden; }',
			'.odometer.odometer-auto-theme .odometer-digit .odometer-digit-inner, .odometer.odometer-theme-minimal .odometer-digit .odometer-digit-inner { text-align: left; display: block; position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; }',
			'.odometer.odometer-auto-theme .odometer-digit .odometer-ribbon, .odometer.odometer-theme-minimal .odometer-digit .odometer-ribbon { display: block; }',
			'.odometer.odometer-auto-theme .odometer-digit .odometer-ribbon-inner, .odometer.odometer-theme-minimal .odometer-digit .odometer-ribbon-inner { display: block; }',
			'.odometer.odometer-auto-theme .odometer-digit .odometer-value, .odometer.odometer-theme-minimal .odometer-digit .odometer-value { display: block; }',
			'.odometer.odometer-auto-theme .odometer-digit .odometer-value.odometer-last-value, .odometer.odometer-theme-minimal .odometer-digit .odometer-value.odometer-last-value { position: absolute; }',
			'.odometer.odometer-auto-theme.odometer-animating-up .odometer-ribbon-inner, .odometer.odometer-theme-minimal.odometer-animating-up .odometer-ribbon-inner { -webkit-transition: -webkit-transform 2s; -moz-transition: -moz-transform 2s; -ms-transition: -ms-transform 2s; -o-transition: -o-transform 2s; transition: transform 2s; }',
			'.odometer.odometer-auto-theme.odometer-animating-up.odometer-animating .odometer-ribbon-inner, .odometer.odometer-theme-minimal.odometer-animating-up.odometer-animating .odometer-ribbon-inner { -webkit-transform: translateY(-100%); -moz-transform: translateY(-100%); -ms-transform: translateY(-100%); -o-transform: translateY(-100%); transform: translateY(-100%); }',
			'.odometer.odometer-auto-theme.odometer-animating-down .odometer-ribbon-inner, .odometer.odometer-theme-minimal.odometer-animating-down .odometer-ribbon-inner { -webkit-transform: translateY(-100%); -moz-transform: translateY(-100%); -ms-transform: translateY(-100%); -o-transform: translateY(-100%); transform: translateY(-100%); }',
			'.odometer.odometer-auto-theme.odometer-animating-down.odometer-animating .odometer-ribbon-inner, .odometer.odometer-theme-minimal.odometer-animating-down.odometer-animating .odometer-ribbon-inner { -webkit-transition: -webkit-transform 2s; -moz-transition: -moz-transform 2s; -ms-transition: -ms-transform 2s; -o-transition: -o-transform 2s; -o-transition: -o-transform 2s; transition: transform 2s; -webkit-transform: translateY(0); -moz-transform: translateY(0); -ms-transform: translateY(0); -o-transform: translateY(0); transform: translateY(0); }',
		'</style>',
		'<div class="btc-box" style="height: 71px; width: 212px; font-size: 12px; font-family: Arial; position: relative; overflow:hidden; background-color: #DFE0E2; background-image: url(' + BACKGROUND_GRADIENT + '); background-repeat: repeat-x; border-radius: 4px; border: 2px solid #D6D4D7;">',
			'<div class="btc-is-loading" id="btc-slider">',
				'<div class="btc-box" style="height: 71px; width: 212px; font-size: 12px; line-height: 1;">',
					'<div style="position: absolute; background-image: url(' + BITCOIN_LOGO + '); width: 56px; height: 56px; top: 9px; left: 10px;"></div>',
					'<div id="btc-last-wrapper" style="position: absolute; font-weight: bold; right: 10px; top: 8px; height: 38px; line-height: 30px; width: 140px; text-align: right; font-size: 30px;">',
						'$<span class="odometer" id="btc-last-field" style="padding-top: 4px;"></span>',
					'</div>',
					'<div class="btc-hides" style="position: absolute; right: 0px; top: 40px; margin-right: 10px;">',
						'<span style="font-size: 10px; color: #999; width: 150px;">Bid: ',
							'<b style="font-weight: bold; font-size: 10px; color: #999;">$</b><b id="btc-bid-field" style="font-weight: bold; font-size: 10px; color: #999;"></b>',
						'</span>',
						'<span style="font-size: 10px; color: #999; margin-left: 2px;">Ask: ',
							'<b style="font-weight: bold; font-size: 10px; color: #999;">$</b><b id="btc-ask-field" style="font-weight: bold; font-size: 10px; color: #999;"></b>',
						'</span>',
						'<span style="position: absolute; right: 0px; top: 14px; color: #666; text-align: right; width: 160px; font-size: 10px;">',
							'Powered by <a href="http://www.btcquote.com/?utm_source=poweredby&utm_medium=widget&utm_campaign=btcquote" target="_blank" style="background-color: inherit; float: right; margin-left: 4px; color: #666; text-decoration: underline; cursor: pointer; font-size: 10px; padding: 0px;">BTCQuote.com</a>',
						'</span>',
					'</div>',
				'</div>',
				'<div class="btc-box" style="height: 71px; width: 212px; font-size: 12px; text-align: center; line-height: 70px; color: #aaa; font-size: 14px;">Loading...</div>',
			'</div>',
		'</div>'
	].join('\n');
};

var _bq = new BTCQuote();
