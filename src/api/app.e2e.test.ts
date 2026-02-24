import request from "supertest";
import { createApp } from "./app";

describe("API health", () => {
  it("returns ok", async () => {
    const app = createApp();

    const response = await request(app)
      .get("/health")
      .expect(200);

    expect(response.body).toEqual({ status: "ok" });
  });
});
