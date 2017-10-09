import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import Home from '../containers/Home/Home';
import { Layout } from './shared/Layout';

export const Routes = () => (
  <div>
    <Switch>
      <Layout path="/" component={Home} />
    </Switch>
  </div>
);
