import React, { ReactNode, useState, useEffect } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode | ((error: Error) => ReactNode);
}

export const ErrorBoundary = ({ children, fallback }: ErrorBoundaryProps) => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      event.preventDefault();
      setError(event.error || new Error("Unknown error occurred"));
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      setError(event.reason || new Error("Promise rejection"));
    };

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", rejectionHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", rejectionHandler);
    };
  }, []);

  if (error) {
    return typeof fallback === "function" ? fallback(error) : fallback;
  }

  return <>{children}</>;
};

export default ErrorBoundary;
