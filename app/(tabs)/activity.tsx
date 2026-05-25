import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useFocusEffect } from "expo-router";
import { ChevronLeft, ChevronRight, Dumbbell, Flame, TrendingUp } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export default function ActivityScreen() {
  const { allLogs, loadingLogs, refreshLogs } = useWorkoutHistory();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }, []);

  // Auto-refresh when tab is focused
  useFocusEffect(
    useCallback(() => {
      refreshLogs();
    }, [refreshLogs])
  );

  // Month and Year state
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Helper to change month
  const changeMonth = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
    setSelectedDate(null); // Reset selection
  };

  // Group logs by YYYY-MM-DD
  const logsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    allLogs.forEach((log) => {
      if (log.completed_at) {
        const dateKey = log.completed_at.split("T")[0];
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(log);
      }
    });
    return map;
  }, [allLogs]);

  // Generate calendar days
  const calendarCells = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    const cells = [];
    // Prev month padding
    for (let i = 0; i < startOffset; i++) {
      cells.push({ dayNum: null, dateStr: null });
    }
    // Month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ dayNum: d, dateStr });
    }
    return cells;
  }, [currentMonth, currentYear]);

  // Stats calculation
  const stats = useMemo(() => {
    const activeDates = new Set<string>();

    allLogs.forEach((log) => {
      const date = new Date(log.completed_at);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        activeDates.add(log.completed_at.split("T")[0]);
      }
    });

    // Calculate active streak
    let streak = 0;
    const todayStr = new Date().toISOString().split("T")[0];
    let checkDate = new Date();

    const todayKey = todayStr;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split("T")[0];

    const hasWorkoutToday = !!logsByDate[todayKey];
    const hasWorkoutYesterday = !!logsByDate[yesterdayKey];

    if (hasWorkoutToday || hasWorkoutYesterday) {
      if (!hasWorkoutToday) {
        checkDate = yesterday;
      }
      while (true) {
        const key = checkDate.toISOString().split("T")[0];
        if (logsByDate[key]) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return {
      uniqueDays: activeDates.size,
      streak,
    };
  }, [allLogs, currentMonth, currentYear, logsByDate]);

  // Selected date logs
  const selectedLogs = selectedDate ? logsByDate[selectedDate] || [] : [];

  // Month summary logs
  const currentMonthLogs = useMemo(() => {
    return allLogs
      .filter((log) => {
        const date = new Date(log.completed_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  }, [allLogs, currentMonth, currentYear]);

  return (
    <SafeAreaView style={styles.mainContainer} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Actividad 📅</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: "#ecfdf5" }]}>
              <Dumbbell size={20} color="#10b981" />
            </View>
            <Text style={styles.statValue}>{stats.uniqueDays}</Text>
            <Text style={styles.statLabel}>Entrenos</Text>
            <Text style={styles.statSubLabel}>este mes</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: "#fff7ed" }]}>
              <Flame size={20} color="#f97316" />
            </View>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Días Racha</Text>
            <Text style={styles.statSubLabel}>actual</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: "#eff6ff" }]}>
              <TrendingUp size={20} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>
              {calendarCells.filter((c) => c.dateStr && logsByDate[c.dateStr]).length}
            </Text>
            <Text style={styles.statLabel}>Días Activos</Text>
            <Text style={styles.statSubLabel}>de {calendarCells.filter((c) => c.dayNum).length}</Text>
          </View>
        </View>

        {/* Calendar Box */}
        <View style={styles.calendarCard}>
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
              <ChevronLeft size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton}>
              <ChevronRight size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((day, idx) => (
              <Text key={idx} style={styles.weekdayLabel}>
                {day}
              </Text>
            ))}
          </View>

          {loadingLogs ? (
            <ActivityIndicator color="#10b981" style={{ marginVertical: 40 }} />
          ) : (
            <View style={styles.gridContainer}>
              {calendarCells.map((cell, idx) => {
                if (!cell.dayNum) {
                  return <View key={idx} style={styles.emptyCell} />;
                }

                const isTrained = !!logsByDate[cell.dateStr!];
                const isSelected = selectedDate === cell.dateStr;
                const isToday = cell.dateStr === todayStr;

                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (cell.dateStr) {
                        setSelectedDate(selectedDate === cell.dateStr ? null : cell.dateStr);
                      }
                    }}
                    style={[
                      styles.dayCell,
                      isTrained && styles.trainedDayCell,
                      isToday && styles.todayDayCell,
                      isSelected && styles.selectedDayCell,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        isTrained && styles.trainedDayCellText,
                        isToday && styles.todayDayCellText,
                        isSelected && styles.selectedDayCellText,
                      ]}
                    >
                      {cell.dayNum}
                    </Text>
                    {isTrained && <View style={styles.trainedDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Details or Month Summary */}
        <View style={styles.detailSection}>
          {selectedDate ? (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Sesiones del {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>

              {selectedLogs.length > 0 ? (
                selectedLogs.map((log, idx) => (
                  <View key={log.id || idx} style={styles.sessionCard}>
                    <Text style={styles.sessionRoutineName}>
                      {log.routines?.name || "Rutina sin nombre"}
                    </Text>
                    <Text style={styles.sessionTime}>
                      Completado a las{" "}
                      {new Date(log.completed_at).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>

                    {log.session_data.days?.map((day: any, dIdx: number) => (
                      <View key={dIdx} style={styles.sessionDayBlock}>
                        <Text style={styles.sessionDayTitle}>{day.dayName}</Text>
                        {day.exercises.map((ex: any, eIdx: number) => (
                          <View key={eIdx} style={styles.sessionExerciseRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.sessionExerciseName}>
                                <Text style={styles.sessionExerciseBlock}>{ex.block}. </Text>
                                {ex.name}
                              </Text>
                              <Text style={styles.sessionExerciseTarget}>Objetivo: {ex.series}</Text>
                            </View>
                            <View style={styles.sessionExerciseWeightContainer}>
                              <Text style={styles.sessionExerciseLogged}>
                                {ex.weight ? `${ex.weight}kg` : "—"} x {ex.reps ? `${ex.reps} reps` : "—"}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Día de descanso. ¡Recupera bien! 🧘‍♂️</Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Historial de {MONTHS[currentMonth]}</Text>
              </View>

              {currentMonthLogs.length > 0 ? (
                currentMonthLogs.map((log, idx) => (
                  <TouchableOpacity
                    key={log.id || idx}
                    activeOpacity={0.8}
                    onPress={() => setSelectedDate(log.completed_at.split("T")[0])}
                    style={styles.summaryRowCard}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.summaryRoutineName}>
                        {log.routines?.name || "Rutina sin nombre"}
                      </Text>
                      <Text style={styles.summaryDate}>
                        {new Date(log.completed_at).toLocaleDateString("es-ES", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </Text>
                    </View>
                    <View style={styles.summaryArrowContainer}>
                      <ChevronRight size={18} color="#10b981" />
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Sin entrenamientos registrados este mes.</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 2,
  },
  statSubLabel: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 1,
  },
  calendarCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  weekdayLabel: {
    width: 38,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#9ca3af",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  emptyCell: {
    width: 38,
    height: 38,
  },
  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  trainedDayCell: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  selectedDayCell: {
    borderWidth: 2,
    borderColor: "#10b981",
    backgroundColor: "#ffffff",
  },
  todayDayCell: {
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  trainedDayCellText: {
    color: "#065f46",
    fontWeight: "700",
  },
  selectedDayCellText: {
    color: "#10b981",
    fontWeight: "700",
  },
  todayDayCellText: {
    color: "#2563eb",
    fontWeight: "800",
  },
  trainedDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10b981",
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  sessionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  sessionRoutineName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sessionTime: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  sessionDayBlock: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 10,
  },
  sessionDayTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
    marginBottom: 8,
  },
  sessionExerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  sessionExerciseName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  sessionExerciseBlock: {
    color: "#10b981",
    fontWeight: "700",
  },
  sessionExerciseTarget: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  sessionExerciseWeightContainer: {
    backgroundColor: "#f9fafb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sessionExerciseLogged: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  summaryRowCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  summaryRoutineName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  summaryDate: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    textTransform: "capitalize",
  },
  summaryArrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
  },
});
