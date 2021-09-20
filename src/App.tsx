import React from 'react';
import sum from './services/sum';
import './App.scss';

const RemoteButton = React.lazy(() => import('app2/Button'));

const App = (): JSX.Element => {
  console.log(RemoteButton);
  const sumer = sum(1, 2);
  console.log(sumer);
  return (
    <div className="app">
      <h1>Host App</h1>
      <p>{process.env.NODE_ENV}</p>

      {
        RemoteButton.$$typeof && <div>Hey</div>
      }

      {/* <Suspense fallback="Loading Button">
        <RemoteButton id="1" />
      </Suspense> */}
    </div>
  );
};

export default App;
