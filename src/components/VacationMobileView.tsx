import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Vacation } from '@/types/vacation';
import { Employee } from '@/types/employee';
import { getVacationsFromDb } from '@/services/vacations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface VacationMobileViewProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employees: Employee[]; // Pode ser útil para exibir detalhes do funcionário, se necessário
}

// Função para determinar o status efetivo para exibição (copiada de VacationTable)
function getEffectiveStatus(vacation: Vacation): Vacation['status'] {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // Mês de 1 a 12
  const currentYear = now.getFullYear();

  if (vacation.status === 'completed') {
    return 'completed';
  }

  if (vacation.plannedYear === currentYear && vacation.plannedMonth === currentMonth) {
    return 'in_progress';
  }

  if (vacation.plannedYear > currentYear || (vacation.plannedYear === currentYear && vacation.plannedMonth > currentMonth)) {
    return 'pending';
  }

  return 'pending';
}

// Função para obter o texto do status (copiada de VacationTable)
const getStatusBadge = (status: Vacation['status']) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Em Andamento</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Concluída</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};

// Função para obter o texto de 'Vender 10 dias' (copiada de VacationTable)
const getSellDaysText = (sellDays: Vacation['sellDays']) => {
  switch (sellDays) {
    case 'none':
      return 'Não';
    case 'first10':
      return 'Sim (10 primeiros)';
    case 'last10':
      return 'Sim (10 últimos)';
    default:
      return '-';
  }
};

export function VacationMobileView({ open, onOpenChange }: VacationMobileViewProps) {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;

    const fetchVacations = async () => {
      setIsLoading(true);
      const { data, error } = await getVacationsFromDb();
      if (error) {
        toast({ title: 'Erro ao carregar férias', description: error.message, variant: 'destructive' });
        setVacations([]);
      } else {
        setVacations(data);
      }
      setIsLoading(false);
    };

    fetchVacations();
  }, [open, toast]);

  const filteredVacations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? vacations.filter(v => v.employeeName.toLowerCase().includes(q))
      : vacations;
  }, [vacations, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md shadow-none">
        <DialogHeader>
          <DialogTitle>Férias dos Funcionários</DialogTitle>
          <DialogDescription>Visualize os registros de férias dos colaboradores.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", searchQuery && "hidden")} />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome do funcionário"
              className="pl-10 pr-8"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent hover:text-foreground"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-md text-muted-foreground">Carregando férias...</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto space-y-3">
              {filteredVacations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum registro de férias encontrado.</p>
              ) : (
                filteredVacations.map(v => {
                  const effectiveStatus = getEffectiveStatus(v);
                  const plannedDate = new Date(v.plannedYear, v.plannedMonth - 1, 1);
                  return (
                    <div key={v.id} className="neo-card p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{v.employeeName}</p>
                        {getStatusBadge(effectiveStatus)}
                      </div>
                      <p className="text-muted-foreground">
                        {format(plannedDate, 'MMMM/yyyy', { locale: ptBR })}
                      </p>
                      <p className="text-muted-foreground">Vender 10 dias: {getSellDaysText(v.sellDays)}</p>
                      <p className="text-muted-foreground">Notificar: {v.notificationDaysBefore} dias antes</p>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}