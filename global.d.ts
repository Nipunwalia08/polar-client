export {};

// Extend the Window interface to include the FB object
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: FB; // Specify the type for `FB`
  }
}

// Define the FB interface
interface FB {
  init(params: { appId: string; cookie: boolean; xfbml: boolean; version: string }): void;
  AppEvents: {
    logPageView(): void;
  };
  login(callback: (response: FB.StatusResponse) => void, options: { scope: string }): void;
  api(path: string, options: { fields: string }, callback: (response: any) => void): void;
}

// Define the StatusResponse interface within the FB namespace
declare namespace FB {
  interface StatusResponse {
    status: string;
    authResponse: {
      accessToken: string;
      expiresIn: number;
      signedRequest: string;
      userID: string;
    };
  }
}
