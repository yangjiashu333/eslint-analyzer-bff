import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import type { Context, Next } from "hono";

// 创建 Hono 应用实例
const app = new Hono();

// 全局中间件
app.use(logger()); // 日志中间件
app.use(prettyJSON()); // 美化 JSON 响应
app.use(cors()); // CORS 中间件

// 基本路由定义
// GET 请求
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// POST 请求
app.post("/api/users", async (c) => {
  const user = await c.req.json();
  return c.json({ message: "User created", user }, 201);
});

// PUT 请求
app.put("/api/users/:id", async (c) => {
  const id = c.req.param("id");
  const user = await c.req.json();
  return c.json({ message: `User ${id} updated`, user });
});

// DELETE 请求
app.delete("/api/users/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ message: `User ${id} deleted` });
});

// 请求参数处理
// Path 参数
app.get("/api/users/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ id, name: "John Doe" });
});

// Query 参数
app.get("/api/search", (c) => {
  const query = c.req.query("q") || "";
  const page = c.req.query("page") || "1";
  return c.json({ query, page, results: [] });
});

// Body 参数
app.post("/api/login", async (c) => {
  const { username, password } = await c.req.json();
  return c.json({ token: "jwt-token-123" });
});

// 不同类型的响应
// Text 响应
app.get("/text", (c) => {
  return c.text("This is a text response", 200, { "X-Custom-Header": "value" });
});

// JSON 响应
app.get("/json", (c) => {
  return c.json({ message: "Hello", data: { key: "value" } });
});

// HTML 响应
app.get("/html", (c) => {
  return c.html("<h1>Hello Hono!</h1><p>Welcome to Hono framework</p>");
});

// 重定向
app.get("/redirect", (c) => {
  return c.redirect("/");
});

// 文件下载
app.get("/download", (c) => {
  return c.text("File content", 200, {
    "Content-Type": "text/plain",
    "Content-Disposition": "attachment; filename=file.txt",
  });
});

// 中间件示例
// 自定义中间件
const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header("Authorization");
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};

// 应用中间件到特定路由
app.get("/api/protected", authMiddleware, (c) => {
  return c.json({ message: "Protected route accessed" });
});

// 错误处理
// 自定义错误处理中间件
app.use("*", async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return c.json({ error: errorMessage }, 500);
  }
});

// 404 处理
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

// 路由组
const api = app.basePath("/api/v1");

// API 版本 1 路由
api.get("/users", (c) => {
  return c.json({ version: "v1", users: [] });
});

api.get("/posts", (c) => {
  return c.json({ version: "v1", posts: [] });
});

// 嵌套路由组
const admin = api.basePath("/admin");

admin.get("/dashboard", (c) => {
  return c.json({ admin: true, dashboard: "Welcome Admin" });
});

export default app;
