import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Vacation } from '@/types/vacation';
import { Employee } from '@/types/employee'; // Para selecionar o funcionário

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear + i); // Current year + next 4 years
const months = Array.from({ length: 12 }, (_, i) => i + 1);

const schema = z.object({
  employeeId: z.string().min(1, 'Funcionário é obrigatório'),
  employeeName: z.string().min(1, 'Nome do funcionário é obrigatório'), // Hidden field, derived from employeeId
  plannedMonth: z.coerce.number().min(1).max(12),
  plannedYear: z.coerce.number().min(currentYear),
  sellDays: z.enum(['none', 'first10', 'last10']),
  notificationDaysBefore: z.coerce.number().min(1, 'Dias de notificação devem ser pelo menos 1').default(10),
});

export type VacationFormValues = z.infer<typeof schema>;

type Props = {
  trigger?: React.ReactNode;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Vacation | null;
  employees: Employee[]; // Lista de funcionários para seleção
  onSubmitVacation: (data: VacationFormValues & { id?: string }) => void;
};

export function VacationFormModal({ trigger, open, onOpenChange, initial, employees, onSubmitVacation }: Props) {
  const { toast } = useToast();

  const form = useForm<VacationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial ? {
      employeeId: initial.employeeId,
      employeeName: initial.employeeName,
      plannedMonth: initial.plannedMonth,
      plannedYear: initial.plannedYear,
      sellDays: initial.sellDays,
      notificationDaysBefore: initial.notificationDaysBefore,
    } : {
      employeeId: '',
      employeeName: '',
      plannedMonth: new Date().getMonth() + 1,
      plannedYear: currentYear,
      sellDays: 'none',
      notificationDaysBefore: 10,
    }
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      form.reset({
        employeeId: initial.employeeId,
        employeeName: initial.employeeName,
        plannedMonth: initial.plannedMonth,
        plannedYear: initial.plannedYear,
        sellDays: initial.sellDays,
        notificationDaysBefore: initial.notificationDaysBefore,
      });
    } else {
      form.reset({
        employeeId: '',
        employeeName: '',
        plannedMonth: new Date().getMonth() + 1,
        plannedYear: currentYear,
        sellDays: 'none',
        notificationDaysBefore: 10,
      });
    }
  }, [open, initial, form]);

  const handleEmployeeSelect = (employeeId: string) => {
    const selectedEmployee = employees.find(e => e.id === employeeId);
    if (selectedEmployee) {
      form.setValue('employeeId', employeeId);
      form.setValue('employeeName', selectedEmployee.nome);
    } else {
      form.setValue('employeeId', '');
      form.setValue('employeeName', '');
    }
  };

  const onSubmit = (values: VacationFormValues) => {
    onSubmitVacation({ ...values, id: initial?.id });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-2xl shadow-none">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar Férias' : 'Registrar Férias'}</DialogTitle>
          <DialogDescription>Preencha os detalhes das férias do funcionário.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          const first = Object.values(errors)[0] as any;
          const msg = (first && (first as any).message) || 'Corrija os campos destacados';
          toast({ title: 'Erro de validação', description: msg, variant: 'destructive' });
        })} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="md:col-span-2">
            <Label htmlFor="employeeId">Funcionário *</Label>
            <Select
              value={form.watch('employeeId')}
              onValueChange={handleEmployeeSelect}
            >
              <SelectTrigger id="employeeId">
                <SelectValue placeholder="Selecione um funcionário" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.nome} (Matrícula: {emp.matricula})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.employeeId && <p className="text-red-500 text-sm mt-1">{form.formState.errors.employeeId.message}</p>}
          </div>

          <div>
            <Label htmlFor="plannedMonth">Mês Previsto *</Label>
            <Select
              value={String(form.watch('plannedMonth'))}
              onValueChange={(v) => form.setValue('plannedMonth', Number(v))}
            >
              <SelectTrigger id="plannedMonth">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={String(month)}>
                    {new Date(currentYear, month - 1, 1).toLocaleString('pt-BR', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.plannedMonth && <p className="text-red-500 text-sm mt-1">{form.formState.errors.plannedMonth.message}</p>}
          </div>

          <div>
            <Label htmlFor="plannedYear">Ano Previsto *</Label>
            <Select
              value={String(form.watch('plannedYear'))}
              onValueChange={(v) => form.setValue('plannedYear', Number(v))}
            >
              <SelectTrigger id="plannedYear">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.plannedYear && <p className="text-red-500 text-sm mt-1">{form.formState.errors.plannedYear.message}</p>}
          </div>

          <div className="md:col-span-2">
            <Label>Vender 10 dias?</Label>
            <RadioGroup
              value={form.watch('sellDays')}
              onValueChange={(v: 'none' | 'first10' | 'last10') => form.setValue('sellDays', v)}
              className="flex flex-col space-y-1 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="sell-none" />
                <Label htmlFor="sell-none">Não</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="first10" id="sell-first10" />
                <Label htmlFor="sell-first10">Sim, os 10 primeiros dias</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="last10" id="sell-last10" />
                <Label htmlFor="sell-last10">Sim, os 10 últimos dias</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="notificationDaysBefore">Notificar (dias antes) *</Label>
            <Input
              id="notificationDaysBefore"
              type="number"
              {...form.register('notificationDaysBefore', { valueAsNumber: true })}
              placeholder="Ex: 10"
            />
            {form.formState.errors.notificationDaysBefore && <p className="text-red-500 text-sm mt-1">{form.formState.errors.notificationDaysBefore.message}</p>}
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