import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Employee } from '@/types/employee';
import { AiOutlineCloseCircle } from 'react-icons/ai';

export type Filters = {
  especialidade?: string;
  lotacao?: string;
  contrato?: string;
};

type Props = {
  employees: Employee[];
  values: Filters;
  onChange: (v: Filters) => void;
  onReset: () => void;
};

export function FiltersBar({ employees, values, onChange, onReset }: Props) {
  const { especialidades, lotacoes, contratos } = useMemo(() => {
    const uniq = (arr: (string | undefined)[]) => Array.from(new Set(arr.filter(Boolean))) as string[];
    return {
      especialidades: uniq(employees.map((e) => e.especialidade)),
      lotacoes: uniq(employees.map((e) => e.lotacao)),
      contratos: uniq(employees.map((e) => e.contrato)),
    };
  }, [employees]);

  const set = (key: keyof Filters) => (val: string) => {
    onChange({ ...values, [key]: val === '__all__' ? undefined : val });
  };

  const valOrAll = (val?: string) => val ?? '__all__';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <Label>Especialidade</Label>
          <Select value={valOrAll(values.especialidade)} onValueChange={set('especialidade')}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {especialidades.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Lotação</Label>
          <Select value={valOrAll(values.lotacao)} onValueChange={set('lotacao')}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {lotacoes.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Contrato</Label>
          <Select value={valOrAll(values.contrato)} onValueChange={set('contrato')}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {contratos.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-start">
        <Button type="button" variant="secondary" onClick={onReset}><AiOutlineCloseCircle /> Limpar filtros</Button>
      </div>
    </div>
  );
}