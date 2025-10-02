import React, { useEffect, useState, useMemo } from "react";
import { View, Text, FlatList } from "react-native";
import { me, type Me } from "@/src/api/auth";
import { api } from "@/src/api/cliente";

type Solicitud = {
  id_solicitud: number;
  codigo?: string | null;
  estado?: string | null;
  created_at?: string | null;
  fecha_envio?: string | null;
  fecha_vencimiento?: string | null;
};

export default function Dashboard() {
  const [user, setUser] = useState<Me | null>(null);
  const [items, setItems] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await me();
        if (!alive) return;
        setUser(u);
        const r = await api.get("/solicitudes/mis");
        if (!alive) return;
        setItems(Array.isArray(r.data) ? r.data : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const recientes = useMemo(() => {
    const sorted = [...items].sort((a, b) => b.id_solicitud - a.id_solicitud);
    return sorted.slice(0, 4);
  }, [items]);

  const proxVenc = useMemo(() => {
    const fechas = items.map(x => x.fecha_vencimiento).filter(Boolean) as string[];
    if (!fechas.length) return "—";
    const min = fechas.reduce((a, b) => (new Date(a) < new Date(b) ? a : b));
    return new Date(min).toLocaleDateString();
  }, [items]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0b0b0b", padding: 16 }}>
      <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
        {user ? `Hola, ${user.Nombre}` : "Inicio"}
      </Text>
      <Text style={{ color: "#a3a3a3", marginTop: 4 }}>Resumen de tu actividad</Text>

      {/* KPIs */}
      <View style={{ marginTop: 16, gap: 12 }}>
        <Kpi title="Solicitudes activas" value={items.length} />
        <Kpi title="Próximo vencimiento" value={proxVenc} />
      </View>

      {/* Recientes */}
      <Text style={{ color: "white", marginTop: 20, fontWeight: "600" }}>Actividad reciente</Text>
      <FlatList
        style={{ marginTop: 8 }}
        data={recientes}
        keyExtractor={(x) => String(x.id_solicitud)}
        ListEmptyComponent={!loading ? <Text style={{ color: "#a3a3a3" }}>Sin actividad.</Text> : null}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderRadius: 12, borderColor: "#262626", borderWidth: 1, marginBottom: 8 }}>
            <Text style={{ color: "white", fontWeight: "600" }}>#{item.id_solicitud}</Text>
            <Text style={{ color: "#a3a3a3" }}>Código: {item.codigo ?? "—"}</Text>
            <Text style={{ color: "#a3a3a3" }}>Estado: {item.estado ?? "—"}</Text>
            <Text style={{ color: "#a3a3a3" }}>
              Fecha: {new Date(item.created_at ?? item.fecha_envio ?? "").toLocaleDateString() || "—"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

function Kpi({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <View style={{ padding: 14, borderRadius: 16, borderColor: "#262626", borderWidth: 1 }}>
      <Text style={{ color: "#a3a3a3" }}>{title}</Text>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "700", marginTop: 4 }}>{value}</Text>
    </View>
  );
}
