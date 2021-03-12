export interface OrthoCamera {
    center: ArrayPoint3;
    zoom: number;
    position: ArrayPoint3;
}

export type ArrayPoint3 = [number, number, number];

export type ArrayPoint2 = [number, number];

export interface ObjectPoint2 {
    x: number;
    y: number;
}

export interface ObjectPoint3 {
    x: number;
    y: number;
    z: number;
}

export interface AxesDataT {
    radius: number;
    show: boolean;
    tickLabelDistance: number;
}

export interface Bounds {
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
    zMin?: number;
    zMax?: number;
}

// Bounds2Min(imized), for using in query-string
export interface BoundsMin {
    xp?: number;
    xm?: number;
    yp?: number;
    ym?: number;
    zp?: number;
    zm?: number;
}

export interface Bounds3 {
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
    zMin?: number;
    zMax?: number;
}

export interface CurveData2 {
    color?: string;
    approxH?: number;
    visible?: boolean;
    width?: number;
}

export interface CurveData2Min {
    c?: string;
    a?: number;
    v?: number;
    w?: number;
}

export interface Label2 {
    x: string;
    y: string;
}

export interface Label3 {
    x: string;
    y: string;
    z: string;
}

export interface LabelStyle {
    backgroundColor?: string;
    color?: string;
    border?: number;
    padding?: string;
    margin?: string;
    fontSize?: string;
}

export interface LabelProps {
    pos: ArrayPoint3;
    text: string;
    style: LabelStyle;
    anchor: string;
}

export interface AnimationDataType {
    animationTime: number;
    t: number;
    paused: boolean;
    min: number;
    max: number;
}
