
// compArray is an array of arrays; each array is a chain of points to be drawn
export default function CurvedPathCanvas({ compArray, bounds, color, lineWidth }) {

    const ctx = document.createElement('canvas').getContext('2d');
    ctx.canvas.width = 1024;
    ctx.canvas.height = 1024;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    let {xMin, xMax, zMin, zMax} = bounds;

    const xRange = xMax - xMin;
    const zRange = zMax - zMin;

    if( !zMax ) zMax = 10;
    if( !zMin ) zMin = -10;
    
    const h = ctx.canvas.height;
    const w = ctx.canvas.width;

    // location of origin in (percentage) canvas coords
    const cx = .1;
    const cz = .5;


    const stc = ([x,z]) => ([ ((x-xMin)/xRange)*w, (1-((z-zMin)/zRange))*h ]);
    
    let curve, curArray, nextPt, l, tempD;
    
    for( let i = 0; i < compArray.length; i++ ) {

     	curArray = compArray[i];	
     	l = curArray.length;

     	ctx.beginPath();
     	ctx.moveTo( ...stc(curArray[0]) );

     	for( let i = 1; i < l; i++ ) {

     	    ctx.lineTo(  ...stc(curArray[i]) );
	
	}

	//ctx.closePath();
	ctx.stroke();
    }

    return ctx;

    //unchangeCanvasCoords( ctx, bounds );
    
};


