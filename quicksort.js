/** 快速排序 **/
function quickSort( arr ){
  if( arr.length < 2 ){
    return arr;
  }
  let base = arr[0],
    left = arr.filter( ( d, i ) => i !== 0 && d < base ),
    right = arr.filter( ( d, i ) => i !== 0 && d >= base );
  return [ ...quickSort( left ), base, ...quickSort(right) ];
}

/** 选择排序 **/
function selectSort( arr ){
  for( let i = 0; i < arr.length - 1; i++ ){
    let min, minInx = i;
    for( let j = i; j < arr.length; j++){
      if( typeof min == "undefined" || arr[j] < min ){
        min = arr[j]
        minInx = j
      }
    }
    arr[ i ] = arr[ minInx ] + arr[ i ];
    arr[ minInx ] = arr[ i ] - arr[ minInx ];
    arr[ i ] = arr[ i ] - arr[ minInx ];

  }
  return arr;
}

function shellSort( arr ){
  for( let gap = Math.floor( arr.length / 2 ); gap > 0; gap = Math.floor( gap / 2 )){
    for( let i = 0; i < gap; i++ ){
      for( let j = i; j < arr.length; j += gap){
        if( arr[ j ] > arr[ i ] ){
          arr[ j ] = arr[ i ] + arr[ j ];
          arr[ i ] = arr[ j ] - arr[ i ];
          arr[ j ] = arr[ j ] - arr[ i ];
        }
      }
    }
  }
}

console.log(selectSort([65,42,71]));

/** 测试用例 **/
function test(fn){
  let randoms, clone;
  function generateRandom(){
    let rs = [];
    let len = Math.floor( Math.random() * 9 ) + 1;
    for( let i = 0; i < len; i++ ){
      rs.push(Math.floor(Math.random() * 100));
    }
    return rs;
  }
  function check( arr ){
    let start = arr[0], rest = arr.slice( 1 );
    for( let i = 0; i < rest.length; i++ ){
      if( rest[i] < start ){
        console.error("output :", arr.join(",") );
        return false;
      } else {
        start = rest[i];
      }
    }
    return true;
  }
  for(let i = 0; i < 100; i++ ){
    randoms = generateRandom();
    clone = randoms.slice();
    if( !check(fn(randoms))){
      console.error("input : ", clone.join(","));
    }
  }
  console.log("pass");
}

test( shellSort );
//test(quickSort);
//test(selectSort);