import React from 'react';
import './styles.scss';

const RemoteButton = React.lazy(() => import("app2/Button"));

const App = (): JSX.Element => (
  <div className="app">
    <h1>Host App</h1>

    <React.Suspense fallback="Loading Button">
      <RemoteButton id="1"/>
    </React.Suspense>
  </div>
);

export default App;
