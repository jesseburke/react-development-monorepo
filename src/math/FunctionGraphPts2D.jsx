
// func: f(x)
export default function FunctionGraphPts2D({ func,
					     bounds,
					     approxH = .1,
					   })
{        
    const {xMin, xMax, yMin, yMax} = bounds;

    let compArray = [];
    let curArray = [];

    let pointArray = [];

    let x0, y0, x1, y1, m, tx, ty, lastOutPt;


    for( let i = Math.floor(xMin/approxH); i < Math.ceil(xMax/approxH); i++ ) {

        ty = func( i*approxH );

	// if out of bounds, will try to add point on the boundary (but potentially off the x-grid)
	if( ty < yMin || ty > yMax ) {

	    // were out of bounds previous iteration, still out of bounds,
	    // so nothing to do
	    if( curArray.length === 0 ) {
		lastOutPt = [i*approxH, ty];
		continue;
	    }
	    
	    // otherwise, to draw equation until edge of bounds, will do linear
	    // approximation for the last bit

	    [x0, y0] = curArray[curArray.length-1];
	    [x1, y1] = [i*approxH, ty];	    

	    // x1 - x0 is nonzero by construction
	    m = (y1 - y0)/(x1-x0);

	    if( ty > yMax ) {
		tx = x0 + (yMax - y0)/m;
		curArray.push( [tx, yMax] );
		lastOutPt = [x1, y1];
	    }

	    else if( ty < yMin ) {
		tx = x0 + (yMin - y0)/m;
		curArray.push( [tx, yMin] );
		lastOutPt = [x1, y1];
	    }
	    
	    compArray.push( curArray );
	    curArray = [];
	    continue;
	}

	// if curArray is empty, then will add point on the boundary
	if( curArray.length === 0 && lastOutPt) {

	    [x0, y0] = lastOutPt;
	    [x1, y1] = [i*approxH, ty];

	    m = (y1 - y0)/(x1-x0);
	    
	    if( y0 > yMax ) {
		tx = x0 + (yMax - y0)/m;
		curArray.push( [tx, yMax] );
	    }

	    else if( y0 < yMin ) {
		tx = x0 + (yMin - y0)/m;
		curArray.push( [tx, yMin] );
	    }

	    else {
		curArray.push([ x0, y0 ]); 
	    }
	    
	}
	
        curArray.push([ i*approxH, ty ]);

    }

    if( curArray.length > 0) compArray.push( curArray );

    return compArray;
}



