/** 让A继承B */
function extendClass(a, b){
  var proto = Object.create(null, b.prototype);
  proto.constructor = b;
  a.prototype = proto;
  a.super = b;
  return a;
}
/** 让A继承B */

/** ES6 Promise */
function _promise(fn){
  this.state = 0;
  function resolve(d){
    this.state = 1;
    this.resolveFn && this.resolveFn(d);
  }
  function reject(e){
    this.state = 2;
    this.rejectFn && this.resolveFn(d);
  }
  fn(resolve, reject);
}
_promise.pototype.then = function(fn){
  this.resolveFn = fn;
}
_promise.prototype.catch = function(fn){
  this.rejectFn = fn;
}
_promise.all = function(promises, callback){
  var i = 0;
  var result = [];
  function each(callback){
    for(;i < promises.length; i++){
      callback(promises[i], i);
    }
  }
  each(function(promise){
    promise.then(function(d){
      result.push(d);
      result.length == promises.length && callback && callback(result);
    })
  });
}
/** ES6 Promise */