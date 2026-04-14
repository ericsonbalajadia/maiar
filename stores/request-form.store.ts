// stores/request-form.store.ts
import { create } from 'zustand';
import type { RequestType } from '@/lib/constants/request-types';
import type { PpsrServiceType } from '@/lib/constants/ppsr-service-types';

interface RequestFormState {
  requestType: RequestType | null;
  ppsrServiceType: PpsrServiceType | null;
  // Steps: 1 = type picker, 2 = form fields, 3 = confirm
  currentStep: number;
  setRequestType: (t: RequestType) => void;
  setPpsrServiceType: (t: PpsrServiceType) => void;
  setStep: (s: number) => void;
  reset: () => void;
}

export const useRequestFormStore = create<RequestFormState>((set) => ({
  requestType: null,
  ppsrServiceType: null,
  currentStep: 1,
  setRequestType: (requestType) => set({ requestType, currentStep: 2 }),
  setPpsrServiceType: (ppsrServiceType) => set({ ppsrServiceType }),
  setStep: (currentStep) => set({ currentStep }),
  reset: () => set({ requestType: null, ppsrServiceType: null, currentStep: 1 }),
}));