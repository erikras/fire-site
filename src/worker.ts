type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

type Env = {
  ASSETS: AssetsBinding;
};

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const mustRedirect =
      url.protocol === "http:" || url.hostname === "www.storecanary.app";

    if (mustRedirect) {
      url.protocol = "https:";
      url.hostname = "storecanary.app";
      return Response.redirect(url.toString(), 308);
    }

    return env.ASSETS.fetch(request);
  },
};

export default worker;
