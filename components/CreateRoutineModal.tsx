import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CreateRoutineModalProps {
  visible: boolean;
  onClose: () => void;
  routineText: string;
  setRoutineText: (text: string) => void;
  onCreate: () => void;
}

const CreateRoutineModal = ({
  visible,
  onClose,
  routineText,
  setRoutineText,
  onCreate,
}: CreateRoutineModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nueva Rutina</Text>

          <TextInput
            style={[styles.routineInput, styles.textArea]}
            multiline
            numberOfLines={6}
            placeholder="ej: A1. Sentadilla — 3x8 || 30kg..."
            placeholderTextColor="#9ca3af"
            value={routineText}
            onChangeText={setRoutineText}
          />

          <Text style={styles.helperText}>Pega tu rutina completa aquí</Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={onCreate}>
              <Text style={styles.saveButtonText}>Crear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Mueve los estilos específicos del modal aquí
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111827",
  },
  routineInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  textArea: { height: 150, textAlignVertical: "top", marginTop: 10 },
  helperText: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  cancelButtonText: { fontSize: 16, fontWeight: "600", color: "#6b7280" },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#10b981",
    alignItems: "center",
  },
  saveButtonText: { fontSize: 16, fontWeight: "600", color: "#ffffff" },
});

export default CreateRoutineModal;
