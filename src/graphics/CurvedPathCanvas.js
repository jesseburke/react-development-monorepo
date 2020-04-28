
// compArray is an array of arrays; each array is a chain of points to be drawn
export default function CurvedPathCanvas({ compArray, bounds, ctx }) {

    let {xMin, xMax, zMin, zMax} = bounds;

    if( !zMax ) zMax = 10;
    if( !zMin ) zMin = -10;
    
    const h = ctx.canvas.height;
    const w = ctx.canvas.width;

    // location of origin in (percentage) canvas coords
    const cx = .1;
    const cz = .5;

    function sceneToCanvas ([x,z]) {
	return [ cx*w + ((1-cx)*w)*(x/xMax),
		 (1-(z/zMax))*h*cz ];
    }

    // draw axes
    ctx.beginPath();
    ctx.moveTo( ...sceneToCanvas([-1,0]) );
    ctx.lineTo( ...sceneToCanvas([xMax,0]) );
    //ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo( ...sceneToCanvas([0,zMin]) );
    ctx.lineTo( ...sceneToCanvas([0,zMax]) );
    //ctx.closePath();
    ctx.stroke();

    
    let curve, curArray, nextPt, l, tempD;
    
    for( let i = 0; i < compArray.length; i++ ) {

     	curArray = compArray[i];	
     	l = curArray.length;

     	ctx.beginPath();
     	ctx.moveTo( ...sceneToCanvas(curArray[0]) );

     	for( let i = 1; i < l; i++ ) {

     	    ctx.lineTo(  ...sceneToCanvas(curArray[i]) );
	
	}

	//ctx.closePath();
	ctx.stroke();
    }

    //unchangeCanvasCoords( ctx, bounds );
    
};


