import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";

export const useWorkoutHistory = () => {
  const [lastLogs, setLastLogs] = useState<Record<string, any[]>>({});
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchLastLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const { data, error } = await supabase
        .from("workout_logs")
        .select("id, routine_id, session_data, completed_at, routines(name)")
        .order("completed_at", { ascending: false });

      if (error) throw error;

      const logsByRoutine: Record<string, any[]> = {};
      data?.forEach((log) => {
        if (!logsByRoutine[log.routine_id]) {
          logsByRoutine[log.routine_id] = [];
        }
        logsByRoutine[log.routine_id].push(log);
      });

      setLastLogs(logsByRoutine);
      setAllLogs(data || []);
    } catch (error) {
      console.log("Error fetching workout logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchLastLogs();
  }, [fetchLastLogs]);

  return { lastLogs, allLogs, loadingLogs, refreshLogs: fetchLastLogs };
};
