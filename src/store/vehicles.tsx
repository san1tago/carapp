import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type VehicleType = "carro" | "moto" | "camion" | "van" | "bus" | "taxi";

export type SoatData = {
  purchaseDate?: string;
  expiryDate?: string;        // 🔥 nuevo
  photoUri?: string;
  remindersDaysBefore: number[];
  notificationIds: string[];
};

export type TecnomecanicaData = {
  reviewDate?: string;        // cuándo se hizo
  expiryDate?: string;        // 🔥 nuevo: cuándo vence
  photoUri?: string;
  remindersDaysBefore: number[];
  notificationIds: string[];
};

export type ExtintorData = {
  purchaseDate?: string;
  expiryDate?: string;        // 🔥 nuevo
  photoUri?: string;
  remindersDaysBefore: number[];
  notificationIds: string[];
};

export type KitCarreteraData = {
  items: string[];
};

export type DocumentosData = {
  items: string[];
};

export type SeguroAdicionalData = {
  type?: string;
  startDate?: string;
  endDate?: string;
  photoUri?: string;
  remindersDaysBefore: number[];
  notificationIds: string[];
};

export type TarjetaOperacionData = {
  info?: string;
  expeditionDate?: string;
  expiryDate?: string;        // 🔥 nuevo
  photoUri?: string;
  remindersDaysBefore: number[];
  notificationIds: string[];
};
export type TarjetaControlData = {
  info?: string;
  expiryDate?: string;
  photoUri?: string;
  remindersDaysBefore: number[];
  notificationIds: string[];
};

// En Vehicle, agregar:
export type ExtractoContratoData = {
  info?: string;
  photoUri?: string;
};

export type Vehicle = {
  id: string;
  type: VehicleType;
  name: string;
  model?: string;
  plate?: string;
  photoUri?: string;
  soat: SoatData;
  tecnomecanica: TecnomecanicaData;
  extintor: ExtintorData;
  kitCarretera: KitCarreteraData;
  documentos: DocumentosData;
  seguroAdicional: SeguroAdicionalData;
  tarjetaOperacion: TarjetaOperacionData;
  extractoContrato: ExtractoContratoData;
  tarjetaControl?: TarjetaControlData; // 🔥 opcional, solo taxis
};

type Ctx = {
  vehicles: Vehicle[];
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  getVehicle: (id: string) => Vehicle | undefined;
  deleteVehicle: (id: string) => void;  // 🔥 nuevo
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

  const value = useMemo<Ctx>(() => ({
    vehicles,
    addVehicle: (v) => setVehicles((prev) => [v, ...prev]),
    updateVehicle: (id, patch) =>
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...patch } : v)),
      ),
    getVehicle: (id) => vehicles.find((v) => v.id === id),
    deleteVehicle: (id) =>
      setVehicles((prev) => prev.filter((v) => v.id !== id)),
  }), [vehicles]);

  return (
    <VehiclesContext.Provider value={value}>
      {children}
    </VehiclesContext.Provider>
  );
}

export function useVehicles() {
  const ctx = useContext(VehiclesContext);
  if (!ctx) throw new Error("useVehicles must be used within VehiclesProvider");
  return ctx;
}