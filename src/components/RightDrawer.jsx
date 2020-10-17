import React from 'react';

// width is expected in em's
function rightDrawer({ toShow, width = 25, children, color, fontSize = '1em' }) {
    const r = toShow ? 0 : (-width).toString() + 'em';

    return (
        <div
            css={{
                position: 'absolute',
                top: '0',
                right: r,
                width: width.toString() + 'em',
                padding: '1em 1.5em',
                zIndex: '100',
                backgroundColor: color,
                fontSize,
                userSelect: 'none'
            }}
        >
            {children}
        </div>
    );
}

const RightDrawer = React.memo(rightDrawer);

export default RightDrawer;

// width is expected in em's
// export default function RightDrawer({toShow, width = 25, children}) {

//     const contentProps = useSpring({
//         //opacity: toShow ? .75 : 0,
//         right: toShow ? 0 : ((-width).toString()+'em'),
//         config: {
//             friction: 20,
//             tension: 210,
//             mass: 1,
//             clamp: true
//         }
//     });

//     return  <animated.div
//               css={{
//                   position: 'absolute',
//                   top: '0',
//                   right: '0',
//                   width: width.toString()+'em',
//                   padding: '1em 1.5em',
//                   zIndex: '100',
//                   backgroundColor: '#9E9E9E',
//               }}
//               style={contentProps}
//             >
//               {children}
//             </animated.div>;
// }
