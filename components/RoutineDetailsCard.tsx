import { ArrowLeft } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Routine } from "../supabase";

interface RoutineDetailsProps {
  routine: Routine;
  onBack: () => void;
}
const RoutineDetailsCard = ({ routine, onBack }: RoutineDetailsProps) => {
  return (
    <>
      <View style={styles.detailsContainer}>
        <ArrowLeft color={"#10b981"} size={30} onPress={onBack} />
        <View style={styles.detailsHeader}>
          <Text style={styles.mainTitle}>{routine.name}</Text>
        </View>
      </View>
      <ScrollView style={styles.scrollContent}>
        {routine.structure.days.map((day, dayIndex) => (
          <View key={dayIndex} style={{ marginBottom: 30 }}>
            <Text style={styles.dayTitle}>{day.dayName}</Text>

            {day.exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseItem}>
                <Text style={styles.exerciseBlock}>{exercise.block}</Text>
                <View>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseSeries}>{exercise.series}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    gap: 15,
  },

  detailsHeader: {
    flex: 1,
  },

  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },

  scrollContent: {
    padding: 20,
  },

  exerciseBlock: {
    fontSize: 14,
    color: "#10b981",
    marginRight: 10,
  },

  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
  },

  exerciseSeries: {
    fontSize: 16,
    color: "#666",
  },

  dayTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10b981",
    marginBottom: 15,
    backgroundColor: "#ecfdf5",
    padding: 8,
    borderRadius: 5,
    alignSelf: "flex-start",
  },

  exerciseItem: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default RoutineDetailsCard;
