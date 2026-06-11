export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      aluno_treinos: {
        Row: {
          aluno_id: string
          atribuido_em: string
          treino_id: string
        }
        Insert: {
          aluno_id: string
          atribuido_em?: string
          treino_id: string
        }
        Update: {
          aluno_id?: string
          atribuido_em?: string
          treino_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aluno_treinos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aluno_treinos_treino_id_fkey"
            columns: ["treino_id"]
            isOneToOne: false
            referencedRelation: "treinos"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos: {
        Row: {
          altura_cm: number | null
          cor_avatar: string
          criado_em: string
          data_nascimento: string | null
          dias_semana: string[]
          email: string | null
          id: string
          meta_peso_kg: number | null
          nome: string
          objetivo: string | null
          plano: string
          status: string
          telefone: string | null
          trainer_id: string
          valor_mensalidade: number
        }
        Insert: {
          altura_cm?: number | null
          cor_avatar?: string
          criado_em?: string
          data_nascimento?: string | null
          dias_semana?: string[]
          email?: string | null
          id?: string
          meta_peso_kg?: number | null
          nome: string
          objetivo?: string | null
          plano?: string
          status?: string
          telefone?: string | null
          trainer_id: string
          valor_mensalidade?: number
        }
        Update: {
          altura_cm?: number | null
          cor_avatar?: string
          criado_em?: string
          data_nascimento?: string | null
          dias_semana?: string[]
          email?: string | null
          id?: string
          meta_peso_kg?: number | null
          nome?: string
          objetivo?: string | null
          plano?: string
          status?: string
          telefone?: string | null
          trainer_id?: string
          valor_mensalidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "alunos_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      anamneses: {
        Row: {
          aluno_id: string
          atualizado_em: string
          historico_saude: string | null
          lesoes: string | null
          medicamentos: string | null
          nivel_atividade: string | null
          objetivo_detalhado: string | null
          observacoes: string | null
        }
        Insert: {
          aluno_id: string
          atualizado_em?: string
          historico_saude?: string | null
          lesoes?: string | null
          medicamentos?: string | null
          nivel_atividade?: string | null
          objetivo_detalhado?: string | null
          observacoes?: string | null
        }
        Update: {
          aluno_id?: string
          atualizado_em?: string
          historico_saude?: string | null
          lesoes?: string | null
          medicamentos?: string | null
          nivel_atividade?: string | null
          objetivo_detalhado?: string | null
          observacoes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: true
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      exercicios: {
        Row: {
          carga_kg: number
          icone: string | null
          id: string
          nome: string
          ordem: number
          reps: number
          series: number
          treino_id: string
          video_url: string | null
        }
        Insert: {
          carga_kg?: number
          icone?: string | null
          id?: string
          nome: string
          ordem?: number
          reps?: number
          series?: number
          treino_id: string
          video_url?: string | null
        }
        Update: {
          carga_kg?: number
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number
          reps?: number
          series?: number
          treino_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercicios_treino_id_fkey"
            columns: ["treino_id"]
            isOneToOne: false
            referencedRelation: "treinos"
            referencedColumns: ["id"]
          },
        ]
      }
      medidas: {
        Row: {
          aluno_id: string
          data: string
          gordura_pct: number | null
          id: string
          imc: number | null
          peso_kg: number
        }
        Insert: {
          aluno_id: string
          data?: string
          gordura_pct?: number | null
          id?: string
          imc?: number | null
          peso_kg: number
        }
        Update: {
          aluno_id?: string
          data?: string
          gordura_pct?: number | null
          id?: string
          imc?: number | null
          peso_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "medidas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          aluno_id: string
          autor: string
          criado_em: string
          id: string
          lida: boolean
          texto: string
          trainer_id: string
        }
        Insert: {
          aluno_id: string
          autor: string
          criado_em?: string
          id?: string
          lida?: boolean
          texto: string
          trainer_id: string
        }
        Update: {
          aluno_id?: string
          autor?: string
          criado_em?: string
          id?: string
          lida?: boolean
          texto?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          aluno_id: string
          id: string
          metodo: string | null
          pago_em: string | null
          status: string
          trainer_id: string
          valor: number
          vencimento: string
        }
        Insert: {
          aluno_id: string
          id?: string
          metodo?: string | null
          pago_em?: string | null
          status?: string
          trainer_id: string
          valor: number
          vencimento: string
        }
        Update: {
          aluno_id?: string
          id?: string
          metodo?: string | null
          pago_em?: string | null
          status?: string
          trainer_id?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cref: string | null
          criado_em: string
          especialidades: string[]
          id: string
          nome: string
          plano_app: string
        }
        Insert: {
          avatar_url?: string | null
          cref?: string | null
          criado_em?: string
          especialidades?: string[]
          id: string
          nome?: string
          plano_app?: string
        }
        Update: {
          avatar_url?: string | null
          cref?: string | null
          criado_em?: string
          especialidades?: string[]
          id?: string
          nome?: string
          plano_app?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          criado_em: string
          endpoint: string
          id: string
          p256dh: string
          trainer_id: string
        }
        Insert: {
          auth: string
          criado_em?: string
          endpoint: string
          id?: string
          p256dh: string
          trainer_id: string
        }
        Update: {
          auth?: string
          criado_em?: string
          endpoint?: string
          id?: string
          p256dh?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes: {
        Row: {
          aluno_id: string
          duracao_min: number
          id: string
          inicio: string
          observacao: string | null
          status: string
          trainer_id: string
          treino_id: string | null
        }
        Insert: {
          aluno_id: string
          duracao_min?: number
          id?: string
          inicio: string
          observacao?: string | null
          status?: string
          trainer_id: string
          treino_id?: string | null
        }
        Update: {
          aluno_id?: string
          duracao_min?: number
          id?: string
          inicio?: string
          observacao?: string | null
          status?: string
          trainer_id?: string
          treino_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_treino_id_fkey"
            columns: ["treino_id"]
            isOneToOne: false
            referencedRelation: "treinos"
            referencedColumns: ["id"]
          },
        ]
      }
      treinos: {
        Row: {
          categoria: string
          criado_em: string
          duracao_min: number
          id: string
          nivel: string
          nome: string
          observacoes: string | null
          trainer_id: string
        }
        Insert: {
          categoria?: string
          criado_em?: string
          duracao_min?: number
          id?: string
          nivel?: string
          nome: string
          observacoes?: string | null
          trainer_id: string
        }
        Update: {
          categoria?: string
          criado_em?: string
          duracao_min?: number
          id?: string
          nivel?: string
          nome?: string
          observacoes?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treinos_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cadastro_publico: {
        Args: {
          p_email: string
          p_nome: string
          p_objetivo: string
          p_telefone: string
          p_trainer: string
        }
        Returns: undefined
      }
      nome_trainer: { Args: { p_trainer: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
