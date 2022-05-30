import { ErrorBoundary } from 'react-error-boundary';
import React from 'react';
import { useSnackbar } from 'notistack';

function MyFallbackComponent({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export default function ErrorParent({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <ErrorBoundary
      FallbackComponent={MyFallbackComponent}
      onError={(error, errorInfo) => enqueueSnackbar(error.message, { variant: 'error' })}
      onReset={() => {
        // reset the state of your app
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
