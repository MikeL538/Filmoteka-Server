import express from "express";
import cors from "cors";

export const app = express();

app.use(cors());
app.use(express.json());
console.log("test");

const TEST_TOKEN = "filmoteka-test-token";

const testUser = {
  login: "test",
  password: "test",
  watched: [603, 238],
  queued: [155, 27205],
};

function getBearerToken(authHeader?: string): string | null {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length);
}

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "filmoteka-server" });
});

app.post("/api/auth/login", (req, res) => {
  const { login, password } = req.body ?? {};

  if (login !== testUser.login || password !== testUser.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.status(200).json({
    token: TEST_TOKEN,
    user: { login: testUser.login },
    lists: {
      watched: testUser.watched,
      queued: testUser.queued,
    },
  });
});

app.get("/api/users/me/lists", (req, res) => {
  const token = getBearerToken(req.headers.authorization);

  if (token !== TEST_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.status(200).json({
    watched: testUser.watched,
    queued: testUser.queued,
  });
});

app.put("/api/users/me/lists/:listName", (req, res) => {
  const token = getBearerToken(req.headers.authorization);

  if (token !== TEST_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { listName } = req.params;
  const { movieIds } = req.body ?? {};

  if (listName !== "watched" && listName !== "queued") {
    return res.status(400).json({ message: "Unknown list name" });
  }

  if (!Array.isArray(movieIds)) {
    return res.status(400).json({ message: "movieIds must be an array" });
  }

  const normalizedIds = movieIds
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));

  testUser[listName] = normalizedIds;

  return res.status(200).json({
    watched: testUser.watched,
    queued: testUser.queued,
  });
});
