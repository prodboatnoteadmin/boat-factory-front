// Must run before any component file. The prototype components reference
// `React` / `ReactDOM` as globals and register themselves on `window`,
// so we expose them here.
import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from './supabaseClient';

window.React = React;
window.ReactDOM = ReactDOMClient;
window.ReactRouterDOM = ReactRouterDOM;
window.supabase = supabase;
