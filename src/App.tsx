import React, { Suspense, useEffect } from 'react';
import './App.scss';

// const RemoteButton = React.lazy(() => import('app2/Button'));

const useDynamicScript = (args: any) => {
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  useEffect(() => {
    if (!args.url) {
      return;
    }

    const element = document.createElement('script');

    element.src = args.url;
    element.type = 'text/javascript';
    element.async = true;

    setReady(false);
    setFailed(false);

    element.onload = () => {
      console.log(`Dynamic Script Loaded: ${args.url}`);
      setReady(true);
    };

    element.onerror = () => {
      console.error(`Dynamic Script Error: ${args.url}`);
      setReady(false);
      setFailed(true);
    };

    document.head.appendChild(element);

    // eslint-disable-next-line consistent-return
    return () => {
      console.log(`Dynamic Script Removed: ${args.url}`);
      document.head.removeChild(element);
    };
  }, [args.url]);

  return {
    ready,
    failed,
  };
};

const loadComponent = (scope: string, module: string) => async (): Promise<any> => {
  // @ts-ignore
  await __webpack_init_sharing__('default');
  // @ts-ignore
  const container = window[scope];
  // @ts-ignore
  await container.init(__webpack_share_scopes__.default);
  // @ts-ignore
  const factory = await window[scope].get(module);
  return factory();
};

// @ts-ignore
function System({ system }: any) {
  const { ready, failed } = useDynamicScript({
    url: system && system.url,
  });

  if (!system) {
    return <h2>Not system specified</h2>;
  }

  if (!ready) {
    return (
      <h2>
        Loading dynamic script:
        {system.url}
      </h2>
    );
  }

  if (failed) {
    return (
      <h2>
        Failed to load dynamic script:
        {system.url}
      </h2>
    );
  }

  const Component = React.lazy(
    loadComponent(system.scope, system.module),
  );

  return (
    <Suspense fallback="Loading System">
      <Component />
    </Suspense>
  );
}

const App = (): JSX.Element => {
  console.log('test');
  return (
    <div className="app">
      <h1>Host App</h1>
      <p>
        Env:
        <span>{process.env.NODE_ENV}</span>
      </p>

      <System system={{
        url: 'https://de-common-ui.netlify.app/remoteEntry.js',
        scope: 'app2',
        module: './Button',
      }}
      />
    </div>
  );
};

export default App;
