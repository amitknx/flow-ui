import React from 'react';
import { ApiPlayground } from '../../components/api/ApiPlayground';

/**
 * API Playground feature page
 * Wraps the ApiPlayground component with proper layout
 */
export const ApiPlaygroundPage: React.FC = () => {
    return (
        <div className="h-[calc(100vh-64px)]">
            <ApiPlayground />
        </div>
    );
};
