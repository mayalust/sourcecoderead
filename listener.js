var uid = 0, queue = [];
function pushTarget( target ){
  queue.push( target );
  Dep.target = target;
}
function popTarget(){
  queue.pop();
  Dep.target = queue[queue.length - 1];
}
function Dep(){
  this.id = uid++;
  this.subs = [];
}
function observe( value ){
  var ob;
  ob = new Observer(value);
  return ob;
}
function Observer( value ){
  this.dep = new Dep();
  this.value = value;
  Object.defineProperty(value, "__ob__", {
    value : this
  });
  this.walk();
}
Observer.prototype.walk = function(){
  for( var i in this.value ){
    defineReactive( this.value, i );
  }
}
Dep.prototype.addDep = function( watcher ){
  this.subs.push( watcher )
}
Dep.prototype.depend = function(){
  if( Dep.target ) {
    Dep.target.addDep( this );
  }
}
Dep.prototype.notify = function(){
  for(var i = 0; i < this.subs.length; i++){
    this.subs[i].get();
  }
}
var wid = 0
function Watcher( vm, getter, cb, options ){
  if( options ){
    this.lazy = !!options.lazy;
  } else {
    this.lazy = false;
  }
  this.wid = wid++;
  this.vm = vm;
  this.getter = getter;
  this.cb = cb;
  this.dirty = this.lazy;
  this.depIds = [];
  vm._watchers.push( this );
  this.value = this.lazy ? undefined : this.get();
}

Watcher.prototype.addDep = function( dep ){
  if( this.depIds.indexOf( dep.id ) == -1 ){
    this.depIds.push( dep.id );
    dep.subs.push( this );
  }
}
Watcher.prototype.get = function(){
  pushTarget( this );
  var getter = this.getter;
  var vm = this.vm;
  var value = getter.call( vm, vm );
  popTarget();
  return value;
}
Watcher.prototype.evaluate = function(){
  this.value = this.get();
  this.dirty = false;
}
Watcher.prototype.update = function(){
  var value = this.get();
  this.oldValue = this.value;
  this.value = value;
  var cb = this.cb;
  cb.call( this.vm, value, this.oldValue );
}
Watcher.prototype.depend = function(){

}

function defineReactive( obj, key ){
  var dep = new Dep(),
    val = obj[key];
  Object.defineProperty(obj, key, {
    get : function(){
      if( Dep.target ){
        dep.depend();
      }
      return val;
    },
    set : function( v ){
      val = v;
      dep.notify();
    }
  })
}