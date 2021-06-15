import {Api} from "drop-client";

export type SecurityDataType = {
  token: string | null
};

export const api = new Api<SecurityDataType>({
  baseUrl: DROP_API_ROOT,
  securityWorker(securityData) {
    if (securityData && securityData.token) {
      return {
        headers: {
          // TODO: Make dependant on the target API as both APIs use tokens
          Authorization: `Bearer ${securityData.token}`,
        }
      };
    }
  },
});
export default api;
