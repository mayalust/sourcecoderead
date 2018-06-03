var tokenize;
function Sizzle(selector, context){
  Sizzle.select(selector, context)
}
tokenize = Sizzle.tokenize = function(selector){

}
Expr = Sizzle.selectors = {
  relative : {
    " " : { dir : "parentNode"}
  },
  filter : function(){
    "TAG" : function(nodeName) {
      return function( elem ){
        return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
      }
    },
    "CLASS" : function(cls) {
      var pattern = new RegExp(cls, "g");
      return function( elem ){
        return pattern.test(elem.className);
      }
    },
    "TAG" : function(nodeName) {
      return function( elem ){
        return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
      }
    }
  }
}
Sizzle.select = function(selector, context){
  var match = tokenize( selector );
}
