export interface FireInput { currentAge: number; currentAssets: number; monthlyInvestment: number; annualReturn: number; monthlyExpenses: number; withdrawalRate: number; }
export interface AssetProjection { month: number; age: number; assets: number; }
export interface FireResult { targetAssets: number; monthsToFire: number | null; fireAge: { years: number; months: number } | null; fireDate: string | null; progress: number; projectedAssets: AssetProjection[]; }
export interface LabState { schemaVersion: 1; xp: number; streak: { current: number; best: number; lastDate: string }; }
