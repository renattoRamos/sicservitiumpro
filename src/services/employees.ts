import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';

// Helpers
function decodeByteaToString(value: any): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string' && value.startsWith('\\x')) {
    try {
      const hex = value.slice(2);
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
      }
      return new TextDecoder('utf-8').decode(bytes);
    } catch {
      return undefined;
    }
  }
  if (typeof value === 'string') return value;
  return undefined;
}

// Map DB row -> UI model
function mapFromDb(row: any): Employee {
  return {
    id: String(row.id),
    foto: decodeByteaToString(row.foto),
    nome: row.nome,
    matricula: row.matricula,
    cpf: row.cpf ?? undefined,
    especialidade: row.especialidade,
    lotacao: row.lotacao,
    coordenacao: row.coordenacao,
    sexo: row.sexo ?? undefined,
    telefone: row.telefone ?? undefined,
    endereco: row.endereco ?? undefined,
    dataNascimento: row.data_nascimento ?? undefined,
    dataAdmissao: row.data_admissao ?? undefined,
    escalaDeTrabalho: row.escala_de_trabalho ?? undefined,
    contrato: row.contrato,
  };
}

// Map UI model -> DB row
function mapToDb(e: Partial<Employee>) {
  return {
    foto: e.foto ?? null,
    nome: e.nome,
    matricula: e.matricula,
    cpf: e.cpf ?? null,
    especialidade: e.especialidade,
    lotacao: e.lotacao,
    coordenacao: e.coordenacao,
    sexo: e.sexo ?? null,
    telefone: e.telefone ?? null,
    endereco: e.endereco ?? null,
    data_nascimento: e.dataNascimento ?? null,
    data_admissao: e.dataAdmissao ?? null,
    escala_de_trabalho: e.escalaDeTrabalho ?? null,
    contrato: e.contrato,
  };
}

export async function getEmployeesFromDb(): Promise<{ data: Employee[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return { data: [], error };
  return { data: (data ?? []).map(mapFromDb), error: null };
}

export async function createEmployeeInDb(payload: Omit<Employee, 'id'>): Promise<{ data: Employee | null; error: Error | null }>{
  const toInsert = mapToDb(payload);
  const { data, error } = await supabase
    .from('employees')
    .insert([toInsert])
    .select('*')
    .single();

  if (error) return { data: null, error };
  return { data: mapFromDb(data), error: null };
}

export async function updateEmployeeInDb(id: string, payload: Partial<Employee>): Promise<{ data: Employee | null; error: Error | null }>{
  const toUpdate = mapToDb(payload);
  const { data, error } = await supabase
    .from('employees')
    .update(toUpdate)
    .eq('id', Number(id))
    .select('*')
    .single();

  if (error) return { data: null, error };
  return { data: mapFromDb(data), error: null };
}

export async function createEmployeesInDbBulk(payloads: Omit<Employee, 'id'>[]): Promise<{ data: Employee[]; error: Error | null }>{
  if (!payloads?.length) return { data: [], error: null };
  const rows = payloads.map(mapToDb);
  const { data, error } = await supabase
    .from('employees')
    .insert(rows)
    .select('*');

  if (error) return { data: [], error } as any;
  return { data: (data ?? []).map(mapFromDb), error: null };
}

export async function deleteEmployeeInDb(id: string): Promise<{ error: Error | null }>{
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', Number(id));
  return { error: error ?? null };
}
