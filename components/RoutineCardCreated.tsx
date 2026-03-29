import { useFocusEffect } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RoutineDetailsCard from "../components/RoutineDetailsCard";
import { useRoutines } from "../hooks/useRoutines";
import { Routine } from "../supabase";

const RoutineCardCreated = () => {
  const { routines, deleteRoutineFromSupabase, refreshRoutines } =
    useRoutines();
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshRoutines();
    }, [refreshRoutines]),
  );

  const viewRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
  };

  const deleteRoutine = async (routineId: string) => {
    try {
      const result = await deleteRoutineFromSupabase(routineId);

      if (!result.success) {
        throw result.error;
      }

      if (selectedRoutine && selectedRoutine.id === routineId) {
        setSelectedRoutine(null);
      }
    } catch (error) {
      console.error(error);
      alert("No se pudo borrar la rutina");
    }
  };

  if (selectedRoutine) {
    return (
      <RoutineDetailsCard
        routine={selectedRoutine}
        onBack={() => setSelectedRoutine(null)}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.content}>
        {routines.map((routine: Routine) => (
          <View key={routine.id} style={styles.routineCard}>
            <TouchableOpacity
              style={styles.routineContent}
              onPress={() => viewRoutine(routine)}
            >
              <Text style={styles.routineName}>{routine.name}</Text>
              <Text style={styles.routineDate}>
                {new Date(routine.created_at).toLocaleDateString("es-ES")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteRoutine(routine.id)}
            >
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}

        {routines.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay rutinas guardadas</Text>
            <Text style={styles.emptySubtext}>
              Toca el botón + para crear tu primera rutina
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  routineCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  routineContent: {
    flex: 1,
  },
  routineName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  routineDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

export default RoutineCardCreated;
