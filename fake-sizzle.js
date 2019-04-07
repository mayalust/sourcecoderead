/** Sizzle core **/
var tokenize, matchExpr, identifier, tokenCache, rcombinators,
  identifier = "(?:[\\w-]+)",
  whitespace = "(?:[ ]+)",
  rcombinators = new RegExp("^([ ]+)");
matchExpr = {
  "TAG" : new RegExp("^(" + identifier + ")", "g"),
  "CLASS" : new RegExp("^\\.(" + identifier + ")", "g"),
  "ID" : new RegExp("^\\#(" + identifier + ")", "g")
}
function Sizzle(selector, context){
  Sizzle.select(selector, context)
}
tokenCache = createCache();
function matcherFromGroupMatchers(elementMatchers){
  var i = 0, j, superMatcher = function(seed, context, results){
    var elems = seed,
      byElement = elementMatchers.length > 0,
    len = elems.length;
    for(; i !== len && (elem = elems[i]) != null; i++){
      j = 0;
      if( byElement && elem){
        while( (matcher = elementMatchers[j++]) ){
          if ( matcher( elem, context, false) ) {
            results.push( elem );
            break;
          }
        }
      }
    }
  }
  return superMatcher;
}
function compile(selector, match){
  var i,
    setMatchers = [],
    elementMatchers = [],
    cached;
  if( !cached ){
    i = match.length;
    while( i-- ){
      cached = matcherFromTokens( match[i] );
      elementMatchers.push( cached )
    }
    cached = matcherFromGroupMatchers(elementMatchers)
  }
  return cached;
}
function matcherFromTokens( tokens ){
  var matchers = [], marcher, leadingRelative, checkContext, len = tokens.length, matcher,
    matchContext = addCombinator(function(elem, context, xml){
      return elem === checkContext;
    }, Expr.relative[" "]);
  leadingRelative = Expr.relative[ tokens[0].type ];
  matchers = [function(elem, context, xml){
    checkContext = context;
    var ret = !leadingRelative || matchContext( elem, context, xml );
    checkContext = null;
    return ret;
  }];
  for(var i = 0; i < len; i++){
    if(match = Expr.relative[tokens[i].type] ){
      matchers = [ addCombinator(elementMatcher( matchers ), match) ];
    } else {
      matcher = Expr.filter[ tokens[i].type ].apply(null, tokens[i].matches);
      matchers.push(matcher)
    }
  }
  return elementMatcher( matchers );
}
function elementMatcher( matchers ){
  return matchers.length > 1 ? function(elem, context, xml){
    var i = matchers.length;
    while ( i-- ) {
      if ( !matchers[i]( elem, context, xml ) ) {
        return false;
      }
    }
    return true;
  } : matchers[0]
}
function addCombinator(matcher, combinator){
  var dir = combinator.dir;
  return function( elem, context, xml ){
    while( elem = elem[dir]){
      if( elem.nodeType === 1){
        if(matcher(elem, context, xml)){
          return true;
        }
      }
    }
    return false;
  }
}
function createCache(){
  var keys = [];
  function cache(key, value){
    keys.push(key + " ");
    return( cache[key + " "] = value );
  }
  return cache
}
tokenize = Sizzle.tokenize = function(selector){
  var soFar = selector, match, matched, tokens, groups=[];
  while (soFar){
    if(!matched){
      groups.push((tokens = []))
    }
    matched = false;
    if(match = rcombinators.exec(soFar)){
      matched = match.shift();
      tokens.push({
        value : matched,
        type : " "
      });
      soFar = soFar.slice( matched.length );
    }
    for(var type in Expr.filter){
      match = matchExpr[type].exec(soFar);
      if(match){
        matched = match.shift();
        tokens.push({
          value : matched,
          type : type,
          matches : match
        })
        soFar = soFar.slice( matched.length );
      }
    }
    if(!matched){
      break;
    }
  }
  return tokenCache( selector, groups ).slice( 0 );
}
Expr = Sizzle.selectors = {
  find : {
    "ID" : function(id, context){
      return [context.getElementById( id )];
    },
    "TAG" : function(tag, context){
      return context.getElementsByTagName( tag );
    },
    "CLASS" : function(cls, context){
      return context.getElementsByClassName( cls );
    }
  },
  relative : {
    " " : { dir : "parentNode"}
  },
  filter : {
    "TAG" : function(nodeName) {
      return function( elem ){
        return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
      }
    },
    "ID" : function(id) {
      return function( elem ){
        return elem.getAttribute("id") === id;
      }
    },
    "CLASS" : function(cls) {
      var pattern = new RegExp(cls, "g");
      return function( elem ){
        return pattern.test(elem.className);
      }
    }
  }
}
Sizzle.select = function(selector, context){
  var match = tokenize( selector ), i, seed, results = [],
    tokens = match[0] =  match[0].slice(0), token;
  i = tokens.length;
  while( i-- ){
    token = tokens[i];
    if(Expr.relative[ ( type = token.type) ]){
      break;
    };
    if( find = Expr.find[type] ){
      if(seed = find( token.matches[0], context )){
        tokens.splice( i, 1 );
        break;
      }
    }
  }
  compile(selector, match)(
    seed,
    context,
    results
  )
  return results;
}