import { History } from 'history';
import { createStoreParams } from './index';
import { createStore, applyMiddleware, Store, compose } from 'redux';
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant';
import thunk from 'redux-thunk';

import rootReducer, { RootState } from '../reducers';

function configureStoreDev(params) {

  const middlewares = [
    reduxImmutableStateInvariant(),
    thunk,
  ];
  // add support for Redux dev tools
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const store = createStore(rootReducer, params.initialState, composeEnhancers(
    applyMiddleware(...middlewares),
  ));

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}

function configureStoreProd(params) {
  const middlewares = [
    thunkWithServices,
  ];

  return createStore(rootReducer, params.initialState,
    compose(applyMiddleware(...middlewares)),
  );
}

const configureStore =
  process.env.NODE_ENV === 'production' ? configureStoreProd : configureStoreDev;

export default configureStore;
