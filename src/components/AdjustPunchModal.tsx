import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle } from 'lucide-react';

import { EmployeePicker } from './adjust-punch/EmployeePicker';
import { DatesDialog } from './adjust-punch/DatesDialog';
import { EmailPreview } from './adjust-punch/EmailPreview';
import { WhatsAppTab } from './adjust-punch/WhatsAppTab';
import type { Employee } from '@/types/employee';

interface AdjustPunchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
}

export function AdjustPunchModal({ open, onOpenChange, employees }: AdjustPunchModalProps) {
  // Email tab state
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
      // reset email state when closing
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
              Selecione o método de comunicação e os funcionários para o ajuste.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="email" className="flex-1 gap-1.5">
                <Mail className="h-4 w-4" /> E-mail
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex-1 gap-1.5">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <div className="space-y-4 pt-2">
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
              </div>
            </TabsContent>

            <TabsContent value="whatsapp">
              <div className="pt-2">
                <WhatsAppTab employees={employees} />
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Email flow dialogs (unchanged) */}
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
