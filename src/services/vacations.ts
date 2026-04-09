import { supabase } from '@/integrations/supabase/client';
import { VacationDocument } from '@/types/vacation';

const BUCKET = 'official-documents';
const FOLDER = 'vacations';
const SEPARATOR = '___';

export async function getVacationDocuments(): Promise<{ data: VacationDocument[]; error: Error | null }> {
  // Lista todos os arquivos da pasta 'vacations' do bucket
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(FOLDER, {
       limit: 500,
       offset: 0,
       sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) return { data: [], error };

  const docs: VacationDocument[] = (data || [])
    .filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '.gitkeep')
    .map(f => {
      // Extrair contrato e nome real do arquivo hospedado
      const parts = f.name.split(SEPARATOR);
      const contract = parts.length > 1 ? parts[0] : 'Geral';
      const name = parts.length > 1 ? parts.slice(1).join(SEPARATOR) : f.name;

      const path = `${FOLDER}/${f.name}`;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

      return {
        id: f.id,
        name,
        contract,
        url: urlData.publicUrl,
        created_at: f.created_at,
        // Mantemos o fullName para remoção posterior de forma segura:
        fullName: f.name 
      } as VacationDocument & { fullName: string };
    });

  return { data: docs, error: null };
}

export async function uploadVacationDocument(contract: string, file: File): Promise<{ error: Error | null }>{
  if (!contract) contract = 'Geral';
  
  // Substituir barras para não corromper caminhos do Storage
  const safeContract = contract.replace(/\//g, '-');
  const safeName = file.name.replace(/\//g, '-');
  const fullPath = `${FOLDER}/${safeContract}${SEPARATOR}${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fullPath, file, {
      cacheControl: '3600',
      upsert: true
    });

  return { error: error ?? null };
}

export async function deleteVacationDocument(fullName: string): Promise<{ error: Error | null }>{
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([`${FOLDER}/${fullName}`]);
    
  return { error: error ?? null };
}