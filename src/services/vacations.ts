import { supabase } from '@/integrations/supabase/client';
import { Vacation } from '@/types/vacation';

// Map DB row -> UI model
function mapFromDb(row: any): Vacation {
  return {
    id: String(row.id),
    employeeId: String(row.employee_id),
    employeeName: row.employee_name,
    plannedMonth: row.planned_month,
    plannedYear: row.planned_year,
    sellDays: row.sell_days,
    notificationDaysBefore: row.notification_days_before,
    status: row.status,
  };
}

// Map UI model -> DB row
function mapToDb(v: Partial<Vacation>) {
  return {
    employee_id: v.employeeId,
    employee_name: v.employeeName,
    planned_month: v.plannedMonth,
    planned_year: v.plannedYear,
    sell_days: v.sellDays,
    notification_days_before: v.notificationDaysBefore,
    status: v.status,
  };
}

export async function getVacationsFromDb(): Promise<{ data: Vacation[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('vacations')
    .select('*')
    .order('planned_year', { ascending: true })
    .order('planned_month', { ascending: true });

  if (error) return { data: [], error };
  return { data: (data ?? []).map(mapFromDb), error: null };
}

export async function createVacationInDb(payload: Omit<Vacation, 'id'>): Promise<{ data: Vacation | null; error: Error | null }>{
  const toInsert = mapToDb(payload);
  const { data, error } = await supabase
    .from('vacations')
    .insert([toInsert])
    .select('*')
    .single();

  if (error) return { data: null, error };
  return { data: mapFromDb(data), error: null };
}

export async function updateVacationInDb(id: string, payload: Partial<Vacation>): Promise<{ data: Vacation | null; error: Error | null }>{
  const toUpdate = mapToDb(payload);
  const { data, error } = await supabase
    .from('vacations')
    .update(toUpdate)
    .eq('id', Number(id))
    .select('*')
    .single();

  if (error) return { data: null, error };
  return { data: mapFromDb(data), error: null };
}

export async function deleteVacationInDb(id: string): Promise<{ error: Error | null }>{
  const { error } = await supabase
    .from('vacations')
    .delete()
    .eq('id', Number(id));
  return { error: error ?? null };
}

export async function deleteAllVacationsInDb(): Promise<{ error: Error | null }>{
  const { error } = await supabase
    .from('vacations')
    .delete()
    .neq('id', 0); // Deletes all rows where id is not 0 (assuming id starts from 1)
  return { error: error ?? null };
}