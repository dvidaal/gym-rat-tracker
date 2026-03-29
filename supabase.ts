import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sqajljepsyuvvwibfabr.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYWpsamVwc3l1dnZ3aWJmYWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NzkxNjEsImV4cCI6MjA4OTA1NTE2MX0.iaQfH92NJmNOw-_mJ04XRmLWv9AaC9S1nqMV5ijfy_M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Routine = {
  id: string;
  name: string;
  created_at: string;
  structure: {
    days: {
      dayName: string;
      exercises: {
        block: string;
        name: string;
        series: string;
      }[];
    }[];
  };
};

export type Exercise = {
  id: string;
  routine_id: string;
  name: string;
  created_at: string;
  block: string;
  series: string;
};

export type TrackingLog = {
  id: string;
  routine_id: string;
  routine_name?: string;
  session_data: {
    days: {
      dayName: string;
      exercises: {
        block: string;
        name: string;
        series: string;
        weight?: string;
      }[];
    }[];
    completed_at: string; //fecha del entrenamiento
  };
};
