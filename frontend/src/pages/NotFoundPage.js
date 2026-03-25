import React from "react";

function NotFoundPage({ onGoHome }) {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist or has been moved.</p>
        {onGoHome && (
          <button className="btn btn-primary" onClick={onGoHome}>
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

export default NotFoundPage;
