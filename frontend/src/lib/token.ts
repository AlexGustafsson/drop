export type UploadClaims = {
  maximumFileCount: number,
  maximumFileSize: number,
  maximumSize: number,
  archiveId: string,
  expiresAt: Date,
  id: string,
  issuer: string,
}

export function parseFragments() {
  const fragments = location.hash.substr(1).split("&").reduce((result: { [key: string]: string }, fragment) => {
    const [key, value] = fragment.split("=");
    result[key] = value;
    return result;
  }, {});

  return { token: fragments["token"] || null, secret: fragments["secret"] || null };
}

export function parseUploadClaims(token: string): UploadClaims {
  const claims = JSON.parse(atob(token.split(".")[1]));
  return {
    maximumFileCount: claims["mfc"] || 0,
    maximumFileSize: claims["mfs"] || 0,
    maximumSize: claims["ms"] || 0,
    archiveId: claims["arc"],
    expiresAt: new Date(claims["exp"] * 1000),
    id: claims["jti"],
    issuer: claims["iss"],
  };
}
