import { useCallback, useEffect, useState } from "react";
import { Routine, supabase } from "../supabase";

type DeleteRoutineResult =
  | { success: true }
  | { success: false; error: unknown };

export const useRoutines = () => {
  const [loading, setLoading] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);

  const fetchRoutines = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = (await supabase
        .from("routines")
        .select("*")
        .order("created_at", { ascending: false })) as {
        data: Routine[] | null;
        error: unknown;
      };

      if (error) throw error;

      setRoutines(data ?? []);
    } catch (error) {
      console.error("Error cargando rutinas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRoutineFromSupabase = async (
    id: string,
  ): Promise<DeleteRoutineResult> => {
    try {
      const { error } = await supabase.from("routines").delete().eq("id", id);

      if (error) throw error;

      setRoutines((prev) => prev.filter((r) => r.id !== id));

      return { success: true };
    } catch (error) {
      console.error("Error eliminando rutina:", error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  return {
    routines,
    loading,
    refreshRoutines: fetchRoutines,
    deleteRoutineFromSupabase,
  };
};
