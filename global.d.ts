export {};

// Extend the Window interface to include the FB object
declare global {
  interface Window {
    fbAsyncInit: () => void;
  }
}
