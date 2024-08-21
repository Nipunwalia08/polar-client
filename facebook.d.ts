declare global {
    interface Window {
      FB: FB;
    }
  
    interface FB {
      init(params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }): void;
      AppEvents: {
        logPageView(): void;
      };
      login(
        callback: (response: FB.StatusResponse) => void,
        options: { scope: string }
      ): void;
      api(
        path: string,
        options: { fields: string },
        callback: (response: any) => void
      ): void;
    }
  
    namespace FB {
      interface StatusResponse {
        status: string;
        authResponse: {
          accessToken: string;
          expiresIn: number;
          signedRequest: string;
          userID: string;
        } | null;
      }
    }
  }
  
  export {};