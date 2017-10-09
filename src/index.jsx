import React from 'react';
import { render } from 'react-dom';
import { createBrowserHistory } from 'history';
import configureStore from './store';

import Root from './components/Root';

const history = createBrowserHistory();
const store = configureStore({ history });

// Since we are using HtmlWebpackPlugin WITHOUT a template, we should create our own root node in the body element before rendering into it
let root = document.createElement('div');
root.id = "app";
document.body.appendChild( root );

// Now we can render our application into it
render(<Root history={history} store={store} />, document.getElementById('app'));
