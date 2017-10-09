import * as React from 'react';
import { Route }  from 'react-router-dom';

/*
  More info:
  https://stackoverflow.com/a/46201798/2533474
  https://simonsmith.io/reusing-layouts-in-react-router-4/
*/

export const Layout = (props) => {
  const { component: Component, ...rest } = props;
  return (
    <Route {...rest} render={matchProps => (
      <div className="app-layout">
        <Component {...matchProps} />
      </div>
    )} />
  );
};
