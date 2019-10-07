function parse( template ){
  var root, stack = [], currentParent;
  parseHTML(template, {
    start : function( tag, attrs ){
      var n = createASTElement( tag, attrs );
      if( !root ){
        root = n;
      }
      if( currentParent ){
        currentParent.children = currentParent.children || [];
        currentParent.children.push( n );
      }
      currentParent = n;
      stack.push( currentParent );
    },
    chars : function( text ){
      if( currentParent ){
        var rs = parseText( text );
        currentParent.children = currentParent.children || [];
        currentParent.children.push({
          type : 3,
          expression : rs.expression,
          text : text
        });
      }
    },
    end : function( tag ){
      stack.pop();
      currentParent = stack[ stack.length - 1 ];
    }
  });
  return root;
}
function parseText( str ){
  var match = /\{\{([^\{\}]+)\}\}/g.exec( str );
  return {
    expression : match ? match[1].trim() : ""
  }
}
function createASTElement( tag, attrs ){
  return {
    type : 1,
    tag : tag,
    attrs : attrs
  }
}
function parseHTML( html, options ){
  var stack = [], lastTag, last, rest, index = 0, TAGStart = "^\\<\\s*(\\w+)(?:\\s+([^>]*))?", TAGEnd = "^\\>", EndTag = "^\\<\\/\\s*([^\\s<>\\\\][^<>\\\\]*)\\s*\\>";
  function advance(){
    html = html.slice( index );
  }
  function getAttrs( attrs ){
    if( typeof attrs == "undefined" ){
      return {};
    }
    return attrs.split(/\s+/)
      .filter( function( n ){ return n } )
      .reduce(function(a,b){
      var match = /^([^=]+)=(.*)$/g.exec( b ),
       attrName = match[1],
        fn = new Function( "return " + match[2] );
      a[attrName] = fn();
      return a;
    }, {});
  }
  function parseStartTag(){
    var startTag = new RegExp( TAGStart ).exec( html ),
      attrs = getAttrs( startTag[2] ),
      match = {
        tagName : startTag[1],
        attrs : attrs
      };
    index = startTag[0].length;
    advance();
    var a = html.match( new RegExp( TAGEnd ) );
    index = a[0].length;
    advance();
    stack.push( match );
    return match;
  }
  function handleStartTag( match ){

    options.start( match.tagName, match.attrs )
  }
  function handleEndTag(){
    var match = new RegExp( EndTag ).exec( html ),
      tag = match[1];
    index = match[0].length;
    options.end( tag );
    advance();
  }
  var inx = 0;
  while( html ){
    if(html[0] == "<"){
      if(new RegExp( TAGStart ).test(html)){
        var startTag = parseStartTag()
        handleStartTag( startTag );
        continue;
      }
      if(new RegExp( EndTag ).test(html)){
        handleEndTag( html );
        continue;
      }
    }
    var index = html.indexOf("<");
    if(index == -1){
      break;
    }
    options.chars(html.slice( 0, index ));
    inx++;
    advance();
  }
}