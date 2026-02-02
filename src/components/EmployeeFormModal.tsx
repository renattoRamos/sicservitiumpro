import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { COORDENACAO_OPTIONS, CONTRATO_OPTIONS, ESCALA_OPTIONS, LOTACAO_OPTIONS, SEXO_OPTIONS, ESPECIALIDADE_OPTIONS } from '@/constants/employees';
import { Employee } from '@/types/employee';
import { formatPhoneBR, validateEmployee, formatCPF } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const toISODate = (v?: string | null) => {
  if (!v) return '';
  const s = String(v).trim();
  // ISO full or partial with time
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // dd/mm/aaaa
  const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`;
  // dd-mm-aaaa
  const m2 = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
  // dd.mm.aaaa
  const m3 = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m3) return `${m3[3]}-${m3[2]}-${m3[1]}`;
  return '';
};

const isoToBR = (iso?: string | null) => {
  if (!iso) return '';
  const s = String(iso).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return '';
};

const pickDateValue = (obj?: any, keys: string[] = []) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
  }
  return undefined;
};

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  matricula: z.string().regex(/^[0-9]+$/, 'Apenas números'),
  cpf: z.string().min(1, 'CPF é obrigatório').refine(v => v.replace(/\D/g, '').length === 11, 'CPF deve conter 11 dígitos'),
  especialidade: z.union([z.enum(ESPECIALIDADE_OPTIONS), z.literal('')]).refine((v) => v !== '', 'Especialidade é obrigatória'),
  lotacao: z.enum(LOTACAO_OPTIONS),
  coordenacao: z.enum(COORDENACAO_OPTIONS),
  sexo: z.enum(SEXO_OPTIONS).optional().or(z.literal('').transform(() => undefined)),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  dataNascimento: z.string().optional(),
  dataAdmissao: z.string().optional(),
  escalaDeTrabalho: z.enum(ESCALA_OPTIONS).optional().or(z.literal('').transform(() => undefined)),
  contrato: z.enum(CONTRATO_OPTIONS),
  foto: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof schema>;

type Props = {
  trigger?: React.ReactNode;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Employee | null;
  onSubmitEmployee: (data: EmployeeFormValues & { id?: string }) => void;
};

export function EmployeeFormModal({ trigger, open, onOpenChange, initial, onSubmitEmployee }: Props) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | undefined>(initial?.foto);

  const [nascText, setNascText] = useState<string>('');
  const [admText, setAdmText] = useState<string>('');

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial ? {
      nome: initial.nome,
      matricula: initial.matricula,
      cpf: initial.cpf ? formatCPF(initial.cpf) : '',
      especialidade: (ESPECIALIDADE_OPTIONS as readonly string[]).includes(initial.especialidade) ? (initial.especialidade as any) : '' as any,
      lotacao: initial.lotacao as typeof LOTACAO_OPTIONS[number],
      coordenacao: initial.coordenacao as typeof COORDENACAO_OPTIONS[number],
      sexo: (initial.sexo || undefined) as any,
      telefone: initial.telefone || '',
      endereco: initial.endereco || '',
      dataNascimento: toISODate(pickDateValue(initial, ['dataNascimento','data_nascimento','Data de Nascimento','data de nascimento','nascimento'])),
      dataAdmissao: toISODate(pickDateValue(initial, ['dataAdmissao','data_admissao','Data de Admissão','Data de Admissao','data de admissão','data de admissao','admissao'])),
      escalaDeTrabalho: (initial.escalaDeTrabalho || undefined) as any,
      contrato: initial.contrato as typeof CONTRATO_OPTIONS[number],
      foto: initial.foto || undefined,
    } : {
      nome: '',
      matricula: '',
      cpf: '',
      especialidade: ESPECIALIDADE_OPTIONS[0],
      lotacao: LOTACAO_OPTIONS[0],
      coordenacao: COORDENACAO_OPTIONS[0],
      sexo: undefined,
      telefone: '',
      endereco: '',
      dataNascimento: '',
      dataAdmissao: '',
      escalaDeTrabalho: undefined,
      contrato: CONTRATO_OPTIONS[0],
      foto: undefined,
    }
  });
  
  const dataNascimentoISO = form.watch('dataNascimento');
  const dataAdmissaoISO = form.watch('dataAdmissao');

  useEffect(() => { setNascText(isoToBR(dataNascimentoISO)); }, [dataNascimentoISO, open]);
  useEffect(() => { setAdmText(isoToBR(dataAdmissaoISO)); }, [dataAdmissaoISO, open]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      console.log('Editar funcionário - datas atuais', {
        dataNascimento: initial.dataNascimento,
        dataAdmissao: initial.dataAdmissao,
      });
      form.reset({
        nome: initial.nome,
        matricula: initial.matricula,
        cpf: initial.cpf ? formatCPF(initial.cpf) : '',
        especialidade: (ESPECIALIDADE_OPTIONS as readonly string[]).includes(initial.especialidade) ? (initial.especialidade as any) : '' as any,
        lotacao: initial.lotacao as typeof LOTACAO_OPTIONS[number],
        coordenacao: initial.coordenacao as typeof COORDENACAO_OPTIONS[number],
        sexo: (initial.sexo || undefined) as any,
        telefone: initial.telefone || '',
        endereco: initial.endereco || '',
        dataNascimento: toISODate(pickDateValue(initial, ['dataNascimento','data_nascimento','Data de Nascimento','data de nascimento','nascimento'])),
        dataAdmissao: toISODate(pickDateValue(initial, ['dataAdmissao','data_admissao','Data de Admissão','Data de Admissao','data de admissão','data de admissao','admissao'])),
        escalaDeTrabalho: (initial.escalaDeTrabalho || undefined) as any,
        contrato: initial.contrato as typeof CONTRATO_OPTIONS[number],
        foto: initial.foto || undefined,
      });
      setPreview(initial.foto);
    } else {
      form.reset({
        nome: '',
        matricula: '',
        cpf: '',
        especialidade: ESPECIALIDADE_OPTIONS[0],
        lotacao: LOTACAO_OPTIONS[0],
        coordenacao: COORDENACAO_OPTIONS[0],
        sexo: undefined,
        telefone: '',
        endereco: '',
        dataNascimento: '',
        dataAdmissao: '',
        escalaDeTrabalho: undefined,
        contrato: CONTRATO_OPTIONS[0],
        foto: undefined,
      });
      setPreview(undefined);
    }
  }, [open, initial, form]);
  const handleFile = async (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      form.setValue('foto', result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (values: EmployeeFormValues) => {
    const { valid, errors } = validateEmployee({ ...values });
    if (!valid) {
      toast({ title: 'Erro de validação', description: Object.values(errors).join(' • '), variant: 'destructive' });
      return;
    }
    onSubmitEmployee({ ...values, id: initial?.id });
    onOpenChange(false);
    form.reset();
    setPreview(undefined);
  };

  const formatDateInput = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 8 dígitos
    const limited = numbers.slice(0, 8);
    
    // Aplica formatação dd/mm/aaaa automaticamente
    if (limited.length <= 2) return limited;
    if (limited.length <= 4) return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
  };

  const handleNascChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setNascText(formatted);
  };

  const handleAdmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setAdmText(formatted);
  };

  const handleNascBlur = () => {
    const iso = toISODate(nascText);
    if (iso) {
      form.setValue('dataNascimento', iso);
      setNascText(isoToBR(iso));
    } else {
      form.setValue('dataNascimento', '');
      setNascText('');
    }
  };

  const handleAdmBlur = () => {
    const iso = toISODate(admText);
    if (iso) {
      form.setValue('dataAdmissao', iso);
      setAdmText(isoToBR(iso));
    } else {
      form.setValue('dataAdmissao', '');
      setAdmText('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-2xl shadow-none">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar Funcionário' : 'Adicionar Funcionário'}</DialogTitle>
          <DialogDescription>Preencha os campos obrigatórios marcados com *</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, (errors) => { const first = Object.values(errors)[0] as any; const msg = (first && (first as any).message) || 'Corrija os campos destacados'; toast({ title: 'Erro de validação', description: msg, variant: 'destructive' }); })} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 flex items-center gap-4">
            <img src={preview || '/placeholder.svg'} alt="Foto do funcionário" className="h-16 w-16 rounded-full object-cover" />
            <div>
              <Label htmlFor="foto">Foto (opcional)</Label>
              <Input id="foto" type="file" accept="image/png,image/jpeg" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
          </div>

          <div>
            <Label>Nome *</Label>
            <Input {...form.register('nome')} placeholder="Nome completo" />
          </div>

          <div>
            <Label>Matrícula *</Label>
            <Input {...form.register('matricula')} placeholder="Somente números" inputMode="numeric" />
          </div>

          <div>
            <Label>CPF *</Label>
            <Input value={form.watch('cpf') || ''} onChange={(e) => form.setValue('cpf', formatCPF(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
          </div>

          <div>
            <Label>Especialidade *</Label>
            <Select value={form.watch('especialidade')} onValueChange={(v) => form.setValue('especialidade', v as any)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {ESPECIALIDADE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Lotação *</Label>
            <Select value={form.watch('lotacao')} onValueChange={(v) => form.setValue('lotacao', v as any)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {LOTACAO_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Coordenação *</Label>
            <Select value={form.watch('coordenacao')} onValueChange={(v) => form.setValue('coordenacao', v as any)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {COORDENACAO_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Sexo</Label>
            <Select value={form.watch('sexo') || ''} onValueChange={(v) => form.setValue('sexo', v === '__none__' ? undefined : (v as any))}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Não informar</SelectItem>
                {SEXO_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Telefone</Label>
            <Input value={form.watch('telefone') || ''} onChange={(e) => form.setValue('telefone', formatPhoneBR(e.target.value))} placeholder="(XX) XXXXX-XXXX" inputMode="tel" />
          </div>

          <div className="md:col-span-2">
            <Label>Endereço</Label>
            <Input {...form.register('endereco')} placeholder="Rua, número - bairro, cidade" />
          </div>

          <div>
            <Label>Data de Nascimento</Label>
            <div className="relative">
              <Input
                placeholder="dd/mm/aaaa"
                value={nascText}
                onChange={handleNascChange}
                onBlur={handleNascBlur}
                className="pr-10"
                inputMode="numeric"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    aria-label="Abrir calendário de nascimento"
                  >
                    <CalendarIcon className="h-4 w-4 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch('dataNascimento') ? new Date(form.watch('dataNascimento') + 'T00:00:00') : undefined}
                    onSelect={(d) => {
                      const iso = d ? format(d, 'yyyy-MM-dd') : '';
                      form.setValue('dataNascimento', iso);
                      setNascText(iso ? isoToBR(iso) : '');
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Data de Admissão</Label>
            <div className="relative">
              <Input
                placeholder="dd/mm/aaaa"
                value={admText}
                onChange={handleAdmChange}
                onBlur={handleAdmBlur}
                className="pr-10"
                inputMode="numeric"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    aria-label="Abrir calendário de admissão"
                  >
                    <CalendarIcon className="h-4 w-4 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch('dataAdmissao') ? new Date(form.watch('dataAdmissao') + 'T00:00:00') : undefined}
                    onSelect={(d) => {
                      const iso = d ? format(d, 'yyyy-MM-dd') : '';
                      form.setValue('dataAdmissao', iso);
                      setAdmText(iso ? isoToBR(iso) : '');
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Escala de Trabalho</Label>
            <Select value={form.watch('escalaDeTrabalho') || ''} onValueChange={(v) => form.setValue('escalaDeTrabalho', v === '__none__' ? undefined : (v as any))}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Não informar</SelectItem>
                {ESCALA_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Contrato *</Label>
            <Select value={form.watch('contrato')} onValueChange={(v) => form.setValue('contrato', v as any)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {CONTRATO_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
