export const getCartIdentifier = (req) => {
  try {
    if (req.user) {
      return { type: "user", id: req.user._id };
    }

    const sessionId = req.sessionID || req.headers['x-session-id'] || req.cookies['sessionId'] || null;
    if (sessionId) {
      return { type: "guest", id: sessionId };
    }

    return null;
  } catch (error) {
    console.error("Error in getCartIdentifier:", error);
    return null;
  }
};
