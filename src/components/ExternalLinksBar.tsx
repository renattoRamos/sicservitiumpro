import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, FileText } from 'lucide-react'; // Importando o ícone FileText

export function ExternalLinksBar() {
  return (
    <div className={cn("flex gap-2 flex-row")}>
      <Button
        style={{ backgroundColor: '#59CBE8' }}
        onClick={() => window.open("https://centraldofuncionario.com.br/47233/", "_blank")}
      >
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Cartão de Ponto
        </span>
      </Button>
      <Button
        style={{ backgroundColor: '#601EAA' }}
        onClick={() => window.open("https://rh.servitium.com.br/", "_blank")}
      >
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Contracheque
        </span>
      </Button>
    </div>
  );
}