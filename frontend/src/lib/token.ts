export abstract class Token {
  constructor(
    private readonly raw: string,
    public readonly expiresAt: Date,
    public readonly id: string,
    public readonly issuer: string
  ) {}

  isValid(): boolean {
    return Date.now() < this.expiresAt.getTime();
  }

  toString(): string {
    return this.raw;
  }
}

export class UploadToken extends Token {
  constructor(
    raw: string,
    expiresAt: Date,
    id: string,
    issuer: string,
    public readonly maximumFileCount: number,
    public readonly maximumFileSize: number,
    public readonly maximumSize: number,
    public readonly archiveId: string,
    public readonly archiveName: string,
  ) {
    super(raw, expiresAt, id, issuer);
  }

  static parse(token: string): UploadToken {
    const claims = JSON.parse(atob(token.split(".")[1]));
    if (claims["iss"] !== "drop")
      throw Error("Not a valid token for drop");
    if (claims["sub"] !== "archive")
      throw Error("Not a valid token for an archive");

    return new UploadToken(
      token,
      new Date(claims["exp"] * 1000),
      claims["jti"],
      claims["iss"],
      claims["mfc"] || 0,
      claims["mfs"] || 0,
      claims["ms"] || 0,
      claims["ari"],
      claims["arn"],
    )
  }
}

export class AdminToken extends Token {
  constructor(
    raw: string,
    expiresAt: Date,
    id: string,
    issuer: string,
  ) {
    super(raw, expiresAt, id, issuer);
  }

  static parse(token: string): AdminToken {
    const claims = JSON.parse(atob(token.split(".")[1]));
    if (claims["iss"] !== "drop")
      throw Error("Not a valid token for drop");
    if (claims["sub"] !== "admin")
      throw Error("Not a valid token for an admin");

    return new AdminToken(
      token,
      new Date(claims["exp"] * 1000),
      claims["jti"],
      claims["iss"],
    )
  }
}
