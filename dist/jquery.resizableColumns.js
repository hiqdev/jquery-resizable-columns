/**
 * hiqdev-jquery-resizable-columns - Resizable table columns for jQuery
 * @date Mon Jan 16 2017 13:31:45 GMT+0200 (EET)
 * @version v2.2.4
 * @link https://github.com/hiqdev/jquery-resizable-columns
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _constants = require('./constants');

$.fn.resizableColumns = function (optionsOrMethod) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	return this.each(function () {
		var $table = $(this);

		var api = $table.data(_constants.DATA_API);
		if (!api) {
			api = new _class2['default']($table, optionsOrMethod);
			$table.data(_constants.DATA_API, api);
		} else if (typeof optionsOrMethod === 'string') {
			var _api;

			return (_api = api)[optionsOrMethod].apply(_api, args);
		}
	});
};

$.resizableColumns = _class2['default'];

},{"./class":2,"./constants":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./constants');

/**
Takes a <table /> element and makes it's columns resizable across both
mobile and desktop clients.

@class ResizableColumns
@param $table {jQuery} jQuery-wrapped <table> element to make resizable
@param options {Object} Configuration object
**/

var ResizableColumns = (function () {
	function ResizableColumns($table, options) {
		_classCallCheck(this, ResizableColumns);

		this.ns = '.rc' + this.count++;

		this.options = $.extend({}, ResizableColumns.defaults, options);

		this.$window = $(window);
		this.$ownerDocument = $($table[0].ownerDocument);
		this.$table = $table;

		this.refreshHeaders();
		this.restoreColumnWidths();
		this.syncHandleWidths();

		this.bindEvents(this.$window, 'resize', this.syncHandleWidths.bind(this));

		if (this.options.start) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE_START, this.options.start);
		}
		if (this.options.resize) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE, this.options.resize);
		}
		if (this.options.stop) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE_STOP, this.options.stop);
		}
	}

	/**
 Refreshes the headers associated with this instances <table/> element and
 generates handles for them. Also assigns percentage widths.
 	@method refreshHeaders
 **/

	_createClass(ResizableColumns, [{
		key: 'refreshHeaders',
		value: function refreshHeaders() {
			// Allow the selector to be both a regular selctor string as well as
			// a dynamic callback
			var selector = this.options.selector;
			if (typeof selector === 'function') {
				selector = selector.call(this, this.$table);
			}

			// Select all table headers
			this.$tableHeaders = this.$table.find(selector);

			// Assign percentage widths first, then create drag handles
			this.assignPercentageWidths();
			this.createHandles();
		}

		/**
  Creates dummy handle elements for all table header columns
  	@method createHandles
  **/
	}, {
		key: 'createHandles',
		value: function createHandles() {
			var _this = this;

			var ref = this.$handleContainer;
			if (ref != null) {
				ref.remove();
			}

			this.$handleContainer = $('<div class=\'' + _constants.CLASS_HANDLE_CONTAINER + '\' />');
			this.$table.before(this.$handleContainer);

			this.$tableHeaders.each(function (i, el) {
				var $current = _this.$tableHeaders.eq(i);
				var $next = _this.$tableHeaders.eq(i + 1);

				if ($next.length === 0 || $current.is(_constants.SELECTOR_UNRESIZABLE) || $next.is(_constants.SELECTOR_UNRESIZABLE)) {
					return;
				}

				var $handle = $('<div class=\'' + _constants.CLASS_HANDLE + '\' />').data(_constants.DATA_TH, $(el)).appendTo(_this.$handleContainer);
			});

			this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.' + _constants.CLASS_HANDLE, this.onPointerDown.bind(this));
		}

		/**
  Assigns a percentage width to all columns based on their current pixel width(s)
  	@method assignPercentageWidths
  **/
	}, {
		key: 'assignPercentageWidths',
		value: function assignPercentageWidths() {
			var _this2 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);
				_this2.setWidth($el[0], $el.outerWidth() / _this2.$table.width() * 100);
			});
		}

		/**
  
  @method syncHandleWidths
  **/
	}, {
		key: 'syncHandleWidths',
		value: function syncHandleWidths() {
			var _this3 = this;

			var $container = this.$handleContainer;

			$container.width(this.$table.width());

			$container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
				var $el = $(el);

				var height = _this3.options.resizeFromBody ? _this3.$table.height() : _this3.$table.find('thead').height();

				var left = $el.data(_constants.DATA_TH).outerWidth() + ($el.data(_constants.DATA_TH).offset().left - _this3.$handleContainer.offset().left);

				$el.css({ left: left, height: height });
			});
		}

		/**
  Persists the column widths in localStorage
  	@method saveColumnWidths
  **/
	}, {
		key: 'saveColumnWidths',
		value: function saveColumnWidths() {
			var _this4 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (_this4.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					_this4.options.store.set(_this4.generateColumnId($el), _this4.parseWidth(el));
				}
			});
		}

		/**
  Retrieves and sets the column widths from localStorage
  	@method restoreColumnWidths
  **/
	}, {
		key: 'restoreColumnWidths',
		value: function restoreColumnWidths() {
			var _this5 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (_this5.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					var width = _this5.options.store.get(_this5.generateColumnId($el));

					if (width != null) {
						_this5.setWidth(el, width);
					}
				}
			});
		}

		/**
  Pointer/mouse down handler
  	@method onPointerDown
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerDown',
		value: function onPointerDown(event) {
			// Only applies to left-click dragging
			if (event.which !== 1) {
				return;
			}

			// If a previous operation is defined, we missed the last mouseup.
			// Probably gobbled up by user mousing out the window then releasing.
			// We'll simulate a pointerup here prior to it
			if (this.operation) {
				this.onPointerUp(event);
			}

			// Ignore non-resizable columns
			var $currentGrip = $(event.currentTarget);
			if ($currentGrip.is(_constants.SELECTOR_UNRESIZABLE)) {
				return;
			}

			var gripIndex = $currentGrip.index();
			var $leftColumn = this.$tableHeaders.eq(gripIndex).not(_constants.SELECTOR_UNRESIZABLE);
			var $rightColumn = this.$tableHeaders.eq(gripIndex + 1).not(_constants.SELECTOR_UNRESIZABLE);

			var leftWidth = this.parseWidth($leftColumn[0]);
			var rightWidth = this.parseWidth($rightColumn[0]);

			this.operation = {
				$leftColumn: $leftColumn, $rightColumn: $rightColumn, $currentGrip: $currentGrip,

				startX: this.getPointerX(event),

				widths: {
					left: leftWidth,
					right: rightWidth
				},
				newWidths: {
					left: leftWidth,
					right: rightWidth
				}
			};

			this.bindEvents(this.$ownerDocument, ['mousemove', 'touchmove'], this.onPointerMove.bind(this));
			this.bindEvents(this.$ownerDocument, ['mouseup', 'touchend'], this.onPointerUp.bind(this));

			this.$handleContainer.add(this.$table).addClass(_constants.CLASS_TABLE_RESIZING);

			$leftColumn.add($rightColumn).add($currentGrip).addClass(_constants.CLASS_COLUMN_RESIZING);

			this.triggerEvent(_constants.EVENT_RESIZE_START, [$leftColumn, $rightColumn, leftWidth, rightWidth], event);

			event.preventDefault();
		}

		/**
  Pointer/mouse movement handler
  	@method onPointerMove
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerMove',
		value: function onPointerMove(event) {
			var op = this.operation;
			if (!this.operation) {
				return;
			}

			// Determine the delta change between start and new mouse position, as a percentage of the table width
			var difference = (this.getPointerX(event) - op.startX) / this.$table.width() * 100;
			if (difference === 0) {
				return;
			}

			var leftColumn = op.$leftColumn[0];
			var rightColumn = op.$rightColumn[0];
			var widthLeft = undefined,
			    widthRight = undefined;

			if (difference > 0) {
				widthLeft = this.constrainWidth(op.widths.left + (op.widths.right - op.newWidths.right));
				widthRight = this.constrainWidth(op.widths.right - difference);
			} else if (difference < 0) {
				widthLeft = this.constrainWidth(op.widths.left + difference);
				widthRight = this.constrainWidth(op.widths.right + (op.widths.left - op.newWidths.left));
			}

			if (leftColumn) {
				this.setWidth(leftColumn, widthLeft);
			}
			if (rightColumn) {
				this.setWidth(rightColumn, widthRight);
			}

			op.newWidths.left = widthLeft;
			op.newWidths.right = widthRight;

			return this.triggerEvent(_constants.EVENT_RESIZE, [op.$leftColumn, op.$rightColumn, widthLeft, widthRight], event);
		}

		/**
  Pointer/mouse release handler
  	@method onPointerUp
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerUp',
		value: function onPointerUp(event) {
			var op = this.operation;
			if (!this.operation) {
				return;
			}

			this.unbindEvents(this.$ownerDocument, ['mouseup', 'touchend', 'mousemove', 'touchmove']);

			this.$handleContainer.add(this.$table).removeClass(_constants.CLASS_TABLE_RESIZING);

			op.$leftColumn.add(op.$rightColumn).add(op.$currentGrip).removeClass(_constants.CLASS_COLUMN_RESIZING);

			this.syncHandleWidths();
			this.saveColumnWidths();

			this.operation = null;

			return this.triggerEvent(_constants.EVENT_RESIZE_STOP, [op.$leftColumn, op.$rightColumn, op.newWidths.left, op.newWidths.right], event);
		}

		/**
  Removes all event listeners, data, and added DOM elements. Takes
  the <table/> element back to how it was, and returns it
  	@method destroy
  @return {jQuery} Original jQuery-wrapped <table> element
  **/
	}, {
		key: 'destroy',
		value: function destroy() {
			var $table = this.$table;
			var $handles = this.$handleContainer.find('.' + _constants.CLASS_HANDLE);

			this.unbindEvents(this.$window.add(this.$ownerDocument).add(this.$table).add($handles));

			$handles.removeData(_constants.DATA_TH);
			$table.removeData(_constants.DATA_API);

			this.$handleContainer.remove();
			this.$handleContainer = null;
			this.$tableHeaders = null;
			this.$table = null;

			return $table;
		}

		/**
  Binds given events for this instance to the given target DOMElement
  	@private
  @method bindEvents
  @param target {jQuery} jQuery-wrapped DOMElement to bind events to
  @param events {String|Array} Event name (or array of) to bind
  @param selectorOrCallback {String|Function} Selector string or callback
  @param [callback] {Function} Callback method
  **/
	}, {
		key: 'bindEvents',
		value: function bindEvents($target, events, selectorOrCallback, callback) {
			if (typeof events === 'string') {
				events = events + this.ns;
			} else {
				events = events.join(this.ns + ' ') + this.ns;
			}

			if (arguments.length > 3) {
				$target.on(events, selectorOrCallback, callback);
			} else {
				$target.on(events, selectorOrCallback);
			}
		}

		/**
  Unbinds events specific to this instance from the given target DOMElement
  	@private
  @method unbindEvents
  @param target {jQuery} jQuery-wrapped DOMElement to unbind events from
  @param events {String|Array} Event name (or array of) to unbind
  **/
	}, {
		key: 'unbindEvents',
		value: function unbindEvents($target, events) {
			if (typeof events === 'string') {
				events = events + this.ns;
			} else if (events != null) {
				events = events.join(this.ns + ' ') + this.ns;
			} else {
				events = this.ns;
			}

			$target.off(events);
		}

		/**
  Triggers an event on the <table/> element for a given type with given
  arguments, also setting and allowing access to the originalEvent if
  given. Returns the result of the triggered event.
  	@private
  @method triggerEvent
  @param type {String} Event name
  @param args {Array} Array of arguments to pass through
  @param [originalEvent] If given, is set on the event object
  @return {Mixed} Result of the event trigger action
  **/
	}, {
		key: 'triggerEvent',
		value: function triggerEvent(type, args, originalEvent) {
			var event = $.Event(type);
			if (event.originalEvent) {
				event.originalEvent = $.extend({}, originalEvent);
			}

			return this.$table.trigger(event, [this].concat(args || []));
		}

		/**
  Calculates a unique column ID for a given column DOMElement
  	@private
  @method generateColumnId
  @param $el {jQuery} jQuery-wrapped column element
  @return {String} Column ID
  **/
	}, {
		key: 'generateColumnId',
		value: function generateColumnId($el) {
			return this.$table.data(_constants.DATA_COLUMNS_ID) + '-' + $el.data(_constants.DATA_COLUMN_ID);
		}

		/**
  Parses a given DOMElement's width into a float
  	@private
  @method parseWidth
  @param element {DOMElement} Element to get width of
  @return {Number} Element's width as a float
  **/
	}, {
		key: 'parseWidth',
		value: function parseWidth(element) {
			return element ? parseFloat(element.style.width.replace('%', '')) : 0;
		}

		/**
  Sets the percentage width of a given DOMElement
  	@private
  @method setWidth
  @param element {DOMElement} Element to set width on
  @param width {Number} Width, as a percentage, to set
  **/
	}, {
		key: 'setWidth',
		value: function setWidth(element, width) {
			width = width.toFixed(2);
			width = width > 0 ? width : 0;
			element.style.width = width + '%';
		}

		/**
  Constrains a given width to the minimum and maximum ranges defined in
  the `minWidth` and `maxWidth` configuration options, respectively.
  	@private
  @method constrainWidth
  @param width {Number} Width to constrain
  @return {Number} Constrained width
  **/
	}, {
		key: 'constrainWidth',
		value: function constrainWidth(width) {
			if (this.options.minWidth != undefined) {
				width = Math.max(this.options.minWidth, width);
			}

			if (this.options.maxWidth != undefined) {
				width = Math.min(this.options.maxWidth, width);
			}

			return width;
		}

		/**
  Given a particular Event object, retrieves the current pointer offset along
  the horizontal direction. Accounts for both regular mouse clicks as well as
  pointer-like systems (mobiles, tablets etc.)
  	@private
  @method getPointerX
  @param event {Object} Event object associated with the interaction
  @return {Number} Horizontal pointer offset
  **/
	}, {
		key: 'getPointerX',
		value: function getPointerX(event) {
			if (event.type.indexOf('touch') === 0) {
				return (event.originalEvent.touches[0] || event.originalEvent.changedTouches[0]).pageX;
			}
			return event.pageX;
		}
	}]);

	return ResizableColumns;
})();

exports['default'] = ResizableColumns;

ResizableColumns.defaults = {
	selector: function selector($table) {
		if ($table.find('thead').length) {
			return _constants.SELECTOR_TH;
		}

		return _constants.SELECTOR_TD;
	},
	store: window.store,
	syncHandlers: true,
	resizeFromBody: true,
	maxWidth: null,
	minWidth: 0.01
};

