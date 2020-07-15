export default function use2DAxes({
    canvas,
    bounds,
    color = '#8BC34A',
    lineWidth = 1,
    show = true,
    showLabels = true,
    tickDistance = 1,
    tickRadius = 1.25,
    tickColor = '#8BC34A',
    labelEps = 0.5,
    labelStyle,
    xLabel = 'x',
    yLabel = 'y'
}) {
    if (!canvas || !show) return;

    const ctx = canvas.getContext('2d');

    const { xMin, xMax, yMin, yMax } = bounds;

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    const h = ctx.canvas.height;
    const w = ctx.canvas.width;

    // scene to canvas
    const stc = (x, y) => [((x - xMin) / xRange) * w, (1 - (y - yMin) / yRange) * h];

    const oldColor = ctx.strokeStyle;
    ctx.strokeStyle = color;

    if (showLabels) {
        const oldFont = ctx.font;
        ctx.font = '3em sans-serif';

        const oldColor = ctx.fillStyle;
        ctx.fillStyle = color;

        const xCoords = stc(xMax - labelEps, -labelEps);
        ctx.fillText(xLabel, xCoords[0], xCoords[1]);

        const yCoords = stc(-labelEps, yMax - labelEps);
        ctx.fillText(yLabel, yCoords[0], yCoords[1]);

        ctx.font = oldFont;
        ctx.fillStyle = oldColor;
    }

    const oldLineWidth = ctx.lineWidth;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(...stc(xMin, 0));
    ctx.lineTo(...stc(xMax, 0));
    ctx.stroke();

    ctx.moveTo(...stc(0, yMin));
    ctx.lineTo(...stc(0, yMax));
    ctx.stroke();

    for (let i = xMin - 1; i < xMax; i++) {
        // make sphere here
    }

    ctx.strokeStyle = oldColor;
    ctx.lineWidth = oldLineWidth;
}
