import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Trash2, Eye, FileText, Download } from 'lucide-react';
import { Employee } from '@/types/employee';
import { VacationDocument } from '@/types/vacation';
import { getVacationDocuments, uploadVacationDocument, deleteVacationDocument } from '@/services/vacations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VacationControlModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employees: Employee[];
}

export function VacationControlModal({ open, onOpenChange, employees }: VacationControlModalProps) {
  const [docs, setDocs] = useState<VacationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUploadContract, setSelectedUploadContract] = useState<string>('Geral');
  const [filterContract, setFilterContract] = useState<string>('Todos');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  // Obter contratos únicos dos funcionários da base para os selects
  const uniqueContracts = useMemo(() => {
    const contracts = employees.map(e => e.contrato).filter(Boolean);
    const unique = Array.from(new Set(contracts));
    return ['Geral', ...unique];
  }, [employees]);

  const loadDocuments = async () => {
    setIsLoading(true);
    const { data, error } = await getVacationDocuments();
    if (error) {
      toast({ title: 'Erro ao carregar documentos', description: error.message, variant: 'destructive' });
      setDocs([]);
    } else {
      setDocs(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (open) {
      loadDocuments();
    }
  }, [open, toast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ title: 'Formato inválido', description: 'Por favor, selecione um arquivo PDF.', variant: 'destructive' });
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    const { error } = await uploadVacationDocument(selectedUploadContract, file);
    
    if (error) {
      toast({ title: 'Erro no Upload', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Upload Concluído', description: 'Documento foi armazenado com sucesso.' });
      await loadDocuments();
    }
    setIsUploading(false);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (doc: VacationDocument & { fullName?: string }) => {
    const fullName = doc.fullName || `${doc.contract}___${doc.name}`;
    const { error } = await deleteVacationDocument(fullName);
    if (error) {
      toast({ title: 'Erro ao deletar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Arquivo deletado', description: 'O documento foi removido com sucesso.' });
      setDocs(prev => prev.filter(d => d.id !== doc.id));
    }
  };

  const filteredDocs = useMemo(() => {
    if (filterContract === 'Todos') return docs;
    return docs.filter(d => d.contract === filterContract);
  }, [docs, filterContract]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl shadow-none">
        <DialogHeader>
          <DialogTitle>Controle de Documentos de Férias</DialogTitle>
          <DialogDescription>Armazene e visualize os PDFs oficiais das escalas de férias por contrato.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sessão de Upload */}
          <div className="p-4 border rounded-md bg-slate-50 space-y-4">
            <h3 className="text-sm font-semibold">Enviar Nova Escala (PDF)</h3>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <Label>Vincular ao Contrato</Label>
                <Select value={selectedUploadContract} onValueChange={setSelectedUploadContract}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueContracts.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Input 
                  type="file" 
                  accept="application/pdf"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                  ) : (
                    <><UploadCloud className="mr-2 h-4 w-4" /> Selecionar Arquivo PDF</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Filtro da Listagem */}
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">Filtrar por Contrato:</Label>
            <Select value={filterContract} onValueChange={setFilterContract}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os Envios</SelectItem>
                {uniqueContracts.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Listagem */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-md text-muted-foreground">Carregando documentos...</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              {filteredDocs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <FileText className="h-12 w-12 text-slate-300 mb-2" />
                  <p>Nenhum documento encontrado para o filtro atual.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-100/50">
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Contrato</th>
                      <th className="p-3 font-medium text-muted-foreground">Nome do Arquivo</th>
                      <th className="p-3 font-medium text-muted-foreground">Enviado em</th>
                      <th className="p-3 font-medium text-muted-foreground text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map(doc => (
                      <tr key={doc.id} className="border-b last:border-0 hover:bg-slate-50/50">
                        <td className="p-3 align-middle max-w-[200px] truncate" title={doc.contract}>
                          {doc.contract}
                        </td>
                        <td className="p-3 align-middle font-medium truncate max-w-[200px]" title={doc.name}>
                          {doc.name}
                        </td>
                        <td className="p-3 align-middle text-muted-foreground">
                          {format(new Date(doc.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </td>
                        <td className="p-3 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="outline" title="Visualizar" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button size="icon" variant="outline" title="Download" asChild>
                              <a href={doc.url} download={doc.name}>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="destructive" title="Excluir">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja apagar o documento <strong>{doc.name}</strong> do contrato <strong>{doc.contract}</strong>? 
                                    Essa ação removerá o arquivo permanentemente do sistema e não poderá ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(doc)}>Excluir Arquivo</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}