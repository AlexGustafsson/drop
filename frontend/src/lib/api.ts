import {Api} from "drop-client";

export type SecurityDataType = {
  adminToken: string | null
  uploadToken: string | null
};

const api = new Api<SecurityDataType>({
  baseUrl: DROP_API_ROOT,
  securityWorker(securityData) {
    if (securityData && (securityData.adminToken || securityData.uploadToken)) {
      return {
        headers: {
          // TODO: Make dependant on the target API as both APIs use tokens
          Authorization: `Bearer ${securityData.uploadToken || securityData.adminToken}`,
        }
      };
    }
  },
});

export function useApi(): Api<SecurityDataType> {
  return api;
}
