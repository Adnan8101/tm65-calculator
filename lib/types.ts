export type Level = "basic" | "mid";

export type Step = "product" | "materials" | "upkeep" | "factory" | "review";

export type Mat = {
  id: string;
  kind: "tm65" | "ice";
  name: string;
  pct: string;
  rec: string;
  origin: string;
  lat: number | null;
  lng: number | null;
};

export type Rep = { id: string; mat: string; rate: string };

export type Draft = {
  type: string;
  maker: string;
  name: string;
  email: string;
  cap: string;
  unit: string;
  life: string;
  weight: string;
  mats: Mat[];
  hasRef: boolean;
  ref: string;
  charge: string;
  leak: string;
  reps: Rep[];
  city: string;
  cityOk: boolean;
  kwh: string;
  region: string;
  fuelKwh: string;
  fuel: string;
  totalT: string;
  prodT: string;
  units: string;
};

export type Ref = {
  productTypes: string[];
  slots: { slot: number; name: string; locked: boolean }[];
  extra: string[];
  refrigerants: string[];
  leaks: string[];
  regions: string[];
  fuels: string[];
  units: string[];
};

export type Errs = Record<string, string>;

export type StepProps = { d: Draft; up: (p: Partial<Draft>) => void; errs: Errs; refs: Ref };

export type City = { label: string; lat: number; lng: number };
