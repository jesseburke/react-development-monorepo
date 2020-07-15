import * as THREE from 'three';

// square piece of graph paper
//
// output: grid contained in xy plane, centered at 0

export default function GraphPaper({ quadSize = 10, sqSize = 1, gridOpacity = 0.4 }) {
    const group = new THREE.Group();

    //const grid = new GridHelper(
    // {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax, color: 0x8888888});

    const grid = new THREE.GridHelper(2 * quadSize, (2 * quadSize) / sqSize);
    grid.material.opacity = gridOpacity;
    grid.material.transparent = true;
    grid.rotateX(Math.PI / 2);

    group.add(grid);

    function getMesh() {
        return group;
    }

    function dispose() {
        //planeGeometry.dispose();
        //planeMaterial.dispose();
        group.remove(grid);
    }

    return { getMesh, dispose };
}

const initAxesData = {
    xMin: -100,
    xMax: 100,
    yMin: -10,
    yMax: 10,
    gridSqSize: 1,
    graphQuadSize: 10,
    axesColor: '#8BC34A',
    tickColor: '#8BC34A',
    showLabels: true
};
