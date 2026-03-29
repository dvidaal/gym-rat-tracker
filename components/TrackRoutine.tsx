import { useRoutines } from "@/hooks/useRoutines";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useFocusEffect } from "expo-router";
import { ArrowLeft, ChevronRight, Plus } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Routine, supabase } from "../supabase";

const TrackRoutine = () => {
  const { routines, refreshRoutines } = useRoutines();
  const { lastLogs, refreshLogs } = useWorkoutHistory();

  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [isTrackModalVisible, setIsTrackModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<{
    block: string;
    name: string;
    dayName: string;
  } | null>(null);

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  const [sessionLogs, setSessionLogs] = useState<
    Record<string, { weight: string; reps: string }>
  >({});

  // AUTO-REFRESCO: Se ejecuta cada vez que entras a esta pantalla
  useFocusEffect(
    useCallback(() => {
      refreshRoutines();
      refreshLogs();
    }, [refreshRoutines, refreshLogs]),
  );

  const viewRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);

    const routineLogs = lastLogs[routine.id] || [];
    const today = new Date().toISOString().split("T")[0];
    const todayLog = routineLogs.find((log) =>
      log.completed_at.startsWith(today),
    );

    if (todayLog) {
      const initialLogs: Record<string, { weight: string; reps: string }> = {};
      todayLog.session_data.days?.forEach((day: any) => {
        day.exercises.forEach((ex: any) => {
          if (ex.weight || ex.reps) {
            initialLogs[`${day.dayName}-${ex.name}`] = {
              weight: ex.weight,
              reps: ex.reps,
            };
          }
        });
      });
      setSessionLogs(initialLogs);
    } else {
      setSessionLogs({});
    }
  };

  const openTracker = (exName: string, exBlock: string, dayName: string) => {
    const logKey = `${dayName}-${exName}`;
    const existing = sessionLogs[logKey];

    if (existing) {
      setWeight(existing.weight);
      setReps(existing.reps);
    } else {
      const routineLogs = lastLogs[selectedRoutine?.id || ""] || [];
      const lastSession = routineLogs[0];
      const historicalExercise = lastSession?.session_data.days
        ?.flatMap((d: any) => d.exercises)
        .find((hEx: any) => hEx.name === exName);

      setWeight(historicalExercise?.weight || "");
      setReps(historicalExercise?.reps || "");
    }

    setSelectedExercise({ name: exName, block: exBlock, dayName });
    setIsTrackModalVisible(true);
  };

  const handleSaveExerciseInSession = () => {
    if (selectedExercise && weight && reps) {
      const logKey = `${selectedExercise.dayName}-${selectedExercise.name}`;
      setSessionLogs((prev) => ({
        ...prev,
        [logKey]: { weight, reps },
      }));
      setIsTrackModalVisible(false);
      setWeight("");
      setReps("");
    } else {
      Alert.alert("Atención", "Por favor indica peso y repeticiones");
    }
  };

  const finishWorkout = async (dayName: string) => {
    const currentDayLogs = Object.keys(sessionLogs).filter((key) =>
      key.startsWith(`${dayName}-`),
    );

    if (currentDayLogs.length === 0) {
      Alert.alert("Sesión vacía", "No has trackeado ningún ejercicio.");
      return;
    }

    try {
      const currentDayData = selectedRoutine?.structure.days.find(
        (d) => d.dayName === dayName,
      );

      const dayExercises = currentDayData?.exercises.map((ex) => {
        const logKey = `${dayName}-${ex.name}`;
        return {
          ...ex,
          weight: sessionLogs[logKey]?.weight || "",
          reps: sessionLogs[logKey]?.reps || "",
        };
      });

      const today = new Date().toISOString().split("T")[0];
      const routineLogs = lastLogs[selectedRoutine?.id || ""] || [];
      const existingLog = routineLogs.find((log) =>
        log.completed_at.startsWith(today),
      );

      let newSessionData;
      if (existingLog) {
        const otherDays =
          existingLog.session_data.days?.filter(
            (d: any) => d.dayName !== dayName,
          ) || [];
        newSessionData = {
          days: [...otherDays, { dayName, exercises: dayExercises }],
        };
      } else {
        newSessionData = { days: [{ dayName, exercises: dayExercises }] };
      }

      const { error } = await supabase.from("workout_logs").upsert({
        id: existingLog?.id,
        routine_id: selectedRoutine?.id,
        session_data: newSessionData,
        completed_at: existingLog?.completed_at || new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert("¡Hecho!", `Entrenamiento de ${dayName} guardado.`);
      await refreshLogs();
      setSelectedRoutine(null);
      setSessionLogs({});
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar la sesión.");
    }
  };

  if (!selectedRoutine) {
    return (
      <ScrollView style={styles.listContent}>
        <Text style={styles.routineGeneralTitle}>Empezar a registrar</Text>
        {routines.map((routine: Routine) => {
          const routineLogs = lastLogs[routine.id] || [];
          const lastLog = routineLogs[0];
          return (
            <TouchableOpacity
              key={routine.id}
              style={styles.routineCard}
              onPress={() => viewRoutine(routine)}
            >
              <View style={styles.routineRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routineName}>{routine.name}</Text>
                  {lastLog ? (
                    <View style={{ marginTop: 4 }}>
                      <Text
                        style={{
                          color: "#10b981",
                          fontSize: 13,
                          fontWeight: "600",
                        }}
                      >
                        Último:{" "}
                        {
                          lastLog.session_data.days[
                            lastLog.session_data.days.length - 1
                          ]?.dayName
                        }
                      </Text>
                      <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                        {new Date(lastLog.completed_at).toLocaleDateString(
                          "es-ES",
                        )}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.routineDate}>
                      Sin entrenos registrados
                    </Text>
                  )}
                </View>
                <ChevronRight color={"#10b981"} size={24} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ArrowLeft
          color={"#10b981"}
          size={30}
          onPress={() => setSelectedRoutine(null)}
        />
        <Text style={styles.routineTitle}>{selectedRoutine.name}</Text>
      </View>

      <ScrollView style={styles.trackingContent}>
        {selectedRoutine.structure.days.map((day, dIdx) => (
          <View key={dIdx} style={styles.dayContainer}>
            <Text style={styles.dayName}>{day.dayName}</Text>

            {day.exercises.map((ex, eIdx) => {
              const logKey = `${day.dayName}-${ex.name}`;
              const isTracked = sessionLogs[logKey];
              const routineHistory = lastLogs[selectedRoutine.id] || [];

              const exerciseHistory = routineHistory.reduce(
                (acc: any[], log) => {
                  const dayData = log.session_data.days?.find(
                    (d: any) => d.dayName === day.dayName,
                  );
                  const exData = dayData?.exercises?.find(
                    (e: any) => e.name === ex.name,
                  );

                  if (exData && (exData.weight || exData.reps)) {
                    acc.push({
                      date: new Date(log.completed_at).toLocaleDateString(
                        "es-ES",
                        { day: "2-digit", month: "2-digit" },
                      ),
                      weight: exData.weight,
                      reps: exData.reps,
                    });
                  }
                  return acc;
                },
                [],
              );

              return (
                <View
                  key={eIdx}
                  style={[
                    styles.exerciseTrackerCard,
                    isTracked && {
                      borderLeftColor: "#34d399",
                      backgroundColor: "#f0fdf4",
                    },
                  ]}
                >
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exBlock}>{ex.block}</Text>
                    <Text style={styles.exName}>{ex.name}</Text>
                  </View>
                  <Text style={styles.exSeries}>{ex.series}</Text>

                  {exerciseHistory.length > 0 && (
                    <View style={styles.historyContainer}>
                      <Text style={styles.historyTitle}>Evolución:</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {exerciseHistory.map((h, idx) => (
                          <View key={idx} style={styles.historyChip}>
                            <Text style={styles.historyDate}>{h.date}</Text>
                            <Text style={styles.historyValue}>
                              {h.weight || 0}kg x {h.reps || 0}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {isTracked && (
                    <View style={styles.trackedBadge}>
                      <Text style={styles.trackedText}>
                        Hoy: {isTracked.weight}kg x {isTracked.reps} reps
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.logButton,
                      isTracked && { backgroundColor: "#dcfce7" },
                    ]}
                    onPress={() => openTracker(ex.name, ex.block, day.dayName)}
                  >
                    <Plus size={20} color={"#10b981"} />
                    <Text style={styles.logButtonText}>
                      {isTracked ? "Corregir" : "Track"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.finishDayButton}
              onPress={() => finishWorkout(day.dayName)}
            >
              <Text style={styles.saveButtonText}>Finalizar {day.dayName}</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 50 }} />
      </ScrollView>

      <Modal visible={isTrackModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Registrar {selectedExercise?.block}
            </Text>
            <Text style={styles.exerciseSubtitle}>
              {selectedExercise?.name}
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.trackInput}
                placeholder="Peso"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
              <TextInput
                style={styles.trackInput}
                placeholder="Reps"
                keyboardType="numeric"
                value={reps}
                onChangeText={setReps}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsTrackModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveExerciseInSession}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  listContent: { padding: 20 },
  routineCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  routineName: { fontSize: 18, fontWeight: "600" },
  routineDate: { color: "#6b7280", marginTop: 4 },
  trackingContent: { paddingHorizontal: 20, paddingTop: 10 },
  routineTitle: { fontSize: 24, fontWeight: "bold" },
  routineGeneralTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  dayContainer: { marginBottom: 30 },
  dayName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 15,
  },
  exerciseTrackerCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: "#e5e7eb",
  },
  exerciseInfo: { flexDirection: "row", gap: 8, alignItems: "center" },
  exBlock: { fontWeight: "bold", color: "#10b981", fontSize: 16 },
  exName: { fontSize: 16, fontWeight: "600", flexShrink: 1 },
  exSeries: { color: "#6b7280", marginTop: 2, fontSize: 14 },
  historyContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  historyTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9ca3af",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  historyChip: {
    backgroundColor: "#f9fafb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  historyDate: { fontSize: 10, color: "#6b7280", fontWeight: "bold" },
  historyValue: { fontSize: 13, color: "#374151", marginTop: 2 },
  trackedBadge: {
    backgroundColor: "#dcfce7",
    padding: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  trackedText: { color: "#15803d", fontWeight: "700", fontSize: 14 },
  logButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
  },
  logButtonText: { color: "#374151", fontWeight: "600", fontSize: 14 },
  finishDayButton: {
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  routineRow: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  exerciseSubtitle: { fontSize: 16, color: "#6b7280", marginBottom: 24 },
  inputRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  trackInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
    textAlign: "center",
  },
  modalButtons: { flexDirection: "row", gap: 12 },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  cancelButtonText: { fontSize: 16, fontWeight: "600", color: "#6b7280" },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#10b981",
    alignItems: "center",
  },
});

export default TrackRoutine;
