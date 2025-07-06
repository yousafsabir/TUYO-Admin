"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  getAllSubscriptionPlans,
  type SubscriptionPlan,
} from "@/lib/api/subscription-plans";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Loader2, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EditSubscriptionPlanModal } from "./edit-subscription-plan-modal";

interface SubscriptionPlansTableProps {}

export function SubscriptionPlansTable({}: SubscriptionPlansTableProps) {
  const [planToEdit, setPlanToEdit] = useState<SubscriptionPlan | null>(null);
  const t = useTranslations();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: getAllSubscriptionPlans,
  });

  const handleEditClick = (plan: SubscriptionPlan) => {
    setPlanToEdit(plan);
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return "N/A";
    return price === 0 ? "Free" : `$${price}`;
  };

  const formatListingsLimit = (limit: number | undefined) => {
    if (limit === undefined || limit === null) return "N/A";
    return limit >= 999999999 ? "Unlimited" : limit.toString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : "Failed to load subscription plans"}
        </AlertDescription>
      </Alert>
    );
  }

  const plans = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("subscriptionPlans.plan") || "Plan"}</TableHead>
              <TableHead>{t("subscriptionPlans.price") || "Price"}</TableHead>
              <TableHead>
                {t("subscriptionPlans.listingsLimit") || "Listings Limit"}
              </TableHead>
              <TableHead className="text-center">
                {t("subscriptionPlans.auctions") || "Auctions"}
              </TableHead>
              <TableHead className="text-center">
                {t("subscriptionPlans.featured") || "Featured"}
              </TableHead>
              <TableHead className="text-center">
                {t("subscriptionPlans.premium") || "Premium"}
              </TableHead>
              <TableHead>
                {t("subscriptionPlans.features") || "Features"}
              </TableHead>
              <TableHead className="text-right">
                {t("subscriptionPlans.actions") || "Actions"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t("subscriptionPlans.noPlans") ||
                    "No subscription plans found"}
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan: SubscriptionPlan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{plan.title || "N/A"}</p>
                      {plan.subtitle && (
                        <p className="text-sm text-muted-foreground">
                          {plan.subtitle}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        ID: {plan.planId || "N/A"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.price === 0 ? "secondary" : "default"}>
                      {formatPrice(plan.price)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatListingsLimit(plan.listingsLimit)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {plan.auctionsAllowed ? (
                      <Check className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {plan.featuredProductsAllowed ? (
                      <Check className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {plan.premiumProductsAllowed ? (
                      <Check className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm text-muted-foreground">
                        {plan.features?.length || 0} feature
                        {(plan.features?.length || 0) !== 1 ? "s" : ""}
                      </p>
                      {plan.features && plan.features.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {plan.features.slice(0, 2).map((feature, index) => (
                            <div key={index} className="truncate">
                              • {feature.heading || "Feature"}
                            </div>
                          ))}
                          {plan.features.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{plan.features.length - 2} more...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(plan)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {t("subscriptionPlans.edit") || "Edit"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Plan Modal */}
      <EditSubscriptionPlanModal
        isOpen={planToEdit !== null}
        onClose={() => setPlanToEdit(null)}
        plan={planToEdit}
      />
    </div>
  );
}
