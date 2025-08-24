import React from 'react';
import { StackProvider } from '@stackframe/stack';
import { stackClientApp } from '../lib/stack-auth';
import { StackAuthProvider as InnerStackAuthProvider } from '../hooks/use-stack-auth';

interface StackAuthProviderProps {
  children: React.ReactNode;
}

export function StackAuthProvider({ children }: StackAuthProviderProps) {
  return (
    <StackProvider app={stackClientApp}>
      <InnerStackAuthProvider>
        {children}
      </InnerStackAuthProvider>
    </StackProvider>
  );
}