import RoutineCardCreated from "@/components/RoutineCardCreated";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CreateRoutineModal from "../components/CreateRoutineModal";
import { supabase } from "../supabase";

export default function Routines() {
  const [createModal, setCreateModal] = useState(false);
  const [routineText, setRoutineText] = useState("");
  const [routineName, setRoutineName] = useState("");

  const handleCreate = async () => {
    if (!routineText.trim() || !routineName.trim()) {
      alert("Por favor, ponle un nombre a la rutina y pega el contenido.");
      return;
    }

    try {
      const lines = routineText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l !== "");
      const days: { dayName: string; exercises: any[] }[] = [];
      let currentDay: { dayName: string; exercises: any[] } | null = null;

      const dayRegex = /^(Día|Day)\s*\d+/i;
      const exerciseRegex = /^([A-Z]\d+)\.\s*(.*)/i;
      const seriesRegex = /\s+(\d+\s*[x×X\-–—]\s*\d+(?:\s*(?:–|—|-|\/)\s*\d+)?(?:\s*\/[a-zA-Záéíóúñ]+)?)$/i;

      lines.forEach((line) => {
        if (dayRegex.test(line)) {
          if (currentDay) days.push(currentDay);
          currentDay = { dayName: line, exercises: [] };
        } else {
          const match = line.match(exerciseRegex);
          if (match && currentDay) {
            const idPart = match[1].trim();
            const rest = match[2].trim();

            const seriesMatch = rest.match(seriesRegex);
            let exerciseName = rest;
            let series = "";

            if (seriesMatch) {
              series = seriesMatch[1].trim();
              exerciseName = rest.substring(0, rest.length - seriesMatch[0].length).trim();
              exerciseName = exerciseName.replace(/\s*[-—–:\s]+$/, "").trim();
            }

            currentDay.exercises.push({
              block: idPart,
              name: exerciseName,
              series: series,
            });
          }
        }
      });

      if (currentDay) days.push(currentDay);

      const { error } = await supabase
        .from("routines")
        .insert([
          {
            name: routineName,
            structure: { days: days },
          },
        ])
        .select();

      if (error) throw error;

      alert("¡RUTINA GUARDADA!");
      setCreateModal(false);
      setRoutineText("");
      setRoutineName("");
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Rutinas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setCreateModal(true)}
        >
          <Plus size={24} color={"#10b981"} />
        </TouchableOpacity>
      </View>

      <CreateRoutineModal
        visible={createModal}
        onClose={() => setCreateModal(false)}
        routineText={routineText}
        setRoutineText={setRoutineText}
        onCreate={handleCreate}
        routineName={routineName}
        setRoutineName={setRoutineName}
      />

      <RoutineCardCreated />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 28, fontWeight: "700", color: "#111827", marginTop: 8 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
  },
});
