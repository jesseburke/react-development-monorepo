
const squareBounds = (quadSize) => ({ xMin: -quadSize,
				      xMax: quadSize,
				      yMin: -quadSize,
				      yMax: quadSize });


//
// func is a function of two variables
// bounds = {xMin, xMax, yMin, yMax}
// approxH is the grid size
// g is the value of the level curve
// sideLengthPx is the size of the canvas in pixels

export default function ImplicitFuncGraph({ func, bounds, approxH, g = 0, sideLengthPx = 1024 }) {

    let {xMin, xMax, yMin, yMax} = bounds;   
    
    let xRange = xMax - xMin;
    let yRange = yMax - yMin;
    let range = xRange;
    
    if( xRange > yRange ) {

	range = yRange;
	const delta = (xRange - yRange)/2;
	xMin = xMin + delta;
	xMax = xMax - delta;
    }

    else if( yRange > xRange ) {

	range = xRange;
	const delta = (yRange - xRange)/2;
	yMin = yMin + delta;
	yMax = yMax - delta;	
    }  
    
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.canvas.width = sideLengthPx;
    ctx.canvas.height = sideLengthPx;

    // gray background
    ctx.fillStyle = '#AAA';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineJoin = 'round';

    // changes canvas coordinates to bounds coordinates passed in
    ctx.translate(0, ctx.canvas.height);
    ctx.scale(1, -1);
    ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);
    ctx.scale(sideLengthPx/range,sideLengthPx/range);
    ctx.lineWidth = .05;

    //------------------------------------------------------------------------
    //
    // draw curve
    //
    
    const gridSize = approxH;

    // square numbers are from https://en.wikipedia.org/w/index.php?title=Marching_squares&oldid=933213691
    let drawFuncArray = [], t, s;

    // assumes that b < 0 < a
    const percHelp = (a,b) => a/(a-b);

    drawFuncArray[0] = () => null;
    
    drawFuncArray[1] = (a,b,c,d,x,y) => {
	t = percHelp( a, d );
	ctx.moveTo(x, y + t*gridSize);
	s = percHelp( a, b );
	ctx.lineTo(x + s*gridSize, y);
    };
    
    drawFuncArray[2] = (a,b,c,d,x,y) => {
	t = percHelp( b, a );
	ctx.moveTo(x + t*gridSize, y);
	s = percHelp( b, c );
	ctx.lineTo(x + gridSize, y + s*gridSize);
    };
    
    drawFuncArray[3] = (a,b,c,d,x,y) => {
	t = percHelp( a, d );
	ctx.moveTo(x,y + t*gridSize);
	s = percHelp( b, c );
	ctx.lineTo(x + gridSize, y + s*gridSize);
    };

    drawFuncArray[4] = (a,b,c,d,x,y) => {
	t = percHelp( c, d );
	ctx.moveTo(x + t*gridSize, y + gridSize);
	s = percHelp( c, b );
	ctx.lineTo(x + gridSize, y + s*gridSize);
    };

    drawFuncArray[5] = (a,b,c,d,x,y) => {
	t = percHelp( a, d );
	ctx.moveTo(x, y + t*gridSize);
	s = percHelp( c, d );
	ctx.lineTo(x + s*gridSize, y + gridSize);

	t = percHelp( a, b );
	ctx.moveTo(x + t*gridSize, y);
	s = percHelp( c, b );
	ctx.lineTo(x + gridSize, y + s*gridSize);
    };

    drawFuncArray[6] = (a,b,c,d,x,y) => {
	t = percHelp( c, d );
	ctx.moveTo(x + t*gridSize, y + gridSize);
	s = percHelp( a, b );
	ctx.lineTo(x + s*gridSize, y);
    };

    drawFuncArray[7] = (a,b,c,d,x,y) => {
	t = a/(a-d);
	ctx.moveTo(x, y + t*gridSize);
	s = percHelp( c, d );
	ctx.lineTo(x + s*gridSize, y + gridSize);
    };

    drawFuncArray[8] = (a,b,c,d,x,y) => {
	t = d/(d-a);
	ctx.moveTo(x, y + t*gridSize);
	s = percHelp( d, c );
	ctx.lineTo(x + s*gridSize, y + gridSize);
    };

    drawFuncArray[9] = (a,b,c,d,x,y) => {
	t = percHelp( d, c );
	ctx.moveTo(x + t*gridSize, y + gridSize);
	s = percHelp( b, a );
	ctx.lineTo(x + s*gridSize, y);
    };

    drawFuncArray[10] = (a,b,c,d,x,y) => {
	t = percHelp( d, c );
	ctx.moveTo(x + t*gridSize, y + gridSize);
	s = percHelp( b, c );
	ctx.lineTo(x + gridSize, y + s*gridSize);
	
	t = percHelp( d, a );
	ctx.moveTo(x, y + t*gridSize);
	s = percHelp( b, a );
	ctx.lineTo(x + s*gridSize, y);
    };

    drawFuncArray[11] = (a,b,c,d,x,y) => {
	t = percHelp( d, c );
	ctx.moveTo(x + t*gridSize, y + gridSize);
	s = percHelp( b, c );
	ctx.lineTo(x + gridSize, y + s*gridSize);
    };

    drawFuncArray[12] = (a,b,c,d,x,y) => {
	t = percHelp( d, c );
	ctx.moveTo(x, y + t*gridSize);
	s = percHelp( c, b );
	ctx.lineTo(x + gridSize, y + s*gridSize);
    };

    drawFuncArray[13] = (a,b,c,d,x,y) => {
	t = percHelp( a, b );
	ctx.moveTo(x + t*gridSize, y);
	s = percHelp( c, b );
	ctx.lineTo(x + gridSize, y + s*gridSize);
    };

    drawFuncArray[14] = (a,b,c,d,x,y) => {
	t = percHelp( d, a );
	ctx.moveTo(x, y + t*gridSize);
	s = percHelp( b, a );
	ctx.lineTo(x + s*gridSize, y);
    };    
    
    drawFuncArray[15] = () => null;

    const newDrawFuncArray = drawFuncArray.map( f => (
	(a,b,c,d,x,y) => {
	    ctx.beginPath();
	    f(a,b,c,d,x,y);
	    ctx.closePath();
	    ctx.stroke();
	} ) );
    

    let prevRow = [];

    for( let i = 0; i <= Math.floor(range/gridSize); i++ )
	prevRow[i] = func( xMin + i*gridSize, yMin );

    let d;
    let c = func( xMin, yMin + gridSize );
    let a,b, sqNum;

    const n = Math.floor(range/gridSize);

    //ctx.beginPath();

    for( let j = 0; j < n; j++  ) {

	c = func( xMin, yMin + (j+1)*gridSize );

	for( let i = 0; i < n; i++ ) {
	    
	    d = c;
	    c = func( xMin + (i+1)*gridSize, yMin + (j+1)*gridSize );
	    a = prevRow[i];
	    b = prevRow[i+1];

	    sqNum = 0;

	    if( a > g ) sqNum += 1;
	    if( b > g ) sqNum += 2;
	    if( c > g ) sqNum += 4;
	    if( d > g ) sqNum += 8;

	    newDrawFuncArray[sqNum](a,b,c,d, xMin + (i)*gridSize, yMin + j*gridSize);

	    prevRow[i] = d;
	}
	prevRow[n] = c;
    }

    //ctx.closePath();
    //ctx.stroke();
    
    return ctx;
    
}

