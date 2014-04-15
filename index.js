/*
 *
 * Original Author: Diego Perini (diego.perini at gmail.com)
 * Summary: cross-browser wrapper for DOMContentLoaded
 *
 */

var events = require('event');

module.exports = domready;


function bind(init) {
	events.bind(document, 'DOMContentLoaded', init);
	events.bind(document, 'readystatechange', init);
	events.bind(window, 'load', init);
}

function unbind(init) {
	events.unbind(document, 'DOMContentLoaded', init);
	events.unbind(document, 'readystatechange', init);
	events.unbind(window, 'load', init);
}

function domready(fn) {
	var done = false,
		top = true,
		root = document.documentElement;

	function init(e) {
		if (e.type == 'readystatechange' && document.readyState != 'complete') return;
		unbind(init);
		if (!done) {
			done = true;
			fn(e.type || e);
		}
	}

	function poll() {
		try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
		init('poll');
	}

	if (done || document.readyState == 'complete') {
		return fn('lazy');
	}

	if (document.createEventObject && root.doScroll) {
		try { top = !window.frameElement; } catch(e) { }
		if (top) poll();
	}
	bind(init);
}
