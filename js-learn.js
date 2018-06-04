/** 让A继承B */
function extendClass(a, b){
  function ext(a, b){
    for(var i in b){
      a[i] = b[i];
    }
  }
  function c(){
    b.apply(this, arguments);
    a.apply(this, arguments);
  }
  c.prototype = a.prototype
  ext(a.prototype, b.prototype);
  return c;
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