function parse( template ){
  var root, stack = [], currentParent;
  parseHTML(template, {
    start : function( tag, attrs ){
      var n = createASTElement( tag );
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
function createASTElement( tag ){
  return {
    type : 1,
    tag : tag
  }
}
function parseHTML( html, options ){
  var stack = [], lastTag, last, rest, index = 0, TAGStart = "^\\<\\s*(\\w+)(?:\\s+[^>]*)?", TAGEnd = "^\\>", EndTag = "^\\<\\/\\s*([^\\s<>\\\\][^<>\\\\]*)\\s*\\>";
  function advance(){
    html = html.slice( index );
  }
  function parseStartTag(){
    var startTag = new RegExp( TAGStart ).exec( html ),
      match = {
        tagName : startTag[1]
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
    options.start( match.tagName )
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