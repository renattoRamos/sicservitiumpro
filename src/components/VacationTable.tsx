import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { CheckCircle, RotateCcw, Search, X } from 'lucide-react'; // Ícones para status e busca
import { useToast } from '@/hooks/use-toast';
import { Vacation } from '@/types/vacation';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

type Props = {
  data: Vacation[];
  onEdit: (vacation: Vacation) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: 'pending' | 'in_progress' | 'completed') => void;
  searchQuery?: string;
  onSearchQueryChange?: (v: string) => void;
};

// Função para determinar o status efetivo para exibição
function getEffectiveStatus(vacation: Vacation): Vacation['status'] {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // Mês de 1 a 12
  const currentYear = now.getFullYear();

  // Se o status salvo for 'completed', sempre exibe como 'Concluída'.
  // O botão 'Reabrir' muda vacation.status para 'pending', então esta condição
  // será falsa se o usuário tiver clicado em 'Reabrir'.
  if (vacation.status === 'completed') {
    return 'completed';
  }

  // Se o status salvo for 'pending' (seja inicialmente ou após 'Reabrir'):
  // Verifica se está 'Em Andamento' ou 'Pendente' com base nas datas.
  // Se for uma data passada, mas o status é 'pending', mantém como 'pending'
  // para respeitar a ação do usuário de reabrir.
  if (vacation.plannedYear === currentYear && vacation.plannedMonth === currentMonth) {
    return 'in_progress';
  }

  if (vacation.plannedYear > currentYear || (vacation.plannedYear === currentYear && vacation.plannedMonth > currentMonth)) {
    return 'pending';
  }

  // Se chegamos aqui, significa que:
  // 1. vacation.status é 'pending' (não 'completed').
  // 2. O período planejado está no passado (não é o mês atual, nem futuro).
  // Neste cenário, se o usuário clicou em 'Reabrir', ele quer que seja 'pending'
  // mesmo que a data seja passada.
  return 'pending';
}

export function VacationTable({
  data,
  onEdit,
  onDelete,
  onUpdateStatus,
  searchQuery,
  onSearchQueryChange,
}: Props) {
  const { toast } = useToast();
  const [internalQuery, setInternalQuery] = useState('');
  const query = searchQuery ?? internalQuery;
  const setQuery = onSearchQueryChange ?? setInternalQuery;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Define quantos itens por página

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? data.filter(e => e.employeeName.toLowerCase().includes(q))
      : data;
  }, [data, query]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative max-w-md">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", query && "hidden")} />
          <Input
            value={query}
            onChange={e => { setQuery(e.target.value); setCurrentPage(1); }} // Reset page on search
            placeholder="Buscar por nome do funcionário"
            className="pl-10 pr-8"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => { setQuery(''); setCurrentPage(1); }} // Reset page on clear
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''} visível{filtered.length !== 1 ? 'is' : ''}
          </span>
        </div>
      </div>

      <div className="neo-card transition-[transform,box-shadow] duration-300">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Funcionário</TableHead>
              <TableHead className="text-center">Mês/Ano Previsto</TableHead>
              <TableHead className="text-center">Vender 10 dias</TableHead>
              <TableHead className="text-center">Notificar (dias antes)</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center w-40">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum registro de férias encontrado.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map(v => {
                const effectiveStatus = getEffectiveStatus(v);
                return (
                  <TableRow key={v.id}>
                    <TableCell className="text-left font-medium">{v.employeeName}</TableCell>
                    <TableCell className="text-center">
                      {new Date(v.plannedYear, v.plannedMonth - 1, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-center">{getSellDaysText(v.sellDays)}</TableCell>
                    <TableCell className="text-center">{v.notificationDaysBefore} dias</TableCell>
                    <TableCell className="text-center">{getStatusBadge(effectiveStatus)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" variant="secondary" onClick={() => onEdit(v)}>
                          <AiOutlineEdit className="mr-1" /> Editar
                        </Button>
                        {effectiveStatus !== 'completed' ? (
                          <Button size="sm" variant="outline" onClick={() => onUpdateStatus(v.id, 'completed')}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Baixar
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => onUpdateStatus(v.id, 'pending')}>
                            <RotateCcw className="h-4 w-4 mr-1" /> Reabrir
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <AiOutlineDelete className="mr-1" /> Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não poderá ser desfeita. O registro de férias será removido.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(v.id)}>Confirmar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                isActive={currentPage > 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                isActive={currentPage < totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}