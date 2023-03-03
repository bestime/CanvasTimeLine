
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':1505/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var CanvasTimeLine = (function () {
'use strict';

/**  
 * 个人工具库 (TS版) bestime.esm.min.js
 * @QQ 1174295440
 * @author Bestime
 * @see https://github.com/bestime/tool
 * @update 2022-11-10 11:11:13
 */
function isNull(e){return null===e||e===undefined}function _String(e){return isNull(e)?"":String(e)}function repeatString(e,t){var n="";if((e=_String(e)).length*t<1<<28)for(;1==(1&t)&&(n+=e),0!=(t>>>=1);)e+=e;return n}function hpPadString(e,t,n,r){return (e=_String(e)).length>(t>>=0)?e:(t-=e.length,n.length<t&&(n+=repeatString(n,t/n.length)),-1===r?n.slice(0,t)+e:e+n.slice(0,t))}function padStart(e,t,n){return hpPadString(e,t,n,-1)}document.getElementsByTagName("head")[0];

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

var freeGlobal$1 = freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal$1 || freeSelf || Function('return this')();

var root$1 = root;

/** Built-in value references. */
var Symbol = root$1.Symbol;

var Symbol$1 = Symbol;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto$1.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

/** Used to match a single whitespace character. */
var reWhitespace = /\s/;

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
 * character of `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the index of the last non-whitespace character.
 */
function trimmedEndIndex(string) {
  var index = string.length;

  while (index-- && reWhitespace.test(string.charAt(index))) {}
  return index;
}

/** Used to match leading whitespace. */
var reTrimStart = /^\s+/;

/**
 * The base implementation of `_.trim`.
 *
 * @private
 * @param {string} string The string to trim.
 * @returns {string} Returns the trimmed string.
 */
function baseTrim(string) {
  return string
    ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
    : string;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root$1.Date.now();
};

var now$1 = now;

/** Error message constants. */
var FUNC_ERROR_TEXT$1 = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now$1();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now$1());
  }

  function debounced() {
    var time = now$1(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

const centerLineColor = '#ffcc00';
const canvasHeight = 60;
const scaleEnableColor = 'green';
const scaleDisabledColor = 'red';
const mouseInfoColor = '#d7d7d7';
const timeTextFont = '12px serif';
function formatTime(data) {
    const year = padStart(data.year, 4, '0');
    const month = padStart(data.month, 2, '0');
    const day = padStart(data.day, 2, '0');
    const hour = padStart(data.hour, 2, '0');
    const minute = padStart(data.minute, 2, '0');
    const second = padStart(data.second, 2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
function convertTime(timeStamp) {
    const date = new Date(timeStamp);
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        milliSecond: date.getMilliseconds()
    };
}
function parseStep(data) {
    let step = 0;
    let scale = 'second';
    let parent = 'minute';
    switch (data) {
        case 'second':
            step = 1000;
            scale = 'second';
            parent = 'minute';
            break;
        case 'minute':
            step = 1000 * 60;
            scale = 'minute';
            parent = 'hour';
            break;
    }
    return {
        step,
        scale,
        parent
    };
}
class CanvasTimeLine {
    _canvas;
    _range = [0, 0];
    _options;
    _datetime = new Date().getTime();
    _times = [];
    _ctx;
    _pressX = 0;
    _isMouseDown = false;
    _pressTime = 0;
    _step = parseStep('second');
    _mouseX;
    constructor(canvas, options) {
        this._onMouseup = this._onMouseup.bind(this);
        this._onMouesmove = throttle(this._onMouesmove.bind(this), 17);
        this._emitTime = throttle(this._emitTime.bind(this), 200);
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
        this._options = Object.assign({
            style: {
                backgroundColor: 'black'
            },
            precision: 'second'
        }, options);
        this._step = parseStep(this._options.precision);
        this.updateSize();
        this.setStyle(this._options.style);
        // this.draw = debounce(this.draw, 16)
        this._initDrag();
        // observeDomResize(this._canvas, () => {
        //   this.updateSize()
        // }, 'width', 100)
    }
    draw() {
        this._times = [];
        const width = this._canvas.offsetWidth;
        this._ctx.clearRect(0, 0, width, canvasHeight);
        const left = Math.ceil(width / 2);
        this._drawScaleInfo(width, left);
        this._drawCenterLine(left);
        this._drawMouseInfo();
    }
    _initDrag() {
        this._canvas.onmousedown = (ev) => {
            this._isMouseDown = true;
            this._pressTime = this._datetime;
            this._pressX = ev.clientX;
            document.removeEventListener('mouseup', this._onMouseup);
            document.removeEventListener('mousemove', this._onMouesmove);
            document.addEventListener('mouseup', this._onMouseup);
            document.addEventListener('mousemove', this._onMouesmove);
        };
        this._canvas.onmousemove = (ev) => {
            // if(this._isMouseDown) return;
            const boundary = this._canvas.getBoundingClientRect();
            this._mouseX = ev.clientX - boundary.left;
            this.draw();
        };
        this._canvas.onmouseout = this._canvas.onmouseleave = () => {
            this._mouseX = undefined;
            this.draw();
        };
        this._canvas.ondblclick = (ev) => {
            const boundary = this._canvas.getBoundingClientRect();
            const x = ev.clientX - boundary.left;
            this.setDateTime(this._times[x]);
            this._emitTime();
        };
    }
    _emitTime() {
        console.log("时间改变", formatTime(convertTime(this._datetime)));
    }
    _drawMouseInfo() {
        // if(this._isMouseDown) return;
        if (typeof this._mouseX !== 'number' || !this._times[this._mouseX])
            return;
        const x = this._mouseX;
        const color = mouseInfoColor;
        // 绘制鼠标移动的刻度
        this._ctx.beginPath();
        this._ctx.strokeStyle = color;
        this._ctx.lineWidth = 1;
        this._ctx.moveTo(x - 0.5, 0);
        this._ctx.lineTo(x - 0.5, 30);
        this._ctx.stroke();
        this._ctx.closePath();
        // 绘制鼠标移动的文本
        const width = this._canvas.offsetWidth;
        // 设置文字绘制的起点坐标，保证绘制在可视区域内
        let textLeft = x - 50;
        textLeft = Math.min(textLeft, width - 115);
        textLeft = Math.max(textLeft, 2);
        this._ctx.beginPath();
        this._ctx.fillStyle = color;
        this._ctx.font = timeTextFont;
        this._ctx.fillText(this._times[x], textLeft, 42);
        this._ctx.closePath();
    }
    _onMouesmove(ev) {
        const x = ev.clientX - this._pressX;
        this._datetime = this._pressTime - x * this._step.step;
        this.draw();
    }
    _onMouseup() {
        this._isMouseDown = false;
        document.removeEventListener('mouseup', this._onMouseup);
        document.removeEventListener('mousemove', this._onMouesmove);
        this._emitTime();
    }
    _drawScaleInfo(width, left) {
        const drawBeginTime = this._datetime - left * this._step.step;
        this._ctx.lineWidth = 1;
        for (let a = 0; a < width; a++) {
            this._ctx.beginPath();
            const stamp = drawBeginTime + a * this._step.step;
            const time = convertTime(stamp);
            this._times.push(formatTime(time));
            // 10像素绘制一个刻度
            if (time[this._step.scale] % 10 !== 0)
                continue;
            const isLabel = time[this._step.scale] === 0;
            // 10个小刻度绘制一个文本
            const scaleHeight = isLabel ? 14 : 8;
            let color = this._checkEnableTime(stamp) ? scaleEnableColor : scaleDisabledColor;
            this._ctx.strokeStyle = color;
            let x = a - 0.5;
            this._ctx.moveTo(x, 0);
            this._ctx.lineTo(x, scaleHeight);
            this._ctx.stroke();
            this._ctx.closePath();
            if (isLabel) {
                this._ctx.beginPath();
                this._ctx.fillStyle = color;
                this._ctx.font = timeTextFont;
                this._ctx.fillText(`${padStart(time[this._step.parent], 2, '0')}:${padStart(time[this._step.scale], 2, '0')}`, a - 16, 26);
                this._ctx.closePath();
            }
        }
    }
    _drawCenterLine(x) {
        // 绘制鼠标移动的刻度
        this._ctx.beginPath();
        this._ctx.strokeStyle = centerLineColor;
        this._ctx.lineWidth = 2;
        this._ctx.moveTo(x, 0);
        this._ctx.lineTo(x, 43);
        this._ctx.stroke();
        this._ctx.closePath();
        // 绘制鼠标移动的文本
        this._ctx.beginPath();
        this._ctx.fillStyle = centerLineColor;
        this._ctx.font = timeTextFont;
        this._ctx.fillText(this._times[x], x - 50, 55);
        this._ctx.closePath();
    }
    _checkEnableTime(date) {
        if (typeof this._range[0] === 'number' && date < this._range[0]) {
            return false;
        }
        else if (typeof this._range[1] === 'number' && date > this._range[1]) {
            return false;
        }
        return true;
    }
    setDateTime(datetime) {
        this._isMouseDown = false;
        this._mouseX = undefined;
        this._datetime = new Date(datetime).getTime();
        this.draw();
    }
    setRange(start, end) {
        this._range[0] = new Date(start).getTime();
        this._range[1] = new Date(end).getTime();
        this.draw();
    }
    setStyle(data) {
        this._options.style = data;
        this._canvas.style['backgroundColor'] = this._options.style.backgroundColor;
    }
    updateSize() {
        const width = this._canvas.offsetWidth;
        this._canvas.style.height = canvasHeight + 'px';
        this._canvas.width = width;
        this._canvas.height = canvasHeight;
        this.draw();
    }
    dispose() {
        document.removeEventListener('mouseup', this._onMouseup);
        document.removeEventListener('mousemove', this._onMouesmove);
    }
}

return CanvasTimeLine;

})();
//# sourceMappingURL=index.js.map
