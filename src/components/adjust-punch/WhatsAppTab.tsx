import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, X, Trash2, CalendarPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DatesDialog } from './DatesDialog';
import { WhatsAppPreview } from './WhatsAppPreview';
import type { WhatsAppEntry } from './WhatsAppPreview';
import type { Employee } from '@/types/employee';

interface Props {
  employees: Employee[];
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName.trim();
  return `${parts[0]} ${parts[1]}`;
}

export function WhatsAppTab({ employees }: Props) {
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<WhatsAppEntry[]>([]);
  const [pendingEmployee, setPendingEmployee] = useState<Employee | null>(null);
  const [datesOpen, setDatesOpen] = useState(false);
  const [pendingDates, setPendingDates] = useState<Date[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees.slice(0, 10);
    return employees
      .filter((e) => e.nome.toLowerCase().includes(q) || e.matricula.toLowerCase().includes(q))
      .slice(0, 10);
  }, [employees, query]);

  const addedIds = useMemo(() => new Set(entries.map((e) => e.employee.id)), [entries]);

  const handleSelectEmployee = (emp: Employee, preserveDates = false) => {
    setPendingEmployee(emp);
    if (preserveDates) {
      const existing = entries.find((e) => e.employee.id === emp.id);
      setPendingDates(existing ? [...existing.dates] : []);
    } else {
      setPendingDates([]);
    }
    setDatesOpen(true);
  };

  const handleDatesConfirm = () => {
    if (!pendingEmployee || pendingDates.length === 0) return;

    setEntries((prev) => {
      const existing = prev.findIndex((e) => e.employee.id === pendingEmployee.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { employee: pendingEmployee, dates: pendingDates };
        return updated;
      }
      return [...prev, { employee: pendingEmployee, dates: pendingDates }];
    });

    setPendingEmployee(null);
    setPendingDates([]);
  };

  const handleRemoveEntry = (employeeId: string) => {
    setEntries((prev) => prev.filter((e) => e.employee.id !== employeeId));
  };

  return (
    <>
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
              query && 'hidden'
            )}
          />
          <Input
            placeholder="Buscar por nome ou matrícula"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-8"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Employee list */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Funcionários</p>
            <ul className="max-h-52 overflow-auto rounded-md border border-border divide-y">
              {filtered.length ? (
                filtered.map((e) => {
                  const alreadyAdded = addedIds.has(e.id);
                  return (
                    <li
                      key={e.id}
                      className={cn(
                        'p-3 cursor-pointer transition-colors hover:bg-accent',
                        alreadyAdded && 'opacity-50'
                      )}
                      onClick={() => handleSelectEmployee(e)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {e.foto ? (
                            <AvatarImage src={e.foto} alt={`Foto de ${e.nome}`} />
                          ) : (
                            <AvatarFallback>{initials(e.nome)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{e.nome}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            Matrícula {e.matricula}
                          </p>
                        </div>
                        {alreadyAdded && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            ✓ adicionado
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="p-3 text-sm text-muted-foreground">
                  Nenhum funcionário encontrado.
                </li>
              )}
            </ul>
          </div>

          {/* Added entries */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Adicionados ({entries.length})
            </p>
            {entries.length > 0 ? (
              <ul className="max-h-52 overflow-auto rounded-md border border-border divide-y">
                {entries.map((entry) => {
                  const days = [...new Set(entry.dates.map((d) => d.getDate()))]
                    .sort((a, b) => a - b)
                    .join(', ');
                  return (
                    <li
                      key={entry.employee.id}
                      className="p-3 flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getShortName(entry.employee.nome)}
                        </p>
                        <p className="text-xs text-muted-foreground">Dias: {days}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleSelectEmployee(entry.employee, true)}
                          title="Alterar datas"
                        >
                          <CalendarPlus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveEntry(entry.employee.id)}
                          title="Remover"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Selecione funcionários e suas datas à esquerda.
              </div>
            )}

            <Button
              type="button"
              className="w-full"
              disabled={entries.length === 0}
              onClick={() => setPreviewOpen(true)}
            >
              Gerar Mensagem
            </Button>
          </div>
        </div>
      </div>

      <DatesDialog
        open={datesOpen}
        onOpenChange={setDatesOpen}
        dates={pendingDates}
        onChangeDates={setPendingDates}
        onConfirm={handleDatesConfirm}
      />

      <WhatsAppPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        entries={entries}
      />
    </>
  );
}
