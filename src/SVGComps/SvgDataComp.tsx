import { atom } from 'jotai';

import NumberDataComp from '../data/NumberDataComp';
import PointDataComp from '../data/PointDataComp';

import MatrixFactory from '../math/MatrixFactory';

import { diffObjects, isEmpty, myStringify } from '../utils/BaseUtils.js';

export const zoom1XWidth = 20;
// y width will be determined by aspect ratio of svg

export const initXCenter = 0;
export const initYCenter = 0;

const initGraphSqW = 1;

export const zoomFactorButton = 2;
const zoomFactorWheel = 1.1;

const zoomMax = 2 ** 15;
const zoomMin = 1 / zoomMax;

export default function SvgDataComp() {
    const svgHeightAndWidthAtom = atom({ height: 0, width: 0 });

    const svgToMathFuncAtom = atom((get) => {
        const { height, width } = get(svgHeightAndWidthAtom);

        const scale = width / zoom1XWidth;

        const m = MatrixFactory([
            [1 / scale, 0, initXCenter - zoom1XWidth / 2],
            [0, -1 / scale, initYCenter + (((1 / 2) * height) / width) * zoom1XWidth],
            [0, 0, 1]
        ]);

        return {
            func: ({ x, y }) => {
                const vec = m.multiplyWithVec([x, y, 1]);
                return { x: vec[0], y: vec[1] };
            }
        };
    });

    const mathToSvgFuncAtom = atom((get) => {
        const { width, height } = get(svgHeightAndWidthAtom);

        const scale = width / zoom1XWidth;

        const m = MatrixFactory([
            [scale, 0, width / 2],
            [0, -scale, height / 2],
            [0, 0, 1]
        ]);

        const func = ({ x, y }) => {
            const vec = m.multiplyWithVec([x, y, 1]);
            return { x: vec[0], y: vec[1] };
        };

        return { func };
    });

    const zoomData = NumberDataComp(1);

    const zoomAtom = atom(
        (get) => get(zoomData.atom),
        (get, set, action) => {
            const z = get(zoomData.atom);

            switch (action) {
                case 'zoom in button':
                    if (z < zoomMax) {
                        set(zoomData.atom, z * zoomFactorButton);
                    }
                    break;

                case 'zoom in wheel':
                    if (z < zoomMax) {
                        set(zoomData.atom, z * zoomFactorWheel);
                    }
                    break;

                case 'zoom out button':
                    if (z > zoomMin) {
                        set(zoomData.atom, z / zoomFactorButton);
                    }
                    break;

                case 'zoom out wheel':
                    if (z > zoomMin) {
                        set(zoomData.atom, z / zoomFactorWheel);
                    }
                    break;

                case 'reset':
                    set(zoomData.atom, 1);
                    break;
            }
        }
    );

    const graphSqWAtom = atom((get) => initGraphSqW / get(zoomAtom));

    const upperLeftPointData = PointDataComp({ x: 0, y: 0 });

    const svgBoundsAtom = atom((get) => {
        const zoom = get(zoomData.atom);
        const { height, width } = get(svgHeightAndWidthAtom);
        const { x: ulX, y: ulY } = get(upperLeftPointData.atom);

        const svgCenterX = width / 2 + ulX;
        const svgCenterY = height / 2 + ulY;

        return {
            xMin: svgCenterX - width / (2 * zoom),
            xMax: svgCenterX + width / (2 * zoom),
            yMin: svgCenterY - height / (2 * zoom),
            yMax: svgCenterY + height / (2 * zoom)
        };
    });

    const mathBoundsAtom = atom((get) => {
        const svgBds = get(svgBoundsAtom);
        const svgToMathFunc = get(svgToMathFuncAtom).func;

        const { x: xMin, y: yMin } = svgToMathFunc({ x: svgBds.xMin, y: svgBds.yMax });
        const { x: xMax, y: yMax } = svgToMathFunc({ x: svgBds.xMax, y: svgBds.yMin });

        return { xMin, xMax, yMin, yMax };
    });

    return {
        svgHeightAndWidthAtom,
        svgToMathFuncAtom,
        mathToSvgFuncAtom,
        zoomAtom,
        graphSqWAtom,
        upperLeftPointAtom: upperLeftPointData.atom,
        svgBoundsAtom,
        mathBoundsAtom
    };
}

function CombineReadWriteAtoms(atomStore) {
    const newRWAtom = atom(null, (get, set, action) => {
        switch (action.type) {
            case 'reset':
                Object.values(atomStore).forEach((atom) => {
                    set(atom.readWriteAtom, {
                        type: 'reset'
                    });
                });
                break;

            case 'readToAddressBar':
                let ro = {};

                Object.entries(atomStore).forEach(([abbrev, atom]) =>
                    set(atom.readWriteAtom, {
                        type: 'readToAddressBar',
                        callback: (obj) => {
                            if (obj) ro[abbrev] = myStringify(obj);
                        }
                    })
                );

                if (isEmpty(ro)) return;
                action.callback(ro);
                break;
        }
    });

    return newRWAtom;
}
