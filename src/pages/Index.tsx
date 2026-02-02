import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Employee } from '@/types/employee';
import { EmployeeFormModal } from '@/components/EmployeeFormModal';
import { EmployeeTable } from '@/components/EmployeeTable';
import { ImportExportBar } from '@/components/ImportExportBar';
import { getEmployeesFromDb, createEmployeeInDb, updateEmployeeInDb, deleteEmployeeInDb } from '@/services/employees';
import { FiltersBar, Filters } from '@/components/FiltersBar';
import { AiOutlineUserAdd, AiOutlineArrowUp } from 'react-icons/ai';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarCheck } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ExternalLinksBar } from '@/components/ExternalLinksBar';
import { VacationControlModal } from '@/components/VacationControlModal';
import { CorporateContacts } from '@/components/CorporateContacts';
import { VacationMobileView } from '@/components/VacationMobileView'; // Importar VacationMobileView

const Index = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openEmployeeForm, setOpenEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showTop, setShowTop] = useState(false);
  const [openVacationControl, setOpenVacationControl] = useState(false);
  const [openVacationMobileView, setOpenVacationMobileView] = useState(false); // Novo estado para a visualização mobile

  const isMobile = useIsMobile();
  const {
    toast
  } = useToast();

  useEffect(() => {
    document.title = 'Servitium';
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', 'Sistema de gerenciamento de funcionários com cadastro, edição, importação e exportação CSV/XLSX.');

    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);

    (async () => {
      setIsLoading(true);
      const { data, error } = await getEmployeesFromDb();
      if (error) {
        toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' });
      } else {
        setEmployees(data);
      }
      setIsLoading(false);
    })();
  }, [toast]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 200);
    onScroll();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCreateOrUpdateEmployee = async (data: any) => {
    const matricula = String(data?.matricula ?? '').trim();
    if (!matricula) {
      toast({
        title: 'Matrícula obrigatória',
        description: 'Informe a matrícula do funcionário.',
        variant: 'destructive'
      });
      return;
    }

    if (editingEmployee) {
      if (employees.some(e => e.matricula === matricula && e.id !== editingEmployee.id)) {
        toast({
          title: 'Matrícula duplicada',
          description: 'Já existe um funcionário com esta matrícula.',
          variant: 'destructive'
        });
        return;
      }

      const { data: updated, error } = await updateEmployeeInDb(editingEmployee.id, { ...editingEmployee, ...data, matricula });
      if (error || !updated) {
        toast({ title: 'Erro ao atualizar', description: error?.message || 'Tente novamente.', variant: 'destructive' });
        return;
      }
      setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? updated : e));
      setEditingEmployee(null);
      toast({ title: 'Edição concluída', description: 'Funcionário atualizado com sucesso.' });
    } else {
      if (employees.some(e => e.matricula === matricula)) {
        toast({
          title: 'Matrícula duplicada',
          description: 'Já existe um funcionário com esta matrícula.',
          variant: 'destructive'
        });
        return;
      }

      const { data: created, error } = await createEmployeeInDb({ ...data, matricula });
      if (error || !created) {
        toast({ title: 'Erro ao cadastrar', description: error?.message || 'Tente novamente.', variant: 'destructive' });
        return;
      }
      setEmployees(prev => [...prev, created]);
      toast({ title: 'Cadastro concluído', description: 'Funcionário adicionado com sucesso.' });
    }
    setOpenEmployeeForm(false);
  };

  const handleDeleteEmployee = async (id: string) => {
    const { error } = await deleteEmployeeInDb(id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
      return;
    }
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast({ title: 'Exclusão concluída', description: 'Funcionário excluído com sucesso.' });
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e =>
      (!filters.especialidade || e.especialidade === filters.especialidade) &&
      (!filters.lotacao || e.lotacao === filters.lotacao) &&
      (!filters.contrato || e.contrato === filters.contrato)
    );
  }, [employees, filters]);

  return (
    <main className="min-h-screen bg-slate-200 pwa-safe">
      <section className="container py-8 space-y-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Gerenciamento de Funcionários CPR e CMA SUL</h1>
            <p className="text-muted-foreground">Cadastro, edição, importação funcionários Servitium</p>
          </div>
          <ExternalLinksBar />
        </header>

        <div className="neo-card p-4 transition-[transform,box-shadow] duration-300 space-y-4">
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {!isMobile && (
                <Button onClick={() => {
                  setEditingEmployee(null);
                  setOpenEmployeeForm(true);
                }}>
                  <AiOutlineUserAdd /> Adicionar Funcionário
                </Button>
              )}
              <Button variant="outline" onClick={() => isMobile ? setOpenVacationMobileView(true) : setOpenVacationControl(true)}>
                <CalendarCheck className="mr-2 h-5 w-5" /> Controle de Férias
              </Button>
            </div>
            {!isMobile && <ImportExportBar employees={employees} onApply={list => setEmployees(list)} />}
          </div>
          <FiltersBar employees={employees} values={filters} onChange={v => setFilters(v)} onReset={() => {
            setFilters({});
            setSearchQuery('');
          }} />
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contatos Corporativos</h2>
        <CorporateContacts />

        {isLoading ? (
          <div className="neo-card flex flex-col items-center justify-center p-16 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <EmployeeTable
            data={filteredEmployees}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onEdit={e => {
              setEditingEmployee(e);
              setOpenEmployeeForm(true);
            }}
            onDelete={handleDeleteEmployee}
            isMobile={isMobile}
          />
        )}

        {!isMobile && (
          <EmployeeFormModal
            open={openEmployeeForm}
            onOpenChange={v => {
              setOpenEmployeeForm(v);
              if (!v) setEditingEmployee(null);
            }}
            initial={editingEmployee}
            onSubmitEmployee={handleCreateOrUpdateEmployee}
          />
        )}

        {!isMobile && (
          <VacationControlModal
            open={openVacationControl}
            onOpenChange={setOpenVacationControl}
            employees={employees}
          />
        )}

        {isMobile && (
          <VacationMobileView
            open={openVacationMobileView}
            onOpenChange={setOpenVacationMobileView}
            employees={employees}
          />
        )}
      </section>

      {showTop && (
        <Button
          aria-label="Voltar ao topo"
          className="fixed bottom-6 right-6 rounded-full shadow-lg"
          size="icon"
          onClick={() => window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })}
        >
          <AiOutlineArrowUp />
        </Button>
      )}
    </main>
  );
};

export default Index;