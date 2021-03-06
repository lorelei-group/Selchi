var Event = (function() {
	var undefined;
	function EventHandler(target, event, funct, handler, bubble) {
		this.target = target;
		this.event = event;
		this.funct = funct;
		this.bubble = bubble;
		this.handler = handler;
	}

	function eventArgs_common() {
		this.type = function() { return this.systemEvent.type; };
		this.ctrlKey = function() { return this.systemEvent.ctrlKey; };
		this.shiftKey = function() { return this.systemEvent.shiftKey; };
		this.altKey = function() { return this.systemEvent.altKey; };
		this.cancelBubble = function() { this.systemEvent.cancelBubble = true; };
		this.clientX = function() { return this.systemEvent.clientX; };
		this.clientY = function() { return this.systemEvent.clientY; };
		this.screenX = function() { return this.systemEvent.screenX; };
		this.screenY = function() { return this.systemEvent.screenY; };
	}
	function eventArgs_IE() {
		this.keyCode = function() { return this.systemEvent.keyCode; };
		this.target = function() { return this.systemEvent.srcElement; };

		/*
		 * Only IE
		 */
		this.recordset = function() { return this.systemEvent.recordset; };
	}
	function eventArgs_gecko_opera_KHTML() {
		this.keyCode = function() { return this.systemEvent.which; };
		this.target = function() { return this.systemEvent.target; };

		/*
		 * Only Firefox
		 */
		this.currentTarget = function() { return this.systemEvent.currentTarget; };
		this.eventPhase = function() { return this.systemEvent.eventPhase; };
		this.bubbles = function() { return this.systemEvent.bubbles; };
		this.cancelable = function() { return this.systemEvent.cancelable; };
		this.timeStamp = function() { return this.systemEvent.timeStamp; };
		this.stopPropagation = function() { return this.systemEvent.stopPropagation(); };
		this.preventDefault = function() { return this.systemEvent.preventDefault(); };
		this.initEvent = function() { return this.systemEvent.initEvent(); };
		this.view = function() { return this.systemEvent.view; };
		this.detail = function() { return this.systemEvent.detail; };
		this.initUIEvent = function() { return this.systemEvent.initUIEvent(); };
		this.metaKey = function() { return this.systemEvent.metaKey; };
		this.relatedTarget = function() { return this.systemEvent.relatedTarget; };
		this.initMouseEvent = function() { return this.systemEvent.initMouseEvent(); };
		this.getPreventDefault = function() { return this.systemEvent.getPreventDefault(); };
		this.layerX = function() { return this.systemEvent.layerX; };
		this.layerY = function() { return this.systemEvent.layerY; };
		this.pageX = function() { return this.systemEvent.pageX; };
		this.pageY = function() { return this.systemEvent.pageY; };
		this.rangeParent = function() { return this.systemEvent.rangeParent; };
		this.rangeOffset = function() { return this.systemEvent.rangeOffset; };
		this.isChar = function() { return this.systemEvent.isChar; };
		this.originalTarget = function() { return this.systemEvent.originalTarget; };
		this.explicitOriginalTarget = function() { return this.systemEvent.explicitOriginalTarget; };
		this.preventBubble = function() { return this.systemEvent.preventBubble(); };
		this.preventCapture = function() { return this.systemEvent.preventCapture(); };
		this.isTrusted = function() { return this.systemEvent.isTrusted; };
		this.CAPTURING_PHASE = function() { return this.systemEvent.CAPTURING_PHASE; };
		this.AT_TARGET = function() { return this.systemEvent.AT_TARGET; };
		this.BUBBLING_PHASE = function() { return this.systemEvent.BUBBLING_PHASE; };
		this.SCROLL_PAGE_UP = function() { return this.systemEvent.SCROLL_PAGE_UP; };
		this.SCROLL_PAGE_DOWN = function() { return this.systemEvent.SCROLL_PAGE_DOWN; };
		this.MOUSEDOWN = function() { return this.systemEvent.MOUSEDOWN; };
	}
	var eventArgs = Selchi.isIE() ? eventArgs_IE : eventArgs_gecko_opera_KHTML;
	function EventArgs(event) {
		eventArgs_common.call(this);
		eventArgs.call(this);
	}

	function Event() {
		this.listeners_ = [];
	}
	Event.prototype.add = function(listener) {
		if (typeof listener != 'function')
			throw new Error("Listener must be a function");
		this.listeners_.push(listener);
	};
	Event.prototype.remove = function(listener) {
		var list = this.listeners_,
			index = list.indexOf(listener);
		if (index == -1)
			throw new Error("Listener is not attached");
		for (var i=index, len=list.length-1; i<len; i++)
			list[i] = list[i+1];
		list.length--;
	};
	Event.prototype.fire = function() {
		var list = this.listeners_;
		for (var i=0, len=list.length; i<len; i++)
			list[i].apply(null, arguments);
	};

	function addListener(target, event, action, bubble) {
		function intermediate(eventObj) {
			return action.call(this, new EventArgs(eventObj));
		}
		bubble = bubble === undefined ? true : bubble;
		target.addEventListener(event, intermediate, bubble);
		return new EventHandler(target, event, action, intermediate, bubble);
	}
	function removeListener(handler) {
		handler.target.removeEventListener(
			handler.event, handler.handler, handler.bubble);
	}
	function attachEvent(target, event, action) {
		function intermediate() {
			var value = action.call(this, new EventArgs(window.event));
			if (typeof value != 'undefined')
				window.event.returnValue = value;
		}
		target.attachEvent('on' + event, intermediate);
		return new EventHandler(target, event, action, intermediate, null);
	}
	function deattachEvent(handler) {
		handler.target.attachEvent('on' + handler.event, handler.handler);
	}
	if (document.addEventListener) {
		Event.add = addListener;
		Event.remove = removeListener;
	} else if (document.attachEvent) {
		Event.add = attachEvent;
		Event.remove = deattachEvent;
	} else
		throw new Error("Unknown browser event management");

	/*
	 * Document Load behaviour
	 */
	Event.onReady = new Event();
	var onload = Event.add(document, 'load', function() {
		var interval = setInterval(function testLoad() {
			if (!document.body)
				return;
			clearInterval(interval);
			Event.onReady.fire();
		}, 1);
		Event.remove(onload);
	});

	return Event;
})();

