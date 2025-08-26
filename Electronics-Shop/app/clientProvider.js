'use client'

import { Provider } from "react-redux";
import store from "./states/store";

import { library } from '@fortawesome/fontawesome-svg-core';

import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

library.add(fab, fas, far);

import { useEffect } from "react";


export default function ClientProvider({children}) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('bootstrap/dist/js/bootstrap.bundle.min.js');
        }
    }, [])
    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
}