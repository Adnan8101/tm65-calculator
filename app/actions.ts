'use server';

import * as svc from '@/server/service';

export async function getReference() {
  return svc.reference();
}

export async function searchCities(q: string) {
  return svc.cities(q);
}

export async function getExample() {
  return svc.example();
}

export async function getBls() {
  return svc.blsData();
}

export async function calculate(inputs: unknown, mode: string) {
  return svc.run(inputs, mode);
}
