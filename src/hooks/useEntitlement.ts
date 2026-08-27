import { useEffect, useState } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";

export function useEntitlement(entitlementId = "premium") {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Purchases.getCustomerInfo()
      .then((info) => setIsActive(!!info.entitlements.active[entitlementId]))
      .finally(() => setLoading(false));

    const listener = (info: CustomerInfo) => {
      setIsActive(!!info.entitlements.active[entitlementId]);
    };
    Purchases.addCustomerInfoUpdateListener(listener);

    return () => Purchases.removeCustomerInfoUpdateListener(listener);
  }, [entitlementId]);

  return { isActive, loading };
}
