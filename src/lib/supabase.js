import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://stqsgvawiyfoekrcgthc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cXNndmF3aXlmb2VrcmNndGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTczMDAsImV4cCI6MjA4OTMzMzMwMH0.HTsu8vr-FoU8wr5ll55CYByiwFiT3n1S78vITkuSVVY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);