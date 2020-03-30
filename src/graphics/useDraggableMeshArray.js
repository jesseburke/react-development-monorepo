import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function useDraggableMeshArray({ threeCBs, meshArray, dragendCB, dragCB })

{
      useEffect( () => {

            if( !threeCBs || !meshArray ) return;
            
            const nonNullMeshArray = meshArray.map( m => m );

            if( !nonNullMeshArray ) return;            

            const controlsDisposeFunc = threeCBs.addDragControls({ meshArray,
                                                                   dragCB,
                                                                   dragendCB});
            return () => {

                if( controlsDisposeFunc ) controlsDisposeFunc();

            };
            
        }, [threeCBs, meshArray, dragendCB, dragCB] );
           
};
