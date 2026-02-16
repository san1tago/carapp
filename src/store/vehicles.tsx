import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type VehicleType = "carro" | "moto" | "camion" | "van" | "bus" | "taxi";

export type SoatData = {
  purchaseDate?: string; // ISO
  photoUri?: string;
  remindersDaysBefore: number[]; // ej: [7]
  notificationIds: string[];
};

export type Vehicle = {
  id: string;
  type: VehicleType;
  name: string;
  model?: string;
  plate?: string;
  photoUri?: string;
  soat: SoatData;
};

type Ctx = {
  vehicles: Vehicle[];
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  getVehicle: (id: string) => Vehicle | undefined;
};

const VehiclesContext = createContext<Ctx | null>(null);
const KEY = "carapp.vehicles.v1";

export function VehiclesProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) setVehicles(JSON.parse(raw));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  const value = useMemo<Ctx>(() => {
    return {
      vehicles,
      addVehicle: (v) => setVehicles((prev) => [v, ...prev]),
      updateVehicle: (id, patch) =>
        setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v))),
      getVehicle: (id) => vehicles.find((v) => v.id === id),
    };
  }, [vehicles]);

  return <VehiclesContext.Provider value={value}>{children}</VehiclesContext.Provider>;
}

export function useVehicles() {
  const ctx = useContext(VehiclesContext);
  if (!ctx) throw new Error("useVehicles must be used within VehiclesProvider");
  return ctx;
}
