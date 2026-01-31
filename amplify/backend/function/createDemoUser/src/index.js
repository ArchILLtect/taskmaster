const crypto = require("node:crypto");
const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminAddUserToGroupCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const cognito = new CognitoIdentityProviderClient({});

// ---- Config ----
// Demo identities look like: demo+<uuid>@taskmaster.me
const DEMO_EMAIL_DOMAIN = "taskmaster.me";
const DEMO_GROUP_NAME = "Demo";

// CORS allowlist
const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "https://taskmaster.nickhanson.me",
  "https://www.taskmaster.nickhanson.me",
  // "https://<your-netlify-domain>.netlify.app",
]);

function pickOrigin(event) {
  const origin =
    event?.headers?.origin ||
    event?.headers?.Origin ||
    event?.multiValueHeaders?.origin?.[0] ||
    event?.multiValueHeaders?.Origin?.[0];

  if (!origin) return null;
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  return null;
}

function corsHeaders(origin) {
  // If origin is not allowed, omit Access-Control-Allow-Origin.
  // Browser will block it (good).
  const base = {
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
  };

  return origin
    ? { ...base, "Access-Control-Allow-Origin": origin }
    : base;
}

function json(statusCode, bodyObj, origin) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
    body: JSON.stringify(bodyObj),
  };
}

function randomPassword() {
  // Cognito password policy usually requires upper/lower/number/special
  // This generates a strong password with safe special chars.
  const base = crypto.randomBytes(18).toString("base64url"); // no + or /
  return `D!${base}9aZ#`; // ensures special/upper/lower/number
}

function demoEmail() {
  // unique enough; avoids collisions
  const id = crypto.randomUUID();
  return `demo+${id}@${DEMO_EMAIL_DOMAIN}`;
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  const origin = pickOrigin(event);

  // Handle preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders(origin),
      body: "",
    };
  }

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed" }, origin);
  }

  const userPoolId = process.env.USER_POOL_ID;

  if (!userPoolId) {
    return json(
      500,
      { message: "Missing UserPoolId env var. Check function environment variables." },
      origin
    );
  }

  // Create a unique demo identity
  const username = demoEmail();
  const password = randomPassword();

  // Try once; if collision (unlikely), retry with a new uuid
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      // 1) Create user without sending email
      await cognito.send(
        new AdminCreateUserCommand({
          UserPoolId: userPoolId,
          Username: username,
          MessageAction: "SUPPRESS",
          UserAttributes: [
            { Name: "email", Value: username },
            { Name: "email_verified", Value: "true" },
          ],
        })
      );

      // 2) Set permanent password
      await cognito.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: userPoolId,
          Username: username,
          Password: password,
          Permanent: true,
        })
      );

      // 3) Add to Demo group (optional but recommended)
      // If group doesn't exist, this will throw — we’ll treat that as non-fatal.
      try {
        await cognito.send(
          new AdminAddUserToGroupCommand({
            UserPoolId: userPoolId,
            Username: username,
            GroupName: DEMO_GROUP_NAME,
          })
        );
      } catch (e) {
        console.warn("[demo] could not add user to Demo group:", e?.name || e);
      }

      // Success
      return json(200, { username, password }, origin);
    } catch (e) {
      const name = e?.name || "";
      const message = e?.message || "";

      // Collision / already exists — retry
      if (name === "UsernameExistsException") {
        console.warn("[demo] username exists, retrying...");
        continue;
      }

      console.error("[demo] failed to create demo user:", name, message);

      // Don't leak internal details to the client
      return json(
        500,
        { message: "Failed to create demo user. Please try again." },
        origin
      );
    }
  }

  return json(500, { message: "Failed to create demo user (retry exhausted)." }, origin);
};
