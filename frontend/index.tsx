import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global error handler for top-level crashes (e.g. imports)
window.onerror = function (message, source, lineno, colno, error) {
  const div = document.createElement('div');
  div.style.color = 'red';
  div.style.padding = '20px';
  div.style.border = '2px solid red';
  div.style.backgroundColor = 'white';
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.zIndex = '99999';
  div.style.fontSize = '20px';
  div.innerHTML = '<h1>Global Error</h1><pre>' + message + '\n' + source + ':' + lineno + '</pre>';
  if (error && error.stack) {
    div.innerHTML += '<pre style="font-size:12px">' + error.stack + '</pre>';
  }
  document.body.appendChild(div);
};

console.log('Index.tsx running');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps { children: React.ReactNode }
interface ErrorBoundaryState { hasError: boolean; error: Error | null }

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', border: '1px solid red', margin: 20 }}>
          <h2>Something went wrong inside the app.</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
