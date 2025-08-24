import { StackClientApp } from "@stackframe/stack";

const stackClientApp = new StackClientApp({
  projectId: import.meta.env.VITE_STACK_PROJECT_ID || '3b274e6d-5ded-4246-9b45-e3721ef00676',
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || 'pck_776jykt2yesys217x7v18h2xwk33yjmzq9pjjngased1r',
  baseUrl: 'https://api.stack-auth.com',
});

export { stackClientApp };