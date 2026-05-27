import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type SignupDraft = {
  userName: string;
  phoneNumber: string;
  email: string;
  password: string;
  userAddress: string;
  role: string;
  agreedToTerms: boolean;
};

type SignupContextValue = {
  draft: SignupDraft;
  updateDraft: (update: Partial<SignupDraft>) => void;
  resetDraft: () => void;
};

const DEFAULT_DRAFT: SignupDraft = {
  userName: '',
  phoneNumber: '',
  email: '',
  password: '',
  userAddress: '',
  role: 'user',
  agreedToTerms: false,
};

const SignupContext = createContext<SignupContextValue | undefined>(undefined);

export function SignupProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<SignupDraft>(DEFAULT_DRAFT);

  const value = useMemo(
    () => ({
      draft,
      updateDraft: (update: Partial<SignupDraft>) => {
        setDraft((previous) => ({ ...previous, ...update }));
      },
      resetDraft: () => {
        setDraft(DEFAULT_DRAFT);
      },
    }),
    [draft],
  );

  return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>;
}

export function useSignupDraft() {
  const context = useContext(SignupContext);

  if (!context) {
    throw new Error('useSignupDraft must be used within SignupProvider');
  }

  return context;
}
