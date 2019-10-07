var Vuex = {};
var prototypeAccessors = {
  state : {
    configurable : true,
    get : function(){
      return this._vm._data.$$state
    }
  }
}
function installModule( store, rootState, path, modules ){
  modules.forEachGetter(function( getter, key ){
    registerGetter( store, key, getter );
  });
  modules.forEachMutation(function( getter, key ){
    registerMutation( store, key, getter );
  });
  modules.forEachAction(function( getter, key ){
    registerAction( store, key, getter );
  })
}
function ModuleCollection( options ){
  this.register( [], options );
}
function registerAction( store, key, getter ){
  var entry = store._actions[key] || ( store._actions[key] = [] );
  entry.push(function(){
    return getter.call( store, store );
  })
}
function registerGetter( store, key, getter ){
  store._wrappedGetters[key] = function(){
    return getter.call( store, store.state );
  };
}
function registerMutation( store, key, handler ){
  var entry = store._mutations[key] || ( store._mutations[key] = [] );
  entry.push( function( val ) {
    handler.call( store, store.state, val );
  })
}
ModuleCollection.prototype.register = function( path, rawModule ){
  this.root = new Module( rawModule );
}
function Module( rawModule ){
  this._rawModule = rawModule;
  var rawState = rawModule.state;
  this.state = rawState;
}
Module.prototype.forEachGetter = function( fn ){
  if( this._rawModule ){
    for( var i in this._rawModule.getters ){
      fn( this._rawModule.getters[i], i );
    }
  }
}
Module.prototype.forEachMutation = function( fn ){
  if( this._rawModule ){
    for( var i in this._rawModule.mutations ){
      fn( this._rawModule.mutations[i], i );
    }
  }
}
Module.prototype.forEachAction = function( fn ){
  if( this._rawModule ){
    for( var i in this._rawModule.actions ){
      fn( this._rawModule.actions[i], i );
    }
  }
}
function resetStoreVM( store, state ){
  var wrappedGetters = store._wrappedGetters, computed = {};
  for( var i in wrappedGetters ){
    computed[ i ] = wrappedGetters[i];
    Object.defineProperty(store.getters, i, {
      get : function(){
        return store._vm[ i ];
      }
    });
  }
  store._vm = new Vue({
    data : function(){
      return {
        $$state : state
      }
    },
    computed : computed
  })
}
Store = function Store( options ){
  this._modules = new ModuleCollection( options );
  var state = this._modules.root.state;
  this._wrappedGetters = {};
  this._mutations = {};
  this._actions = {};
  this.getters = {};
  installModule( this, state, [], this._modules.root );
  resetStoreVM( this, state, this._modules.root );
}
Store.prototype.commit = function( key, value ){
  var entrys = this._mutations[ key ];
  for(var i = 0; i < entrys.length; i++ ){
    entrys[i]( value );
  }
}
Store.prototype.dispatch = function( key ){
  var entrys = this._actions[ key ];
  return Promise.all(entrys.map(function( entry ){
    return entry.call( store, store );
  }))
}

Object.defineProperties( Store.prototype, prototypeAccessors );
Vuex.Store = Store;