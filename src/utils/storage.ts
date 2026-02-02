import { Employee } from '@/types/employee';
import { LOTACAO_OPTIONS, COORDENACAO_OPTIONS, CONTRATO_OPTIONS } from '@/constants/employees';

const STORAGE_KEY = 'employees';
const ID_COUNTER_KEY = 'employees_id_counter';

export function loadEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Employee[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveEmployees(list: Employee[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getNextId(): string {
  const current = parseInt(localStorage.getItem(ID_COUNTER_KEY) || '0', 10) || 0;
  const next = current + 1;
  localStorage.setItem(ID_COUNTER_KEY, String(next));
  return String(next);
}

export function upsertByMatricula(base: Employee[], incoming: Omit<Employee, 'id'> & Partial<Pick<Employee, 'id'>>): { list: Employee[]; action: 'added' | 'updated' } {
  const idx = base.findIndex(e => e.matricula === incoming.matricula);
  if (idx >= 0) {
    const updated: Employee = { ...base[idx], ...incoming, id: base[idx].id };
    const list = [...base];
    list[idx] = updated;
    return { list, action: 'updated' };
  }
  const added: Employee = { id: getNextId(), ...incoming } as Employee;
  return { list: [...base, added], action: 'added' };
}

export function validateEmployee(e: Partial<Employee>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!e.nome || !String(e.nome).trim()) errors.nome = 'Nome é obrigatório';
  if (!e.matricula || !/^[0-9]+$/.test(String(e.matricula))) errors.matricula = 'Matrícula deve conter apenas números';
  const cpfDigits = String(e.cpf ?? '').replace(/\D/g, '');
  if (!cpfDigits || cpfDigits.length !== 11) errors.cpf = 'CPF é obrigatório e deve conter 11 dígitos';
  if (!e.especialidade || !String(e.especialidade).trim()) errors.especialidade = 'Especialidade é obrigatória';
  if (!e.lotacao || !LOTACAO_OPTIONS.includes(e.lotacao as any)) errors.lotacao = 'Lotação inválida';
  if (!e.coordenacao || !COORDENACAO_OPTIONS.includes(e.coordenacao as any)) errors.coordenacao = 'Coordenação inválida';
  if (!e.contrato || !CONTRATO_OPTIONS.includes(e.contrato as any)) errors.contrato = 'Contrato inválido';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function seedEmployees() {
  const existing = loadEmployees();
  if (existing.length > 0) return;
  const seed: Employee[] = [
    {
      id: getNextId(),
      nome: 'Ana Souza',
      matricula: '100001',
      especialidade: 'Operadora de ETA',
      lotacao: 'ETA PIRAPAMA',
      coordenacao: 'CMA SUL',
      contrato: 'CT.PS. 18.4.177 - SERVIÇOS DE OPERAÇÃO EM UNIDADES',
    },
    {
      id: getNextId(),
      nome: 'Bruno Lima',
      matricula: '100002',
      especialidade: 'Técnico de Manutenção',
      lotacao: 'EEAB PIRAPAMA',
      coordenacao: 'CPR SUL',
      contrato: 'CT.PS.22.4.417 - MANUT DAS UNIDADES OPERACIONAIS',
    },
    {
      id: getNextId(),
      nome: 'Carla Mendes',
      matricula: '100003',
      especialidade: 'Supervisor Administrativo',
      lotacao: 'ETA SUAPE',
      coordenacao: 'CMA SUL',
      contrato: 'CT.PS.22.2.205 - SERVIÇOS SUPERVISORES ADMINISTRATIVOS',
    },
    {
      id: getNextId(),
      nome: 'Diego Santos',
      matricula: '100004',
      especialidade: 'Operador de Booster',
      lotacao: 'BOOSTER IPOJUCA',
      coordenacao: 'CPR SUL',
      contrato: 'CT.PS. 18.4.177 - SERVIÇOS DE OPERAÇÃO EM UNIDADES',
    },
    {
      id: getNextId(),
      nome: 'Elisa Ferreira',
      matricula: '100005',
      especialidade: 'Operadora de RAP',
      lotacao: 'RAP PONTE DOS CARVALHOS',
      coordenacao: 'CMA SUL',
      contrato: 'CT.PS.22.4.417 - MANUT DAS UNIDADES OPERACIONAIS',
    },
  ];
  saveEmployees(seed);
}

export function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const p1 = digits.slice(0, 2);
  const p2 = digits.length > 6 ? digits.slice(2, 7) : digits.slice(2, 6);
  const p3 = digits.length > 6 ? digits.slice(7, 11) : digits.slice(6, 10);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${p1}) ${digits.slice(2)}`;
  return `(${p1}) ${p2}-${p3}`;
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const p1 = digits.slice(0, 3);
  const p2 = digits.slice(3, 6);
  const p3 = digits.slice(6, 9);
  const p4 = digits.slice(9, 11);
  if (digits.length <= 3) return p1;
  if (digits.length <= 6) return `${p1}.${p2}`;
  if (digits.length <= 9) return `${p1}.${p2}.${p3}`;
  return `${p1}.${p2}.${p3}-${p4}`;
}
