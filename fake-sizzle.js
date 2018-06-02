var require,
  req,
  define,
  hasOwnProp = Object.prototype.hasOwnProperty,
  toString = Object.prototype.toString,
  globalDefQueue = [],
  defQueue = [],
  contexts = {},
  registry = {},
  defaultContextName = "_";
function each(arr, callback){
  var i, length = isArray(arr) ? arr.length : 0;
  for(i = 0; i < length; i++){
    callback(arr[i], i, arr);
  }
}
function bind(target, fn){
  return function(){
    fn.apply(target, arguments)
  }
}
function hasOwn(obj, attr){
  return hasOwnProp.call(obj, attr);
}
function getOwn(obj, attr){
  return hasOwn(obj, attr) && obj[attr];
}
function isArray(obj){
  return toString.call(obj) === "[object Array]";
}
function isFunction(obj){
  return toString.call(obj) === "[object Function]";
}
function takeGlobalQueue(){
  each(globalDefQueue, function(item){
    defQueue.push(item);
  });
  globalDefQueue = [];
}
function intakeDefines(){
  takeGlobalQueue();
}
function newContext(contentName){
  var Module, context;
  Module = function(map){
    this.exports = {};
    this.defined = false;
    this.map = map;
    this.events = {};
    this.depMaps = [];
    this.defineMaps = [];
    this.depCount = 0;
  }
  function makeModuleMap(name){
    if(!name){
      name = "_@r"
    }
    return {
      id : name,
      name : name,
      url : name
    }
  }
  function getScriptData(evt){
    var node = evt.currentTarget;
    return {
      node: node,
      id: node && node.getAttribute('data-requiremodule')
    };
  }
  function callGetModule(args){
    var name = args[0];
    var map = makeModuleMap(name);
    var mod = getModule(map);
    mod.init(map, args[1]);
  }
  function getModule(defMap){
    var id = defMap.id,
      mod = getOwn(registry, id)
    if(!mod){
      mod = registry[id] = new context.Module(defMap)
    };
    return mod;
  }
  function on(map, eventname, callback){
    var mod = getModule(map);
    mod.on(eventname, callback);
  };
  Module.prototype = {
    init : function(depMaps, callback, option){
      this.factory = callback;
      this.inited = true;
      this.depMaps = depMaps;
      this.depExports = [];
      if(option && option.enable){
        this.enable();
      } else {
        this.check();
      }
    },
    on : function(eventname, callback){
      this.events[eventname] = this.events[eventname] || [];
      this.events[eventname].push(callback);
    },
    emit : function(eventname, data){
      each(this.events[eventname], function(cb){
        cb(data);
      })
    },
    defineDep : function(i, depExports){
      this.depExports[i] = depExports;
      this.depCount--;
    },
    fetch : function(){
      this.load();
    },
    check : function(){
      var id = this.map.id,
        factory = this.factory,
        depExports = this.depExports,
        exports = this.exports;
      if(!this.inited){
        this.fetch();
      } else if(!this.defining){
        if(this.depCount < 1){
          if(isFunction(factory)){
            exports = context.execCb(id, factory, exports, depExports);
          }
          this.exports = exports;
          this.defined = true;
        }
      };
      if(this.defined){
        this.emit("defined", this.exports);
      }
    },
    enable : function(){
      this.enabled = true;
      var depMaps = this.depMaps;
      each(depMaps, bind(this, function(e, i){
        var map = makeModuleMap(e);
        this.defineMaps[i] = map;
        this.depCount += 1;
        on(map, "defined", bind(this, function(d){
          this.defineDep(i, d);
          this.check();
        }));
        context.enable(map, this);
      }));
      this.check();
    },
    load : function(){
      context.load(this.map.id, this.map.url);
    }
  }
  context = {
    enable : function(depMap){
      var id = depMap.id;
      var mod = getOwn(registry, id);
      if(mod){
        getModule(depMap).enable();
      }
    },
    nextTick : function(fn){
      setTimeout ? setTimeout(fn, 4) : function(){
        fn();
      }
    },
    makeRequire : function(options){
      options = options || {};
      function localRequire(deps, callback){
        context.nextTick(function(){
          var module = getModule(makeModuleMap())
          module.init(deps, callback, {
            enable : true
          });
        })
      }
      return localRequire;
    },
    onScriptLoad : function(evt){
      var data = getScriptData(evt);
      context.completeLoad(data.id);
    },
    load : function(id, url){
      req.load(context, id, url);
    },
    execCb : function(id, factory, exports, args){
      return factory.apply(exports, args);
    },
    completeLoad : function(id){
      takeGlobalQueue();
      while(defQueue.length){
        args = defQueue.shift();
        if(args[0] == null) {
          args[0] = id;
        }
      }
      callGetModule(args);
    },
    Module : Module
  }
  context.require = context.makeRequire();
  return context;
}
req = require = function(deps, callback, errback){
  var context = contexts.defaultContextName;
  if(!context){
    context = require.s.newContext()
  };
  return context.require(deps, callback, errback);
}
req.createNode = function(){
  var node = document.createElement('script');
  node.type = 'text/javascript';
  node.charset = 'utf-8';
  node.async = true;
  return node;
}
req.load = function(context, id, url){
  var node = req.createNode(url),
   head = document.getElementsByTagName('head')[0];
  node.setAttribute('data-requiremodule', id);
  node.addEventListener('load', context.onScriptLoad, false);
  node.src = url;
  head.appendChild(node);
}
req.config = function(){

}
require.s = {
  contexts : contexts,
  newContext : newContext
}
define = function(name, callback){
  if(isFunction(name)){
    callback = name;
    name = null;
  }
  globalDefQueue.push([name, callback]);
}