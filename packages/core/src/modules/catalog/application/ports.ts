import type { CatalogPlan, PlanSelection } from "../domain/index.js";

export interface CatalogPlanResolver {
  resolvePlanSelection(selection: PlanSelection): Promise<CatalogPlan | null>;
}
