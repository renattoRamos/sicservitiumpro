import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarCheck, Trash2, FileText, Eye } from 'lucide-react'; // Usar FileText para o documento
import { Vacation } from '@/types/vacation';
import { VacationFormModal, VacationFormValues } from '@/components/VacationFormModal';
import { VacationTable } from '@/components/VacationTable';
import { Employee } from '@/types/employee';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { AiOutlineDownload } from 'react-icons/ai';
import * as XLSX from 'xlsx';
import { getVacationsFromDb, createVacationInDb, updateVacationInDb, deleteVacationInDb, deleteAllVacationsInDb } from '@/services/vacations';

const NOTIFIED_VACATIONS_KEY = 'notified_vacations';
const OFFICIAL_DOCUMENT_PATH = '/documento_oficial.pdf'; // Caminho para o documento estático

interface VacationControlModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employees: Employee[];
}

export function VacationControlModal({ open, onOpenChange, employees }: VacationControlModalProps) {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editingVacation, setEditingVacation] = useState<Vacation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();

  // Load initial vacation data from DB
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setIsLoading(true);

      const { data: vacationsData, error: vacationsError } = await getVacationsFromDb();

      if (vacationsError) {
        toast({ title: 'Erro ao carregar férias', description: vacationsError.message, variant: 'destructive' });
        setVacations([]);
      } else {
        setVacations(vacationsData);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [open, toast]);

  // Notification logic
  useEffect(() => {
    if (!open || isLoading || vacations.length === 0) return;

    const notifiedVacations = JSON.parse(localStorage.getItem(NOTIFIED_VACATIONS_KEY) || '[]') as string[];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Only date, no time

    vacations.forEach(vacation => {
      if (vacation.status === 'completed' || notifiedVacations.includes(vacation.id)) {
        return; // Skip completed or already notified vacations
      }

      const plannedDate = new Date(vacation.plannedYear, vacation.plannedMonth - 1, 1); // First day of planned month
      const diffTime = plannedDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= vacation.notificationDaysBefore && diffDays >= 0) {
        toast({
          title: `Férias se aproximando: ${vacation.employeeName}`,
          description: `As férias de ${vacation.employeeName} estão planejadas para ${format(plannedDate, 'MM/yyyy')} e começam em ${diffDays} dia(s).`,
          duration: 8000, // Show for 8 seconds
        });

        // Mark as notified
        notifiedVacations.push(vacation.id);
        localStorage.setItem(NOTIFIED_VACATIONS_KEY, JSON.stringify(notifiedVacations));
      }
    });
  }, [open, isLoading, vacations, toast]);


  const handleCreateOrUpdate = async (data: VacationFormValues & { id?: string }) => {
    if (data.id) {
      const { data: updated, error } = await updateVacationInDb(data.id, data);
      if (error || !updated) {
        toast({ title: 'Erro ao atualizar', description: error?.message || 'Tente novamente.', variant: 'destructive' });
        return;
      }
      setVacations(prev => prev.map(v => v.id === data.id ? updated : v));
      toast({ title: 'Férias atualizadas', description: 'Registro de férias atualizado com sucesso.' });
    } else {
      const newVacationPayload: Omit<Vacation, 'id'> = {
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        plannedMonth: data.plannedMonth,
        plannedYear: data.plannedYear,
        sellDays: data.sellDays,
        notificationDaysBefore: data.notificationDaysBefore,
        status: 'pending', // New vacations start as pending
      };
      const { data: created, error } = await createVacationInDb(newVacationPayload);
      if (error || !created) {
        toast({ title: 'Erro ao registrar', description: error?.message || 'Tente novamente.', variant: 'destructive' });
        return;
      }
      setVacations(prev => [...prev, created]);
      toast({ title: 'Férias registradas', description: 'Novo registro de férias adicionado com sucesso.' });
    }
    setEditingVacation(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteVacationInDb(id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
      return;
    }
    setVacations(prev => prev.filter(v => v.id !== id));
    toast({ title: 'Férias excluídas', description: 'Registro de férias removido com sucesso.' });
    // Also remove from notified list if it was there
    const notifiedVacations = JSON.parse(localStorage.getItem(NOTIFIED_VACATIONS_KEY) || '[]') as string[];
    const updatedNotified = notifiedVacations.filter(notifiedId => notifiedId !== id);
    localStorage.setItem(NOTIFIED_VACATIONS_KEY, JSON.stringify(updatedNotified));
  };

  const handleUpdateStatus = async (id: string, newStatus: Vacation['status']) => {
    const { data: updated, error } = await updateVacationInDb(id, { status: newStatus });
    if (error || !updated) {
      toast({ title: 'Erro ao atualizar status', description: error?.message || 'Tente novamente.', variant: 'destructive' });
      return;
    }
    setVacations(prev => prev.map(v => v.id === id ? updated : v));
    toast({ title: 'Status atualizado', description: `Status das férias alterado para ${newStatus === 'completed' ? 'Concluída' : 'Pendente'}.` });
    // If marked as completed, remove from notified list
    if (newStatus === 'completed') {
      const notifiedVacations = JSON.parse(localStorage.getItem(NOTIFIED_VACATIONS_KEY) || '[]') as string[];
      const updatedNotified = notifiedVacations.filter(notifiedId => notifiedId !== id);
      localStorage.setItem(NOTIFIED_VACATIONS_KEY, JSON.stringify(updatedNotified));
    }
  };

  const handleClearAllVacations = async () => {
    const { error } = await deleteAllVacationsInDb();
    if (error) {
      toast({ title: 'Erro ao limpar férias', description: error.message, variant: 'destructive' });
      return;
    }
    setVacations([]);
    localStorage.removeItem(NOTIFIED_VACATIONS_KEY); // Clear all notifications
    toast({ title: 'Férias limpas', description: 'Todos os registros de férias foram removidos.' });
  };

  const filteredVacations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? vacations.filter(v => v.employeeName.toLowerCase().includes(q))
      : vacations;
  }, [vacations, searchQuery]);

  const buildExportRows = () => {
    return vacations.map(v => {
      const plannedDate = new Date(v.plannedYear, v.plannedMonth - 1, 1);
      const monthYear = format(plannedDate, 'MMMM/yyyy', { locale: ptBR });
      
      let sellDaysText = '';
      switch (v.sellDays) {
        case 'none': sellDaysText = 'Não'; break;
        case 'first10': sellDaysText = 'Sim (10 primeiros dias)'; break;
        case 'last10': sellDaysText = 'Sim (10 últimos dias)'; break;
      }

      let statusText = '';
      switch (v.status) {
        case 'pending': statusText = 'Pendente'; break;
        case 'in_progress': statusText = 'Em Andamento'; break;
        case 'completed': statusText = 'Concluída'; break;
      }

      return {
        'Nome do Funcionário': v.employeeName,
        'Mês/Ano Previsto': monthYear,
        'Vender 10 Dias': sellDaysText,
        'Notificar (Dias Antes)': v.notificationDaysBefore,
        'Status': statusText,
      };
    });
  };

  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(buildExportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ferias');
    XLSX.writeFile(wb, 'ferias.xlsx', { bookType: 'xlsx' });
    toast({ title: 'Exportação concluída', description: 'Dados de férias exportados para XLSX.' });
  };

  const exportODS = () => {
    const ws = XLSX.utils.json_to_sheet(buildExportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ferias');
    XLSX.writeFile(wb, 'ferias.ods', { bookType: 'ods' });
    toast({ title: 'Exportação concluída', description: 'Dados de férias exportados para ODS.' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl shadow-none">
        <DialogHeader>
          <DialogTitle>Controle de Férias de Funcionários</DialogTitle>
          <DialogDescription>Gerencie os registros de férias dos colaboradores.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => { setEditingVacation(null); setOpenForm(true); }}>
                <CalendarCheck className="mr-2 h-5 w-5" /> Registrar Férias
              </Button>
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Button type="button" variant="outline" disabled={vacations.length === 0}>
                    <AiOutlineDownload className="mr-2 h-5 w-5" /> Exportar
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto p-2">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={exportXLSX}>XLSX</Button>
                    <Button variant="outline" onClick={exportODS}>ODS</Button>
                  </div>
                </HoverCardContent>
              </HoverCard>

              {/* Botão para o Documento Oficial Estático */}
              <Button type="button" variant="secondary" onClick={() => window.open(OFFICIAL_DOCUMENT_PATH, '_blank')}>
                <FileText className="mr-2 h-5 w-5" /> Visualizar Documento Oficial
              </Button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={vacations.length === 0}>
                  <Trash2 className="mr-2 h-5 w-5" /> Limpar Tudo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja limpar tudo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação removerá TODOS os registros de férias e não poderá ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAllVacations}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-md text-muted-foreground">Carregando dados...</p>
            </div>
          ) : (
            <VacationTable
              data={filteredVacations}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onEdit={v => { setEditingVacation(v); setOpenForm(true); }}
              onDelete={handleDelete}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </div>

        <VacationFormModal
          open={openForm}
          onOpenChange={v => { setOpenForm(v); if (!v) setEditingVacation(null); }}
          initial={editingVacation}
          employees={employees}
          onSubmitVacation={handleCreateOrUpdate}
        />
      </DialogContent>
    </Dialog>
  );
}