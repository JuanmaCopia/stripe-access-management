import type { CatalogPlan, PlanSelection } from "../domain/index";

export interface CatalogPlanResolver {
  resolvePlanSelection(selection: PlanSelection): Promise<CatalogPlan | null>;
}
