import { Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RoutineDetailsCard from "../components/RoutineDetailsCard";
import { Exercise, Routine, supabase } from "../supabase";

const RoutineCardCreated = () => {
  const [loading, setLoading] = useState(false);
  const [routines, setRoutines] = useState<any[]>([]);
  const [selectedRoutines, setSelectedRoutines] = useState<Routine | null>(
    null,
  );
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("routines")
        .select("*")
        .order("created_at", { ascending: false });
      console.log("RUTINITAS 🐀🐀🐀🐀🐀 ", data);
      if (error) throw error;
      setRoutines(data || []);
    } catch (error) {
      console.error("Error cargando rutinas:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async (routineId: string) => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("routine_id", routineId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error("Error loading exercises:", error);
    }
  };

  const viewRoutine = async (routine: Routine) => {
    setSelectedRoutines(routine);
    await loadExercises(routine.id);
  };

  if (selectedRoutines) {
    return (
      <RoutineDetailsCard
        routine={selectedRoutines}
        onBack={() => setSelectedRoutines(null)}
      />
    );
  }

  const deleteRoutine = async (routine: Routine, id: string) => {
    try {
      const { error } = await supabase.from("routines").delete().eq("id", id);

      if (error) throw error;
      fetchRoutines();
      if (routine.id === id) {
        setSelectedRoutines(null);
      }
    } catch (error) {
      console.error("Error deleting routine:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.content}>
        {routines.map((routine) => (
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
              onPress={() => deleteRoutine(routine.id, routine.id)}
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
  exerciseItem: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
    marginRight: 12,
    minWidth: 30,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  exerciseMeta: {
    fontSize: 14,
    color: "#6b7280",
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
