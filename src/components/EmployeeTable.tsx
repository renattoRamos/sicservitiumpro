import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Employee } from '@/types/employee';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, X } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

export type SortKey = 'nome' | 'matricula' | 'cpf' | 'especialidade' | 'lotacao' | 'telefone';
type Props = {
  data: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (v: string) => void;
  isMobile?: boolean;
};
export function EmployeeTable({
  data,
  onEdit,
  onDelete,
  searchQuery,
  onSearchQueryChange,
  isMobile
}: Props) {
  const { toast } = useToast();
  const [internalQuery, setInternalQuery] = useState('');
  const query = searchQuery ?? internalQuery;
  const setQuery = onSearchQueryChange ?? setInternalQuery;
  const [sortKey, setSortKey] = useState<SortKey>('nome');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Define quantos itens por página

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copiado!',
        description: `${label} copiado para a área de transferência.`,
      });
    } catch (err) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar para a área de transferência.',
        variant: 'destructive',
      });
    }
  };

  const formatEmployeeTooltip = (employee: Employee) => {
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return 'Não informado';
      try {
        // Parse the date as local date to avoid timezone issues
        const [year, month, day] = dateStr.split('-');
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        return date.toLocaleDateString('pt-BR');
      } catch {
        return dateStr;
      }
    };

    return (
      <div className="space-y-1.5 text-sm max-w-xs text-left">
        <div className="font-semibold text-base text-center">{employee.nome}</div>
        <div><span className="font-medium">Matrícula:</span> {employee.matricula}</div>
        <div><span className="font-medium">CPF:</span> {employee.cpf || 'Não informado'}</div>
        <div><span className="font-medium">Especialidade:</span> {employee.especialidade}</div>
        <div><span className="font-medium">Lotação:</span> {employee.lotacao}</div>
        <div><span className="font-medium">Contrato:</span> {employee.contrato}</div>
        {employee.sexo && <div><span className="font-medium">Sexo:</span> {employee.sexo}</div>}
        {employee.telefone && <div><span className="font-medium">Telefone:</span> {employee.telefone}</div>}
        {employee.endereco && <div><span className="font-medium">Endereço:</span> {employee.endereco}</div>}
        {employee.dataNascimento && <div><span className="font-medium">Nascimento:</span> {formatDate(employee.dataNascimento)}</div>}
        {employee.dataAdmissao && <div><span className="font-medium">Admissão:</span> {formatDate(employee.dataAdmissao)}</div>}
        {employee.escalaDeTrabalho && <div><span className="font-medium">Escala:</span> {employee.escalaDeTrabalho}</div>}
      </div>
    );
  };

  const sortedAndFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? data.filter(e => [e.nome, e.matricula, e.cpf, e.especialidade].filter(Boolean).some(v => String(v).toLowerCase().includes(q))) : data;
    return base.slice().sort((a, b) => {
      const va = String(a[sortKey] || '').toLowerCase();
      const vb = String(b[sortKey] || '').toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, query, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedAndFiltered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedAndFiltered.slice(startIndex, endIndex);
  }, [sortedAndFiltered, currentPage, itemsPerPage]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
            placeholder="Buscar por Nome, Matrícula ou Especialidade"
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
            {sortedAndFiltered.length} funcionário{sortedAndFiltered.length !== 1 ? 's' : ''} visível{sortedAndFiltered.length !== 1 ? 'is' : ''}
          </span>
        </div>
      </div>

      <div className="neo-card transition-[transform,box-shadow] duration-300">
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn('sticky top-0 z-10 bg-background text-center w-[12%]')}>Foto</TableHead>
                <TableHead className={cn('sticky top-0 z-10 bg-background cursor-pointer select-none text-left', isMobile ? 'w-[32%]' : 'w-[28%]')} onClick={() => toggleSort('nome')}>Nome</TableHead>
                <TableHead className={cn('sticky top-0 z-10 bg-background cursor-pointer select-none text-center whitespace-nowrap', isMobile ? 'w-[10%]' : 'w-[11%]')} onClick={() => toggleSort('matricula')}>{isMobile ? 'Mat.' : 'Matrícula'}</TableHead>
                <TableHead className={cn('sticky top-0 z-10 bg-background cursor-pointer select-none text-center whitespace-nowrap', isMobile ? 'w-[14%]' : 'w-[14%]')} onClick={() => toggleSort('cpf')}>CPF</TableHead>
                <TableHead className={cn('sticky top-0 z-10 bg-background cursor-pointer select-none text-center whitespace-nowrap', isMobile ? 'w-[12%]' : 'w-[13%]')} onClick={() => toggleSort('telefone')}>Contato</TableHead>
                {!isMobile && <>
                  <TableHead className={cn('sticky top-0 z-10 bg-background cursor-pointer select-none text-center whitespace-nowrap w-[11%]')} onClick={() => toggleSort('especialidade')}>Especialidade</TableHead>
                  <TableHead className={cn('sticky top-0 z-10 bg-background cursor-pointer select-none text-center whitespace-nowrap w-[11%]')} onClick={() => toggleSort('lotacao')}>Lotação</TableHead>
                  <TableHead className={cn('sticky top-0 z-10 bg-background text-center w-28')}>Ações</TableHead>
                </>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? <TableRow>
                <TableCell colSpan={isMobile ? 4 : 7} className="text-center text-muted-foreground py-8">Nenhum funcionário cadastrado</TableCell>
              </TableRow> : paginatedData.map(e => <TableRow key={e.id || e.matricula}>
                <TableCell className="align-middle text-center w-[12%]">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help transition-transform hover:scale-105">
                        <img src={e.foto || '/placeholder.svg'} alt={`Foto de ${e.nome}`} className="size-16 aspect-square rounded-full object-cover mx-auto block" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-none">
                      {formatEmployeeTooltip(e)}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className={cn("text-left whitespace-normal break-words", isMobile ? 'w-[32%]' : 'w-[28%]')}>
                  <button
                    onClick={() => copyToClipboard(e.nome, 'Nome')}
                    className="text-left hover:text-primary transition-colors cursor-pointer underline-offset-2 hover:underline"
                    title="Clique para copiar o nome"
                  >
                    {e.nome}
                  </button>
                </TableCell>
                <TableCell className={cn("text-center whitespace-nowrap", isMobile ? 'w-[10%]' : 'w-[11%]')}>
                  <button
                    onClick={() => copyToClipboard(e.matricula, 'Matrícula')}
                    className="hover:text-primary transition-colors cursor-pointer underline-offset-2 hover:underline"
                    title="Clique para copiar a matrícula"
                  >
                    {e.matricula}
                  </button>
                </TableCell>
                <TableCell className={cn("text-center whitespace-nowrap", isMobile ? 'w-[14%]' : 'w-[14%]')}>
                  {e.cpf ? (
                    <button
                      onClick={() => copyToClipboard(e.cpf!.replace(/[.-]/g, ''), 'CPF')}
                      className="hover:text-primary transition-colors cursor-pointer underline-offset-2 hover:underline"
                      title="Clique para copiar o CPF (sem pontuação)"
                    >
                      {e.cpf}
                    </button>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className={cn("text-center whitespace-nowrap", isMobile ? 'w-[12%]' : 'w-[13%]')}>
                  {e.telefone ? (
                    <a
                      href={`https://wa.me/55${e.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors cursor-pointer underline-offset-2 hover:underline"
                      title="Abrir no WhatsApp"
                    >
                      {e.telefone}
                    </a>
                  ) : (
                    '-'
                  )}
                </TableCell>
                {!isMobile && <>
                  <TableCell className="text-center whitespace-nowrap w-[11%]">{e.especialidade}</TableCell>
                  <TableCell className="text-center whitespace-nowrap w-[11%]">{e.lotacao}</TableCell>
                  <TableCell className="text-center w-28">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-xl font-bold transition-all active:scale-95 shadow-sm"
                        onClick={() => onEdit(e)}
                      >
                        <AiOutlineEdit className="mr-1 size-4" /> Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-xl font-bold transition-all active:scale-95 shadow-sm"
                          >
                            <AiOutlineDelete className="mr-1 size-4" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl border-2">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-black uppercase tracking-tight text-destructive">Remover Funcionário?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-600">
                              Esta ação removerá permanentemente <span className="font-bold text-slate-900">{e.nome}</span> do sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-xs">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(e.id)}
                              className="rounded-xl font-bold uppercase tracking-widest text-xs bg-destructive hover:bg-destructive/90 shadow-sm"
                            >
                              Confirmar Exclusão
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </>}
              </TableRow>)}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent className="gap-2">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={cn(
                  "hover:bg-transparent text-primary font-medium transition-opacity",
                  currentPage === 1 ? "opacity-30 pointer-events-none" : "cursor-pointer"
                )}
              />
            </PaginationItem>
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className={cn(
                      "size-10 transition-all font-bold rounded-lg border-none",
                      currentPage === page
                        ? "bg-white text-primary shadow-md hover:bg-white"
                        : "bg-transparent text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </div>
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={cn(
                  "hover:bg-transparent text-primary font-medium transition-opacity",
                  currentPage === totalPages ? "opacity-30 pointer-events-none" : "cursor-pointer"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}