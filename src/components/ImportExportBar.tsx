import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Employee } from '@/types/employee';
import { CONTRATO_OPTIONS, COORDENACAO_OPTIONS, LOTACAO_OPTIONS } from '@/constants/employees';
import { upsertByMatricula, validateEmployee, formatPhoneBR, formatCPF } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';
import { AiOutlineDownload, AiOutlinePaperClip, AiOutlineMail } from 'react-icons/ai';
import { AdjustPunchModal } from '@/components/AdjustPunchModal';
import { getEmployeesFromDb, updateEmployeeInDb, createEmployeesInDbBulk } from '@/services/employees';
type Props = {
  employees: Employee[];
  onApply: (list: Employee[]) => void;
};
export function ImportExportBar({
  employees,
  onApply
}: Props) {
  const {
    toast
  } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const buildExportRows = () => {
    const toBR = (v?: string) => {
      if (!v) return '';
      const s = String(v).trim();
      const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})/); // yyyy-mm-dd or starts with it
      if (mIso) return `${mIso[3]}/${mIso[2]}/${mIso[1]}`;
      const mBr = s.match(/^(\d{2})[\/.\-](\d{2})[\/.\-](\d{4})$/); // already br-like
      if (mBr) return `${mBr[1]}/${mBr[2]}/${mBr[3]}`;
      return s;
    };
    return employees.map(e => ({
      nome: e.nome,
      matricula: e.matricula,
      cpf: formatCPF(e.cpf || ''),
      especialidade: e.especialidade,
      lotacao: e.lotacao,
      coordenacao: e.coordenacao,
      sexo: e.sexo || '',
      telefone: e.telefone || '',
      endereco: e.endereco || '',
      dataNascimento: toBR(e.dataNascimento),
      dataAdmissao: toBR(e.dataAdmissao),
      escalaDeTrabalho: e.escalaDeTrabalho || '',
      contrato: e.contrato
    }));
  };
  const exportXLSXNoIdFoto = () => {
    const ws = XLSX.utils.json_to_sheet(buildExportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'funcionarios');
    XLSX.writeFile(wb, 'funcionarios.xlsx', {
      bookType: 'xlsx'
    });
  };
  const exportODSNoIdFoto = () => {
    const ws = XLSX.utils.json_to_sheet(buildExportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'funcionarios');
    XLSX.writeFile(wb, 'funcionarios.ods', {
      bookType: 'ods'
    });
  };
  const downloadTemplate = (format: 'xlsx' | 'ods') => {
    const headers = [[
      'nome',
      'matricula',
      'cpf',
      'especialidade',
      'lotacao',
      'coordenacao',
      'sexo',
      'telefone',
      'endereco',
      'dataNascimento',
      'dataAdmissao',
      'escalaDeTrabalho',
      'contrato'
    ]];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'modelo');
    const filename = `modelo-funcionarios.${format}`;
    XLSX.writeFile(wb, filename, { bookType: format });
  };
  const parseAndApply = async (file: File) => {
    const ext = file.name.split('.')?.pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'ods') {
      toast({
        title: 'Formato não suportado',
        description: 'Use .xlsx ou .ods',
        variant: 'destructive',
      });
      return;
    }

    let rows: any[] = [];
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet);
    } catch (e) {
      toast({ title: 'Erro ao ler arquivo', description: String(e), variant: 'destructive' });
      return;
    }

    const normalizeDate = (v: any): string | undefined => {
      if (v === null || v === undefined || v === '') return undefined;
      // Excel serial number
      if (typeof v === 'number') {
        const d = XLSX.SSF.parse_date_code(v);
        if (d) {
          const yyyy = String(d.y).padStart(4, '0');
          const mm = String(d.m).padStart(2, '0');
          const dd = String(d.d).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        }
        return undefined;
      }
      // JS Date object (when cellDates: true)
      if (v instanceof Date && !isNaN(v.getTime())) {
        const yyyy = v.getFullYear();
        const mm = String(v.getMonth() + 1).padStart(2, '0');
        const dd = String(v.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      const s = String(v).trim();
      // ISO with or without time
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
      // dd/mm/aaaa, dd-mm-aaaa, dd.mm.aaaa
      const m = s.match(/^(\d{2})[\/.\-](\d{2})[\/.\-](\d{4})$/);
      if (m) return `${m[3]}-${m[2]}-${m[1]}`;
      return undefined;
    };

    const normalizePhone = (v: any): string | undefined => {
      if (!v && v !== 0) return undefined;
      const digits = String(v).replace(/\D/g, '');
      if (!digits) return undefined;
      return formatPhoneBR(digits);
    };

    const normalizeCPF = (v: any): string | undefined => {
      const digits = String(v ?? '').replace(/\D/g, '');
      if (!digits) return undefined;
      if (digits.length !== 11) return undefined;
      return digits;
    };

let added = 0, updated = 0;
const errors: string[] = [];
const validRows: Omit<Employee, 'id'>[] = [];
const seenInFile = new Set<string>();

for (let i = 0; i < rows.length; i++) {
  const r = rows[i] ?? {};
  const e = {
    foto: r.foto || undefined,
    nome: String(r.nome || ''),
    matricula: String(r.matricula || ''),
    cpf: normalizeCPF(r.cpf),
    especialidade: String(r.especialidade || ''),
    lotacao: String(r.lotacao || ''),
    coordenacao: String(r.coordenacao || ''),
    sexo: r.sexo ? String(r.sexo) : undefined,
    telefone: normalizePhone(r.telefone),
    endereco: r.endereco ? String(r.endereco) : undefined,
    dataNascimento: normalizeDate(r.dataNascimento),
    dataAdmissao: normalizeDate(r.dataAdmissao),
    escalaDeTrabalho: r.escalaDeTrabalho ? String(r.escalaDeTrabalho) : undefined,
    contrato: String(r.contrato || ''),
  } as Omit<Employee, 'id'>;

  const { valid, errors: vErrors } = validateEmployee(e);
  if (!valid) {
    errors.push(`Linha ${i + 2}: ${Object.values(vErrors).join(' | ')}`);
    continue;
  }

  if (seenInFile.has(e.matricula)) {
    errors.push(`Linha ${i + 2}: Matrícula duplicada na planilha (${e.matricula}). Linha ignorada.`);
    continue;
  }
  seenInFile.add(e.matricula);
  validRows.push(e);
}

// Se nada válido, apenas informa
if (validRows.length === 0) {
  toast({ title: 'Nenhuma linha válida', description: errors.length ? `${errors.length} erro(s) encontrados` : 'Sem registros válidos para importar', variant: errors.length ? 'destructive' : 'default' });
  if (errors.length) console.warn('Erros de importação:', errors);
  return;
}

// Busca existentes no banco para decidir entre inserir/atualizar
const { data: existingDb, error: loadErr } = await getEmployeesFromDb();
if (loadErr) {
  toast({ title: 'Erro ao consultar banco', description: loadErr.message, variant: 'destructive' });
  return;
}
const byMatricula = new Map((existingDb || []).map(e => [e.matricula, e]));
const toInsert = validRows.filter(e => !byMatricula.has(e.matricula));
const toUpdatePairs = validRows.filter(e => byMatricula.has(e.matricula)).map(e => ({ id: byMatricula.get(e.matricula)!.id, data: e }));

// Inserções em massa (em chunks)
let createdAll: Employee[] = [];
if (toInsert.length) {
  const chunkSize = 100;
  const chunks: Omit<Employee, 'id'>[][] = [];
  for (let i = 0; i < toInsert.length; i += chunkSize) chunks.push(toInsert.slice(i, i + chunkSize));
  const results = await Promise.all(chunks.map(c => createEmployeesInDbBulk(c)));
  for (const r of results) {
    if (r.error) errors.push(`Falha ao inserir lote: ${r.error.message}`);
    else createdAll = createdAll.concat(r.data || []);
  }
  added = createdAll.length;
}

// Atualizações em paralelo
let updatedAll: Employee[] = [];
if (toUpdatePairs.length) {
  const results = await Promise.all(toUpdatePairs.map(p => updateEmployeeInDb(p.id, p.data)));
  for (const r of results) {
    if (r.error || !r.data) errors.push(`Falha ao atualizar registro`);
    else updatedAll.push(r.data);
  }
  updated = updatedAll.length;
}

// Monta lista final baseada no banco + mudanças
const mapById = new Map((existingDb || []).map(e => [e.id, e]));
for (const u of updatedAll) mapById.set(u.id, u);
const finalList = Array.from(mapById.values()).concat(createdAll);

onApply(finalList);
const desc = [`${added} adicionado(s)`, `${updated} atualizado(s)`].join(' • ');
toast({
  title: 'Importação concluída',
  description: errors.length ? `${desc} • ${errors.length} erro(s)` : desc,
});
if (errors.length) console.warn('Erros de importação:', errors);
  };
  return <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
      <div className="flex gap-2">
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button type="button"><AiOutlineDownload /> Exportar</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto p-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportXLSXNoIdFoto}>XLSX</Button>
              <Button variant="outline" onClick={exportODSNoIdFoto}>ODS</Button>
            </div>
          </HoverCardContent>
        </HoverCard>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.ods"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) parseAndApply(f);
            e.currentTarget.value = '';
          }}
        />
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <AiOutlinePaperClip /> Importar
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto p-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => downloadTemplate('xlsx')}>Modelo XLSX</Button>
              <Button variant="outline" onClick={() => downloadTemplate('ods')}>Modelo ODS</Button>
            </div>
          </HoverCardContent>
        </HoverCard>
          <Button type="button" variant="secondary" onClick={() => setAdjustOpen(true)}>
            <AiOutlineMail /> Ajustar Ponto
          </Button>
        </div>
      <AdjustPunchModal open={adjustOpen} onOpenChange={setAdjustOpen} employees={employees} />
    </div>;
}