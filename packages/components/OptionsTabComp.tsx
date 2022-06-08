import React, { useState, useCallback } from 'react';

import * as Tabs from '@radix-ui/react-tabs';
import * as Popover from '@radix-ui/react-popover';

export default function OptionsTabComp({ nameComponentArray, className }) {
    const [optionsOpen, setOptionsOpen] = useState(true);

    const optionsOpenCB = useCallback(() => setOptionsOpen((o) => !o), []);

    const preventDefaultCB = useCallback((e) => {
        //console.log('preventDefaultCB called');
        e.preventDefault();
    });

    const triggerArray = nameComponentArray.map(([name, _]) => (
        <TabTrigger value={name} key={name}>
            {name}
        </TabTrigger>
    ));

    const contentArray = nameComponentArray.map(([name, comp, props]) => (
        <TabContent value={name} key={name}>
            {React.createElement(comp, props)}
        </TabContent>
    ));

    return (
        <Popover.Root onOpenChange={optionsOpenCB}>
            <Popover.Trigger className={className}>
                {optionsOpen ? 'Show options' : 'Hide options'}
            </Popover.Trigger>

            <Popover.Content
                className='relative border-3 p-6
bg-gray-50 w-full'
                onFocusOutside={preventDefaultCB}
                onPointerDownOutside={preventDefaultCB}
                onInteractOutside={preventDefaultCB}
            >
                <TabsComp triggerArray={triggerArray} contentArray={contentArray} />
            </Popover.Content>
        </Popover.Root>
    );
}

function TabsComp({ triggerArray, contentArray }) {
    return (
        <Tabs.Root defaultValue='tab1' className='flex flex-col'>
            <Tabs.List
                aria-label='tabs example'
                className='flex-shrink-0 flex border-b border-solid'
            >
                {triggerArray}
            </Tabs.List>
            {contentArray}
        </Tabs.Root>
    );
}

function TabTrigger({ children, value }) {
    return (
        <Tabs.Trigger
            value={value}
            className='flex-shrink-0 px-3
    py-4 text-gray-500 tab-trigger'
        >
            {children}
        </Tabs.Trigger>
    );
}

function TabContent({ children, value }) {
    return (
        <Tabs.Content value={value} className='flex-grow-1 p-6'>
            {children}
        </Tabs.Content>
    );
}
