import { useEffect, useState } from "react";
import Purchases, { PurchasesPackage } from "react-native-purchases";

export function useOfferings() {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setPackages(offerings.current.availablePackages);
        } else {
          setError("No hay offering configurado en RevenueCat");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { packages, loading, error };
}
