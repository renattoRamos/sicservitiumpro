import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dates: Date[];
  onChangeDates: (dates: Date[]) => void;
  onConfirm: () => void;
}

export function DatesDialog({ open, onOpenChange, dates, onChangeDates, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl shadow-none">
        <DialogHeader>
          <DialogTitle>Selecionar Datas</DialogTitle>
          <DialogDescription>Selecione uma ou mais datas para o ajuste de ponto.</DialogDescription>
        </DialogHeader>
        <div className="pt-2 grid gap-4 md:grid-cols-2">
          <div>
            <Calendar
              mode="multiple"
              selected={dates}
              onSelect={onChangeDates}
              className="p-3 pointer-events-auto"
              initialFocus
              locale={ptBR}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Datas selecionadas</p>
            {dates.length ? (
              <ul className="max-h-64 overflow-auto rounded-md border border-border divide-y">
                {dates
                  .slice()
                  .sort((a, b) => a.getTime() - b.getTime())
                  .map((d) => (
                    <li key={d.toISOString()} className="p-2 text-sm">
                      {format(d, 'dd/MM/yyyy')}
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground border border-dashed border-border rounded-md p-4">
                Nenhuma data selecionada.
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!dates.length}
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            Confirmar datas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
