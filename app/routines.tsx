import { Plus } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CreateRoutineModal from "../components/CreateRoutineModal";
import { supabase } from "../supabase";

export default function Routines() {
  const [createModal, setCreateModal] = useState(false);
  const [routineText, setRoutineText] = useState("");

  const handleCreate = async () => {
    if (!routineText.trim()) return;

    try {
      const lines = routineText.split("\n");

      const name = lines[0];

      const exercises = lines
        .slice(1)
        .filter((line) => line.includes(".") && line.includes("-"))
        .map((line) => {
          const partsByPoint = line.split(".");
          if (partsByPoint.length < 2) return null;

          const idPart = partsByPoint[0];
          const rest = partsByPoint[1];

          const partsByDash = rest.split("-");
          const exerciseName = partsByDash[0];
          const specs = partsByDash[1];

          return {
            block: idPart?.trim(),
            name: exerciseName?.trim(),
            series: specs?.trim(),
            //last_weight: "0kg"
          };
        })
        .filter(Boolean);

      const { data, error } = await supabase
        .from("routines")
        .insert([
          {
            name: name,
            structure: { exercises },
            //user_id: session.user.id
          },
        ])
        .select();
      if (error) throw error;
      alert("RUTINA GUARDADA LOQUETA");
      console.log("RUTINA CREADA CON EXITO ✅ ", data);

      setCreateModal(false);
      setRoutineText("");
    } catch (error) {
      console.error("Error al guardar la rutina", error);
      alert("No se pudo guardar la rutina. Revisar formato");
    }
    setCreateModal(false);
    setRoutineText("");
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
      />
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
