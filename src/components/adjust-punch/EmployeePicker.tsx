import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Employee } from '@/types/employee';
import { formatCPF } from '@/utils/storage';
import { Search, X } from 'lucide-react'; // Importar ícones de lupa e X
import { Button } from '@/components/ui/button'; // Importar Button
import { cn } from '@/lib/utils'; // Importar cn

interface Props {
  employees: Employee[];
  selected: Employee | null;
  query: string;
  onQueryChange: (v: string) => void;
  onSelect: (e: Employee) => void;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function EmployeePicker({ employees, selected, query, onQueryChange, onSelect }: Props) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees.slice(0, 10);
    return employees
      .filter((e) => e.nome.toLowerCase().includes(q) || e.matricula.toLowerCase().includes(q))
      .slice(0, 10);
  }, [employees, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", query && "hidden")} />
        <Input
          placeholder="Buscar por nome ou matrícula"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoFocus
          className="pl-10 pr-8"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={() => onQueryChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Funcionários</p>
          <ul className="max-h-64 overflow-auto rounded-md border border-border divide-y">
            {filtered.length ? (
              filtered.map((e) => (
                <li
                  key={e.id}
                  className={`p-3 cursor-pointer transition-colors hover:bg-accent ${selected?.id === e.id ? 'bg-accent' : ''}`}
                  onClick={() => onSelect(e)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {e.foto ? (
                        <AvatarImage src={e.foto} alt={`Foto de ${e.nome}`} />
                      ) : (
                        <AvatarFallback>{initials(e.nome)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{e.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">Matrícula {e.matricula}</p>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-3 text-sm text-muted-foreground">Nenhum funcionário encontrado.</li>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Dados selecionados</p>
          {selected ? (
            <div className="rounded-md border border-border p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  {selected.foto ? (
                    <AvatarImage src={selected.foto} alt={`Foto de ${selected.nome}`} />
                  ) : (
                    <AvatarFallback>{initials(selected.nome)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-medium leading-none">{selected.nome}</h3>
                  <p className="text-sm text-muted-foreground">Matrícula {selected.matricula}</p>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Nome</dt>
                  <dd className="text-sm font-medium">{selected.nome}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Matrícula</dt>
                  <dd className="text-sm font-medium">{selected.matricula}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">CPF</dt>
                  <dd className="text-sm font-medium">{selected.cpf ? formatCPF(selected.cpf) : '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Especialidade</dt>
                  <dd className="text-sm font-medium">{selected.especialidade}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Contrato</dt>
                  <dd className="text-sm font-medium">{selected.contrato}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Selecione um funcionário para visualizar os dados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}