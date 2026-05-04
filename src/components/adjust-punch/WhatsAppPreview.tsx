import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/types/employee';

export interface WhatsAppEntry {
  employee: Employee;
  dates: Date[];
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entries: WhatsAppEntry[];
}

function getShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName.trim();
  return `${parts[0]} ${parts[1]}`;
}

function getNthBusinessDay(n: number): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let count = 0;
  for (let day = 1; day <= 31; day++) {
    const d = new Date(year, month, day);
    if (d.getMonth() !== month) break;
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      count++;
      if (count === n) return day;
    }
  }
  return count;
}

function buildMessage(entries: WhatsAppEntry[]): string {
  const fifthBusinessDay = getNthBusinessDay(5);

  const blocks = entries.map((entry) => {
    const name = getShortName(entry.employee.nome);
    const days = [...new Set(entry.dates.map((d) => d.getDate()))]
      .sort((a, b) => a - b)
      .map((d) => String(d).padStart(2, '0'))
      .join(', ');
    return `- *${name} (Dias: ${days})*`;
  });

  return [
    'Eu realizei agora uma verificação no ponto da equipe de manutenção, e os colaboradores abaixo precisam de ajustes:',
    '',
    ...blocks,
    '',
    '*Peço que verifiquem e realizem os ajustes diretamente no sistema de vocês, por gentileza.*',
    '',
    'Lembrando: para ajustes de dia inteiro, é necessário *registrar o horário de almoço (12:00 às 13:00)* e me avisar, para que eu possa enviar para o Servitium aceitar o ajuste.',
    '',
    `Temos o *prazo de ajuste até o dia ${fifthBusinessDay} do mês atual* para manter todos os pontos ajustados e assim poder calcular e enviar as horas extras.`,
    '',
    'Conto com a colaboração de todos para que o processo seja concluído dentro do prazo 👍',
  ].join('\n');
}

export function WhatsAppPreview({ open, onOpenChange, entries }: Props) {
  const { toast } = useToast();
  const generated = useMemo(() => buildMessage(entries), [entries]);
  const [text, setText] = useState(generated);

  // Sync when entries change and dialog opens
  const prevGenerated = useMemo(() => generated, [generated]);
  if (text !== prevGenerated && !open) {
    setText(prevGenerated);
  }

  const handleRegenerate = useCallback(() => {
    setText(generated);
  }, [generated]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copiado!',
        description: 'Mensagem copiada para a área de transferência. Cole no WhatsApp.',
      });
    } catch {
      toast({
        title: 'Falha ao copiar',
        description: 'Tente selecionar o texto e copiar manualmente.',
        variant: 'destructive',
      });
    }
  }, [text, toast]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) setText(generated);
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-2xl shadow-none">
        <DialogHeader>
          <DialogTitle>Mensagem para WhatsApp</DialogTitle>
          <DialogDescription>
            Revise ou edite o texto abaixo antes de copiar.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[260px] font-mono text-sm leading-relaxed"
        />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={handleRegenerate}>
            Regenerar
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button type="button" onClick={handleCopy}>
            Copiar para WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
