import { http, HttpResponse } from "msw";

export const handlers = [
  // Auth endpoints
  http.post("/api/auth/signin", async () => {
    return HttpResponse.json({
      user: { id: "1", email: "test@example.com", name: "Test User" },
    });
  }),

  // User endpoints
  http.get("/api/users", async () => {
    return HttpResponse.json({
      success: true,
      data: [{ id: "1", email: "test@example.com", name: "Test User" }],
    });
  }),
];
