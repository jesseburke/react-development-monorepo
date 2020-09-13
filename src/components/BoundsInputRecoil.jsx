import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import classnames from 'classnames';
import styles from './BoundsInputRecoil.module.css';

import Input from './Input.jsx';

const defaultXLabelAtom = atom('x');
const defaultYLabelAtom = atom('y');

export default React.memo(function FunctionBounds({
    boundsAtom,
    xLabelAtom = defaultXLabelAtom,
    yLabelAtom = defaultYLabelAtom
}) {
    const [bounds, setBounds] = useAtom(boundsAtom);

    const [xLabel] = useAtom(xLabelAtom);
    const [yLabel] = useAtom(yLabelAtom);

    const xMinCB = useCallback(
        (newxm) => setBounds((oldBounds) => ({ ...oldBounds, xMin: Number(newxm) })),
        [setBounds]
    );
    const xMaxCB = useCallback(
        (newxm) => setBounds((oldBounds) => ({ ...oldBounds, xMax: Number(newxm) })),
        [setBounds]
    );
    const yMinCB = useCallback(
        (newym) => setBounds((oldBounds) => ({ ...oldBounds, yMin: Number(newym) })),
        [setBounds]
    );
    const yMaxCB = useCallback(
        (newym) => setBounds((oldBounds) => ({ ...oldBounds, yMax: Number(newym) })),
        [setBounds]
    );

    return (
        <div className={styles['left-flex-column']}>
            <fieldset className={classnames(styles['full-width'], styles['center-flex-row'])}>
                <legend>Direction field bounds</legend>

                <div className={styles['center-flex-row']}>
                    <span className={styles['med-padding']}>
                        <Input size={4} initValue={bounds.xMin} onC={xMinCB} />
                    </span>
                    <span className={styles['text-align-center']}>
                        {' '}
                        {'\u2000 \u2264 \u2000' + xLabel + '\u2000 \u2264 \u2000'}
                    </span>
                    <span className={styles['med-padding']}>
                        <Input size={4} initValue={bounds.xMax} onC={xMaxCB} />
                    </span>
                </div>

                <div className={styles['center-flex-row']}>
                    <span className={styles['med-padding']}>
                        <Input size={4} initValue={bounds.yMin} onC={yMinCB} />
                    </span>
                    <span className={styles['text-align-center']}>
                        {' '}
                        {'\u2000 \u2264 \u2000' + yLabel + '\u2000 \u2264 \u2000'}
                    </span>
                    <span className={styles['med-padding']}>
                        <Input size={4} initValue={bounds.yMax} onC={yMaxCB} />
                    </span>
                </div>
            </fieldset>
        </div>
    );
});

// <div className={styles['left-flex-column']}>
//          <fieldset className={classnames(styles['full-width'], styles['center-flex-row'])}>
//              <legend>Direction field bounds</legend>

//              <div className={styles['center-flex-row']}>
//                  <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
//                      <span className={styles['text-align-center']}>{xLabel}Min:</span>
//                      <span className={styles['med-padding']}>
//                          <Input size={4} initValue={bounds.xMin} onC={xMinCB} />
//                      </span>
//                  </div>
//                  <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
//                      <span className={styles['text-align-center']}>{xLabel}Max:</span>
//                      <span className={styles['med-padding']}>
//                          <Input size={4} initValue={bounds.xMax} onC={xMaxCB} />
//                      </span>
//                  </div>
//              </div>

//              <div className={styles['center-flex-row']}>
//                  <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
//                      <span className={styles['text-align-center']}>{yLabel}Min:</span>
//                      <span className={styles['med-padding']}>
//                          <Input size={4} initValue={bounds.yMin} onC={yMinCB} />
//                      </span>
//                  </div>
//                  <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
//                      <span className={styles['text-align-center']}>{yLabel}Max:</span>
//                      <span className={styles['med-padding']}>
//                          <Input size={4} initValue={bounds.yMax} onC={yMaxCB} />
//                      </span>
//                  </div>
//              </div>
//          </fieldset>
//      </div>
