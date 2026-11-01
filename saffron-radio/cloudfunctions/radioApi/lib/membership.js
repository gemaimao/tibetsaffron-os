'use strict';

// Pure membership reducer shared by toggleLike / toggleFavorite.
//
// The client stores the membership it *wants* and retries until the server
// confirms it. A blind toggle cannot express that: a retry would flip the value
// back and silently undo the user's latest intent. `desired` makes the write
// idempotent, so replaying the same request is always safe.
//
//   desired === true   -> ensure the episode is present
//   desired === false  -> ensure the episode is absent
//   desired === null   -> legacy blind toggle (kept for older clients)
function applyMembership(list, episodeId, desired) {
  const out = Array.isArray(list) ? list.slice() : [];
  const idx = out.indexOf(episodeId);
  const shouldHave = desired === null || desired === undefined ? idx < 0 : desired === true;

  if (shouldHave && idx < 0) out.push(episodeId);
  else if (!shouldHave && idx >= 0) out.splice(idx, 1);

  return out;
}

module.exports = { applyMembership };