ResizableColumns.count = 0;
module.exports = exports['default'];

},{"./constants":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var DATA_API = 'resizableColumns';
exports.DATA_API = DATA_API;
var DATA_COLUMNS_ID = 'resizable-columns-id';
exports.DATA_COLUMNS_ID = DATA_COLUMNS_ID;
var DATA_COLUMN_ID = 'resizable-column-id';
exports.DATA_COLUMN_ID = DATA_COLUMN_ID;
var DATA_TH = 'th';

exports.DATA_TH = DATA_TH;
var CLASS_TABLE_RESIZING = 'rc-table-resizing';
exports.CLASS_TABLE_RESIZING = CLASS_TABLE_RESIZING;
var CLASS_COLUMN_RESIZING = 'rc-column-resizing';
exports.CLASS_COLUMN_RESIZING = CLASS_COLUMN_RESIZING;
var CLASS_HANDLE = 'rc-handle';
exports.CLASS_HANDLE = CLASS_HANDLE;
var CLASS_HANDLE_CONTAINER = 'rc-handle-container';

exports.CLASS_HANDLE_CONTAINER = CLASS_HANDLE_CONTAINER;
var EVENT_RESIZE_START = 'column:resize:start';
exports.EVENT_RESIZE_START = EVENT_RESIZE_START;
var EVENT_RESIZE = 'column:resize';
exports.EVENT_RESIZE = EVENT_RESIZE;
var EVENT_RESIZE_STOP = 'column:resize:stop';

exports.EVENT_RESIZE_STOP = EVENT_RESIZE_STOP;
var SELECTOR_TH = 'tr:first > th:visible';
exports.SELECTOR_TH = SELECTOR_TH;
var SELECTOR_TD = 'tr:first > td:visible';
exports.SELECTOR_TD = SELECTOR_TD;
var SELECTOR_UNRESIZABLE = '[data-noresize]';
exports.SELECTOR_UNRESIZABLE = SELECTOR_UNRESIZABLE;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _adapter = require('./adapter');

var _adapter2 = _interopRequireDefault(_adapter);

exports['default'] = _class2['default'];
module.exports = exports['default'];

},{"./adapter":1,"./class":2}]},{},[4])

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0hqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFaEUsTUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDekIsTUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2pELE1BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOztBQUVyQixNQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDdEIsTUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDM0IsTUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7O0FBRXhCLE1BQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUUxRSxNQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO0FBQ3ZCLE9BQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0saUNBQXNCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDckU7QUFDRCxNQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ3hCLE9BQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sMkJBQWdCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDaEU7QUFDRCxNQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO0FBQ3RCLE9BQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sZ0NBQXFCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDbkU7RUFDRDs7Ozs7Ozs7Y0F6Qm1CLGdCQUFnQjs7U0FpQ3RCLDBCQUFHOzs7QUFHaEIsT0FBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFDckMsT0FBRyxPQUFPLFFBQVEsS0FBSyxVQUFVLEVBQUU7QUFDbEMsWUFBUSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1Qzs7O0FBR0QsT0FBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7O0FBR2hELE9BQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0FBQzlCLE9BQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztHQUNyQjs7Ozs7Ozs7U0FPWSx5QkFBRzs7O0FBQ2YsT0FBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0FBQ2hDLE9BQUksR0FBRyxJQUFJLElBQUksRUFBRTtBQUNoQixPQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDYjs7QUFFRCxPQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQywrREFBNkMsQ0FBQTtBQUN0RSxPQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7QUFFMUMsT0FBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFLO0FBQ2xDLFFBQUksUUFBUSxHQUFHLE1BQUssYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QyxRQUFJLEtBQUssR0FBRyxNQUFLLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUV6QyxRQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxFQUFFLGlDQUFzQixJQUFJLEtBQUssQ0FBQyxFQUFFLGlDQUFzQixFQUFFO0FBQzlGLFlBQU87S0FDUDs7QUFFRCxRQUFJLE9BQU8sR0FBRyxDQUFDLHFEQUFtQyxDQUNoRCxJQUFJLHFCQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNwQixRQUFRLENBQUMsTUFBSyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2xDLENBQUMsQ0FBQzs7QUFFSCxPQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsRUFBRSxHQUFHLDBCQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztHQUNySDs7Ozs7Ozs7U0FPcUIsa0NBQUc7OztBQUN4QixPQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxFQUFFLEVBQUs7QUFDbEMsUUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hCLFdBQUssUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsT0FBSyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDcEUsQ0FBQyxDQUFDO0dBQ0g7Ozs7Ozs7O1NBT2UsNEJBQUc7OztBQUNsQixPQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUE7O0FBRXRDLGFBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDOztBQUV0QyxhQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsMEJBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxFQUFFLEVBQUs7QUFDakQsUUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUVoQixRQUFJLE1BQU0sR0FBRyxPQUFLLE9BQU8sQ0FBQyxjQUFjLEdBQ3ZDLE9BQUssTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUNwQixPQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRXBDLFFBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLG9CQUFTLENBQUMsVUFBVSxFQUFFLElBQ3hDLEdBQUcsQ0FBQyxJQUFJLG9CQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxHQUFHLE9BQUssZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFBLEFBQ3JFLENBQUM7O0FBRUYsT0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBSixJQUFJLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDMUIsQ0FBQyxDQUFDO0dBQ0g7Ozs7Ozs7O1NBT2UsNEJBQUc7OztBQUNsQixPQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxFQUFFLEVBQUs7QUFDbEMsUUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUVoQixRQUFJLE9BQUssT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLGlDQUFzQixFQUFFO0FBQ3hELFlBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQ3JCLE9BQUssZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEVBQzFCLE9BQUssVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUNuQixDQUFDO0tBQ0Y7SUFDRCxDQUFDLENBQUM7R0FDSDs7Ozs7Ozs7U0FPa0IsK0JBQUc7OztBQUNyQixPQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxFQUFFLEVBQUs7QUFDbEMsUUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUVoQixRQUFHLE9BQUssT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLGlDQUFzQixFQUFFO0FBQ3ZELFNBQUksS0FBSyxHQUFHLE9BQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQ2pDLE9BQUssZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQzFCLENBQUM7O0FBRUYsU0FBRyxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2pCLGFBQUssUUFBUSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztNQUN6QjtLQUNEO0lBQ0QsQ0FBQyxDQUFDO0dBQ0g7Ozs7Ozs7OztTQVFZLHVCQUFDLEtBQUssRUFBRTs7QUFFcEIsT0FBRyxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtBQUFFLFdBQU87SUFBRTs7Ozs7QUFLakMsT0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2xCLFFBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEI7OztBQUdELE9BQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDMUMsT0FBRyxZQUFZLENBQUMsRUFBRSxpQ0FBc0IsRUFBRTtBQUN6QyxXQUFPO0lBQ1A7O0FBRUQsT0FBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3JDLE9BQUksV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsaUNBQXNCLENBQUM7QUFDN0UsT0FBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsaUNBQXNCLENBQUM7O0FBRWxGLE9BQUksU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEQsT0FBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFbEQsT0FBSSxDQUFDLFNBQVMsR0FBRztBQUNoQixlQUFXLEVBQVgsV0FBVyxFQUFFLFlBQVksRUFBWixZQUFZLEVBQUUsWUFBWSxFQUFaLFlBQVk7O0FBRXZDLFVBQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQzs7QUFFL0IsVUFBTSxFQUFFO0FBQ1AsU0FBSSxFQUFFLFNBQVM7QUFDZixVQUFLLEVBQUUsVUFBVTtLQUNqQjtBQUNELGFBQVMsRUFBRTtBQUNWLFNBQUksRUFBRSxTQUFTO0FBQ2YsVUFBSyxFQUFFLFVBQVU7S0FDakI7SUFDRCxDQUFDOztBQUVGLE9BQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2hHLE9BQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUUzRixPQUFJLENBQUMsZ0JBQWdCLENBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQ2hCLFFBQVEsaUNBQXNCLENBQUM7O0FBRWpDLGNBQVcsQ0FDVCxHQUFHLENBQUMsWUFBWSxDQUFDLENBQ2pCLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FDakIsUUFBUSxrQ0FBdUIsQ0FBQzs7QUFFbEMsT0FBSSxDQUFDLFlBQVksZ0NBQXFCLENBQ3JDLFdBQVcsRUFBRSxZQUFZLEVBQ3pCLFNBQVMsRUFBRSxVQUFVLENBQ3JCLEVBQ0QsS0FBSyxDQUFDLENBQUM7O0FBRVAsUUFBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0dBQ3ZCOzs7Ozs7Ozs7U0FRWSx1QkFBQyxLQUFLLEVBQUU7QUFDcEIsT0FBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUN4QixPQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUFFLFdBQU87SUFBRTs7O0FBRy9CLE9BQUksVUFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFBLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFDbkYsT0FBRyxVQUFVLEtBQUssQ0FBQyxFQUFFO0FBQ3BCLFdBQU87SUFDUDs7QUFFRCxPQUFJLFVBQVUsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLE9BQUksV0FBVyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckMsT0FBSSxTQUFTLFlBQUE7T0FBRSxVQUFVLFlBQUEsQ0FBQzs7QUFFMUIsT0FBRyxVQUFVLEdBQUcsQ0FBQyxFQUFFO0FBQ2xCLGFBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFBLEFBQUMsQ0FBQyxDQUFDO0FBQ3pGLGNBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxDQUFDO0lBQy9ELE1BQ0ksSUFBRyxVQUFVLEdBQUcsQ0FBQyxFQUFFO0FBQ3ZCLGFBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxDQUFDO0FBQzdELGNBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFBLEFBQUMsQ0FBQyxDQUFDO0lBQ3pGOztBQUVELE9BQUcsVUFBVSxFQUFFO0FBQ2QsUUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDckM7QUFDRCxPQUFHLFdBQVcsRUFBRTtBQUNmLFFBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3ZDOztBQUVELEtBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztBQUM5QixLQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUM7O0FBRWhDLFVBQU8sSUFBSSxDQUFDLFlBQVksMEJBQWUsQ0FDdEMsRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsWUFBWSxFQUMvQixTQUFTLEVBQUUsVUFBVSxDQUNyQixFQUNELEtBQUssQ0FBQyxDQUFDO0dBQ1A7Ozs7Ozs7OztTQVFVLHFCQUFDLEtBQUssRUFBRTtBQUNsQixPQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ3hCLE9BQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQUUsV0FBTztJQUFFOztBQUUvQixPQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDOztBQUUxRixPQUFJLENBQUMsZ0JBQWdCLENBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQ2hCLFdBQVcsaUNBQXNCLENBQUM7O0FBRXBDLEtBQUUsQ0FBQyxXQUFXLENBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FDcEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FDcEIsV0FBVyxrQ0FBdUIsQ0FBQzs7QUFFckMsT0FBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDeEIsT0FBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7O0FBRXhCLE9BQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOztBQUV0QixVQUFPLElBQUksQ0FBQyxZQUFZLCtCQUFvQixDQUMzQyxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxZQUFZLEVBQy9CLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUNyQyxFQUNELEtBQUssQ0FBQyxDQUFDO0dBQ1A7Ozs7Ozs7Ozs7U0FTTSxtQkFBRztBQUNULE9BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDekIsT0FBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLDBCQUFhLENBQUMsQ0FBQzs7QUFFNUQsT0FBSSxDQUFDLFlBQVksQ0FDaEIsSUFBSSxDQUFDLE9BQU8sQ0FDVixHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUN4QixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUNoQixHQUFHLENBQUMsUUFBUSxDQUFDLENBQ2YsQ0FBQzs7QUFFRixXQUFRLENBQUMsVUFBVSxvQkFBUyxDQUFDO0FBQzdCLFNBQU0sQ0FBQyxVQUFVLHFCQUFVLENBQUM7O0FBRTVCLE9BQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMvQixPQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLE9BQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLE9BQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDOztBQUVuQixVQUFPLE1BQU0sQ0FBQztHQUNkOzs7Ozs7Ozs7Ozs7O1NBWVMsb0JBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUU7QUFDekQsT0FBRyxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDOUIsVUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQzFCLE1BQ0k7QUFDSixVQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDOUM7O0FBRUQsT0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN4QixXQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNqRCxNQUNJO0FBQ0osV0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztJQUN2QztHQUNEOzs7Ozs7Ozs7OztTQVVXLHNCQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDN0IsT0FBRyxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDOUIsVUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQzFCLE1BQ0ksSUFBRyxNQUFNLElBQUksSUFBSSxFQUFFO0FBQ3ZCLFVBQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUM5QyxNQUNJO0FBQ0osVUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDakI7O0FBRUQsVUFBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUNwQjs7Ozs7Ozs7Ozs7Ozs7O1NBY1csc0JBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUU7QUFDdkMsT0FBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixPQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUU7QUFDdkIsU0FBSyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUNsRDs7QUFFRCxVQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztHQUM3RDs7Ozs7Ozs7Ozs7U0FVZSwwQkFBQyxHQUFHLEVBQUU7QUFDckIsVUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksNEJBQWlCLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLDJCQUFnQixDQUFDO0dBQzFFOzs7Ozs7Ozs7OztTQVVTLG9CQUFDLE9BQU8sRUFBRTtBQUNuQixVQUFPLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUN0RTs7Ozs7Ozs7Ozs7U0FVTyxrQkFBQyxPQUFPLEVBQUUsS0FBSyxFQUFFO0FBQ3hCLFFBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLFFBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDOUIsVUFBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQztHQUNsQzs7Ozs7Ozs7Ozs7O1NBV2Esd0JBQUMsS0FBSyxFQUFFO0FBQ3JCLE9BQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksU0FBUyxFQUFFO0FBQ3ZDLFNBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9DOztBQUVELE9BQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksU0FBUyxFQUFFO0FBQ3ZDLFNBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9DOztBQUVELFVBQU8sS0FBSyxDQUFDO0dBQ2I7Ozs7Ozs7Ozs7Ozs7U0FZVSxxQkFBQyxLQUFLLEVBQUU7QUFDbEIsT0FBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDdEMsV0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUUsS0FBSyxDQUFDO0lBQ3ZGO0FBQ0QsVUFBTyxLQUFLLENBQUMsS0FBSyxDQUFDO0dBQ25COzs7UUF4ZG1CLGdCQUFnQjs7O3FCQUFoQixnQkFBZ0I7O0FBMmRyQyxnQkFBZ0IsQ0FBQyxRQUFRLEdBQUc7QUFDM0IsU0FBUSxFQUFFLGtCQUFTLE1BQU0sRUFBRTtBQUMxQixNQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQy9CLGlDQUFtQjtHQUNuQjs7QUFFRCxnQ0FBbUI7RUFDbkI7QUFDRCxNQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7QUFDbkIsYUFBWSxFQUFFLElBQUk7QUFDbEIsZUFBYyxFQUFFLElBQUk7QUFDcEIsU0FBUSxFQUFFLElBQUk7QUFDZCxTQUFRLEVBQUUsSUFBSTtDQUNkLENBQUM7O0FBRUYsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQzs7Ozs7Ozs7O0FDcGdCcEIsSUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUM7O0FBQ3BDLElBQU0sZUFBZSxHQUFHLHNCQUFzQixDQUFDOztBQUMvQyxJQUFNLGNBQWMsR0FBRyxxQkFBcUIsQ0FBQzs7QUFDN0MsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDOzs7QUFFckIsSUFBTSxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQzs7QUFDakQsSUFBTSxxQkFBcUIsR0FBRyxvQkFBb0IsQ0FBQzs7QUFDbkQsSUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDOztBQUNqQyxJQUFNLHNCQUFzQixHQUFHLHFCQUFxQixDQUFDOzs7QUFFckQsSUFBTSxrQkFBa0IsR0FBRyxxQkFBcUIsQ0FBQzs7QUFDakQsSUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDOztBQUNyQyxJQUFNLGlCQUFpQixHQUFHLG9CQUFvQixDQUFDOzs7QUFFL0MsSUFBTSxXQUFXLEdBQUcsdUJBQXVCLENBQUM7O0FBQzVDLElBQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDOztBQUM1QyxJQUFNLG9CQUFvQixvQkFBb0IsQ0FBQzs7Ozs7Ozs7Ozs7O3FCQ2hCekIsU0FBUzs7Ozt1QkFDbEIsV0FBVyIsImZpbGUiOiJqcXVlcnkucmVzaXphYmxlQ29sdW1ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFJlc2l6YWJsZUNvbHVtbnMgZnJvbSAnLi9jbGFzcyc7XG5pbXBvcnQge0RBVEFfQVBJfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbiQuZm4ucmVzaXphYmxlQ29sdW1ucyA9IGZ1bmN0aW9uKG9wdGlvbnNPck1ldGhvZCwgLi4uYXJncykge1xuXHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdGxldCAkdGFibGUgPSAkKHRoaXMpO1xuXG5cdFx0bGV0IGFwaSA9ICR0YWJsZS5kYXRhKERBVEFfQVBJKTtcblx0XHRpZiAoIWFwaSkge1xuXHRcdFx0YXBpID0gbmV3IFJlc2l6YWJsZUNvbHVtbnMoJHRhYmxlLCBvcHRpb25zT3JNZXRob2QpO1xuXHRcdFx0JHRhYmxlLmRhdGEoREFUQV9BUEksIGFwaSk7XG5cdFx0fVxuXG5cdFx0ZWxzZSBpZiAodHlwZW9mIG9wdGlvbnNPck1ldGhvZCA9PT0gJ3N0cmluZycpIHtcblx0XHRcdHJldHVybiBhcGlbb3B0aW9uc09yTWV0aG9kXSguLi5hcmdzKTtcblx0XHR9XG5cdH0pO1xufTtcblxuJC5yZXNpemFibGVDb2x1bW5zID0gUmVzaXphYmxlQ29sdW1ucztcbiIsImltcG9ydCB7XG5cdERBVEFfQVBJLFxuXHREQVRBX0NPTFVNTlNfSUQsXG5cdERBVEFfQ09MVU1OX0lELFxuXHREQVRBX1RILFxuXHRDTEFTU19UQUJMRV9SRVNJWklORyxcblx0Q0xBU1NfQ09MVU1OX1JFU0laSU5HLFxuXHRDTEFTU19IQU5ETEUsXG5cdENMQVNTX0hBTkRMRV9DT05UQUlORVIsXG5cdEVWRU5UX1JFU0laRV9TVEFSVCxcblx0RVZFTlRfUkVTSVpFLFxuXHRFVkVOVF9SRVNJWkVfU1RPUCxcblx0U0VMRUNUT1JfVEgsXG5cdFNFTEVDVE9SX1RELFxuXHRTRUxFQ1RPUl9VTlJFU0laQUJMRVxufVxuZnJvbSAnLi9jb25zdGFudHMnO1xuXG4vKipcblRha2VzIGEgPHRhYmxlIC8+IGVsZW1lbnQgYW5kIG1ha2VzIGl0J3MgY29sdW1ucyByZXNpemFibGUgYWNyb3NzIGJvdGhcbm1vYmlsZSBhbmQgZGVza3RvcCBjbGllbnRzLlxuXG5AY2xhc3MgUmVzaXphYmxlQ29sdW1uc1xuQHBhcmFtICR0YWJsZSB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCA8dGFibGU+IGVsZW1lbnQgdG8gbWFrZSByZXNpemFibGVcbkBwYXJhbSBvcHRpb25zIHtPYmplY3R9IENvbmZpZ3VyYXRpb24gb2JqZWN0XG4qKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2l6YWJsZUNvbHVtbnMge1xuXHRjb25zdHJ1Y3RvcigkdGFibGUsIG9wdGlvbnMpIHtcblx0XHR0aGlzLm5zID0gJy5yYycgKyB0aGlzLmNvdW50Kys7XG5cblx0XHR0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgUmVzaXphYmxlQ29sdW1ucy5kZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLiR3aW5kb3cgPSAkKHdpbmRvdyk7XG5cdFx0dGhpcy4kb3duZXJEb2N1bWVudCA9ICQoJHRhYmxlWzBdLm93bmVyRG9jdW1lbnQpO1xuXHRcdHRoaXMuJHRhYmxlID0gJHRhYmxlO1xuXG5cdFx0dGhpcy5yZWZyZXNoSGVhZGVycygpO1xuXHRcdHRoaXMucmVzdG9yZUNvbHVtbldpZHRocygpO1xuXHRcdHRoaXMuc3luY0hhbmRsZVdpZHRocygpO1xuXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuc3luY0hhbmRsZVdpZHRocy5iaW5kKHRoaXMpKTtcblxuXHRcdGlmICh0aGlzLm9wdGlvbnMuc3RhcnQpIHtcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUQVJULCB0aGlzLm9wdGlvbnMuc3RhcnQpO1xuXHRcdH1cblx0XHRpZiAodGhpcy5vcHRpb25zLnJlc2l6ZSkge1xuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkUsIHRoaXMub3B0aW9ucy5yZXNpemUpO1xuXHRcdH1cblx0XHRpZiAodGhpcy5vcHRpb25zLnN0b3ApIHtcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUT1AsIHRoaXMub3B0aW9ucy5zdG9wKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0UmVmcmVzaGVzIHRoZSBoZWFkZXJzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGluc3RhbmNlcyA8dGFibGUvPiBlbGVtZW50IGFuZFxuXHRnZW5lcmF0ZXMgaGFuZGxlcyBmb3IgdGhlbS4gQWxzbyBhc3NpZ25zIHBlcmNlbnRhZ2Ugd2lkdGhzLlxuXG5cdEBtZXRob2QgcmVmcmVzaEhlYWRlcnNcblx0KiovXG5cdHJlZnJlc2hIZWFkZXJzKCkge1xuXHRcdC8vIEFsbG93IHRoZSBzZWxlY3RvciB0byBiZSBib3RoIGEgcmVndWxhciBzZWxjdG9yIHN0cmluZyBhcyB3ZWxsIGFzXG5cdFx0Ly8gYSBkeW5hbWljIGNhbGxiYWNrXG5cdFx0bGV0IHNlbGVjdG9yID0gdGhpcy5vcHRpb25zLnNlbGVjdG9yO1xuXHRcdGlmKHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5jYWxsKHRoaXMsIHRoaXMuJHRhYmxlKTtcblx0XHR9XG5cblx0XHQvLyBTZWxlY3QgYWxsIHRhYmxlIGhlYWRlcnNcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMgPSB0aGlzLiR0YWJsZS5maW5kKHNlbGVjdG9yKTtcblxuXHRcdC8vIEFzc2lnbiBwZXJjZW50YWdlIHdpZHRocyBmaXJzdCwgdGhlbiBjcmVhdGUgZHJhZyBoYW5kbGVzXG5cdFx0dGhpcy5hc3NpZ25QZXJjZW50YWdlV2lkdGhzKCk7XG5cdFx0dGhpcy5jcmVhdGVIYW5kbGVzKCk7XG5cdH1cblxuXHQvKipcblx0Q3JlYXRlcyBkdW1teSBoYW5kbGUgZWxlbWVudHMgZm9yIGFsbCB0YWJsZSBoZWFkZXIgY29sdW1uc1xuXG5cdEBtZXRob2QgY3JlYXRlSGFuZGxlc1xuXHQqKi9cblx0Y3JlYXRlSGFuZGxlcygpIHtcblx0XHRsZXQgcmVmID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyO1xuXHRcdGlmIChyZWYgIT0gbnVsbCkge1xuXHRcdFx0cmVmLnJlbW92ZSgpO1xuXHRcdH1cblxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lciA9ICQoYDxkaXYgY2xhc3M9JyR7Q0xBU1NfSEFORExFX0NPTlRBSU5FUn0nIC8+YClcblx0XHR0aGlzLiR0YWJsZS5iZWZvcmUodGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcblxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChpLCBlbCkgPT4ge1xuXHRcdFx0bGV0ICRjdXJyZW50ID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGkpO1xuXHRcdFx0bGV0ICRuZXh0ID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGkgKyAxKTtcblxuXHRcdFx0aWYgKCRuZXh0Lmxlbmd0aCA9PT0gMCB8fCAkY3VycmVudC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkgfHwgJG5leHQuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0ICRoYW5kbGUgPSAkKGA8ZGl2IGNsYXNzPScke0NMQVNTX0hBTkRMRX0nIC8+YClcblx0XHRcdFx0LmRhdGEoREFUQV9USCwgJChlbCkpXG5cdFx0XHRcdC5hcHBlbmRUbyh0aGlzLiRoYW5kbGVDb250YWluZXIpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJGhhbmRsZUNvbnRhaW5lciwgWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCAnLicrQ0xBU1NfSEFORExFLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSk7XG5cdH1cblxuXHQvKipcblx0QXNzaWducyBhIHBlcmNlbnRhZ2Ugd2lkdGggdG8gYWxsIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY3VycmVudCBwaXhlbCB3aWR0aChzKVxuXG5cdEBtZXRob2QgYXNzaWduUGVyY2VudGFnZVdpZHRoc1xuXHQqKi9cblx0YXNzaWduUGVyY2VudGFnZVdpZHRocygpIHtcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcblx0XHRcdHRoaXMuc2V0V2lkdGgoJGVsWzBdLCAkZWwub3V0ZXJXaWR0aCgpIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblxuXG5cdEBtZXRob2Qgc3luY0hhbmRsZVdpZHRoc1xuXHQqKi9cblx0c3luY0hhbmRsZVdpZHRocygpIHtcblx0XHRsZXQgJGNvbnRhaW5lciA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lclxuXG5cdFx0JGNvbnRhaW5lci53aWR0aCh0aGlzLiR0YWJsZS53aWR0aCgpKTtcblxuXHRcdCRjb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKS5lYWNoKChfLCBlbCkgPT4ge1xuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xuXG5cdFx0XHRsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJlc2l6ZUZyb21Cb2R5ID9cblx0XHRcdFx0dGhpcy4kdGFibGUuaGVpZ2h0KCkgOlxuXHRcdFx0XHR0aGlzLiR0YWJsZS5maW5kKCd0aGVhZCcpLmhlaWdodCgpO1xuXG5cdFx0XHRsZXQgbGVmdCA9ICRlbC5kYXRhKERBVEFfVEgpLm91dGVyV2lkdGgoKSArIChcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9USCkub2Zmc2V0KCkubGVmdCAtIHRoaXMuJGhhbmRsZUNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XG5cdFx0XHQpO1xuXG5cdFx0XHQkZWwuY3NzKHsgbGVmdCwgaGVpZ2h0IH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdFBlcnNpc3RzIHRoZSBjb2x1bW4gd2lkdGhzIGluIGxvY2FsU3RvcmFnZVxuXG5cdEBtZXRob2Qgc2F2ZUNvbHVtbldpZHRoc1xuXHQqKi9cblx0c2F2ZUNvbHVtbldpZHRocygpIHtcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcblxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9yZSAmJiAhJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xuXHRcdFx0XHR0aGlzLm9wdGlvbnMuc3RvcmUuc2V0KFxuXHRcdFx0XHRcdHRoaXMuZ2VuZXJhdGVDb2x1bW5JZCgkZWwpLFxuXHRcdFx0XHRcdHRoaXMucGFyc2VXaWR0aChlbClcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHRSZXRyaWV2ZXMgYW5kIHNldHMgdGhlIGNvbHVtbiB3aWR0aHMgZnJvbSBsb2NhbFN0b3JhZ2VcblxuXHRAbWV0aG9kIHJlc3RvcmVDb2x1bW5XaWR0aHNcblx0KiovXG5cdHJlc3RvcmVDb2x1bW5XaWR0aHMoKSB7XG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XG5cblx0XHRcdGlmKHRoaXMub3B0aW9ucy5zdG9yZSAmJiAhJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xuXHRcdFx0XHRsZXQgd2lkdGggPSB0aGlzLm9wdGlvbnMuc3RvcmUuZ2V0KFxuXHRcdFx0XHRcdHRoaXMuZ2VuZXJhdGVDb2x1bW5JZCgkZWwpXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0aWYod2lkdGggIT0gbnVsbCkge1xuXHRcdFx0XHRcdHRoaXMuc2V0V2lkdGgoZWwsIHdpZHRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdFBvaW50ZXIvbW91c2UgZG93biBoYW5kbGVyXG5cblx0QG1ldGhvZCBvblBvaW50ZXJEb3duXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxuXHQqKi9cblx0b25Qb2ludGVyRG93bihldmVudCkge1xuXHRcdC8vIE9ubHkgYXBwbGllcyB0byBsZWZ0LWNsaWNrIGRyYWdnaW5nXG5cdFx0aWYoZXZlbnQud2hpY2ggIT09IDEpIHsgcmV0dXJuOyB9XG5cblx0XHQvLyBJZiBhIHByZXZpb3VzIG9wZXJhdGlvbiBpcyBkZWZpbmVkLCB3ZSBtaXNzZWQgdGhlIGxhc3QgbW91c2V1cC5cblx0XHQvLyBQcm9iYWJseSBnb2JibGVkIHVwIGJ5IHVzZXIgbW91c2luZyBvdXQgdGhlIHdpbmRvdyB0aGVuIHJlbGVhc2luZy5cblx0XHQvLyBXZSdsbCBzaW11bGF0ZSBhIHBvaW50ZXJ1cCBoZXJlIHByaW9yIHRvIGl0XG5cdFx0aWYodGhpcy5vcGVyYXRpb24pIHtcblx0XHRcdHRoaXMub25Qb2ludGVyVXAoZXZlbnQpO1xuXHRcdH1cblxuXHRcdC8vIElnbm9yZSBub24tcmVzaXphYmxlIGNvbHVtbnNcblx0XHRsZXQgJGN1cnJlbnRHcmlwID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcblx0XHRpZigkY3VycmVudEdyaXAuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IGdyaXBJbmRleCA9ICRjdXJyZW50R3JpcC5pbmRleCgpO1xuXHRcdGxldCAkbGVmdENvbHVtbiA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShncmlwSW5kZXgpLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSk7XG5cdFx0bGV0ICRyaWdodENvbHVtbiA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShncmlwSW5kZXggKyAxKS5ub3QoU0VMRUNUT1JfVU5SRVNJWkFCTEUpO1xuXG5cdFx0bGV0IGxlZnRXaWR0aCA9IHRoaXMucGFyc2VXaWR0aCgkbGVmdENvbHVtblswXSk7XG5cdFx0bGV0IHJpZ2h0V2lkdGggPSB0aGlzLnBhcnNlV2lkdGgoJHJpZ2h0Q29sdW1uWzBdKTtcblxuXHRcdHRoaXMub3BlcmF0aW9uID0ge1xuXHRcdFx0JGxlZnRDb2x1bW4sICRyaWdodENvbHVtbiwgJGN1cnJlbnRHcmlwLFxuXG5cdFx0XHRzdGFydFg6IHRoaXMuZ2V0UG9pbnRlclgoZXZlbnQpLFxuXG5cdFx0XHR3aWR0aHM6IHtcblx0XHRcdFx0bGVmdDogbGVmdFdpZHRoLFxuXHRcdFx0XHRyaWdodDogcmlnaHRXaWR0aFxuXHRcdFx0fSxcblx0XHRcdG5ld1dpZHRoczoge1xuXHRcdFx0XHRsZWZ0OiBsZWZ0V2lkdGgsXG5cdFx0XHRcdHJpZ2h0OiByaWdodFdpZHRoXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnXSwgdGhpcy5vblBvaW50ZXJNb3ZlLmJpbmQodGhpcykpO1xuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNldXAnLCAndG91Y2hlbmQnXSwgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpKTtcblxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lclxuXHRcdFx0LmFkZCh0aGlzLiR0YWJsZSlcblx0XHRcdC5hZGRDbGFzcyhDTEFTU19UQUJMRV9SRVNJWklORyk7XG5cblx0XHQkbGVmdENvbHVtblxuXHRcdFx0LmFkZCgkcmlnaHRDb2x1bW4pXG5cdFx0XHQuYWRkKCRjdXJyZW50R3JpcClcblx0XHRcdC5hZGRDbGFzcyhDTEFTU19DT0xVTU5fUkVTSVpJTkcpO1xuXG5cdFx0dGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFX1NUQVJULCBbXG5cdFx0XHQkbGVmdENvbHVtbiwgJHJpZ2h0Q29sdW1uLFxuXHRcdFx0bGVmdFdpZHRoLCByaWdodFdpZHRoXG5cdFx0XSxcblx0XHRldmVudCk7XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9XG5cblx0LyoqXG5cdFBvaW50ZXIvbW91c2UgbW92ZW1lbnQgaGFuZGxlclxuXG5cdEBtZXRob2Qgb25Qb2ludGVyTW92ZVxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cblx0KiovXG5cdG9uUG9pbnRlck1vdmUoZXZlbnQpIHtcblx0XHRsZXQgb3AgPSB0aGlzLm9wZXJhdGlvbjtcblx0XHRpZighdGhpcy5vcGVyYXRpb24pIHsgcmV0dXJuOyB9XG5cblx0XHQvLyBEZXRlcm1pbmUgdGhlIGRlbHRhIGNoYW5nZSBiZXR3ZWVuIHN0YXJ0IGFuZCBuZXcgbW91c2UgcG9zaXRpb24sIGFzIGEgcGVyY2VudGFnZSBvZiB0aGUgdGFibGUgd2lkdGhcblx0XHRsZXQgZGlmZmVyZW5jZSA9ICh0aGlzLmdldFBvaW50ZXJYKGV2ZW50KSAtIG9wLnN0YXJ0WCkgLyB0aGlzLiR0YWJsZS53aWR0aCgpICogMTAwO1xuXHRcdGlmKGRpZmZlcmVuY2UgPT09IDApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgbGVmdENvbHVtbiA9IG9wLiRsZWZ0Q29sdW1uWzBdO1xuXHRcdGxldCByaWdodENvbHVtbiA9IG9wLiRyaWdodENvbHVtblswXTtcblx0XHRsZXQgd2lkdGhMZWZ0LCB3aWR0aFJpZ2h0O1xuXG5cdFx0aWYoZGlmZmVyZW5jZSA+IDApIHtcblx0XHRcdHdpZHRoTGVmdCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3Aud2lkdGhzLmxlZnQgKyAob3Aud2lkdGhzLnJpZ2h0IC0gb3AubmV3V2lkdGhzLnJpZ2h0KSk7XG5cdFx0XHR3aWR0aFJpZ2h0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC53aWR0aHMucmlnaHQgLSBkaWZmZXJlbmNlKTtcblx0XHR9XG5cdFx0ZWxzZSBpZihkaWZmZXJlbmNlIDwgMCkge1xuXHRcdFx0d2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC53aWR0aHMubGVmdCArIGRpZmZlcmVuY2UpO1xuXHRcdFx0d2lkdGhSaWdodCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3Aud2lkdGhzLnJpZ2h0ICsgKG9wLndpZHRocy5sZWZ0IC0gb3AubmV3V2lkdGhzLmxlZnQpKTtcblx0XHR9XG5cblx0XHRpZihsZWZ0Q29sdW1uKSB7XG5cdFx0XHR0aGlzLnNldFdpZHRoKGxlZnRDb2x1bW4sIHdpZHRoTGVmdCk7XG5cdFx0fVxuXHRcdGlmKHJpZ2h0Q29sdW1uKSB7XG5cdFx0XHR0aGlzLnNldFdpZHRoKHJpZ2h0Q29sdW1uLCB3aWR0aFJpZ2h0KTtcblx0XHR9XG5cblx0XHRvcC5uZXdXaWR0aHMubGVmdCA9IHdpZHRoTGVmdDtcblx0XHRvcC5uZXdXaWR0aHMucmlnaHQgPSB3aWR0aFJpZ2h0O1xuXG5cdFx0cmV0dXJuIHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRSwgW1xuXHRcdFx0b3AuJGxlZnRDb2x1bW4sIG9wLiRyaWdodENvbHVtbixcblx0XHRcdHdpZHRoTGVmdCwgd2lkdGhSaWdodFxuXHRcdF0sXG5cdFx0ZXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdFBvaW50ZXIvbW91c2UgcmVsZWFzZSBoYW5kbGVyXG5cblx0QG1ldGhvZCBvblBvaW50ZXJVcFxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cblx0KiovXG5cdG9uUG9pbnRlclVwKGV2ZW50KSB7XG5cdFx0bGV0IG9wID0gdGhpcy5vcGVyYXRpb247XG5cdFx0aWYoIXRoaXMub3BlcmF0aW9uKSB7IHJldHVybjsgfVxuXG5cdFx0dGhpcy51bmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZXVwJywgJ3RvdWNoZW5kJywgJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnXSk7XG5cblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXJcblx0XHRcdC5hZGQodGhpcy4kdGFibGUpXG5cdFx0XHQucmVtb3ZlQ2xhc3MoQ0xBU1NfVEFCTEVfUkVTSVpJTkcpO1xuXG5cdFx0b3AuJGxlZnRDb2x1bW5cblx0XHRcdC5hZGQob3AuJHJpZ2h0Q29sdW1uKVxuXHRcdFx0LmFkZChvcC4kY3VycmVudEdyaXApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoQ0xBU1NfQ09MVU1OX1JFU0laSU5HKTtcblxuXHRcdHRoaXMuc3luY0hhbmRsZVdpZHRocygpO1xuXHRcdHRoaXMuc2F2ZUNvbHVtbldpZHRocygpO1xuXG5cdFx0dGhpcy5vcGVyYXRpb24gPSBudWxsO1xuXG5cdFx0cmV0dXJuIHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRV9TVE9QLCBbXG5cdFx0XHRvcC4kbGVmdENvbHVtbiwgb3AuJHJpZ2h0Q29sdW1uLFxuXHRcdFx0b3AubmV3V2lkdGhzLmxlZnQsIG9wLm5ld1dpZHRocy5yaWdodFxuXHRcdF0sXG5cdFx0ZXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdFJlbW92ZXMgYWxsIGV2ZW50IGxpc3RlbmVycywgZGF0YSwgYW5kIGFkZGVkIERPTSBlbGVtZW50cy4gVGFrZXNcblx0dGhlIDx0YWJsZS8+IGVsZW1lbnQgYmFjayB0byBob3cgaXQgd2FzLCBhbmQgcmV0dXJucyBpdFxuXG5cdEBtZXRob2QgZGVzdHJveVxuXHRAcmV0dXJuIHtqUXVlcnl9IE9yaWdpbmFsIGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudFxuXHQqKi9cblx0ZGVzdHJveSgpIHtcblx0XHRsZXQgJHRhYmxlID0gdGhpcy4kdGFibGU7XG5cdFx0bGV0ICRoYW5kbGVzID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyLmZpbmQoJy4nK0NMQVNTX0hBTkRMRSk7XG5cblx0XHR0aGlzLnVuYmluZEV2ZW50cyhcblx0XHRcdHRoaXMuJHdpbmRvd1xuXHRcdFx0XHQuYWRkKHRoaXMuJG93bmVyRG9jdW1lbnQpXG5cdFx0XHRcdC5hZGQodGhpcy4kdGFibGUpXG5cdFx0XHRcdC5hZGQoJGhhbmRsZXMpXG5cdFx0KTtcblxuXHRcdCRoYW5kbGVzLnJlbW92ZURhdGEoREFUQV9USCk7XG5cdFx0JHRhYmxlLnJlbW92ZURhdGEoREFUQV9BUEkpO1xuXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyLnJlbW92ZSgpO1xuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lciA9IG51bGw7XG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzID0gbnVsbDtcblx0XHR0aGlzLiR0YWJsZSA9IG51bGw7XG5cblx0XHRyZXR1cm4gJHRhYmxlO1xuXHR9XG5cblx0LyoqXG5cdEJpbmRzIGdpdmVuIGV2ZW50cyBmb3IgdGhpcyBpbnN0YW5jZSB0byB0aGUgZ2l2ZW4gdGFyZ2V0IERPTUVsZW1lbnRcblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIGJpbmRFdmVudHNcblx0QHBhcmFtIHRhcmdldCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRvIGJpbmQgZXZlbnRzIHRvXG5cdEBwYXJhbSBldmVudHMge1N0cmluZ3xBcnJheX0gRXZlbnQgbmFtZSAob3IgYXJyYXkgb2YpIHRvIGJpbmRcblx0QHBhcmFtIHNlbGVjdG9yT3JDYWxsYmFjayB7U3RyaW5nfEZ1bmN0aW9ufSBTZWxlY3RvciBzdHJpbmcgb3IgY2FsbGJhY2tcblx0QHBhcmFtIFtjYWxsYmFja10ge0Z1bmN0aW9ufSBDYWxsYmFjayBtZXRob2Rcblx0KiovXG5cdGJpbmRFdmVudHMoJHRhcmdldCwgZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2ssIGNhbGxiYWNrKSB7XG5cdFx0aWYodHlwZW9mIGV2ZW50cyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdGV2ZW50cyA9IGV2ZW50cyArIHRoaXMubnM7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0ZXZlbnRzID0gZXZlbnRzLmpvaW4odGhpcy5ucyArICcgJykgKyB0aGlzLm5zO1xuXHRcdH1cblxuXHRcdGlmKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XG5cdFx0XHQkdGFyZ2V0Lm9uKGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrLCBjYWxsYmFjayk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0JHRhcmdldC5vbihldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjayk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdFVuYmluZHMgZXZlbnRzIHNwZWNpZmljIHRvIHRoaXMgaW5zdGFuY2UgZnJvbSB0aGUgZ2l2ZW4gdGFyZ2V0IERPTUVsZW1lbnRcblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIHVuYmluZEV2ZW50c1xuXHRAcGFyYW0gdGFyZ2V0IHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgdG8gdW5iaW5kIGV2ZW50cyBmcm9tXG5cdEBwYXJhbSBldmVudHMge1N0cmluZ3xBcnJheX0gRXZlbnQgbmFtZSAob3IgYXJyYXkgb2YpIHRvIHVuYmluZFxuXHQqKi9cblx0dW5iaW5kRXZlbnRzKCR0YXJnZXQsIGV2ZW50cykge1xuXHRcdGlmKHR5cGVvZiBldmVudHMgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRldmVudHMgPSBldmVudHMgKyB0aGlzLm5zO1xuXHRcdH1cblx0XHRlbHNlIGlmKGV2ZW50cyAhPSBudWxsKSB7XG5cdFx0XHRldmVudHMgPSBldmVudHMuam9pbih0aGlzLm5zICsgJyAnKSArIHRoaXMubnM7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0ZXZlbnRzID0gdGhpcy5ucztcblx0XHR9XG5cblx0XHQkdGFyZ2V0Lm9mZihldmVudHMpO1xuXHR9XG5cblx0LyoqXG5cdFRyaWdnZXJzIGFuIGV2ZW50IG9uIHRoZSA8dGFibGUvPiBlbGVtZW50IGZvciBhIGdpdmVuIHR5cGUgd2l0aCBnaXZlblxuXHRhcmd1bWVudHMsIGFsc28gc2V0dGluZyBhbmQgYWxsb3dpbmcgYWNjZXNzIHRvIHRoZSBvcmlnaW5hbEV2ZW50IGlmXG5cdGdpdmVuLiBSZXR1cm5zIHRoZSByZXN1bHQgb2YgdGhlIHRyaWdnZXJlZCBldmVudC5cblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIHRyaWdnZXJFdmVudFxuXHRAcGFyYW0gdHlwZSB7U3RyaW5nfSBFdmVudCBuYW1lXG5cdEBwYXJhbSBhcmdzIHtBcnJheX0gQXJyYXkgb2YgYXJndW1lbnRzIHRvIHBhc3MgdGhyb3VnaFxuXHRAcGFyYW0gW29yaWdpbmFsRXZlbnRdIElmIGdpdmVuLCBpcyBzZXQgb24gdGhlIGV2ZW50IG9iamVjdFxuXHRAcmV0dXJuIHtNaXhlZH0gUmVzdWx0IG9mIHRoZSBldmVudCB0cmlnZ2VyIGFjdGlvblxuXHQqKi9cblx0dHJpZ2dlckV2ZW50KHR5cGUsIGFyZ3MsIG9yaWdpbmFsRXZlbnQpIHtcblx0XHRsZXQgZXZlbnQgPSAkLkV2ZW50KHR5cGUpO1xuXHRcdGlmKGV2ZW50Lm9yaWdpbmFsRXZlbnQpIHtcblx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQgPSAkLmV4dGVuZCh7fSwgb3JpZ2luYWxFdmVudCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLnRyaWdnZXIoZXZlbnQsIFt0aGlzXS5jb25jYXQoYXJncyB8fCBbXSkpO1xuXHR9XG5cblx0LyoqXG5cdENhbGN1bGF0ZXMgYSB1bmlxdWUgY29sdW1uIElEIGZvciBhIGdpdmVuIGNvbHVtbiBET01FbGVtZW50XG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCBnZW5lcmF0ZUNvbHVtbklkXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgY29sdW1uIGVsZW1lbnRcblx0QHJldHVybiB7U3RyaW5nfSBDb2x1bW4gSURcblx0KiovXG5cdGdlbmVyYXRlQ29sdW1uSWQoJGVsKSB7XG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLmRhdGEoREFUQV9DT0xVTU5TX0lEKSArICctJyArICRlbC5kYXRhKERBVEFfQ09MVU1OX0lEKTtcblx0fVxuXG5cdC8qKlxuXHRQYXJzZXMgYSBnaXZlbiBET01FbGVtZW50J3Mgd2lkdGggaW50byBhIGZsb2F0XG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCBwYXJzZVdpZHRoXG5cdEBwYXJhbSBlbGVtZW50IHtET01FbGVtZW50fSBFbGVtZW50IHRvIGdldCB3aWR0aCBvZlxuXHRAcmV0dXJuIHtOdW1iZXJ9IEVsZW1lbnQncyB3aWR0aCBhcyBhIGZsb2F0XG5cdCoqL1xuXHRwYXJzZVdpZHRoKGVsZW1lbnQpIHtcblx0XHRyZXR1cm4gZWxlbWVudCA/IHBhcnNlRmxvYXQoZWxlbWVudC5zdHlsZS53aWR0aC5yZXBsYWNlKCclJywgJycpKSA6IDA7XG5cdH1cblxuXHQvKipcblx0U2V0cyB0aGUgcGVyY2VudGFnZSB3aWR0aCBvZiBhIGdpdmVuIERPTUVsZW1lbnRcblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIHNldFdpZHRoXG5cdEBwYXJhbSBlbGVtZW50IHtET01FbGVtZW50fSBFbGVtZW50IHRvIHNldCB3aWR0aCBvblxuXHRAcGFyYW0gd2lkdGgge051bWJlcn0gV2lkdGgsIGFzIGEgcGVyY2VudGFnZSwgdG8gc2V0XG5cdCoqL1xuXHRzZXRXaWR0aChlbGVtZW50LCB3aWR0aCkge1xuXHRcdHdpZHRoID0gd2lkdGgudG9GaXhlZCgyKTtcblx0XHR3aWR0aCA9IHdpZHRoID4gMCA/IHdpZHRoIDogMDtcblx0XHRlbGVtZW50LnN0eWxlLndpZHRoID0gd2lkdGggKyAnJSc7XG5cdH1cblxuXHQvKipcblx0Q29uc3RyYWlucyBhIGdpdmVuIHdpZHRoIHRvIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHJhbmdlcyBkZWZpbmVkIGluXG5cdHRoZSBgbWluV2lkdGhgIGFuZCBgbWF4V2lkdGhgIGNvbmZpZ3VyYXRpb24gb3B0aW9ucywgcmVzcGVjdGl2ZWx5LlxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgY29uc3RyYWluV2lkdGhcblx0QHBhcmFtIHdpZHRoIHtOdW1iZXJ9IFdpZHRoIHRvIGNvbnN0cmFpblxuXHRAcmV0dXJuIHtOdW1iZXJ9IENvbnN0cmFpbmVkIHdpZHRoXG5cdCoqL1xuXHRjb25zdHJhaW5XaWR0aCh3aWR0aCkge1xuXHRcdGlmICh0aGlzLm9wdGlvbnMubWluV2lkdGggIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR3aWR0aCA9IE1hdGgubWF4KHRoaXMub3B0aW9ucy5taW5XaWR0aCwgd2lkdGgpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLm9wdGlvbnMubWF4V2lkdGggIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR3aWR0aCA9IE1hdGgubWluKHRoaXMub3B0aW9ucy5tYXhXaWR0aCwgd2lkdGgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB3aWR0aDtcblx0fVxuXG5cdC8qKlxuXHRHaXZlbiBhIHBhcnRpY3VsYXIgRXZlbnQgb2JqZWN0LCByZXRyaWV2ZXMgdGhlIGN1cnJlbnQgcG9pbnRlciBvZmZzZXQgYWxvbmdcblx0dGhlIGhvcml6b250YWwgZGlyZWN0aW9uLiBBY2NvdW50cyBmb3IgYm90aCByZWd1bGFyIG1vdXNlIGNsaWNrcyBhcyB3ZWxsIGFzXG5cdHBvaW50ZXItbGlrZSBzeXN0ZW1zIChtb2JpbGVzLCB0YWJsZXRzIGV0Yy4pXG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCBnZXRQb2ludGVyWFxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cblx0QHJldHVybiB7TnVtYmVyfSBIb3Jpem9udGFsIHBvaW50ZXIgb2Zmc2V0XG5cdCoqL1xuXHRnZXRQb2ludGVyWChldmVudCkge1xuXHRcdGlmIChldmVudC50eXBlLmluZGV4T2YoJ3RvdWNoJykgPT09IDApIHtcblx0XHRcdHJldHVybiAoZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdIHx8IGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0pLnBhZ2VYO1xuXHRcdH1cblx0XHRyZXR1cm4gZXZlbnQucGFnZVg7XG5cdH1cbn1cblxuUmVzaXphYmxlQ29sdW1ucy5kZWZhdWx0cyA9IHtcblx0c2VsZWN0b3I6IGZ1bmN0aW9uKCR0YWJsZSkge1xuXHRcdGlmKCR0YWJsZS5maW5kKCd0aGVhZCcpLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIFNFTEVDVE9SX1RIO1xuXHRcdH1cblxuXHRcdHJldHVybiBTRUxFQ1RPUl9URDtcblx0fSxcblx0c3RvcmU6IHdpbmRvdy5zdG9yZSxcblx0c3luY0hhbmRsZXJzOiB0cnVlLFxuXHRyZXNpemVGcm9tQm9keTogdHJ1ZSxcblx0bWF4V2lkdGg6IG51bGwsXG5cdG1pbldpZHRoOiAwLjAxXG59O1xuXG5SZXNpemFibGVDb2x1bW5zLmNvdW50ID0gMDtcbiIsImV4cG9ydCBjb25zdCBEQVRBX0FQSSA9ICdyZXNpemFibGVDb2x1bW5zJztcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTlNfSUQgPSAncmVzaXphYmxlLWNvbHVtbnMtaWQnO1xuZXhwb3J0IGNvbnN0IERBVEFfQ09MVU1OX0lEID0gJ3Jlc2l6YWJsZS1jb2x1bW4taWQnO1xuZXhwb3J0IGNvbnN0IERBVEFfVEggPSAndGgnO1xuXG5leHBvcnQgY29uc3QgQ0xBU1NfVEFCTEVfUkVTSVpJTkcgPSAncmMtdGFibGUtcmVzaXppbmcnO1xuZXhwb3J0IGNvbnN0IENMQVNTX0NPTFVNTl9SRVNJWklORyA9ICdyYy1jb2x1bW4tcmVzaXppbmcnO1xuZXhwb3J0IGNvbnN0IENMQVNTX0hBTkRMRSA9ICdyYy1oYW5kbGUnO1xuZXhwb3J0IGNvbnN0IENMQVNTX0hBTkRMRV9DT05UQUlORVIgPSAncmMtaGFuZGxlLWNvbnRhaW5lcic7XG5cbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkVfU1RBUlQgPSAnY29sdW1uOnJlc2l6ZTpzdGFydCc7XG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFID0gJ2NvbHVtbjpyZXNpemUnO1xuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRV9TVE9QID0gJ2NvbHVtbjpyZXNpemU6c3RvcCc7XG5cbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9USCA9ICd0cjpmaXJzdCA+IHRoOnZpc2libGUnO1xuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1REID0gJ3RyOmZpcnN0ID4gdGQ6dmlzaWJsZSc7XG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVU5SRVNJWkFCTEUgPSBgW2RhdGEtbm9yZXNpemVdYDtcbiIsImltcG9ydCBSZXNpemFibGVDb2x1bW5zIGZyb20gJy4vY2xhc3MnO1xuaW1wb3J0IGFkYXB0ZXIgZnJvbSAnLi9hZGFwdGVyJztcblxuZXhwb3J0IGRlZmF1bHQgUmVzaXphYmxlQ29sdW1uczsiXSwicHJlRXhpc3RpbmdDb21tZW50IjoiLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW01dlpHVmZiVzlrZFd4bGN5OWljbTkzYzJWeUxYQmhZMnN2WDNCeVpXeDFaR1V1YW5NaUxDSXZhRzl0WlM5emFXeDJaWEptYVhKbEwzQnlhaTluYVhSb2RXSXZhR2x4WkdWMkwycHhkV1Z5ZVMxeVpYTnBlbUZpYkdVdFkyOXNkVzF1Y3k5emNtTXZZV1JoY0hSbGNpNXFjeUlzSWk5b2IyMWxMM05wYkhabGNtWnBjbVV2Y0hKcUwyZHBkR2gxWWk5b2FYRmtaWFl2YW5GMVpYSjVMWEpsYzJsNllXSnNaUzFqYjJ4MWJXNXpMM055WXk5amJHRnpjeTVxY3lJc0lpOW9iMjFsTDNOcGJIWmxjbVpwY21VdmNISnFMMmRwZEdoMVlpOW9hWEZrWlhZdmFuRjFaWEo1TFhKbGMybDZZV0pzWlMxamIyeDFiVzV6TDNOeVl5OWpiMjV6ZEdGdWRITXVhbk1pTENJdmFHOXRaUzl6YVd4MlpYSm1hWEpsTDNCeWFpOW5hWFJvZFdJdmFHbHhaR1YyTDJweGRXVnllUzF5WlhOcGVtRmliR1V0WTI5c2RXMXVjeTl6Y21NdmFXNWtaWGd1YW5NaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRTdPenM3TzNGQ1EwRTJRaXhUUVVGVE96czdPM2xDUVVObUxHRkJRV0U3TzBGQlJYQkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zWjBKQlFXZENMRWRCUVVjc1ZVRkJVeXhsUVVGbExFVkJRVmM3YlVOQlFVNHNTVUZCU1R0QlFVRktMRTFCUVVrN096dEJRVU40UkN4UlFVRlBMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zV1VGQlZ6dEJRVU16UWl4TlFVRkpMRTFCUVUwc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdPMEZCUlhKQ0xFMUJRVWtzUjBGQlJ5eEhRVUZITEUxQlFVMHNRMEZCUXl4SlFVRkpMSEZDUVVGVkxFTkJRVU03UVVGRGFFTXNUVUZCU1N4RFFVRkRMRWRCUVVjc1JVRkJSVHRCUVVOVUxFMUJRVWNzUjBGQlJ5eDFRa0ZCY1VJc1RVRkJUU3hGUVVGRkxHVkJRV1VzUTBGQlF5eERRVUZETzBGQlEzQkVMRk5CUVUwc1EwRkJReXhKUVVGSkxITkNRVUZYTEVkQlFVY3NRMEZCUXl4RFFVRkRPMGRCUXpOQ0xFMUJSVWtzU1VGQlNTeFBRVUZQTEdWQlFXVXNTMEZCU3l4UlFVRlJMRVZCUVVVN096dEJRVU0zUXl4VlFVRlBMRkZCUVVFc1IwRkJSeXhGUVVGRExHVkJRV1VzVDBGQlF5eFBRVUZKTEVsQlFVa3NRMEZCUXl4RFFVRkRPMGRCUTNKRE8wVkJRMFFzUTBGQlF5eERRVUZETzBOQlEwZ3NRMEZCUXpzN1FVRkZSaXhEUVVGRExFTkJRVU1zWjBKQlFXZENMSEZDUVVGdFFpeERRVUZET3pzN096czdPenM3T3pzN08zbENRMGhxUXl4aFFVRmhPenM3T3pzN096czdPenRKUVZWSExHZENRVUZuUWp0QlFVTjZRaXhWUVVSVExHZENRVUZuUWl4RFFVTjRRaXhOUVVGTkxFVkJRVVVzVDBGQlR5eEZRVUZGTzNkQ1FVUlVMR2RDUVVGblFqczdRVUZGYmtNc1RVRkJTU3hEUVVGRExFVkJRVVVzUjBGQlJ5eExRVUZMTEVkQlFVY3NTVUZCU1N4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRE96dEJRVVV2UWl4TlFVRkpMRU5CUVVNc1QwRkJUeXhIUVVGSExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNSVUZCUlN4RlFVRkZMR2RDUVVGblFpeERRVUZETEZGQlFWRXNSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJRenM3UVVGRmFFVXNUVUZCU1N4RFFVRkRMRTlCUVU4c1IwRkJSeXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdRVUZEZWtJc1RVRkJTU3hEUVVGRExHTkJRV01zUjBGQlJ5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExHRkJRV0VzUTBGQlF5eERRVUZETzBGQlEycEVMRTFCUVVrc1EwRkJReXhOUVVGTkxFZEJRVWNzVFVGQlRTeERRVUZET3p0QlFVVnlRaXhOUVVGSkxFTkJRVU1zWTBGQll5eEZRVUZGTEVOQlFVTTdRVUZEZEVJc1RVRkJTU3hEUVVGRExHMUNRVUZ0UWl4RlFVRkZMRU5CUVVNN1FVRkRNMElzVFVGQlNTeERRVUZETEdkQ1FVRm5RaXhGUVVGRkxFTkJRVU03TzBGQlJYaENMRTFCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSVUZCUlN4UlFVRlJMRVZCUVVVc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZET3p0QlFVVXhSU3hOUVVGSkxFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RlFVRkZPMEZCUTNaQ0xFOUJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc2FVTkJRWE5DTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03UjBGRGNrVTdRVUZEUkN4TlFVRkpMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVFVGQlRTeEZRVUZGTzBGQlEzaENMRTlCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNNa0pCUVdkQ0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1IwRkRhRVU3UVVGRFJDeE5RVUZKTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hGUVVGRk8wRkJRM1JDTEU5QlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzWjBOQlFYRkNMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdSMEZEYmtVN1JVRkRSRHM3T3pzN096czdZMEY2UW0xQ0xHZENRVUZuUWpzN1UwRnBRM1JDTERCQ1FVRkhPenM3UVVGSGFFSXNUMEZCU1N4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTTdRVUZEY2tNc1QwRkJSeXhQUVVGUExGRkJRVkVzUzBGQlN5eFZRVUZWTEVWQlFVVTdRVUZEYkVNc1dVRkJVU3hIUVVGSExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dEpRVU0xUXpzN08wRkJSMFFzVDBGQlNTeERRVUZETEdGQlFXRXNSMEZCUnl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXpzN08wRkJSMmhFTEU5QlFVa3NRMEZCUXl4elFrRkJjMElzUlVGQlJTeERRVUZETzBGQlF6bENMRTlCUVVrc1EwRkJReXhoUVVGaExFVkJRVVVzUTBGQlF6dEhRVU55UWpzN096czdPenM3VTBGUFdTeDVRa0ZCUnpzN08wRkJRMllzVDBGQlNTeEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETzBGQlEyaERMRTlCUVVrc1IwRkJSeXhKUVVGSkxFbEJRVWtzUlVGQlJUdEJRVU5vUWl4UFFVRkhMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU03U1VGRFlqczdRVUZGUkN4UFFVRkpMRU5CUVVNc1owSkJRV2RDTEVkQlFVY3NRMEZCUXl3clJFRkJOa01zUTBGQlFUdEJRVU4wUlN4UFFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zUTBGQlF6czdRVUZGTVVNc1QwRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hGUVVGTE8wRkJRMnhETEZGQlFVa3NVVUZCVVN4SFFVRkhMRTFCUVVzc1lVRkJZU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0QlFVTjRReXhSUVVGSkxFdEJRVXNzUjBGQlJ5eE5RVUZMTEdGQlFXRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZET3p0QlFVVjZReXhSUVVGSkxFdEJRVXNzUTBGQlF5eE5RVUZOTEV0QlFVc3NRMEZCUXl4SlFVRkpMRkZCUVZFc1EwRkJReXhGUVVGRkxHbERRVUZ6UWl4SlFVRkpMRXRCUVVzc1EwRkJReXhGUVVGRkxHbERRVUZ6UWl4RlFVRkZPMEZCUXpsR0xGbEJRVTg3UzBGRFVEczdRVUZGUkN4UlFVRkpMRTlCUVU4c1IwRkJSeXhEUVVGRExIRkVRVUZ0UXl4RFFVTm9SQ3hKUVVGSkxIRkNRVUZWTEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVOd1FpeFJRVUZSTEVOQlFVTXNUVUZCU3l4blFrRkJaMElzUTBGQlF5eERRVUZETzBsQlEyeERMRU5CUVVNc1EwRkJRenM3UVVGRlNDeFBRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNSVUZCUlN4RFFVRkRMRmRCUVZjc1JVRkJSU3haUVVGWkxFTkJRVU1zUlVGQlJTeEhRVUZITERCQ1FVRmhMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRIUVVOeVNEczdPenM3T3pzN1UwRlBjVUlzYTBOQlFVYzdPenRCUVVONFFpeFBRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVczdRVUZEYkVNc1VVRkJTU3hIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPMEZCUTJoQ0xGZEJRVXNzVVVGQlVTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hIUVVGSExFTkJRVU1zVlVGQlZTeEZRVUZGTEVkQlFVY3NUMEZCU3l4TlFVRk5MRU5CUVVNc1MwRkJTeXhGUVVGRkxFZEJRVWNzUjBGQlJ5eERRVUZETEVOQlFVTTdTVUZEY0VVc1EwRkJReXhEUVVGRE8wZEJRMGc3T3pzN096czdPMU5CVDJVc05FSkJRVWM3T3p0QlFVTnNRaXhQUVVGSkxGVkJRVlVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVUU3TzBGQlJYUkRMR0ZCUVZVc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJReXhEUVVGRE96dEJRVVYwUXl4aFFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzTUVKQlFXRXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVczdRVUZEYWtRc1VVRkJTU3hIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPenRCUVVWb1FpeFJRVUZKTEUxQlFVMHNSMEZCUnl4UFFVRkxMRTlCUVU4c1EwRkJReXhqUVVGakxFZEJRM1pETEU5QlFVc3NUVUZCVFN4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVOd1FpeFBRVUZMTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTTdPMEZCUlhCRExGRkJRVWtzU1VGQlNTeEhRVUZITEVkQlFVY3NRMEZCUXl4SlFVRkpMRzlDUVVGVExFTkJRVU1zVlVGQlZTeEZRVUZGTEVsQlEzaERMRWRCUVVjc1EwRkJReXhKUVVGSkxHOUNRVUZUTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1NVRkJTU3hIUVVGSExFOUJRVXNzWjBKQlFXZENMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zU1VGQlNTeERRVUZCTEVGQlEzSkZMRU5CUVVNN08wRkJSVVlzVDBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJTaXhKUVVGSkxFVkJRVVVzVFVGQlRTeEZRVUZPTEUxQlFVMHNSVUZCUlN4RFFVRkRMRU5CUVVNN1NVRkRNVUlzUTBGQlF5eERRVUZETzBkQlEwZzdPenM3T3pzN08xTkJUMlVzTkVKQlFVYzdPenRCUVVOc1FpeFBRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVczdRVUZEYkVNc1VVRkJTU3hIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPenRCUVVWb1FpeFJRVUZKTEU5QlFVc3NUMEZCVHl4RFFVRkRMRXRCUVVzc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEdsRFFVRnpRaXhGUVVGRk8wRkJRM2hFTEZsQlFVc3NUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFTkJRM0pDTEU5QlFVc3NaMEpCUVdkQ0xFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlF6RkNMRTlCUVVzc1ZVRkJWU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVU51UWl4RFFVRkRPMHRCUTBZN1NVRkRSQ3hEUVVGRExFTkJRVU03UjBGRFNEczdPenM3T3pzN1UwRlBhMElzSzBKQlFVYzdPenRCUVVOeVFpeFBRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVczdRVUZEYkVNc1VVRkJTU3hIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPenRCUVVWb1FpeFJRVUZITEU5QlFVc3NUMEZCVHl4RFFVRkRMRXRCUVVzc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEdsRFFVRnpRaXhGUVVGRk8wRkJRM1pFTEZOQlFVa3NTMEZCU3l4SFFVRkhMRTlCUVVzc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlEycERMRTlCUVVzc1owSkJRV2RDTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUXpGQ0xFTkJRVU03TzBGQlJVWXNVMEZCUnl4TFFVRkxMRWxCUVVrc1NVRkJTU3hGUVVGRk8wRkJRMnBDTEdGQlFVc3NVVUZCVVN4RFFVRkRMRVZCUVVVc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dE5RVU42UWp0TFFVTkVPMGxCUTBRc1EwRkJReXhEUVVGRE8wZEJRMGc3T3pzN096czdPenRUUVZGWkxIVkNRVUZETEV0QlFVc3NSVUZCUlRzN1FVRkZjRUlzVDBGQlJ5eExRVUZMTEVOQlFVTXNTMEZCU3l4TFFVRkxMRU5CUVVNc1JVRkJSVHRCUVVGRkxGZEJRVTg3U1VGQlJUczdPenM3UVVGTGFrTXNUMEZCUnl4SlFVRkpMRU5CUVVNc1UwRkJVeXhGUVVGRk8wRkJRMnhDTEZGQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03U1VGRGVFSTdPenRCUVVkRUxFOUJRVWtzV1VGQldTeEhRVUZITEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU03UVVGRE1VTXNUMEZCUnl4WlFVRlpMRU5CUVVNc1JVRkJSU3hwUTBGQmMwSXNSVUZCUlR0QlFVTjZReXhYUVVGUE8wbEJRMUE3TzBGQlJVUXNUMEZCU1N4VFFVRlRMRWRCUVVjc1dVRkJXU3hEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETzBGQlEzSkRMRTlCUVVrc1YwRkJWeXhIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNSVUZCUlN4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFZEJRVWNzYVVOQlFYTkNMRU5CUVVNN1FVRkROMFVzVDBGQlNTeFpRVUZaTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhGUVVGRkxFTkJRVU1zVTBGQlV5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc2FVTkJRWE5DTEVOQlFVTTdPMEZCUld4R0xFOUJRVWtzVTBGQlV5eEhRVUZITEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdRVUZEYUVRc1QwRkJTU3hWUVVGVkxFZEJRVWNzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4WlFVRlpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6czdRVUZGYkVRc1QwRkJTU3hEUVVGRExGTkJRVk1zUjBGQlJ6dEJRVU5vUWl4bFFVRlhMRVZCUVZnc1YwRkJWeXhGUVVGRkxGbEJRVmtzUlVGQldpeFpRVUZaTEVWQlFVVXNXVUZCV1N4RlFVRmFMRmxCUVZrN08wRkJSWFpETEZWQlFVMHNSVUZCUlN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFdEJRVXNzUTBGQlF6czdRVUZGTDBJc1ZVRkJUU3hGUVVGRk8wRkJRMUFzVTBGQlNTeEZRVUZGTEZOQlFWTTdRVUZEWml4VlFVRkxMRVZCUVVVc1ZVRkJWVHRMUVVOcVFqdEJRVU5FTEdGQlFWTXNSVUZCUlR0QlFVTldMRk5CUVVrc1JVRkJSU3hUUVVGVE8wRkJRMllzVlVGQlN5eEZRVUZGTEZWQlFWVTdTMEZEYWtJN1NVRkRSQ3hEUVVGRE96dEJRVVZHTEU5QlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExHTkJRV01zUlVGQlJTeERRVUZETEZkQlFWY3NSVUZCUlN4WFFVRlhMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRMmhITEU5QlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExHTkJRV01zUlVGQlJTeERRVUZETEZOQlFWTXNSVUZCUlN4VlFVRlZMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE96dEJRVVV6Uml4UFFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlEyNUNMRWRCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlEyaENMRkZCUVZFc2FVTkJRWE5DTEVOQlFVTTdPMEZCUldwRExHTkJRVmNzUTBGRFZDeEhRVUZITEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUTJwQ0xFZEJRVWNzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZEYWtJc1VVRkJVU3hyUTBGQmRVSXNRMEZCUXpzN1FVRkZiRU1zVDBGQlNTeERRVUZETEZsQlFWa3NaME5CUVhGQ0xFTkJRM0pETEZkQlFWY3NSVUZCUlN4WlFVRlpMRVZCUTNwQ0xGTkJRVk1zUlVGQlJTeFZRVUZWTEVOQlEzSkNMRVZCUTBRc1MwRkJTeXhEUVVGRExFTkJRVU03TzBGQlJWQXNVVUZCU3l4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRE8wZEJRM1pDT3pzN096czdPenM3VTBGUldTeDFRa0ZCUXl4TFFVRkxMRVZCUVVVN1FVRkRjRUlzVDBGQlNTeEZRVUZGTEVkQlFVY3NTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJRenRCUVVONFFpeFBRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRk5CUVZNc1JVRkJSVHRCUVVGRkxGZEJRVTg3U1VGQlJUczdPMEZCUnk5Q0xFOUJRVWtzVlVGQlZTeEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkJMRWRCUVVrc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eExRVUZMTEVWQlFVVXNSMEZCUnl4SFFVRkhMRU5CUVVNN1FVRkRia1lzVDBGQlJ5eFZRVUZWTEV0QlFVc3NRMEZCUXl4RlFVRkZPMEZCUTNCQ0xGZEJRVTg3U1VGRFVEczdRVUZGUkN4UFFVRkpMRlZCUVZVc1IwRkJSeXhGUVVGRkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMEZCUTI1RExFOUJRVWtzVjBGQlZ5eEhRVUZITEVWQlFVVXNRMEZCUXl4WlFVRlpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRGNrTXNUMEZCU1N4VFFVRlRMRmxCUVVFN1QwRkJSU3hWUVVGVkxGbEJRVUVzUTBGQlF6czdRVUZGTVVJc1QwRkJSeXhWUVVGVkxFZEJRVWNzUTBGQlF5eEZRVUZGTzBGQlEyeENMR0ZCUVZNc1IwRkJSeXhKUVVGSkxFTkJRVU1zWTBGQll5eERRVUZETEVWQlFVVXNRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hKUVVGSkxFVkJRVVVzUTBGQlF5eE5RVUZOTEVOQlFVTXNTMEZCU3l4SFFVRkhMRVZCUVVVc1EwRkJReXhUUVVGVExFTkJRVU1zUzBGQlN5eERRVUZCTEVGQlFVTXNRMEZCUXl4RFFVRkRPMEZCUTNwR0xHTkJRVlVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZMEZCWXl4RFFVRkRMRVZCUVVVc1EwRkJReXhOUVVGTkxFTkJRVU1zUzBGQlN5eEhRVUZITEZWQlFWVXNRMEZCUXl4RFFVRkRPMGxCUXk5RUxFMUJRMGtzU1VGQlJ5eFZRVUZWTEVkQlFVY3NRMEZCUXl4RlFVRkZPMEZCUTNaQ0xHRkJRVk1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNZMEZCWXl4RFFVRkRMRVZCUVVVc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlNTeEhRVUZITEZWQlFWVXNRMEZCUXl4RFFVRkRPMEZCUXpkRUxHTkJRVlVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZMEZCWXl4RFFVRkRMRVZCUVVVc1EwRkJReXhOUVVGTkxFTkJRVU1zUzBGQlN5eEpRVUZKTEVWQlFVVXNRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hIUVVGSExFVkJRVVVzUTBGQlF5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkJMRUZCUVVNc1EwRkJReXhEUVVGRE8wbEJRM3BHT3p0QlFVVkVMRTlCUVVjc1ZVRkJWU3hGUVVGRk8wRkJRMlFzVVVGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4VlFVRlZMRVZCUVVVc1UwRkJVeXhEUVVGRExFTkJRVU03U1VGRGNrTTdRVUZEUkN4UFFVRkhMRmRCUVZjc1JVRkJSVHRCUVVObUxGRkJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNWMEZCVnl4RlFVRkZMRlZCUVZVc1EwRkJReXhEUVVGRE8wbEJRM1pET3p0QlFVVkVMRXRCUVVVc1EwRkJReXhUUVVGVExFTkJRVU1zU1VGQlNTeEhRVUZITEZOQlFWTXNRMEZCUXp0QlFVTTVRaXhMUVVGRkxFTkJRVU1zVTBGQlV5eERRVUZETEV0QlFVc3NSMEZCUnl4VlFVRlZMRU5CUVVNN08wRkJSV2hETEZWQlFVOHNTVUZCU1N4RFFVRkRMRmxCUVZrc01FSkJRV1VzUTBGRGRFTXNSVUZCUlN4RFFVRkRMRmRCUVZjc1JVRkJSU3hGUVVGRkxFTkJRVU1zV1VGQldTeEZRVU12UWl4VFFVRlRMRVZCUVVVc1ZVRkJWU3hEUVVOeVFpeEZRVU5FTEV0QlFVc3NRMEZCUXl4RFFVRkRPMGRCUTFBN096czdPenM3T3p0VFFWRlZMSEZDUVVGRExFdEJRVXNzUlVGQlJUdEJRVU5zUWl4UFFVRkpMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETzBGQlEzaENMRTlCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlV5eEZRVUZGTzBGQlFVVXNWMEZCVHp0SlFVRkZPenRCUVVVdlFpeFBRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRWxCUVVrc1EwRkJReXhqUVVGakxFVkJRVVVzUTBGQlF5eFRRVUZUTEVWQlFVVXNWVUZCVlN4RlFVRkZMRmRCUVZjc1JVRkJSU3hYUVVGWExFTkJRVU1zUTBGQlF5eERRVUZET3p0QlFVVXhSaXhQUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUTI1Q0xFZEJRVWNzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUTJoQ0xGZEJRVmNzYVVOQlFYTkNMRU5CUVVNN08wRkJSWEJETEV0QlFVVXNRMEZCUXl4WFFVRlhMRU5CUTFvc1IwRkJSeXhEUVVGRExFVkJRVVVzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZEY0VJc1IwRkJSeXhEUVVGRExFVkJRVVVzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZEY0VJc1YwRkJWeXhyUTBGQmRVSXNRMEZCUXpzN1FVRkZja01zVDBGQlNTeERRVUZETEdkQ1FVRm5RaXhGUVVGRkxFTkJRVU03UVVGRGVFSXNUMEZCU1N4RFFVRkRMR2RDUVVGblFpeEZRVUZGTEVOQlFVTTdPMEZCUlhoQ0xFOUJRVWtzUTBGQlF5eFRRVUZUTEVkQlFVY3NTVUZCU1N4RFFVRkRPenRCUVVWMFFpeFZRVUZQTEVsQlFVa3NRMEZCUXl4WlFVRlpMQ3RDUVVGdlFpeERRVU16UXl4RlFVRkZMRU5CUVVNc1YwRkJWeXhGUVVGRkxFVkJRVVVzUTBGQlF5eFpRVUZaTEVWQlF5OUNMRVZCUVVVc1EwRkJReXhUUVVGVExFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVXNRMEZCUXl4VFFVRlRMRU5CUVVNc1MwRkJTeXhEUVVOeVF5eEZRVU5FTEV0QlFVc3NRMEZCUXl4RFFVRkRPMGRCUTFBN096czdPenM3T3pzN1UwRlRUU3h0UWtGQlJ6dEJRVU5VTEU5QlFVa3NUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU03UVVGRGVrSXNUMEZCU1N4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExEQkNRVUZoTEVOQlFVTXNRMEZCUXpzN1FVRkZOVVFzVDBGQlNTeERRVUZETEZsQlFWa3NRMEZEYUVJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGRFZpeEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMR05CUVdNc1EwRkJReXhEUVVONFFpeEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVOb1FpeEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUTJZc1EwRkJRenM3UVVGRlJpeFhRVUZSTEVOQlFVTXNWVUZCVlN4dlFrRkJVeXhEUVVGRE8wRkJRemRDTEZOQlFVMHNRMEZCUXl4VlFVRlZMSEZDUVVGVkxFTkJRVU03TzBGQlJUVkNMRTlCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4TlFVRk5MRVZCUVVVc1EwRkJRenRCUVVNdlFpeFBRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFZEJRVWNzU1VGQlNTeERRVUZETzBGQlF6ZENMRTlCUVVrc1EwRkJReXhoUVVGaExFZEJRVWNzU1VGQlNTeERRVUZETzBGQlF6RkNMRTlCUVVrc1EwRkJReXhOUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZET3p0QlFVVnVRaXhWUVVGUExFMUJRVTBzUTBGQlF6dEhRVU5rT3pzN096czdPenM3T3pzN08xTkJXVk1zYjBKQlFVTXNUMEZCVHl4RlFVRkZMRTFCUVUwc1JVRkJSU3hyUWtGQmEwSXNSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkRla1FzVDBGQlJ5eFBRVUZQTEUxQlFVMHNTMEZCU3l4UlFVRlJMRVZCUVVVN1FVRkRPVUlzVlVGQlRTeEhRVUZITEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRE8wbEJRekZDTEUxQlEwazdRVUZEU2l4VlFVRk5MRWRCUVVjc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4SFFVRkhMRWRCUVVjc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eEZRVUZGTEVOQlFVTTdTVUZET1VNN08wRkJSVVFzVDBGQlJ5eFRRVUZUTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1JVRkJSVHRCUVVONFFpeFhRVUZQTEVOQlFVTXNSVUZCUlN4RFFVRkRMRTFCUVUwc1JVRkJSU3hyUWtGQmEwSXNSVUZCUlN4UlFVRlJMRU5CUVVNc1EwRkJRenRKUVVOcVJDeE5RVU5KTzBGQlEwb3NWMEZCVHl4RFFVRkRMRVZCUVVVc1EwRkJReXhOUVVGTkxFVkJRVVVzYTBKQlFXdENMRU5CUVVNc1EwRkJRenRKUVVOMlF6dEhRVU5FT3pzN096czdPenM3T3p0VFFWVlhMSE5DUVVGRExFOUJRVThzUlVGQlJTeE5RVUZOTEVWQlFVVTdRVUZETjBJc1QwRkJSeXhQUVVGUExFMUJRVTBzUzBGQlN5eFJRVUZSTEVWQlFVVTdRVUZET1VJc1ZVRkJUU3hIUVVGSExFMUJRVTBzUjBGQlJ5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRPMGxCUXpGQ0xFMUJRMGtzU1VGQlJ5eE5RVUZOTEVsQlFVa3NTVUZCU1N4RlFVRkZPMEZCUTNaQ0xGVkJRVTBzUjBGQlJ5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFZEJRVWNzUjBGQlJ5eERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJRenRKUVVNNVF5eE5RVU5KTzBGQlEwb3NWVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU03U1VGRGFrSTdPMEZCUlVRc1ZVRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0SFFVTndRanM3T3pzN096czdPenM3T3pzN08xTkJZMWNzYzBKQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1JVRkJSU3hoUVVGaExFVkJRVVU3UVVGRGRrTXNUMEZCU1N4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0QlFVTXhRaXhQUVVGSExFdEJRVXNzUTBGQlF5eGhRVUZoTEVWQlFVVTdRVUZEZGtJc1UwRkJTeXhEUVVGRExHRkJRV0VzUjBGQlJ5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRVZCUVVVc1JVRkJSU3hoUVVGaExFTkJRVU1zUTBGQlF6dEpRVU5zUkRzN1FVRkZSQ3hWUVVGUExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF6dEhRVU0zUkRzN096czdPenM3T3pzN1UwRlZaU3d3UWtGQlF5eEhRVUZITEVWQlFVVTdRVUZEY2tJc1ZVRkJUeXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NORUpCUVdsQ0xFZEJRVWNzUjBGQlJ5eEhRVUZITEVkQlFVY3NRMEZCUXl4SlFVRkpMREpDUVVGblFpeERRVUZETzBkQlF6RkZPenM3T3pzN096czdPenRUUVZWVExHOUNRVUZETEU5QlFVOHNSVUZCUlR0QlFVTnVRaXhWUVVGUExFOUJRVThzUjBGQlJ5eFZRVUZWTEVOQlFVTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEVkQlFVY3NSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dEhRVU4wUlRzN096czdPenM3T3pzN1UwRlZUeXhyUWtGQlF5eFBRVUZQTEVWQlFVVXNTMEZCU3l4RlFVRkZPMEZCUTNoQ0xGRkJRVXNzUjBGQlJ5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRM3BDTEZGQlFVc3NSMEZCUnl4TFFVRkxMRWRCUVVjc1EwRkJReXhIUVVGSExFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTTdRVUZET1VJc1ZVRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVkQlFVY3NTMEZCU3l4SFFVRkhMRWRCUVVjc1EwRkJRenRIUVVOc1F6czdPenM3T3pzN096czdPMU5CVjJFc2QwSkJRVU1zUzBGQlN5eEZRVUZGTzBGQlEzSkNMRTlCUVVrc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVsQlFVa3NVMEZCVXl4RlFVRkZPMEZCUTNaRExGTkJRVXNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRPMGxCUXk5RE96dEJRVVZFTEU5QlFVa3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhSUVVGUkxFbEJRVWtzVTBGQlV5eEZRVUZGTzBGQlEzWkRMRk5CUVVzc1IwRkJSeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETzBsQlF5OURPenRCUVVWRUxGVkJRVThzUzBGQlN5eERRVUZETzBkQlEySTdPenM3T3pzN096czdPenM3VTBGWlZTeHhRa0ZCUXl4TFFVRkxMRVZCUVVVN1FVRkRiRUlzVDBGQlNTeExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEVWQlFVVTdRVUZEZEVNc1YwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eGhRVUZoTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFdEJRVXNzUTBGQlF5eGhRVUZoTEVOQlFVTXNZMEZCWXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQkxFTkJRVVVzUzBGQlN5eERRVUZETzBsQlEzWkdPMEZCUTBRc1ZVRkJUeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETzBkQlEyNUNPenM3VVVGNFpHMUNMR2RDUVVGblFqczdPM0ZDUVVGb1FpeG5Ra0ZCWjBJN08wRkJNbVJ5UXl4blFrRkJaMElzUTBGQlF5eFJRVUZSTEVkQlFVYzdRVUZETTBJc1UwRkJVU3hGUVVGRkxHdENRVUZUTEUxQlFVMHNSVUZCUlR0QlFVTXhRaXhOUVVGSExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRk8wRkJReTlDTEdsRFFVRnRRanRIUVVOdVFqczdRVUZGUkN4blEwRkJiVUk3UlVGRGJrSTdRVUZEUkN4TlFVRkxMRVZCUVVVc1RVRkJUU3hEUVVGRExFdEJRVXM3UVVGRGJrSXNZVUZCV1N4RlFVRkZMRWxCUVVrN1FVRkRiRUlzWlVGQll5eEZRVUZGTEVsQlFVazdRVUZEY0VJc1UwRkJVU3hGUVVGRkxFbEJRVWs3UVVGRFpDeFRRVUZSTEVWQlFVVXNTVUZCU1R0RFFVTmtMRU5CUVVNN08wRkJSVVlzWjBKQlFXZENMRU5CUVVNc1MwRkJTeXhIUVVGSExFTkJRVU1zUTBGQlF6czdPenM3T3pzN08wRkRjR2RDY0VJc1NVRkJUU3hSUVVGUkxFZEJRVWNzYTBKQlFXdENMRU5CUVVNN08wRkJRM0JETEVsQlFVMHNaVUZCWlN4SFFVRkhMSE5DUVVGelFpeERRVUZET3p0QlFVTXZReXhKUVVGTkxHTkJRV01zUjBGQlJ5eHhRa0ZCY1VJc1EwRkJRenM3UVVGRE4wTXNTVUZCVFN4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRE96czdRVUZGY2tJc1NVRkJUU3h2UWtGQmIwSXNSMEZCUnl4dFFrRkJiVUlzUTBGQlF6czdRVUZEYWtRc1NVRkJUU3h4UWtGQmNVSXNSMEZCUnl4dlFrRkJiMElzUTBGQlF6czdRVUZEYmtRc1NVRkJUU3haUVVGWkxFZEJRVWNzVjBGQlZ5eERRVUZET3p0QlFVTnFReXhKUVVGTkxITkNRVUZ6UWl4SFFVRkhMSEZDUVVGeFFpeERRVUZET3pzN1FVRkZja1FzU1VGQlRTeHJRa0ZCYTBJc1IwRkJSeXh4UWtGQmNVSXNRMEZCUXpzN1FVRkRha1FzU1VGQlRTeFpRVUZaTEVkQlFVY3NaVUZCWlN4RFFVRkRPenRCUVVOeVF5eEpRVUZOTEdsQ1FVRnBRaXhIUVVGSExHOUNRVUZ2UWl4RFFVRkRPenM3UVVGRkwwTXNTVUZCVFN4WFFVRlhMRWRCUVVjc2RVSkJRWFZDTEVOQlFVTTdPMEZCUXpWRExFbEJRVTBzVjBGQlZ5eEhRVUZITEhWQ1FVRjFRaXhEUVVGRE96dEJRVU0xUXl4SlFVRk5MRzlDUVVGdlFpeHZRa0ZCYjBJc1EwRkJRenM3T3pzN096czdPenM3TzNGQ1EyaENla0lzVTBGQlV6czdPenQxUWtGRGJFSXNWMEZCVnlJc0ltWnBiR1VpT2lKblpXNWxjbUYwWldRdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lLR1oxYm1OMGFXOXVJR1VvZEN4dUxISXBlMloxYm1OMGFXOXVJSE1vYnl4MUtYdHBaaWdoYmx0dlhTbDdhV1lvSVhSYmIxMHBlM1poY2lCaFBYUjVjR1Z2WmlCeVpYRjFhWEpsUFQxY0ltWjFibU4wYVc5dVhDSW1KbkpsY1hWcGNtVTdhV1lvSVhVbUptRXBjbVYwZFhKdUlHRW9ieXdoTUNrN2FXWW9hU2x5WlhSMWNtNGdhU2h2TENFd0tUdDJZWElnWmoxdVpYY2dSWEp5YjNJb1hDSkRZVzV1YjNRZ1ptbHVaQ0J0YjJSMWJHVWdKMXdpSzI4clhDSW5YQ0lwTzNSb2NtOTNJR1l1WTI5a1pUMWNJazFQUkZWTVJWOU9UMVJmUms5VlRrUmNJaXhtZlhaaGNpQnNQVzViYjEwOWUyVjRjRzl5ZEhNNmUzMTlPM1JiYjExYk1GMHVZMkZzYkNoc0xtVjRjRzl5ZEhNc1puVnVZM1JwYjI0b1pTbDdkbUZ5SUc0OWRGdHZYVnN4WFZ0bFhUdHlaWFIxY200Z2N5aHVQMjQ2WlNsOUxHd3NiQzVsZUhCdmNuUnpMR1VzZEN4dUxISXBmWEpsZEhWeWJpQnVXMjlkTG1WNGNHOXlkSE45ZG1GeUlHazlkSGx3Wlc5bUlISmxjWFZwY21VOVBWd2lablZ1WTNScGIyNWNJaVltY21WeGRXbHlaVHRtYjNJb2RtRnlJRzg5TUR0dlBISXViR1Z1WjNSb08yOHJLeWx6S0hKYmIxMHBPM0psZEhWeWJpQnpmU2tpTENKcGJYQnZjblFnVW1WemFYcGhZbXhsUTI5c2RXMXVjeUJtY205dElDY3VMMk5zWVhOekp6dGNibWx0Y0c5eWRDQjdSRUZVUVY5QlVFbDlJR1p5YjIwZ0p5NHZZMjl1YzNSaGJuUnpKenRjYmx4dUpDNW1iaTV5WlhOcGVtRmliR1ZEYjJ4MWJXNXpJRDBnWm5WdVkzUnBiMjRvYjNCMGFXOXVjMDl5VFdWMGFHOWtMQ0F1TGk1aGNtZHpLU0I3WEc1Y2RISmxkSFZ5YmlCMGFHbHpMbVZoWTJnb1puVnVZM1JwYjI0b0tTQjdYRzVjZEZ4MGJHVjBJQ1IwWVdKc1pTQTlJQ1FvZEdocGN5azdYRzVjYmx4MFhIUnNaWFFnWVhCcElEMGdKSFJoWW14bExtUmhkR0VvUkVGVVFWOUJVRWtwTzF4dVhIUmNkR2xtSUNnaFlYQnBLU0I3WEc1Y2RGeDBYSFJoY0drZ1BTQnVaWGNnVW1WemFYcGhZbXhsUTI5c2RXMXVjeWdrZEdGaWJHVXNJRzl3ZEdsdmJuTlBjazFsZEdodlpDazdYRzVjZEZ4MFhIUWtkR0ZpYkdVdVpHRjBZU2hFUVZSQlgwRlFTU3dnWVhCcEtUdGNibHgwWEhSOVhHNWNibHgwWEhSbGJITmxJR2xtSUNoMGVYQmxiMllnYjNCMGFXOXVjMDl5VFdWMGFHOWtJRDA5UFNBbmMzUnlhVzVuSnlrZ2UxeHVYSFJjZEZ4MGNtVjBkWEp1SUdGd2FWdHZjSFJwYjI1elQzSk5aWFJvYjJSZEtDNHVMbUZ5WjNNcE8xeHVYSFJjZEgxY2JseDBmU2s3WEc1OU8xeHVYRzRrTG5KbGMybDZZV0pzWlVOdmJIVnRibk1nUFNCU1pYTnBlbUZpYkdWRGIyeDFiVzV6TzF4dUlpd2lhVzF3YjNKMElIdGNibHgwUkVGVVFWOUJVRWtzWEc1Y2RFUkJWRUZmUTA5TVZVMU9VMTlKUkN4Y2JseDBSRUZVUVY5RFQweFZUVTVmU1VRc1hHNWNkRVJCVkVGZlZFZ3NYRzVjZEVOTVFWTlRYMVJCUWt4RlgxSkZVMGxhU1U1SExGeHVYSFJEVEVGVFUxOURUMHhWVFU1ZlVrVlRTVnBKVGtjc1hHNWNkRU5NUVZOVFgwaEJUa1JNUlN4Y2JseDBRMHhCVTFOZlNFRk9SRXhGWDBOUFRsUkJTVTVGVWl4Y2JseDBSVlpGVGxSZlVrVlRTVnBGWDFOVVFWSlVMRnh1WEhSRlZrVk9WRjlTUlZOSldrVXNYRzVjZEVWV1JVNVVYMUpGVTBsYVJWOVRWRTlRTEZ4dVhIUlRSVXhGUTFSUFVsOVVTQ3hjYmx4MFUwVk1SVU5VVDFKZlZFUXNYRzVjZEZORlRFVkRWRTlTWDFWT1VrVlRTVnBCUWt4RlhHNTlYRzVtY205dElDY3VMMk52Ym5OMFlXNTBjeWM3WEc1Y2JpOHFLbHh1VkdGclpYTWdZU0E4ZEdGaWJHVWdMejRnWld4bGJXVnVkQ0JoYm1RZ2JXRnJaWE1nYVhRbmN5QmpiMngxYlc1eklISmxjMmw2WVdKc1pTQmhZM0p2YzNNZ1ltOTBhRnh1Ylc5aWFXeGxJR0Z1WkNCa1pYTnJkRzl3SUdOc2FXVnVkSE11WEc1Y2JrQmpiR0Z6Y3lCU1pYTnBlbUZpYkdWRGIyeDFiVzV6WEc1QWNHRnlZVzBnSkhSaFlteGxJSHRxVVhWbGNubDlJR3BSZFdWeWVTMTNjbUZ3Y0dWa0lEeDBZV0pzWlQ0Z1pXeGxiV1Z1ZENCMGJ5QnRZV3RsSUhKbGMybDZZV0pzWlZ4dVFIQmhjbUZ0SUc5d2RHbHZibk1nZTA5aWFtVmpkSDBnUTI5dVptbG5kWEpoZEdsdmJpQnZZbXBsWTNSY2Jpb3FMMXh1Wlhod2IzSjBJR1JsWm1GMWJIUWdZMnhoYzNNZ1VtVnphWHBoWW14bFEyOXNkVzF1Y3lCN1hHNWNkR052Ym5OMGNuVmpkRzl5S0NSMFlXSnNaU3dnYjNCMGFXOXVjeWtnZTF4dVhIUmNkSFJvYVhNdWJuTWdQU0FuTG5Kakp5QXJJSFJvYVhNdVkyOTFiblFyS3p0Y2JseHVYSFJjZEhSb2FYTXViM0IwYVc5dWN5QTlJQ1F1WlhoMFpXNWtLSHQ5TENCU1pYTnBlbUZpYkdWRGIyeDFiVzV6TG1SbFptRjFiSFJ6TENCdmNIUnBiMjV6S1R0Y2JseHVYSFJjZEhSb2FYTXVKSGRwYm1SdmR5QTlJQ1FvZDJsdVpHOTNLVHRjYmx4MFhIUjBhR2x6TGlSdmQyNWxja1J2WTNWdFpXNTBJRDBnSkNna2RHRmliR1ZiTUYwdWIzZHVaWEpFYjJOMWJXVnVkQ2s3WEc1Y2RGeDBkR2hwY3k0a2RHRmliR1VnUFNBa2RHRmliR1U3WEc1Y2JseDBYSFIwYUdsekxuSmxabkpsYzJoSVpXRmtaWEp6S0NrN1hHNWNkRngwZEdocGN5NXlaWE4wYjNKbFEyOXNkVzF1VjJsa2RHaHpLQ2s3WEc1Y2RGeDBkR2hwY3k1emVXNWpTR0Z1Wkd4bFYybGtkR2h6S0NrN1hHNWNibHgwWEhSMGFHbHpMbUpwYm1SRmRtVnVkSE1vZEdocGN5NGtkMmx1Wkc5M0xDQW5jbVZ6YVhwbEp5d2dkR2hwY3k1emVXNWpTR0Z1Wkd4bFYybGtkR2h6TG1KcGJtUW9kR2hwY3lrcE8xeHVYRzVjZEZ4MGFXWWdLSFJvYVhNdWIzQjBhVzl1Y3k1emRHRnlkQ2tnZTF4dVhIUmNkRngwZEdocGN5NWlhVzVrUlhabGJuUnpLSFJvYVhNdUpIUmhZbXhsTENCRlZrVk9WRjlTUlZOSldrVmZVMVJCVWxRc0lIUm9hWE11YjNCMGFXOXVjeTV6ZEdGeWRDazdYRzVjZEZ4MGZWeHVYSFJjZEdsbUlDaDBhR2x6TG05d2RHbHZibk11Y21WemFYcGxLU0I3WEc1Y2RGeDBYSFIwYUdsekxtSnBibVJGZG1WdWRITW9kR2hwY3k0a2RHRmliR1VzSUVWV1JVNVVYMUpGVTBsYVJTd2dkR2hwY3k1dmNIUnBiMjV6TG5KbGMybDZaU2s3WEc1Y2RGeDBmVnh1WEhSY2RHbG1JQ2gwYUdsekxtOXdkR2x2Ym5NdWMzUnZjQ2tnZTF4dVhIUmNkRngwZEdocGN5NWlhVzVrUlhabGJuUnpLSFJvYVhNdUpIUmhZbXhsTENCRlZrVk9WRjlTUlZOSldrVmZVMVJQVUN3Z2RHaHBjeTV2Y0hScGIyNXpMbk4wYjNBcE8xeHVYSFJjZEgxY2JseDBmVnh1WEc1Y2RDOHFLbHh1WEhSU1pXWnlaWE5vWlhNZ2RHaGxJR2hsWVdSbGNuTWdZWE56YjJOcFlYUmxaQ0IzYVhSb0lIUm9hWE1nYVc1emRHRnVZMlZ6SUR4MFlXSnNaUzgrSUdWc1pXMWxiblFnWVc1a1hHNWNkR2RsYm1WeVlYUmxjeUJvWVc1a2JHVnpJR1p2Y2lCMGFHVnRMaUJCYkhOdklHRnpjMmxuYm5NZ2NHVnlZMlZ1ZEdGblpTQjNhV1IwYUhNdVhHNWNibHgwUUcxbGRHaHZaQ0J5WldaeVpYTm9TR1ZoWkdWeWMxeHVYSFFxS2k5Y2JseDBjbVZtY21WemFFaGxZV1JsY25Nb0tTQjdYRzVjZEZ4MEx5OGdRV3hzYjNjZ2RHaGxJSE5sYkdWamRHOXlJSFJ2SUdKbElHSnZkR2dnWVNCeVpXZDFiR0Z5SUhObGJHTjBiM0lnYzNSeWFXNW5JR0Z6SUhkbGJHd2dZWE5jYmx4MFhIUXZMeUJoSUdSNWJtRnRhV01nWTJGc2JHSmhZMnRjYmx4MFhIUnNaWFFnYzJWc1pXTjBiM0lnUFNCMGFHbHpMbTl3ZEdsdmJuTXVjMlZzWldOMGIzSTdYRzVjZEZ4MGFXWW9kSGx3Wlc5bUlITmxiR1ZqZEc5eUlEMDlQU0FuWm5WdVkzUnBiMjRuS1NCN1hHNWNkRngwWEhSelpXeGxZM1J2Y2lBOUlITmxiR1ZqZEc5eUxtTmhiR3dvZEdocGN5d2dkR2hwY3k0a2RHRmliR1VwTzF4dVhIUmNkSDFjYmx4dVhIUmNkQzh2SUZObGJHVmpkQ0JoYkd3Z2RHRmliR1VnYUdWaFpHVnljMXh1WEhSY2RIUm9hWE11SkhSaFlteGxTR1ZoWkdWeWN5QTlJSFJvYVhNdUpIUmhZbXhsTG1acGJtUW9jMlZzWldOMGIzSXBPMXh1WEc1Y2RGeDBMeThnUVhOemFXZHVJSEJsY21ObGJuUmhaMlVnZDJsa2RHaHpJR1pwY25OMExDQjBhR1Z1SUdOeVpXRjBaU0JrY21GbklHaGhibVJzWlhOY2JseDBYSFIwYUdsekxtRnpjMmxuYmxCbGNtTmxiblJoWjJWWGFXUjBhSE1vS1R0Y2JseDBYSFIwYUdsekxtTnlaV0YwWlVoaGJtUnNaWE1vS1R0Y2JseDBmVnh1WEc1Y2RDOHFLbHh1WEhSRGNtVmhkR1Z6SUdSMWJXMTVJR2hoYm1Sc1pTQmxiR1Z0Wlc1MGN5Qm1iM0lnWVd4c0lIUmhZbXhsSUdobFlXUmxjaUJqYjJ4MWJXNXpYRzVjYmx4MFFHMWxkR2h2WkNCamNtVmhkR1ZJWVc1a2JHVnpYRzVjZENvcUwxeHVYSFJqY21WaGRHVklZVzVrYkdWektDa2dlMXh1WEhSY2RHeGxkQ0J5WldZZ1BTQjBhR2x6TGlSb1lXNWtiR1ZEYjI1MFlXbHVaWEk3WEc1Y2RGeDBhV1lnS0hKbFppQWhQU0J1ZFd4c0tTQjdYRzVjZEZ4MFhIUnlaV1l1Y21WdGIzWmxLQ2s3WEc1Y2RGeDBmVnh1WEc1Y2RGeDBkR2hwY3k0a2FHRnVaR3hsUTI5dWRHRnBibVZ5SUQwZ0pDaGdQR1JwZGlCamJHRnpjejBuSkh0RFRFRlRVMTlJUVU1RVRFVmZRMDlPVkVGSlRrVlNmU2NnTHo1Z0tWeHVYSFJjZEhSb2FYTXVKSFJoWW14bExtSmxabTl5WlNoMGFHbHpMaVJvWVc1a2JHVkRiMjUwWVdsdVpYSXBPMXh1WEc1Y2RGeDBkR2hwY3k0a2RHRmliR1ZJWldGa1pYSnpMbVZoWTJnb0tHa3NJR1ZzS1NBOVBpQjdYRzVjZEZ4MFhIUnNaWFFnSkdOMWNuSmxiblFnUFNCMGFHbHpMaVIwWVdKc1pVaGxZV1JsY25NdVpYRW9hU2s3WEc1Y2RGeDBYSFJzWlhRZ0pHNWxlSFFnUFNCMGFHbHpMaVIwWVdKc1pVaGxZV1JsY25NdVpYRW9hU0FySURFcE8xeHVYRzVjZEZ4MFhIUnBaaUFvSkc1bGVIUXViR1Z1WjNSb0lEMDlQU0F3SUh4OElDUmpkWEp5Wlc1MExtbHpLRk5GVEVWRFZFOVNYMVZPVWtWVFNWcEJRa3hGS1NCOGZDQWtibVY0ZEM1cGN5aFRSVXhGUTFSUFVsOVZUbEpGVTBsYVFVSk1SU2twSUh0Y2JseDBYSFJjZEZ4MGNtVjBkWEp1TzF4dVhIUmNkRngwZlZ4dVhHNWNkRngwWEhSc1pYUWdKR2hoYm1Sc1pTQTlJQ1FvWUR4a2FYWWdZMnhoYzNNOUp5UjdRMHhCVTFOZlNFRk9SRXhGZlNjZ0x6NWdLVnh1WEhSY2RGeDBYSFF1WkdGMFlTaEVRVlJCWDFSSUxDQWtLR1ZzS1NsY2JseDBYSFJjZEZ4MExtRndjR1Z1WkZSdktIUm9hWE11SkdoaGJtUnNaVU52Ym5SaGFXNWxjaWs3WEc1Y2RGeDBmU2s3WEc1Y2JseDBYSFIwYUdsekxtSnBibVJGZG1WdWRITW9kR2hwY3k0a2FHRnVaR3hsUTI5dWRHRnBibVZ5TENCYkoyMXZkWE5sWkc5M2JpY3NJQ2QwYjNWamFITjBZWEowSjEwc0lDY3VKeXREVEVGVFUxOUlRVTVFVEVVc0lIUm9hWE11YjI1UWIybHVkR1Z5Ukc5M2JpNWlhVzVrS0hSb2FYTXBLVHRjYmx4MGZWeHVYRzVjZEM4cUtseHVYSFJCYzNOcFoyNXpJR0VnY0dWeVkyVnVkR0ZuWlNCM2FXUjBhQ0IwYnlCaGJHd2dZMjlzZFcxdWN5QmlZWE5sWkNCdmJpQjBhR1ZwY2lCamRYSnlaVzUwSUhCcGVHVnNJSGRwWkhSb0tITXBYRzVjYmx4MFFHMWxkR2h2WkNCaGMzTnBaMjVRWlhKalpXNTBZV2RsVjJsa2RHaHpYRzVjZENvcUwxeHVYSFJoYzNOcFoyNVFaWEpqWlc1MFlXZGxWMmxrZEdoektDa2dlMXh1WEhSY2RIUm9hWE11SkhSaFlteGxTR1ZoWkdWeWN5NWxZV05vS0NoZkxDQmxiQ2tnUFQ0Z2UxeHVYSFJjZEZ4MGJHVjBJQ1JsYkNBOUlDUW9aV3dwTzF4dVhIUmNkRngwZEdocGN5NXpaWFJYYVdSMGFDZ2taV3hiTUYwc0lDUmxiQzV2ZFhSbGNsZHBaSFJvS0NrZ0x5QjBhR2x6TGlSMFlXSnNaUzUzYVdSMGFDZ3BJQ29nTVRBd0tUdGNibHgwWEhSOUtUdGNibHgwZlZ4dVhHNWNkQzhxS2x4dVhHNWNibHgwUUcxbGRHaHZaQ0J6ZVc1alNHRnVaR3hsVjJsa2RHaHpYRzVjZENvcUwxeHVYSFJ6ZVc1alNHRnVaR3hsVjJsa2RHaHpLQ2tnZTF4dVhIUmNkR3hsZENBa1kyOXVkR0ZwYm1WeUlEMGdkR2hwY3k0a2FHRnVaR3hsUTI5dWRHRnBibVZ5WEc1Y2JseDBYSFFrWTI5dWRHRnBibVZ5TG5kcFpIUm9LSFJvYVhNdUpIUmhZbXhsTG5kcFpIUm9LQ2twTzF4dVhHNWNkRngwSkdOdmJuUmhhVzVsY2k1bWFXNWtLQ2N1Snl0RFRFRlRVMTlJUVU1RVRFVXBMbVZoWTJnb0tGOHNJR1ZzS1NBOVBpQjdYRzVjZEZ4MFhIUnNaWFFnSkdWc0lEMGdKQ2hsYkNrN1hHNWNibHgwWEhSY2RHeGxkQ0JvWldsbmFIUWdQU0IwYUdsekxtOXdkR2x2Ym5NdWNtVnphWHBsUm5KdmJVSnZaSGtnUDF4dVhIUmNkRngwWEhSMGFHbHpMaVIwWVdKc1pTNW9aV2xuYUhRb0tTQTZYRzVjZEZ4MFhIUmNkSFJvYVhNdUpIUmhZbXhsTG1acGJtUW9KM1JvWldGa0p5a3VhR1ZwWjJoMEtDazdYRzVjYmx4MFhIUmNkR3hsZENCc1pXWjBJRDBnSkdWc0xtUmhkR0VvUkVGVVFWOVVTQ2t1YjNWMFpYSlhhV1IwYUNncElDc2dLRnh1WEhSY2RGeDBYSFFrWld3dVpHRjBZU2hFUVZSQlgxUklLUzV2Wm1aelpYUW9LUzVzWldaMElDMGdkR2hwY3k0a2FHRnVaR3hsUTI5dWRHRnBibVZ5TG05bVpuTmxkQ2dwTG14bFpuUmNibHgwWEhSY2RDazdYRzVjYmx4MFhIUmNkQ1JsYkM1amMzTW9leUJzWldaMExDQm9aV2xuYUhRZ2ZTazdYRzVjZEZ4MGZTazdYRzVjZEgxY2JseHVYSFF2S2lwY2JseDBVR1Z5YzJsemRITWdkR2hsSUdOdmJIVnRiaUIzYVdSMGFITWdhVzRnYkc5allXeFRkRzl5WVdkbFhHNWNibHgwUUcxbGRHaHZaQ0J6WVhabFEyOXNkVzF1VjJsa2RHaHpYRzVjZENvcUwxeHVYSFJ6WVhabFEyOXNkVzF1VjJsa2RHaHpLQ2tnZTF4dVhIUmNkSFJvYVhNdUpIUmhZbXhsU0dWaFpHVnljeTVsWVdOb0tDaGZMQ0JsYkNrZ1BUNGdlMXh1WEhSY2RGeDBiR1YwSUNSbGJDQTlJQ1FvWld3cE8xeHVYRzVjZEZ4MFhIUnBaaUFvZEdocGN5NXZjSFJwYjI1ekxuTjBiM0psSUNZbUlDRWtaV3d1YVhNb1UwVk1SVU5VVDFKZlZVNVNSVk5KV2tGQ1RFVXBLU0I3WEc1Y2RGeDBYSFJjZEhSb2FYTXViM0IwYVc5dWN5NXpkRzl5WlM1elpYUW9YRzVjZEZ4MFhIUmNkRngwZEdocGN5NW5aVzVsY21GMFpVTnZiSFZ0Ymtsa0tDUmxiQ2tzWEc1Y2RGeDBYSFJjZEZ4MGRHaHBjeTV3WVhKelpWZHBaSFJvS0dWc0tWeHVYSFJjZEZ4MFhIUXBPMXh1WEhSY2RGeDBmVnh1WEhSY2RIMHBPMXh1WEhSOVhHNWNibHgwTHlvcVhHNWNkRkpsZEhKcFpYWmxjeUJoYm1RZ2MyVjBjeUIwYUdVZ1kyOXNkVzF1SUhkcFpIUm9jeUJtY205dElHeHZZMkZzVTNSdmNtRm5aVnh1WEc1Y2RFQnRaWFJvYjJRZ2NtVnpkRzl5WlVOdmJIVnRibGRwWkhSb2MxeHVYSFFxS2k5Y2JseDBjbVZ6ZEc5eVpVTnZiSFZ0YmxkcFpIUm9jeWdwSUh0Y2JseDBYSFIwYUdsekxpUjBZV0pzWlVobFlXUmxjbk11WldGamFDZ29YeXdnWld3cElEMCtJSHRjYmx4MFhIUmNkR3hsZENBa1pXd2dQU0FrS0dWc0tUdGNibHh1WEhSY2RGeDBhV1lvZEdocGN5NXZjSFJwYjI1ekxuTjBiM0psSUNZbUlDRWtaV3d1YVhNb1UwVk1SVU5VVDFKZlZVNVNSVk5KV2tGQ1RFVXBLU0I3WEc1Y2RGeDBYSFJjZEd4bGRDQjNhV1IwYUNBOUlIUm9hWE11YjNCMGFXOXVjeTV6ZEc5eVpTNW5aWFFvWEc1Y2RGeDBYSFJjZEZ4MGRHaHBjeTVuWlc1bGNtRjBaVU52YkhWdGJrbGtLQ1JsYkNsY2JseDBYSFJjZEZ4MEtUdGNibHh1WEhSY2RGeDBYSFJwWmloM2FXUjBhQ0FoUFNCdWRXeHNLU0I3WEc1Y2RGeDBYSFJjZEZ4MGRHaHBjeTV6WlhSWGFXUjBhQ2hsYkN3Z2QybGtkR2dwTzF4dVhIUmNkRngwWEhSOVhHNWNkRngwWEhSOVhHNWNkRngwZlNrN1hHNWNkSDFjYmx4dVhIUXZLaXBjYmx4MFVHOXBiblJsY2k5dGIzVnpaU0JrYjNkdUlHaGhibVJzWlhKY2JseHVYSFJBYldWMGFHOWtJRzl1VUc5cGJuUmxja1J2ZDI1Y2JseDBRSEJoY21GdElHVjJaVzUwSUh0UFltcGxZM1I5SUVWMlpXNTBJRzlpYW1WamRDQmhjM052WTJsaGRHVmtJSGRwZEdnZ2RHaGxJR2x1ZEdWeVlXTjBhVzl1WEc1Y2RDb3FMMXh1WEhSdmJsQnZhVzUwWlhKRWIzZHVLR1YyWlc1MEtTQjdYRzVjZEZ4MEx5OGdUMjVzZVNCaGNIQnNhV1Z6SUhSdklHeGxablF0WTJ4cFkyc2daSEpoWjJkcGJtZGNibHgwWEhScFppaGxkbVZ1ZEM1M2FHbGphQ0FoUFQwZ01Ta2dleUJ5WlhSMWNtNDdJSDFjYmx4dVhIUmNkQzh2SUVsbUlHRWdjSEpsZG1sdmRYTWdiM0JsY21GMGFXOXVJR2x6SUdSbFptbHVaV1FzSUhkbElHMXBjM05sWkNCMGFHVWdiR0Z6ZENCdGIzVnpaWFZ3TGx4dVhIUmNkQzh2SUZCeWIySmhZbXg1SUdkdlltSnNaV1FnZFhBZ1lua2dkWE5sY2lCdGIzVnphVzVuSUc5MWRDQjBhR1VnZDJsdVpHOTNJSFJvWlc0Z2NtVnNaV0Z6YVc1bkxseHVYSFJjZEM4dklGZGxKMnhzSUhOcGJYVnNZWFJsSUdFZ2NHOXBiblJsY25Wd0lHaGxjbVVnY0hKcGIzSWdkRzhnYVhSY2JseDBYSFJwWmloMGFHbHpMbTl3WlhKaGRHbHZiaWtnZTF4dVhIUmNkRngwZEdocGN5NXZibEJ2YVc1MFpYSlZjQ2hsZG1WdWRDazdYRzVjZEZ4MGZWeHVYRzVjZEZ4MEx5OGdTV2R1YjNKbElHNXZiaTF5WlhOcGVtRmliR1VnWTI5c2RXMXVjMXh1WEhSY2RHeGxkQ0FrWTNWeWNtVnVkRWR5YVhBZ1BTQWtLR1YyWlc1MExtTjFjbkpsYm5SVVlYSm5aWFFwTzF4dVhIUmNkR2xtS0NSamRYSnlaVzUwUjNKcGNDNXBjeWhUUlV4RlExUlBVbDlWVGxKRlUwbGFRVUpNUlNrcElIdGNibHgwWEhSY2RISmxkSFZ5Ymp0Y2JseDBYSFI5WEc1Y2JseDBYSFJzWlhRZ1ozSnBjRWx1WkdWNElEMGdKR04xY25KbGJuUkhjbWx3TG1sdVpHVjRLQ2s3WEc1Y2RGeDBiR1YwSUNSc1pXWjBRMjlzZFcxdUlEMGdkR2hwY3k0a2RHRmliR1ZJWldGa1pYSnpMbVZ4S0dkeWFYQkpibVJsZUNrdWJtOTBLRk5GVEVWRFZFOVNYMVZPVWtWVFNWcEJRa3hGS1R0Y2JseDBYSFJzWlhRZ0pISnBaMmgwUTI5c2RXMXVJRDBnZEdocGN5NGtkR0ZpYkdWSVpXRmtaWEp6TG1WeEtHZHlhWEJKYm1SbGVDQXJJREVwTG01dmRDaFRSVXhGUTFSUFVsOVZUbEpGVTBsYVFVSk1SU2s3WEc1Y2JseDBYSFJzWlhRZ2JHVm1kRmRwWkhSb0lEMGdkR2hwY3k1d1lYSnpaVmRwWkhSb0tDUnNaV1owUTI5c2RXMXVXekJkS1R0Y2JseDBYSFJzWlhRZ2NtbG5hSFJYYVdSMGFDQTlJSFJvYVhNdWNHRnljMlZYYVdSMGFDZ2tjbWxuYUhSRGIyeDFiVzViTUYwcE8xeHVYRzVjZEZ4MGRHaHBjeTV2Y0dWeVlYUnBiMjRnUFNCN1hHNWNkRngwWEhRa2JHVm1kRU52YkhWdGJpd2dKSEpwWjJoMFEyOXNkVzF1TENBa1kzVnljbVZ1ZEVkeWFYQXNYRzVjYmx4MFhIUmNkSE4wWVhKMFdEb2dkR2hwY3k1blpYUlFiMmx1ZEdWeVdDaGxkbVZ1ZENrc1hHNWNibHgwWEhSY2RIZHBaSFJvY3pvZ2UxeHVYSFJjZEZ4MFhIUnNaV1owT2lCc1pXWjBWMmxrZEdnc1hHNWNkRngwWEhSY2RISnBaMmgwT2lCeWFXZG9kRmRwWkhSb1hHNWNkRngwWEhSOUxGeHVYSFJjZEZ4MGJtVjNWMmxrZEdoek9pQjdYRzVjZEZ4MFhIUmNkR3hsWm5RNklHeGxablJYYVdSMGFDeGNibHgwWEhSY2RGeDBjbWxuYUhRNklISnBaMmgwVjJsa2RHaGNibHgwWEhSY2RIMWNibHgwWEhSOU8xeHVYRzVjZEZ4MGRHaHBjeTVpYVc1a1JYWmxiblJ6S0hSb2FYTXVKRzkzYm1WeVJHOWpkVzFsYm5Rc0lGc25iVzkxYzJWdGIzWmxKeXdnSjNSdmRXTm9iVzkyWlNkZExDQjBhR2x6TG05dVVHOXBiblJsY2sxdmRtVXVZbWx1WkNoMGFHbHpLU2s3WEc1Y2RGeDBkR2hwY3k1aWFXNWtSWFpsYm5SektIUm9hWE11Skc5M2JtVnlSRzlqZFcxbGJuUXNJRnNuYlc5MWMyVjFjQ2NzSUNkMGIzVmphR1Z1WkNkZExDQjBhR2x6TG05dVVHOXBiblJsY2xWd0xtSnBibVFvZEdocGN5a3BPMXh1WEc1Y2RGeDBkR2hwY3k0a2FHRnVaR3hsUTI5dWRHRnBibVZ5WEc1Y2RGeDBYSFF1WVdSa0tIUm9hWE11SkhSaFlteGxLVnh1WEhSY2RGeDBMbUZrWkVOc1lYTnpLRU5NUVZOVFgxUkJRa3hGWDFKRlUwbGFTVTVIS1R0Y2JseHVYSFJjZENSc1pXWjBRMjlzZFcxdVhHNWNkRngwWEhRdVlXUmtLQ1J5YVdkb2RFTnZiSFZ0YmlsY2JseDBYSFJjZEM1aFpHUW9KR04xY25KbGJuUkhjbWx3S1Z4dVhIUmNkRngwTG1Ga1pFTnNZWE56S0VOTVFWTlRYME5QVEZWTlRsOVNSVk5KV2tsT1J5azdYRzVjYmx4MFhIUjBhR2x6TG5SeWFXZG5aWEpGZG1WdWRDaEZWa1ZPVkY5U1JWTkpXa1ZmVTFSQlVsUXNJRnRjYmx4MFhIUmNkQ1JzWldaMFEyOXNkVzF1TENBa2NtbG5hSFJEYjJ4MWJXNHNYRzVjZEZ4MFhIUnNaV1owVjJsa2RHZ3NJSEpwWjJoMFYybGtkR2hjYmx4MFhIUmRMRnh1WEhSY2RHVjJaVzUwS1R0Y2JseHVYSFJjZEdWMlpXNTBMbkJ5WlhabGJuUkVaV1poZFd4MEtDazdYRzVjZEgxY2JseHVYSFF2S2lwY2JseDBVRzlwYm5SbGNpOXRiM1Z6WlNCdGIzWmxiV1Z1ZENCb1lXNWtiR1Z5WEc1Y2JseDBRRzFsZEdodlpDQnZibEJ2YVc1MFpYSk5iM1psWEc1Y2RFQndZWEpoYlNCbGRtVnVkQ0I3VDJKcVpXTjBmU0JGZG1WdWRDQnZZbXBsWTNRZ1lYTnpiMk5wWVhSbFpDQjNhWFJvSUhSb1pTQnBiblJsY21GamRHbHZibHh1WEhRcUtpOWNibHgwYjI1UWIybHVkR1Z5VFc5MlpTaGxkbVZ1ZENrZ2UxeHVYSFJjZEd4bGRDQnZjQ0E5SUhSb2FYTXViM0JsY21GMGFXOXVPMXh1WEhSY2RHbG1LQ0YwYUdsekxtOXdaWEpoZEdsdmJpa2dleUJ5WlhSMWNtNDdJSDFjYmx4dVhIUmNkQzh2SUVSbGRHVnliV2x1WlNCMGFHVWdaR1ZzZEdFZ1kyaGhibWRsSUdKbGRIZGxaVzRnYzNSaGNuUWdZVzVrSUc1bGR5QnRiM1Z6WlNCd2IzTnBkR2x2Yml3Z1lYTWdZU0J3WlhKalpXNTBZV2RsSUc5bUlIUm9aU0IwWVdKc1pTQjNhV1IwYUZ4dVhIUmNkR3hsZENCa2FXWm1aWEpsYm1ObElEMGdLSFJvYVhNdVoyVjBVRzlwYm5SbGNsZ29aWFpsYm5RcElDMGdiM0F1YzNSaGNuUllLU0F2SUhSb2FYTXVKSFJoWW14bExuZHBaSFJvS0NrZ0tpQXhNREE3WEc1Y2RGeDBhV1lvWkdsbVptVnlaVzVqWlNBOVBUMGdNQ2tnZTF4dVhIUmNkRngwY21WMGRYSnVPMXh1WEhSY2RIMWNibHh1WEhSY2RHeGxkQ0JzWldaMFEyOXNkVzF1SUQwZ2IzQXVKR3hsWm5SRGIyeDFiVzViTUYwN1hHNWNkRngwYkdWMElISnBaMmgwUTI5c2RXMXVJRDBnYjNBdUpISnBaMmgwUTI5c2RXMXVXekJkTzF4dVhIUmNkR3hsZENCM2FXUjBhRXhsWm5Rc0lIZHBaSFJvVW1sbmFIUTdYRzVjYmx4MFhIUnBaaWhrYVdabVpYSmxibU5sSUQ0Z01Da2dlMXh1WEhSY2RGeDBkMmxrZEdoTVpXWjBJRDBnZEdocGN5NWpiMjV6ZEhKaGFXNVhhV1IwYUNodmNDNTNhV1IwYUhNdWJHVm1kQ0FySUNodmNDNTNhV1IwYUhNdWNtbG5hSFFnTFNCdmNDNXVaWGRYYVdSMGFITXVjbWxuYUhRcEtUdGNibHgwWEhSY2RIZHBaSFJvVW1sbmFIUWdQU0IwYUdsekxtTnZibk4wY21GcGJsZHBaSFJvS0c5d0xuZHBaSFJvY3k1eWFXZG9kQ0F0SUdScFptWmxjbVZ1WTJVcE8xeHVYSFJjZEgxY2JseDBYSFJsYkhObElHbG1LR1JwWm1abGNtVnVZMlVnUENBd0tTQjdYRzVjZEZ4MFhIUjNhV1IwYUV4bFpuUWdQU0IwYUdsekxtTnZibk4wY21GcGJsZHBaSFJvS0c5d0xuZHBaSFJvY3k1c1pXWjBJQ3NnWkdsbVptVnlaVzVqWlNrN1hHNWNkRngwWEhSM2FXUjBhRkpwWjJoMElEMGdkR2hwY3k1amIyNXpkSEpoYVc1WGFXUjBhQ2h2Y0M1M2FXUjBhSE11Y21sbmFIUWdLeUFvYjNBdWQybGtkR2h6TG14bFpuUWdMU0J2Y0M1dVpYZFhhV1IwYUhNdWJHVm1kQ2twTzF4dVhIUmNkSDFjYmx4dVhIUmNkR2xtS0d4bFpuUkRiMngxYlc0cElIdGNibHgwWEhSY2RIUm9hWE11YzJWMFYybGtkR2dvYkdWbWRFTnZiSFZ0Yml3Z2QybGtkR2hNWldaMEtUdGNibHgwWEhSOVhHNWNkRngwYVdZb2NtbG5hSFJEYjJ4MWJXNHBJSHRjYmx4MFhIUmNkSFJvYVhNdWMyVjBWMmxrZEdnb2NtbG5hSFJEYjJ4MWJXNHNJSGRwWkhSb1VtbG5hSFFwTzF4dVhIUmNkSDFjYmx4dVhIUmNkRzl3TG01bGQxZHBaSFJvY3k1c1pXWjBJRDBnZDJsa2RHaE1aV1owTzF4dVhIUmNkRzl3TG01bGQxZHBaSFJvY3k1eWFXZG9kQ0E5SUhkcFpIUm9VbWxuYUhRN1hHNWNibHgwWEhSeVpYUjFjbTRnZEdocGN5NTBjbWxuWjJWeVJYWmxiblFvUlZaRlRsUmZVa1ZUU1ZwRkxDQmJYRzVjZEZ4MFhIUnZjQzRrYkdWbWRFTnZiSFZ0Yml3Z2IzQXVKSEpwWjJoMFEyOXNkVzF1TEZ4dVhIUmNkRngwZDJsa2RHaE1aV1owTENCM2FXUjBhRkpwWjJoMFhHNWNkRngwWFN4Y2JseDBYSFJsZG1WdWRDazdYRzVjZEgxY2JseHVYSFF2S2lwY2JseDBVRzlwYm5SbGNpOXRiM1Z6WlNCeVpXeGxZWE5sSUdoaGJtUnNaWEpjYmx4dVhIUkFiV1YwYUc5a0lHOXVVRzlwYm5SbGNsVndYRzVjZEVCd1lYSmhiU0JsZG1WdWRDQjdUMkpxWldOMGZTQkZkbVZ1ZENCdlltcGxZM1FnWVhOemIyTnBZWFJsWkNCM2FYUm9JSFJvWlNCcGJuUmxjbUZqZEdsdmJseHVYSFFxS2k5Y2JseDBiMjVRYjJsdWRHVnlWWEFvWlhabGJuUXBJSHRjYmx4MFhIUnNaWFFnYjNBZ1BTQjBhR2x6TG05d1pYSmhkR2x2Ymp0Y2JseDBYSFJwWmlnaGRHaHBjeTV2Y0dWeVlYUnBiMjRwSUhzZ2NtVjBkWEp1T3lCOVhHNWNibHgwWEhSMGFHbHpMblZ1WW1sdVpFVjJaVzUwY3loMGFHbHpMaVJ2ZDI1bGNrUnZZM1Z0Wlc1MExDQmJKMjF2ZFhObGRYQW5MQ0FuZEc5MVkyaGxibVFuTENBbmJXOTFjMlZ0YjNabEp5d2dKM1J2ZFdOb2JXOTJaU2RkS1R0Y2JseHVYSFJjZEhSb2FYTXVKR2hoYm1Sc1pVTnZiblJoYVc1bGNseHVYSFJjZEZ4MExtRmtaQ2gwYUdsekxpUjBZV0pzWlNsY2JseDBYSFJjZEM1eVpXMXZkbVZEYkdGemN5aERURUZUVTE5VVFVSk1SVjlTUlZOSldrbE9SeWs3WEc1Y2JseDBYSFJ2Y0M0a2JHVm1kRU52YkhWdGJseHVYSFJjZEZ4MExtRmtaQ2h2Y0M0a2NtbG5hSFJEYjJ4MWJXNHBYRzVjZEZ4MFhIUXVZV1JrS0c5d0xpUmpkWEp5Wlc1MFIzSnBjQ2xjYmx4MFhIUmNkQzV5WlcxdmRtVkRiR0Z6Y3loRFRFRlRVMTlEVDB4VlRVNWZVa1ZUU1ZwSlRrY3BPMXh1WEc1Y2RGeDBkR2hwY3k1emVXNWpTR0Z1Wkd4bFYybGtkR2h6S0NrN1hHNWNkRngwZEdocGN5NXpZWFpsUTI5c2RXMXVWMmxrZEdoektDazdYRzVjYmx4MFhIUjBhR2x6TG05d1pYSmhkR2x2YmlBOUlHNTFiR3c3WEc1Y2JseDBYSFJ5WlhSMWNtNGdkR2hwY3k1MGNtbG5aMlZ5UlhabGJuUW9SVlpGVGxSZlVrVlRTVnBGWDFOVVQxQXNJRnRjYmx4MFhIUmNkRzl3TGlSc1pXWjBRMjlzZFcxdUxDQnZjQzRrY21sbmFIUkRiMngxYlc0c1hHNWNkRngwWEhSdmNDNXVaWGRYYVdSMGFITXViR1ZtZEN3Z2IzQXVibVYzVjJsa2RHaHpMbkpwWjJoMFhHNWNkRngwWFN4Y2JseDBYSFJsZG1WdWRDazdYRzVjZEgxY2JseHVYSFF2S2lwY2JseDBVbVZ0YjNabGN5QmhiR3dnWlhabGJuUWdiR2x6ZEdWdVpYSnpMQ0JrWVhSaExDQmhibVFnWVdSa1pXUWdSRTlOSUdWc1pXMWxiblJ6TGlCVVlXdGxjMXh1WEhSMGFHVWdQSFJoWW14bEx6NGdaV3hsYldWdWRDQmlZV05ySUhSdklHaHZkeUJwZENCM1lYTXNJR0Z1WkNCeVpYUjFjbTV6SUdsMFhHNWNibHgwUUcxbGRHaHZaQ0JrWlhOMGNtOTVYRzVjZEVCeVpYUjFjbTRnZTJwUmRXVnllWDBnVDNKcFoybHVZV3dnYWxGMVpYSjVMWGR5WVhCd1pXUWdQSFJoWW14bFBpQmxiR1Z0Wlc1MFhHNWNkQ29xTDF4dVhIUmtaWE4wY205NUtDa2dlMXh1WEhSY2RHeGxkQ0FrZEdGaWJHVWdQU0IwYUdsekxpUjBZV0pzWlR0Y2JseDBYSFJzWlhRZ0pHaGhibVJzWlhNZ1BTQjBhR2x6TGlSb1lXNWtiR1ZEYjI1MFlXbHVaWEl1Wm1sdVpDZ25MaWNyUTB4QlUxTmZTRUZPUkV4RktUdGNibHh1WEhSY2RIUm9hWE11ZFc1aWFXNWtSWFpsYm5SektGeHVYSFJjZEZ4MGRHaHBjeTRrZDJsdVpHOTNYRzVjZEZ4MFhIUmNkQzVoWkdRb2RHaHBjeTRrYjNkdVpYSkViMk4xYldWdWRDbGNibHgwWEhSY2RGeDBMbUZrWkNoMGFHbHpMaVIwWVdKc1pTbGNibHgwWEhSY2RGeDBMbUZrWkNna2FHRnVaR3hsY3lsY2JseDBYSFFwTzF4dVhHNWNkRngwSkdoaGJtUnNaWE11Y21WdGIzWmxSR0YwWVNoRVFWUkJYMVJJS1R0Y2JseDBYSFFrZEdGaWJHVXVjbVZ0YjNabFJHRjBZU2hFUVZSQlgwRlFTU2s3WEc1Y2JseDBYSFIwYUdsekxpUm9ZVzVrYkdWRGIyNTBZV2x1WlhJdWNtVnRiM1psS0NrN1hHNWNkRngwZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeUlEMGdiblZzYkR0Y2JseDBYSFIwYUdsekxpUjBZV0pzWlVobFlXUmxjbk1nUFNCdWRXeHNPMXh1WEhSY2RIUm9hWE11SkhSaFlteGxJRDBnYm5Wc2JEdGNibHh1WEhSY2RISmxkSFZ5YmlBa2RHRmliR1U3WEc1Y2RIMWNibHh1WEhRdktpcGNibHgwUW1sdVpITWdaMmwyWlc0Z1pYWmxiblJ6SUdadmNpQjBhR2x6SUdsdWMzUmhibU5sSUhSdklIUm9aU0JuYVhabGJpQjBZWEpuWlhRZ1JFOU5SV3hsYldWdWRGeHVYRzVjZEVCd2NtbDJZWFJsWEc1Y2RFQnRaWFJvYjJRZ1ltbHVaRVYyWlc1MGMxeHVYSFJBY0dGeVlXMGdkR0Z5WjJWMElIdHFVWFZsY25sOUlHcFJkV1Z5ZVMxM2NtRndjR1ZrSUVSUFRVVnNaVzFsYm5RZ2RHOGdZbWx1WkNCbGRtVnVkSE1nZEc5Y2JseDBRSEJoY21GdElHVjJaVzUwY3lCN1UzUnlhVzVuZkVGeWNtRjVmU0JGZG1WdWRDQnVZVzFsSUNodmNpQmhjbkpoZVNCdlppa2dkRzhnWW1sdVpGeHVYSFJBY0dGeVlXMGdjMlZzWldOMGIzSlBja05oYkd4aVlXTnJJSHRUZEhKcGJtZDhSblZ1WTNScGIyNTlJRk5sYkdWamRHOXlJSE4wY21sdVp5QnZjaUJqWVd4c1ltRmphMXh1WEhSQWNHRnlZVzBnVzJOaGJHeGlZV05yWFNCN1JuVnVZM1JwYjI1OUlFTmhiR3hpWVdOcklHMWxkR2h2WkZ4dVhIUXFLaTljYmx4MFltbHVaRVYyWlc1MGN5Z2tkR0Z5WjJWMExDQmxkbVZ1ZEhNc0lITmxiR1ZqZEc5eVQzSkRZV3hzWW1GamF5d2dZMkZzYkdKaFkyc3BJSHRjYmx4MFhIUnBaaWgwZVhCbGIyWWdaWFpsYm5SeklEMDlQU0FuYzNSeWFXNW5KeWtnZTF4dVhIUmNkRngwWlhabGJuUnpJRDBnWlhabGJuUnpJQ3NnZEdocGN5NXVjenRjYmx4MFhIUjlYRzVjZEZ4MFpXeHpaU0I3WEc1Y2RGeDBYSFJsZG1WdWRITWdQU0JsZG1WdWRITXVhbTlwYmloMGFHbHpMbTV6SUNzZ0p5QW5LU0FySUhSb2FYTXVibk03WEc1Y2RGeDBmVnh1WEc1Y2RGeDBhV1lvWVhKbmRXMWxiblJ6TG14bGJtZDBhQ0ErSURNcElIdGNibHgwWEhSY2RDUjBZWEpuWlhRdWIyNG9aWFpsYm5SekxDQnpaV3hsWTNSdmNrOXlRMkZzYkdKaFkyc3NJR05oYkd4aVlXTnJLVHRjYmx4MFhIUjlYRzVjZEZ4MFpXeHpaU0I3WEc1Y2RGeDBYSFFrZEdGeVoyVjBMbTl1S0dWMlpXNTBjeXdnYzJWc1pXTjBiM0pQY2tOaGJHeGlZV05yS1R0Y2JseDBYSFI5WEc1Y2RIMWNibHh1WEhRdktpcGNibHgwVlc1aWFXNWtjeUJsZG1WdWRITWdjM0JsWTJsbWFXTWdkRzhnZEdocGN5QnBibk4wWVc1alpTQm1jbTl0SUhSb1pTQm5hWFpsYmlCMFlYSm5aWFFnUkU5TlJXeGxiV1Z1ZEZ4dVhHNWNkRUJ3Y21sMllYUmxYRzVjZEVCdFpYUm9iMlFnZFc1aWFXNWtSWFpsYm5SelhHNWNkRUJ3WVhKaGJTQjBZWEpuWlhRZ2UycFJkV1Z5ZVgwZ2FsRjFaWEo1TFhkeVlYQndaV1FnUkU5TlJXeGxiV1Z1ZENCMGJ5QjFibUpwYm1RZ1pYWmxiblJ6SUdaeWIyMWNibHgwUUhCaGNtRnRJR1YyWlc1MGN5QjdVM1J5YVc1bmZFRnljbUY1ZlNCRmRtVnVkQ0J1WVcxbElDaHZjaUJoY25KaGVTQnZaaWtnZEc4Z2RXNWlhVzVrWEc1Y2RDb3FMMXh1WEhSMWJtSnBibVJGZG1WdWRITW9KSFJoY21kbGRDd2daWFpsYm5SektTQjdYRzVjZEZ4MGFXWW9kSGx3Wlc5bUlHVjJaVzUwY3lBOVBUMGdKM04wY21sdVp5Y3BJSHRjYmx4MFhIUmNkR1YyWlc1MGN5QTlJR1YyWlc1MGN5QXJJSFJvYVhNdWJuTTdYRzVjZEZ4MGZWeHVYSFJjZEdWc2MyVWdhV1lvWlhabGJuUnpJQ0U5SUc1MWJHd3BJSHRjYmx4MFhIUmNkR1YyWlc1MGN5QTlJR1YyWlc1MGN5NXFiMmx1S0hSb2FYTXVibk1nS3lBbklDY3BJQ3NnZEdocGN5NXVjenRjYmx4MFhIUjlYRzVjZEZ4MFpXeHpaU0I3WEc1Y2RGeDBYSFJsZG1WdWRITWdQU0IwYUdsekxtNXpPMXh1WEhSY2RIMWNibHh1WEhSY2RDUjBZWEpuWlhRdWIyWm1LR1YyWlc1MGN5azdYRzVjZEgxY2JseHVYSFF2S2lwY2JseDBWSEpwWjJkbGNuTWdZVzRnWlhabGJuUWdiMjRnZEdobElEeDBZV0pzWlM4K0lHVnNaVzFsYm5RZ1ptOXlJR0VnWjJsMlpXNGdkSGx3WlNCM2FYUm9JR2RwZG1WdVhHNWNkR0Z5WjNWdFpXNTBjeXdnWVd4emJ5QnpaWFIwYVc1bklHRnVaQ0JoYkd4dmQybHVaeUJoWTJObGMzTWdkRzhnZEdobElHOXlhV2RwYm1Gc1JYWmxiblFnYVdaY2JseDBaMmwyWlc0dUlGSmxkSFZ5Ym5NZ2RHaGxJSEpsYzNWc2RDQnZaaUIwYUdVZ2RISnBaMmRsY21Wa0lHVjJaVzUwTGx4dVhHNWNkRUJ3Y21sMllYUmxYRzVjZEVCdFpYUm9iMlFnZEhKcFoyZGxja1YyWlc1MFhHNWNkRUJ3WVhKaGJTQjBlWEJsSUh0VGRISnBibWQ5SUVWMlpXNTBJRzVoYldWY2JseDBRSEJoY21GdElHRnlaM01nZTBGeWNtRjVmU0JCY25KaGVTQnZaaUJoY21kMWJXVnVkSE1nZEc4Z2NHRnpjeUIwYUhKdmRXZG9YRzVjZEVCd1lYSmhiU0JiYjNKcFoybHVZV3hGZG1WdWRGMGdTV1lnWjJsMlpXNHNJR2x6SUhObGRDQnZiaUIwYUdVZ1pYWmxiblFnYjJKcVpXTjBYRzVjZEVCeVpYUjFjbTRnZTAxcGVHVmtmU0JTWlhOMWJIUWdiMllnZEdobElHVjJaVzUwSUhSeWFXZG5aWElnWVdOMGFXOXVYRzVjZENvcUwxeHVYSFIwY21sbloyVnlSWFpsYm5Rb2RIbHdaU3dnWVhKbmN5d2diM0pwWjJsdVlXeEZkbVZ1ZENrZ2UxeHVYSFJjZEd4bGRDQmxkbVZ1ZENBOUlDUXVSWFpsYm5Rb2RIbHdaU2s3WEc1Y2RGeDBhV1lvWlhabGJuUXViM0pwWjJsdVlXeEZkbVZ1ZENrZ2UxeHVYSFJjZEZ4MFpYWmxiblF1YjNKcFoybHVZV3hGZG1WdWRDQTlJQ1F1WlhoMFpXNWtLSHQ5TENCdmNtbG5hVzVoYkVWMlpXNTBLVHRjYmx4MFhIUjlYRzVjYmx4MFhIUnlaWFIxY200Z2RHaHBjeTRrZEdGaWJHVXVkSEpwWjJkbGNpaGxkbVZ1ZEN3Z1czUm9hWE5kTG1OdmJtTmhkQ2hoY21keklIeDhJRnRkS1NrN1hHNWNkSDFjYmx4dVhIUXZLaXBjYmx4MFEyRnNZM1ZzWVhSbGN5QmhJSFZ1YVhGMVpTQmpiMngxYlc0Z1NVUWdabTl5SUdFZ1oybDJaVzRnWTI5c2RXMXVJRVJQVFVWc1pXMWxiblJjYmx4dVhIUkFjSEpwZG1GMFpWeHVYSFJBYldWMGFHOWtJR2RsYm1WeVlYUmxRMjlzZFcxdVNXUmNibHgwUUhCaGNtRnRJQ1JsYkNCN2FsRjFaWEo1ZlNCcVVYVmxjbmt0ZDNKaGNIQmxaQ0JqYjJ4MWJXNGdaV3hsYldWdWRGeHVYSFJBY21WMGRYSnVJSHRUZEhKcGJtZDlJRU52YkhWdGJpQkpSRnh1WEhRcUtpOWNibHgwWjJWdVpYSmhkR1ZEYjJ4MWJXNUpaQ2drWld3cElIdGNibHgwWEhSeVpYUjFjbTRnZEdocGN5NGtkR0ZpYkdVdVpHRjBZU2hFUVZSQlgwTlBURlZOVGxOZlNVUXBJQ3NnSnkwbklDc2dKR1ZzTG1SaGRHRW9SRUZVUVY5RFQweFZUVTVmU1VRcE8xeHVYSFI5WEc1Y2JseDBMeW9xWEc1Y2RGQmhjbk5sY3lCaElHZHBkbVZ1SUVSUFRVVnNaVzFsYm5RbmN5QjNhV1IwYUNCcGJuUnZJR0VnWm14dllYUmNibHh1WEhSQWNISnBkbUYwWlZ4dVhIUkFiV1YwYUc5a0lIQmhjbk5sVjJsa2RHaGNibHgwUUhCaGNtRnRJR1ZzWlcxbGJuUWdlMFJQVFVWc1pXMWxiblI5SUVWc1pXMWxiblFnZEc4Z1oyVjBJSGRwWkhSb0lHOW1YRzVjZEVCeVpYUjFjbTRnZTA1MWJXSmxjbjBnUld4bGJXVnVkQ2R6SUhkcFpIUm9JR0Z6SUdFZ1pteHZZWFJjYmx4MEtpb3ZYRzVjZEhCaGNuTmxWMmxrZEdnb1pXeGxiV1Z1ZENrZ2UxeHVYSFJjZEhKbGRIVnliaUJsYkdWdFpXNTBJRDhnY0dGeWMyVkdiRzloZENobGJHVnRaVzUwTG5OMGVXeGxMbmRwWkhSb0xuSmxjR3hoWTJVb0p5VW5MQ0FuSnlrcElEb2dNRHRjYmx4MGZWeHVYRzVjZEM4cUtseHVYSFJUWlhSeklIUm9aU0J3WlhKalpXNTBZV2RsSUhkcFpIUm9JRzltSUdFZ1oybDJaVzRnUkU5TlJXeGxiV1Z1ZEZ4dVhHNWNkRUJ3Y21sMllYUmxYRzVjZEVCdFpYUm9iMlFnYzJWMFYybGtkR2hjYmx4MFFIQmhjbUZ0SUdWc1pXMWxiblFnZTBSUFRVVnNaVzFsYm5SOUlFVnNaVzFsYm5RZ2RHOGdjMlYwSUhkcFpIUm9JRzl1WEc1Y2RFQndZWEpoYlNCM2FXUjBhQ0I3VG5WdFltVnlmU0JYYVdSMGFDd2dZWE1nWVNCd1pYSmpaVzUwWVdkbExDQjBieUJ6WlhSY2JseDBLaW92WEc1Y2RITmxkRmRwWkhSb0tHVnNaVzFsYm5Rc0lIZHBaSFJvS1NCN1hHNWNkRngwZDJsa2RHZ2dQU0IzYVdSMGFDNTBiMFpwZUdWa0tESXBPMXh1WEhSY2RIZHBaSFJvSUQwZ2QybGtkR2dnUGlBd0lEOGdkMmxrZEdnZ09pQXdPMXh1WEhSY2RHVnNaVzFsYm5RdWMzUjViR1V1ZDJsa2RHZ2dQU0IzYVdSMGFDQXJJQ2NsSnp0Y2JseDBmVnh1WEc1Y2RDOHFLbHh1WEhSRGIyNXpkSEpoYVc1eklHRWdaMmwyWlc0Z2QybGtkR2dnZEc4Z2RHaGxJRzFwYm1sdGRXMGdZVzVrSUcxaGVHbHRkVzBnY21GdVoyVnpJR1JsWm1sdVpXUWdhVzVjYmx4MGRHaGxJR0J0YVc1WGFXUjBhR0FnWVc1a0lHQnRZWGhYYVdSMGFHQWdZMjl1Wm1sbmRYSmhkR2x2YmlCdmNIUnBiMjV6TENCeVpYTndaV04wYVhabGJIa3VYRzVjYmx4MFFIQnlhWFpoZEdWY2JseDBRRzFsZEdodlpDQmpiMjV6ZEhKaGFXNVhhV1IwYUZ4dVhIUkFjR0Z5WVcwZ2QybGtkR2dnZTA1MWJXSmxjbjBnVjJsa2RHZ2dkRzhnWTI5dWMzUnlZV2x1WEc1Y2RFQnlaWFIxY200Z2UwNTFiV0psY24wZ1EyOXVjM1J5WVdsdVpXUWdkMmxrZEdoY2JseDBLaW92WEc1Y2RHTnZibk4wY21GcGJsZHBaSFJvS0hkcFpIUm9LU0I3WEc1Y2RGeDBhV1lnS0hSb2FYTXViM0IwYVc5dWN5NXRhVzVYYVdSMGFDQWhQU0IxYm1SbFptbHVaV1FwSUh0Y2JseDBYSFJjZEhkcFpIUm9JRDBnVFdGMGFDNXRZWGdvZEdocGN5NXZjSFJwYjI1ekxtMXBibGRwWkhSb0xDQjNhV1IwYUNrN1hHNWNkRngwZlZ4dVhHNWNkRngwYVdZZ0tIUm9hWE11YjNCMGFXOXVjeTV0WVhoWGFXUjBhQ0FoUFNCMWJtUmxabWx1WldRcElIdGNibHgwWEhSY2RIZHBaSFJvSUQwZ1RXRjBhQzV0YVc0b2RHaHBjeTV2Y0hScGIyNXpMbTFoZUZkcFpIUm9MQ0IzYVdSMGFDazdYRzVjZEZ4MGZWeHVYRzVjZEZ4MGNtVjBkWEp1SUhkcFpIUm9PMXh1WEhSOVhHNWNibHgwTHlvcVhHNWNkRWRwZG1WdUlHRWdjR0Z5ZEdsamRXeGhjaUJGZG1WdWRDQnZZbXBsWTNRc0lISmxkSEpwWlhabGN5QjBhR1VnWTNWeWNtVnVkQ0J3YjJsdWRHVnlJRzltWm5ObGRDQmhiRzl1WjF4dVhIUjBhR1VnYUc5eWFYcHZiblJoYkNCa2FYSmxZM1JwYjI0dUlFRmpZMjkxYm5SeklHWnZjaUJpYjNSb0lISmxaM1ZzWVhJZ2JXOTFjMlVnWTJ4cFkydHpJR0Z6SUhkbGJHd2dZWE5jYmx4MGNHOXBiblJsY2kxc2FXdGxJSE41YzNSbGJYTWdLRzF2WW1sc1pYTXNJSFJoWW14bGRITWdaWFJqTGlsY2JseHVYSFJBY0hKcGRtRjBaVnh1WEhSQWJXVjBhRzlrSUdkbGRGQnZhVzUwWlhKWVhHNWNkRUJ3WVhKaGJTQmxkbVZ1ZENCN1QySnFaV04wZlNCRmRtVnVkQ0J2WW1wbFkzUWdZWE56YjJOcFlYUmxaQ0IzYVhSb0lIUm9aU0JwYm5SbGNtRmpkR2x2Ymx4dVhIUkFjbVYwZFhKdUlIdE9kVzFpWlhKOUlFaHZjbWw2YjI1MFlXd2djRzlwYm5SbGNpQnZabVp6WlhSY2JseDBLaW92WEc1Y2RHZGxkRkJ2YVc1MFpYSllLR1YyWlc1MEtTQjdYRzVjZEZ4MGFXWWdLR1YyWlc1MExuUjVjR1V1YVc1a1pYaFBaaWduZEc5MVkyZ25LU0E5UFQwZ01Da2dlMXh1WEhSY2RGeDBjbVYwZFhKdUlDaGxkbVZ1ZEM1dmNtbG5hVzVoYkVWMlpXNTBMblJ2ZFdOb1pYTmJNRjBnZkh3Z1pYWmxiblF1YjNKcFoybHVZV3hGZG1WdWRDNWphR0Z1WjJWa1ZHOTFZMmhsYzFzd1hTa3VjR0ZuWlZnN1hHNWNkRngwZlZ4dVhIUmNkSEpsZEhWeWJpQmxkbVZ1ZEM1d1lXZGxXRHRjYmx4MGZWeHVmVnh1WEc1U1pYTnBlbUZpYkdWRGIyeDFiVzV6TG1SbFptRjFiSFJ6SUQwZ2UxeHVYSFJ6Wld4bFkzUnZjam9nWm5WdVkzUnBiMjRvSkhSaFlteGxLU0I3WEc1Y2RGeDBhV1lvSkhSaFlteGxMbVpwYm1Rb0ozUm9aV0ZrSnlrdWJHVnVaM1JvS1NCN1hHNWNkRngwWEhSeVpYUjFjbTRnVTBWTVJVTlVUMUpmVkVnN1hHNWNkRngwZlZ4dVhHNWNkRngwY21WMGRYSnVJRk5GVEVWRFZFOVNYMVJFTzF4dVhIUjlMRnh1WEhSemRHOXlaVG9nZDJsdVpHOTNMbk4wYjNKbExGeHVYSFJ6ZVc1alNHRnVaR3hsY25NNklIUnlkV1VzWEc1Y2RISmxjMmw2WlVaeWIyMUNiMlI1T2lCMGNuVmxMRnh1WEhSdFlYaFhhV1IwYURvZ2JuVnNiQ3hjYmx4MGJXbHVWMmxrZEdnNklEQXVNREZjYm4wN1hHNWNibEpsYzJsNllXSnNaVU52YkhWdGJuTXVZMjkxYm5RZ1BTQXdPMXh1SWl3aVpYaHdiM0owSUdOdmJuTjBJRVJCVkVGZlFWQkpJRDBnSjNKbGMybDZZV0pzWlVOdmJIVnRibk1uTzF4dVpYaHdiM0owSUdOdmJuTjBJRVJCVkVGZlEwOU1WVTFPVTE5SlJDQTlJQ2R5WlhOcGVtRmliR1V0WTI5c2RXMXVjeTFwWkNjN1hHNWxlSEJ2Y25RZ1kyOXVjM1FnUkVGVVFWOURUMHhWVFU1ZlNVUWdQU0FuY21WemFYcGhZbXhsTFdOdmJIVnRiaTFwWkNjN1hHNWxlSEJ2Y25RZ1kyOXVjM1FnUkVGVVFWOVVTQ0E5SUNkMGFDYzdYRzVjYm1WNGNHOXlkQ0JqYjI1emRDQkRURUZUVTE5VVFVSk1SVjlTUlZOSldrbE9SeUE5SUNkeVl5MTBZV0pzWlMxeVpYTnBlbWx1WnljN1hHNWxlSEJ2Y25RZ1kyOXVjM1FnUTB4QlUxTmZRMDlNVlUxT1gxSkZVMGxhU1U1SElEMGdKM0pqTFdOdmJIVnRiaTF5WlhOcGVtbHVaeWM3WEc1bGVIQnZjblFnWTI5dWMzUWdRMHhCVTFOZlNFRk9SRXhGSUQwZ0ozSmpMV2hoYm1Sc1pTYzdYRzVsZUhCdmNuUWdZMjl1YzNRZ1EweEJVMU5mU0VGT1JFeEZYME5QVGxSQlNVNUZVaUE5SUNkeVl5MW9ZVzVrYkdVdFkyOXVkR0ZwYm1WeUp6dGNibHh1Wlhod2IzSjBJR052Ym5OMElFVldSVTVVWDFKRlUwbGFSVjlUVkVGU1ZDQTlJQ2RqYjJ4MWJXNDZjbVZ6YVhwbE9uTjBZWEowSnp0Y2JtVjRjRzl5ZENCamIyNXpkQ0JGVmtWT1ZGOVNSVk5KV2tVZ1BTQW5ZMjlzZFcxdU9uSmxjMmw2WlNjN1hHNWxlSEJ2Y25RZ1kyOXVjM1FnUlZaRlRsUmZVa1ZUU1ZwRlgxTlVUMUFnUFNBblkyOXNkVzF1T25KbGMybDZaVHB6ZEc5d0p6dGNibHh1Wlhod2IzSjBJR052Ym5OMElGTkZURVZEVkU5U1gxUklJRDBnSjNSeU9tWnBjbk4wSUQ0Z2RHZzZkbWx6YVdKc1pTYzdYRzVsZUhCdmNuUWdZMjl1YzNRZ1UwVk1SVU5VVDFKZlZFUWdQU0FuZEhJNlptbHljM1FnUGlCMFpEcDJhWE5wWW14bEp6dGNibVY0Y0c5eWRDQmpiMjV6ZENCVFJVeEZRMVJQVWw5VlRsSkZVMGxhUVVKTVJTQTlJR0JiWkdGMFlTMXViM0psYzJsNlpWMWdPMXh1SWl3aWFXMXdiM0owSUZKbGMybDZZV0pzWlVOdmJIVnRibk1nWm5KdmJTQW5MaTlqYkdGemN5YzdYRzVwYlhCdmNuUWdZV1JoY0hSbGNpQm1jbTl0SUNjdUwyRmtZWEIwWlhJbk8xeHVYRzVsZUhCdmNuUWdaR1ZtWVhWc2RDQlNaWE5wZW1GaWJHVkRiMngxYlc1ek95SmRmUT09In0=
