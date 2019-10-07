function Vuex(){

}
var prototypeAccessors = {
  state : {
    configurable : true,
    get : function(){
      return this._vm._data.$$state
    }
  }
}
function resetStoreVM( store, state ){
  store._vm = new Vue({
    data : function(){
      return {
        $$state : state
      }
    },
    computed : {}
  })
}
Store = function Store( options ){
  var state = options.state;
  resetStoreVM( this, state )
}
Store.prototype.commit = function(){

}

Object.defineProperties( Store.prototype, prototypeAccessors );

Vuex.Store = Store;