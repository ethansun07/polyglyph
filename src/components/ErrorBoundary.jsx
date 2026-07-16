import { Component } from 'react';

// Class component required — React error boundaries have no hook equivalent.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in page content:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page error-boundary">
          <h2 className="page-title">😕 Something went wrong</h2>
          <p className="page-sub">
            This screen hit an unexpected error. Your progress is saved — reloading should fix it.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
