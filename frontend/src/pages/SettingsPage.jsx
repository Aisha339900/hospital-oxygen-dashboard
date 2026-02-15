import React from 'react';
import { FiBell, FiUser, FiLogOut } from 'react-icons/fi';

function SettingsPage({ settings, onToggleSetting }) {
  const handleSignOut = () => {
    window.alert('Signed out');
  };

  return (
    <section className="settings-shell">
      <header className="settings-simple-header">
        <div>
          <p className="status-pill neutral">Preferences</p>
          <h1>Settings</h1>
          <p className="settings-simple-copy">Manage your account, alert destinations, and session access.</p>
        </div>
      </header>

      <div className="settings-simple-grid">
        <article className="panel settings-simple-card">
          <div className="settings-card-title">
            <FiUser aria-hidden="true" />
            <div>
              <h2>Account</h2>
              <p>Details about your operator profile.</p>
            </div>
          </div>
          <div className="settings-card-content">
            <dl className="settings-detail-list">
              <dt>Name</dt>
              <dd>Riley Evans</dd>
              <dt>Email</dt>
              <dd>riley.evans@oxygen-ops.health</dd>
              <dt>Role</dt>
              <dd>Site administrator</dd>
            </dl>
          </div>
        </article>

        <article className="panel settings-simple-card">
          <div className="settings-card-title">
            <FiBell aria-hidden="true" />
            <div>
              <h2>Alarm notifications</h2>
              <p>Choose whether alarm digests reach your inbox.</p>
            </div>
          </div>
          <div className="settings-card-content">
            <label className="setting-toggle" htmlFor="email-alerts">
              <div className="setting-toggle-copy">
                <p className="setting-title">Receive email alerts</p>
                <span className="setting-subtext">Send a summary when new alarms fire.</span>
              </div>
              <input
                id="email-alerts"
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={() => onToggleSetting('emailAlerts')}
              />
            </label>
          </div>
        </article>

        <article className="panel settings-simple-card">
          <div className="settings-card-title">
            <FiLogOut aria-hidden="true" />
            <div>
              <h2>Session</h2>
              <p>Sign out of this console.</p>
            </div>
          </div>
          <div className="settings-card-content">
            <button className="settings-signout" type="button" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

export default SettingsPage;
