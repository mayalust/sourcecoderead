var cid = 0;
var activeInstance;
function setActiveInstance( vm ){
  var previousActiveInstance = activeInstance;
  activeInstance = vm;
  return function(){
    activeInstance = previousActiveInstance;
  }
}
function isArray( arr ){
  return {}.toString.call( arr ) === "[object Array]";
}
function Vue( options ){
  this._init( options );
};
function callHook( vm, hook ){
  var handlers = vm.$options[hook];
}
function getOuterHTML( el ){
  var outer = document.createElement("div");
  outer.appendChild( el.cloneNode( true ) );
  return outer.innerHTML;
}
function resolveAssert(obj, key, value){
  return obj[key] && obj[key][value];
}
function createComponent( vm, c, data){
  var Ctor = vm.$options._base;
  data = data || {};
  Ctor = Ctor.extend(c || {});
  installComponentHooks( data );
  return new VNode( undefined, "vue-component-" + Ctor.cid, data, undefined, undefined, undefined, {
    Ctor : Ctor
  });
}
function mergeOptions( ){
  var rs = {}, args = [].slice.call( arguments ),
    len = args.length ;
  while( len-- > -1 ){
    for(var i in args[len] ){
      rs[i] = args[len][i]
    }
  }
  return rs;
}
function createElement( vm, tag, data, children ){
  var c;
  if( typeof tag === "string" ){
    if( c = resolveAssert(vm.$options, "components", tag )){
      return createComponent( vm, c, data);
    } else {
      if( isArray( data ) ){
        children = data;
        data = {};
      }
      return new VNode( vm, tag, data, "", children );
    }
  }
}
function createText( vm, text ){
  return new VNode( vm, undefined, {}, text);
}
function initLifecycle( vm ){
  var parent = vm.$options.parent;
  if( parent ){
    parent.$children.push( vm );
  }
  vm.$refs = {};
  vm.$children = [];
  vm.parent = parent;
  vm.$root = parent ? parent.$root : vm
}
function initState( vm ){
  vm._watchers = [];
  var ops = vm.$options;
  if( ops.data ){
    initData( vm );
  }
}
function getData( vm, data ){
  return data.call( vm, vm );
}
function initData( vm ){
  var data = vm.$options.data;
  var computed = vm.$options.computed;
  if(typeof data === "function"){
    data = getData( vm, data );
  }
  vm._data = data;
  for( var i in data ){
    (function(inx){
      Object.defineProperty(vm, inx, {
        get : function(){
          return this["_data"][inx];
        },
        set : function( val ){
          this["_data"][inx] = val;
          
        }
      })
    })(i);
  }
  if ( computed ) {
    initComputed(vm, computed);
  }
  observe( data );
}
function initComputed( vm, computed ){
  var watchers = vm._computedWatchers = Object.create(null);
  for( var i in computed ){
    var userDef = computed[i];
    watchers[ i ] = new Watcher( vm, userDef, null, {
      lazy : true
    });
    defineComputed( vm, i, userDef );
  }

}
function defineComputed( vm, key, cb){
  Object.defineProperty( vm, key, {
    get : function(){
      var watcher = vm._computedWatchers[key];
      if( watcher ){
        if( watcher.dirty ){
          watcher.evaluate();
        }
        if( Dep.target ){
          watcher.depend();
        }
      }
      return watcher.value;
    }
  })
}
function initRender( vm ){
  vm._c = function( tag, data, children ){
    return createElement( vm, tag, data, children );
  }
  vm._v = function( text ){
    return createText( vm, text );
  }
  vm._s = function toString( obj ){
    if( typeof obj === "undefined" || obj === null ){
      return "";
    }
    return obj + "";
  }
  vm.$createElement = function( tag, data, children ){
    return createElement( vm, tag, data, children );
  }
}
function mountComponent( vm ){
  
  var updateComponent = function(){
    vm._update(vm._render())
  };
  new Watcher(vm, updateComponent);
  
  return vm;
}
function createCompileToFunctionFn( compile ){
  return function( template ){
    var compiled = compile( template );
    var res = {};
    res.render = createFunction( compiled.render );
    return res;
  }
}
function createFunction( expression ){
  return new Function( expression );
}
function createCompilerCreator( baseCompile ){
  return function(option){
    function compile(template){
      var compiled = baseCompile(template);
      return compiled;
    }
    return {
      compileToFunction : createCompileToFunctionFn(compile)
    }
  }
}
function generate( ast ){
  var code = genElement( ast );
  return {
    render : "with(this){ return " + code + "}"
  }
}
function genAttrs( el ){
  var rs = {};
  rs.attrs = el.attrs || {};
  return JSON.stringify( rs );
}
function genElement( el ){
  var children = getChildren( el );
  var code = "_c('" + el.tag + "', " + genAttrs( el ) + ", [" + children + "])";
  return code;
}
function getChildren( el ){
  var children = el.children || [];
  if( children.length ){
    return children.map(function( el ) {
      return genNode( el );
    })
  } else {
    return "";
  }
}
function genText( el ){
  return "_v(_s(" + el.expression + "))";
}
function genNode( el ){
  if( el.type == 1 ){
    return genElement( el );
  } else if( el.type == 3){
    return genText( el )
  }
}
function registerRef( vnode, key ){
  var vm = vnode.context;
  var ref = vnode.componentInstance || vnode.elm;
  vm.$refs[ key ] = ref;
}
var ref = {
  create : function( vnode, data ){
    if( data.attrs && data.attrs.ref ){
      registerRef( vnode, data.attrs.ref );
    }
  }
}
var module = {
  ref : ref
}
var patch = createPatch( module );
function createPatch( backend ){
  var cbs = {};
  for( var i in backend ){
    for(var j in backend[i]){
      cbs[j] = cbs[j] || [];
      cbs[j].push(backend[i][j]);
    }
  }
  function createChildren( vnode, children ){
    for(var i = 0; i < children.length; i++ ){
      createElm( children[i], [], vnode.elm )
    }
  }
  function insert( parent, elm, ref ){
    if( parent ){
      if( ref ){
        parent.insertBefore( elm, ref );
      } else {
        parent.appendChild( elm );
      }
    }
  }
  function createElm( vnode, queue, parentElm, refElm){
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children;
    if(createComponent( vnode, parentElm )){
      return;
    }
    if( tag ){
      vnode.elm = document.createElement( tag );
    } else {
      vnode.elm = document.createTextNode( vnode.innerText );
    }
    if( children ){
      createChildren( vnode, children );
    }
    for( var i in cbs["create"] ){
      cbs["create"][i]( vnode, data );
    }
    if( parentElm ){
      insert(parentElm, vnode.elm, refElm);
    }
  }
  function initComponent( vnode ){
    vnode.elm = vnode.componentInstance.$el;
  }
  function createComponent( vnode, parentElm, refElm ){
    var i = vnode.data || {};
    if( i["hooks"] && i["hooks"]["init"]){
      i["hooks"]["init"]( vnode );
    }
    if( vnode.componentInstance) {
      initComponent( vnode );
      insert( parentElm, vnode.elm, refElm );
      return true;
    }
  }
  function creatEmptyNode( el ){
    return new VNode(undefined, undefined, undefined, undefined, undefined, el);
  }
  function removeVnodes( parentElm, nodes ){
    parentElm.removeChild( nodes[0].elm );
  }
  function isRealNode( node ){
    return !( node instanceof VNode );
  }
  return function patch( oldNode, vnode ){
    if( typeof oldNode === "undefined" ){
      createElm( vnode, [] );
    } else {
      var isReal = isRealNode( oldNode );
      if( isReal ){
        oldNode = creatEmptyNode(oldNode);
      }

      var parenrNode = oldNode.elm.parentNode;
      var refElm = oldNode.elm.nextSibling;
      createElm( vnode, [], parenrNode, refElm );
      removeVnodes(parenrNode, [oldNode], 0, 0);
    }
    return vnode;
  }
}

