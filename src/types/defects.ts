export type DefectStatus = 'low' | 'medium' | 'high';
export type DefectStage = 'open' | 'investigating' | 'monitoring' | 'closed';

export interface Defect {
  id: string;
  organization_id: string;
  user_id: string;
  name: string;
  description?: string | null;
  status: DefectStatus;
  defect_stage: DefectStage;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  closed_by?: string | null;
  resolution_comments?: string | null;
  aircraft_id: string;
}

export interface DefectComment {
  id: string;
  defect_id: string;
  user_id: string;
  comment: string;
  created_at: string;
} 