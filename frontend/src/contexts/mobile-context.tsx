'use client';

import { createContext, useContext } from 'react';

const MobileContext = createContext<boolean>(false);

export const MobileProvider = MobileContext.Provider;

export function useIsMobile(): boolean {
  return useContext(MobileContext);
}
