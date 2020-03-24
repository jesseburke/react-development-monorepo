//------------------------------------------------------------------------
//
// returns an array of points, each point in the form [x,y]

export function RK4Pts({ func,
			 initialPt,
			 bounds: {xMin = -10,
				  xMax = 10,
				  yMin = -10,
				  yMax = 10},
			 h }) {

    if( initialPt[0] > xMax || initialPt[0] < xMin ) {
	console.log( 'RK4_pts was called with an initial point outside of the bounds given');
	return;
    }

    const posPtsArray = RK4_helper({ func,
				     initialPt,
				     distance: xMax - initialPt[0],
				     max: yMax,
				     min: yMin,
				     h });
    
    const negFunc = (x,y) => func(-x+2*initialPt[0],-y+2*initialPt[1]);

    const negPtsArray = RK4_helper({func: negFunc,
    				    initialPt,
    				    distance: initialPt[0]-xMin,
    				    min: -yMax+2*initialPt[1],
    				    max: -yMin+2*initialPt[1],
				    h })
    	  .map( ([x,y]) => [2*initialPt[0]-x,-y+2*initialPt[1]] );

    negPtsArray.reverse();

    return negPtsArray.concat(posPtsArray);
}

// returns points in the form [x,y]
export function RK4_ptsOld({ func, initialPt, xMin, xMax, yMin = -10, yMax = 10, h }) {

      if( initialPt[0] > xMax || initialPt[0] < xMin ) {
	console.log( 'RK4_pts was called with an initial point outside of the bounds given');
	return;
    }

    const posPtsArray = RK4_helper({ func,
				     initialPt,
				     distance: xMax - initialPt[0],
				     max: yMax,
				     min: yMin,
				     h });
    
    const negFunc = (x,y) => func(-x+2*initialPt[0],-y+2*initialPt[1]);

    const negPtsArray = RK4_helper({func: negFunc,
    				    initialPt,
    				    distance: initialPt[0]-xMin,
    				    min: -yMax+2*initialPt[1],
    				    max: -yMin+2*initialPt[1],
				    h })
    	  .map( ([x,y]) => [2*initialPt[0]-x,-y+2*initialPt[1]] );

    return [negPtsArray, posPtsArray];
}

// returns point array for solution curve from initialPt, and goes for distance along x-axis
//
// stops the points if the y-value goes outside the range [min,max]
//
// if there are no points, returns an empty array

function RK4_helper({ func, initialPt, distance, max, min, h }) {

    const x0 = initialPt[0];
    const y0 = initialPt[1];
    
    const K1 = (x,y) => func(x,y);
    const K2 = (x,y) => func(x + h/2, y + (h/2)*K1(x,y));
    const K3 = (x,y) => func(x + h/2, y + (h/2)*K2(x,y));
    const K4 = (x,y) => func(x + h, y + h*K3(x,y));

    const steps =  Math.floor(distance/h);

    const xArray = [];

    for( let i = 0; i <= steps; i++ ) {

	xArray.push( x0 + h*i );

    }

    const yArray = [y0];

    let x, y;
    
    for( let i = 1; i <= steps; i++ ) {

	x = xArray[i-1];
	y = yArray[i-1];
	const newY = y + (h/6)*(K1(x,y) + 2*K2(x,y) + 2*K3(x,y) + K4(x,y));

	if( newY < min || newY > max ) {

	    // are including one point over the boundary
	    yArray[i] = newY;
	    break;
	}

	yArray[i] = newY;
    }

    const ptArray = yArray.map( (y, index) => [xArray[index], y] );

    return ptArray;

}
