function randomState() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function html(status, tokenOrMessage) {
  const payload =
    status === "success"
      ? { token: tokenOrMessage }
      : { error: tokenOrMessage || "OAuth authorization failed" };

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Authorizing Decap</title>
    <script>
      const receiveMessage = () => {
        window.opener.postMessage(
          'authorization:github:${status}:${JSON.stringify(payload)}',
          '*'
        );
        window.removeEventListener('message', receiveMessage, false);
      };
      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:github', '*');
    </script>
  </head>
  <body>
    <p>Authorizing Decap...</p>
  </body>
</html>`;
}

function siteOrigin(event) {
  const host = event.headers.host || "barbara-yukhnjevich-site.netlify.app";
  const protocol = host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

exports.handler = async (event) => {
  const clientId = process.env.GITHUB_OAUTH_ID;
  const clientSecret = process.env.GITHUB_OAUTH_SECRET;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "GitHub OAuth is not configured."
    };
  }

  const origin = siteOrigin(event);
  const redirectUri = `${origin}/callback`;
  const path = event.path || "";

  if (path.endsWith("/auth")) {
    const provider = event.queryStringParameters?.provider;
    if (provider && provider !== "github") {
      return { statusCode: 400, body: "Invalid provider." };
    }

    const isPrivateRepo = process.env.GITHUB_REPO_PRIVATE !== "0";
    const scope = isPrivateRepo ? "repo,user" : "public_repo,user";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state: randomState()
    });

    return {
      statusCode: 302,
      headers: {
        Location: `https://github.com/login/oauth/authorize?${params.toString()}`
      },
      body: ""
    };
  }

  if (path.endsWith("/callback")) {
    const code = event.queryStringParameters?.code;
    if (!code) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/html" },
        body: html("error", "Missing GitHub authorization code.")
      };
    }

    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const json = await response.json();
    if (!response.ok || !json.access_token) {
      return {
        statusCode: 502,
        headers: { "Content-Type": "text/html" },
        body: html("error", json.error_description || json.error || "GitHub token exchange failed.")
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: html("success", json.access_token)
    };
  }

  return {
    statusCode: 404,
    body: "Not found."
  };
};
