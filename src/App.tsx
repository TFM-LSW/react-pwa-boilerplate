import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import './App.scss';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{ error.message }</pre>
      <button type="button" onClick={ resetErrorBoundary }>
        Try again
      </button>
    </div>
  );
}

const myErrorHandler = (error: Error, info: { componentStack: string }) => {
  // Do something with the error
  // E.g. log to an error logging client here
  console.log(error, info);
};

const RemoteButton = React.lazy(() => import('app2/Button'));

const App = (): JSX.Element => (
  <div className="app">
    <h1>Host App</h1>
    <p>{ process.env.NODE_ENV }</p>

    <ErrorBoundary
      FallbackComponent={ ErrorFallback }
      onError={ myErrorHandler }
    >
      <Suspense fallback="Loading Button">
        <RemoteButton id="1" />
      </Suspense>
    </ErrorBoundary>
  </div>
);

export default App;
