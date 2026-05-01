const actionLog = new Map();

const COOLDOWNS = {
  like: 120 * 1000, // 2 minute between likes on the same post
  flag: 10 * 60 * 1000, // 10 minutes between flags on the same post
};

function rateLimitAction(action) {
  return (req, res, next) => {
    // Trust X-Forwarded-For if behind a proxy, fallback to socket IP
    const ip =
      (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
      req.socket.remoteAddress ||
      "unknown";

    const id = req.params.id;
    const key = `${ip}:${action}:${id}`;
    const now = Date.now();
    const cooldown = COOLDOWNS[action];
    const last = actionLog.get(key);

    if (last && now - last < cooldown) {
      const secondsLeft = Math.ceil((cooldown - (now - last)) / 1000);

      // For AJAX endpoints (like), return JSON error
      if (
        req.headers.accept &&
        req.headers.accept.includes("application/json")
      ) {
        return res.status(429).json({
          error: "Too soon",
          retryAfter: secondsLeft,
        });
      }

      // For form submissions (flag), redirect back with a flash-style query param
      return res.redirect(`/?rateLimited=${action}&wait=${secondsLeft}`);
    }

    actionLog.set(key, now);

    // Prune old entries every ~500 actions to prevent memory leak
    if (actionLog.size > 500) {
      const cutoff = now - Math.max(...Object.values(COOLDOWNS));
      for (const [k, t] of actionLog.entries()) {
        if (t < cutoff) actionLog.delete(k);
      }
    }

    next();
  };
}

module.exports = { rateLimitAction };
