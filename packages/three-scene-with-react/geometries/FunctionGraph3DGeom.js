import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry';

// func: f(x,y) = z
export default function FunctionGraph3DGeom({
    func,
    bounds: { xMin, xMax, yMin, yMax },
    meshSize = 100
}) {
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    const funcGeom = new ParametricGeometry(
        (u, v, vect) => vect.set(u, v, func(u * xRange + xMin, v * yRange + yMin)),
        meshSize,
        meshSize
    );
    funcGeom.translate(-0.5, -0.5, 0);
    funcGeom.scale(xRange, yRange, 1);
    funcGeom.translate(xMin + xRange / 2, yMin + yRange / 2, 0);

    return funcGeom;
}