function initEvents( vm ){
  vm._events = Object.create(null);
}

function resolveConstructorOptions( Ctor ){
  var options = Ctor.options;
  return options;
}

function createComponentInstanceForVnode( vnode, parent ){
  var Ctor = vnode.componentOptions.Ctor,
    options = {
      isComponent : true,
      _parentVnode : vnode,
      parent : parent
    }
  return new Ctor( options );
}

var createCompile = createCompilerCreator(function baseCompile( template ){
  var ast = parse( template );
  var code = generate( ast );
  return {
    ast : ast,
    render : code.render
  };
});
var ref$1 = createCompile({});
var compileToFunctions = ref$1.compileToFunction;
var componentVNodeHooks = {
  init : function( vnode ){
    var child = vnode.componentInstance = createComponentInstanceForVnode( vnode, activeInstance )
    child.$mount( vnode.elm );
  }
}
function installComponentHooks(data){
  data.hooks = componentVNodeHooks;
}
Vue.prototype._init = function( options ){
  var vm = this;
  vm.cid = cid++;
  vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor),  options );
  initLifecycle( vm );
  initRender( vm );
  initEvents( vm );
  callHook( vm, "beforeCreated");
  initState( vm );
  callHook(vm, "created");
};
Vue.prototype._update = function( vnode ){
  var vm = this;
  var el = this.$el;
  var resetActiveInstance = setActiveInstance( vm );
  this.__patch__( el, vnode );
  resetActiveInstance();
};
Vue.prototype._render = function(){
  return this.$options.render.call( this );
};
Vue.prototype.__patch__ = function( oldVnode, vnode ){
  this.vnode = patch( oldVnode, vnode );
  this.$el = this.vnode.elm;
}
Vue.prototype.$mount = function( el ){
  var template;
  var vm = this;
  var ops = vm.$options;
  if( el ){
    template = getOuterHTML( el );
    vm.$el = el;
  } else {
    template = ops.template
  }
  var ref = compileToFunctions( template );
  vm.$options.render = ref.render;
  return mountComponent( this );
}
Vue.extend = function( extendOptions ){
  var Super = this;
  var Sub = function VueComponent( options ){
    this._init( options );
  }
  Sub.prototype = Object.create( Super.prototype );
  Sub.prototype.constructor = Sub;
  Sub.options = mergeOptions( Super.options, extendOptions );
  return Sub;
};
function VNode( vm, tag, data, innerText, children, elm, componentOptions) {
  this.context = vm;
  this.tag = tag;
  this.data = data;
  this.innerText = innerText;
  this.children = children;
  this.elm = elm;
  this.componentOptions = componentOptions;
}
function eventsMixin(Vue){
  Vue.prototype.$on = function(event, handler){
    this._events[event] = this._events[event] || [];
    this._events[event].push( handler );
  }
  Vue.prototype.$emit = function(event){
    var cbs = this._events[event] || [];
    var args = [].slice.call( arguments );
    args = args.slice(1);
    for(var i = 0; i < cbs.length; i++ ){
      cbs[i].apply( this, args );
    }
  }
  Vue.prototype.$off = function(event, handler){

  }
}
Vue.options = Object.create( null );
function initGlobalAPI( Vue ){
  Vue.options._base = Vue;
}

initGlobalAPI( Vue );
eventsMixin( Vue );