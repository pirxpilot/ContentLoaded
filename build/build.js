
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("domready/index.js", Function("exports, require, module",
"/*\n\
 *\n\
 * Original Author: Diego Perini (diego.perini at gmail.com)\n\
 * Summary: cross-browser wrapper for DOMContentLoaded\n\
 *\n\
 */\n\
\n\
function contentLoaded(fn) {\n\
\n\
\tvar done = false,\n\
\t\ttop = true,\n\
\t\twin = window,\n\
\t\tdoc = document,\n\
\t\troot = doc.documentElement,\n\
\n\
\tadd = doc.addEventListener ? 'addEventListener' : 'attachEvent',\n\
\trem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',\n\
\tpre = doc.addEventListener ? '' : 'on',\n\
\n\
\tinit = function(e) {\n\
\t\tif (e.type == 'readystatechange' && doc.readyState != 'complete') return;\n\
\t\t(e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);\n\
\t\tif (!done && (done = true)) fn.call(win, e.type || e);\n\
\t},\n\
\n\
\tpoll = function() {\n\
\t\ttry { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }\n\
\t\tinit('poll');\n\
\t};\n\
\n\
\tif (doc.readyState == 'complete') fn.call(win, 'lazy');\n\
\telse {\n\
\t\tif (doc.createEventObject && root.doScroll) {\n\
\t\t\ttry { top = !win.frameElement; } catch(e) { }\n\
\t\t\tif (top) poll();\n\
\t\t}\n\
\t\tdoc[add](pre + 'DOMContentLoaded', init, false);\n\
\t\tdoc[add](pre + 'readystatechange', init, false);\n\
\t\twin[add](pre + 'load', init, false);\n\
\t}\n\
\n\
}\n\
\n\
module.exports = contentLoaded;//@ sourceURL=domready/index.js"
));
require.alias("domready/index.js", "domready/index.js");