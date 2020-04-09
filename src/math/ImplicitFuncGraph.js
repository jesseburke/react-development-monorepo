
//
// func is a function of two variables

export default function ImplicitFuncGraph({ func, bounds, approxH, c = 0 }) {

    const {xMin, xMax, yMin, yMax} = bounds;

    const w = Math.floor((xMax-xMin)/approxH);
    const h = Math.floor((yMax-yMin)/approxH);

    let compArray = [];
    
    let ptArray = [];    

    for( let i = 0; i <= Math.floor( (xMax - xMin)/approxH); i++ ) {

	for( let j = 0; j <= Math.floor( (yMax - yMin)/approxH); j++ ) {

	    ptArray.push( func(i*approxH + xMin, j*approxH + yMin) - c );

	}	
    }

    let ul, ur, ll, lr, sqValue, sqArray = [];
    
    for( let a = 0; a < h; a++ ) {

	for( let b = 0; b < w; b++ ) {

	    sqValue = 0;
	    // square vertices are valued 1, 2, 3, 4, starting in upper left and going cc.
	    // assign a value to the square based on whether ptArray is positive or negative
	    // at its four vertices
	    //
	    // this value will give the square type

	    // upper left
	    sqValue += (ptArray[a*(w+1)+b] >= 0) ? 1 : 0;
	    // lower left
	    sqValue += (ptArray[(a+1)*(w+1)+b] >= 0) ? 2 : 0;
	    // lower right
	    sqValue += (ptArray[(a+1)*(w+1)+(b+1)] >= 0) ? 4 : 0;
	     // upper right
	    sqValue += (ptArray[a*(w+1)+(b+1)] >= 0) ? 8 : 0;

	    sqArray[a*w + b] = sqValue;
	}
    }

    let visitedArray = sqArray.slice();
    let comp;

    for( let i = 0; i < sqArray.length; i++ ) {

	// check whether have already visited (=-1), or
	// have a square with no line through it (=0 or 15)
	//
	if( visitedArray[i] <= 0 || visitedArray[i] === 15)
	    continue;

	comp = constructComp( sqArray, i );
	compArray.push(comp);
	
    }

    return compArray;
    
}

function constructComp( sqArray, initialSq ) {

    const initialSide = oneSide( initialSq );

    let ns = nextSide( initialSq, initialSide );

    let pointArray = [], visitedList = [];

    while( ns >= 0 ) {
	
	
    }    

}

export function borderingSquare( sqNum, side ) {

    switch (side) {

    case 'l':
	if( (sqNum % 4) > 0 ) {
	    return sqNum - 1;
	}
	return -1;
	break;

    case 'r':
	if( (sqNum % 4) < 3 ) {
	    return sqNum + 1;
	}
	return -1;
	break;
	
    case 't':
	if( sqNum > 3 ) {
	    return sqNum - 4;
	}
	return -1;
	break;

    case 'b':
	if( sqNum < 12 ) {
	    return sqNum + 4;
	}
	return -1;
	break;	
    }

    return -1;
    
}

// test
//
// console.log( borderingSquare( 2, 'l' ) ); // 1
// console.log( borderingSquare( 2, 'b' ) ); // 6
// console.log( borderingSquare( 2, 'r' ) ); // 3
// console.log( borderingSquare( 2, 't' ) ); // -1


const sideArray = [
    [], [['l','t']], [['l','b']], [['t','b']],
    [['b','r']], [['l','t'],['b','r']], [['l','r']], [['t','r']],
    [['t','r']], [['l','r']], [['l','b'], ['t','r']], [['b','r']],
    [['t','b']], [['l','b']], [['l','t']], []
];

export function nextSide( sqNum, side ) {

    let t = -1;

    sideArray[sqNum].forEach( s => {

	if( s[0] === side ) t = s[1];

	else if( s[1] === side ) t = s[0];
    });

    return t;        
}

// test:
//
// console.log( nextSide( 0, 'l' ) ) = -1;
// console.log( nextSide( 1, 'l' ) ) = t;
// console.log( nextSide( 2, 'l' ) ) = b;


// returns one side that has a line to it, given a square number
function oneSide( sqNum ) {

    if( ((sqNum % 4) === 1 ) || ((sqNum % 4) === 2 ) )
	return 'l';

    else if( (Math.floor(sqNum / 4) === 1 ) || (Math.floor(sqNum / 4) === 2 ) )
	return 'r';
    
    else if( (sqNum === 12) || (sqNum === 3) )
	return 't';

    return -1;	
}

