/** In-memory: at most one stream-focus digest email per browser session per stream. */
const MAX_KEYS = 8000;
const sentStreamFocusKeys = new Set();

function focusKey(sessionId, streamId) {
  const sid = String(sessionId || "").trim();
  const stid = String(streamId || "").trim();
  return `${sid}::${stid}`;
}

/**
 * @param {string} sessionId - client-generated id (sessionStorage)
 * @param {string} streamId
 * @returns {boolean} true if a digest was already sent successfully for this pair
 */
function hasStreamFocusDigestBeenSent(sessionId, streamId) {
  const sid = String(sessionId || "").trim();
  const stid = String(streamId || "").trim();
  if (!sid || !stid) {
    return false;
  }
  return sentStreamFocusKeys.has(focusKey(sessionId, streamId));
}

/**
 * Call after a stream-focus digest email is sent successfully.
 */
function recordStreamFocusDigestSent(sessionId, streamId) {
  const sid = String(sessionId || "").trim();
  const stid = String(streamId || "").trim();
  if (!sid || !stid) {
    return;
  }
  sentStreamFocusKeys.add(focusKey(sessionId, streamId));
  if (sentStreamFocusKeys.size > MAX_KEYS) {
    sentStreamFocusKeys.clear();
  }
}

module.exports = {
  hasStreamFocusDigestBeenSent,
  recordStreamFocusDigestSent,
};
