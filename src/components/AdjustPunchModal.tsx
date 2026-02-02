import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';



import { EmployeePicker } from './adjust-punch/EmployeePicker';
import { DatesDialog } from './adjust-punch/DatesDialog';
import { EmailPreview } from './adjust-punch/EmailPreview';
import type { Employee } from '@/types/employee';

interface AdjustPunchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
}

export function AdjustPunchModal({ open, onOpenChange, employees }: AdjustPunchModalProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [datesOpen, setDatesOpen] = useState(false);
  const [dates, setDates] = useState<Date[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  

  const to = 'ponto1@servitium.com.br; rh@servitium.com.br;';
  const cc = 'renatohenrique@compesa.com.br; luannesilva@compesa.com.br;';

  const emailSubject = selected ? `Ajuste de Ponto do colaborador ${selected.nome}, matrícula ${selected.matricula} - CMA SUL` : '';



  const handleOpenChange = (v: boolean) => {
    if (!v) {
      // reset state when closing
      setQuery('');
      setSelected(null);
    }
    onOpenChange(v);
  };


  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl shadow-none">
          <DialogHeader>
            <DialogTitle>Ajustar Ponto</DialogTitle>
            <DialogDescription>
              Selecione um funcionário para visualizar os dados antes de montar o e-mail.
            </DialogDescription>
          </DialogHeader>

          <EmployeePicker
            employees={employees}
            selected={selected}
            query={query}
            onQueryChange={setQuery}
            onSelect={setSelected}
          />
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={!selected} onClick={() => { setDates([]); setDatesOpen(true); }}>
              Montar Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DatesDialog
        open={datesOpen}
        onOpenChange={setDatesOpen}
        dates={dates}
        onChangeDates={setDates}
        onConfirm={() => setPreviewOpen(true)}
      />

      <EmailPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        to={to}
        cc={cc}
        subject={emailSubject}
        selected={selected}
        dates={dates}
      />
    </>
  );
}
