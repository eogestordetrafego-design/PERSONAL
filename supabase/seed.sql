-- FitCoach Pro — seed de demonstração
-- Cria o trainer Rafael (login: rafael@fitcoach.com / senha: fitcoach123)
-- Rode no SQL Editor do Supabase APÓS a migration.

do $$
declare
  trainer uuid := 'a1b2c3d4-0000-4000-8000-000000000001';
  ana uuid; bruno uuid; carla uuid; diego uuid; fernanda uuid; gabriel uuid; lucas uuid;
  t_emag uuid; t_hiper uuid; t_full uuid; t_reab uuid;
begin
  -- usuário auth
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values (trainer, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'rafael@fitcoach.com', crypt('fitcoach123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"nome":"Rafael Oliveira"}', now(), now())
  on conflict (id) do nothing;

  insert into auth.identities (id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), trainer, 'rafael@fitcoach.com',
    jsonb_build_object('sub', trainer::text, 'email', 'rafael@fitcoach.com'),
    'email', now(), now(), now())
  on conflict do nothing;

  -- profile (trigger já criou; atualiza dados)
  update public.profiles set
    nome = 'Rafael Oliveira', cref = '123456-G/SP',
    especialidades = array['Emagrecimento','Hipertrofia','Funcional','Reabilitação']
  where id = trainer;

  -- alunos
  insert into public.alunos (trainer_id, nome, email, altura_cm, data_nascimento, objetivo, plano, valor_mensalidade, dias_semana, status, cor_avatar, meta_peso_kg)
  values (trainer, 'Ana Lima', 'ana@email.com', 165, '1996-03-12', 'Perder 8kg', 'premium', 799, array['Seg','Qua','Sex'], 'ativo', '#FF4D6D', 70)
  returning id into ana;
  insert into public.alunos (trainer_id, nome, email, altura_cm, data_nascimento, objetivo, plano, valor_mensalidade, dias_semana, status, cor_avatar, meta_peso_kg)
  values (trainer, 'Bruno Gomes', 'bruno@email.com', 180, '1992-07-25', 'Ganhar massa', 'pro', 499, array['Ter','Qui'], 'ativo', '#7B6EF6', 88)
  returning id into bruno;
  insert into public.alunos (trainer_id, nome, email, altura_cm, data_nascimento, objetivo, plano, valor_mensalidade, dias_semana, status, cor_avatar, meta_peso_kg)
  values (trainer, 'Carla Mendes', 'carla@email.com', 170, '1989-01-08', 'Condicionamento', 'basico', 299, array['Ter','Sab'], 'ativo', '#FFB020', null)
  returning id into carla;
  insert into public.alunos (trainer_id, nome, email, altura_cm, data_nascimento, objetivo, plano, valor_mensalidade, dias_semana, status, cor_avatar, meta_peso_kg)
  values (trainer, 'Diego Costa', 'diego@email.com', 175, '1998-11-30', 'Hipertrofia', 'pro', 499, array['Seg','Qua','Sex'], 'ativo', '#00D68F', 80)
  returning id into diego;
  insert into public.alunos (trainer_id, nome, email, altura_cm, data_nascimento, objetivo, plano, valor_mensalidade, dias_semana, status, cor_avatar, meta_peso_kg)
  values (trainer, 'Fernanda Alves', 'fernanda@email.com', 162, '1985-05-17', 'Reabilitação lombar', 'premium', 799, array['Ter','Qui'], 'ativo', '#FF6EC7', null)
  returning id into fernanda;
  insert into public.alunos (trainer_id, nome, email, altura_cm, data_nascimento, objetivo, plano, valor_mensalidade, dias_semana, status, cor_avatar, meta_peso_kg)
  values (trainer, 'Gabriel Rocha', 'gabriel@email.com', 183, '2000-09-02', 'Performance', 'vip', 1099, array['Seg','Ter','Qui','Sex'], 'novo', '#4DA3FF', null)
  returning id into gabriel;
  insert into public.alunos (trainer_id, nome, email, altura_cm, data_nascimento, objetivo, plano, valor_mensalidade, dias_semana, status, cor_avatar, meta_peso_kg)
  values (trainer, 'Lucas Silva', 'lucas@email.com', 177, '1994-02-20', 'Emagrecimento', 'basico', 299, array['Sab'], 'inativo', '#8888A0', 75)
  returning id into lucas;

  -- medidas da Ana (Mar → Jun, descendente até 72,4kg)
  insert into public.medidas (aluno_id, data, peso_kg, gordura_pct, imc) values
    (ana, '2026-03-01', 78.0, 24.0, 28.7),
    (ana, '2026-04-01', 76.2, 22.5, 28.0),
    (ana, '2026-05-01', 74.5, 20.4, 27.4),
    (ana, '2026-06-01', 73.1, 19.0, 26.9),
    (ana, current_date, 72.4, 18.0, 26.6);
  insert into public.medidas (aluno_id, data, peso_kg, gordura_pct) values
    (bruno, '2026-04-01', 80.0, 16.0), (bruno, current_date, 83.2, 15.1),
    (diego, '2026-04-01', 71.0, 17.0), (diego, current_date, 73.5, 16.2);

  -- treinos
  insert into public.treinos (trainer_id, nome, categoria, nivel, duracao_min, observacoes)
  values (trainer, 'Emagrecimento Nível A', 'emagrecimento', 'Iniciante', 50, 'Foco em circuito metabólico, descanso curto de 30s.')
  returning id into t_emag;
  insert into public.treinos (trainer_id, nome, categoria, nivel, duracao_min)
  values (trainer, 'Hipertrofia Peito/Tríceps', 'hipertrofia', 'Intermediário', 70) returning id into t_hiper;
  insert into public.treinos (trainer_id, nome, categoria, nivel, duracao_min)
  values (trainer, 'Full Body Funcional', 'funcional', 'Intermediário', 60) returning id into t_full;
  insert into public.treinos (trainer_id, nome, categoria, nivel, duracao_min)
  values (trainer, 'Reabilitação Lombar', 'reabilitacao', 'Iniciante', 45) returning id into t_reab;

  insert into public.exercicios (treino_id, ordem, nome, series, reps, carga_kg, icone) values
    (t_emag, 1, 'Esteira HIIT', 1, 15, 0, 'run'),
    (t_emag, 2, 'Agachamento livre', 4, 15, 20, 'barbell'),
    (t_emag, 3, 'Burpee', 3, 12, 0, 'flame'),
    (t_emag, 4, 'Remada curvada', 3, 12, 25, 'barbell'),
    (t_emag, 5, 'Prancha', 3, 45, 0, 'heart'),
    (t_emag, 6, 'Bike', 1, 10, 0, 'run'),
    (t_hiper, 1, 'Supino reto', 4, 10, 60, 'barbell'),
    (t_hiper, 2, 'Supino inclinado halteres', 4, 10, 24, 'barbell'),
    (t_hiper, 3, 'Crucifixo máquina', 3, 12, 45, 'barbell'),
    (t_hiper, 4, 'Tríceps corda', 4, 12, 30, 'barbell'),
    (t_hiper, 5, 'Tríceps francês', 3, 12, 14, 'barbell'),
    (t_full, 1, 'Kettlebell swing', 4, 15, 16, 'flame'),
    (t_full, 2, 'Avanço com halteres', 3, 12, 12, 'run'),
    (t_full, 3, 'Flexão de braço', 3, 15, 0, 'heart'),
    (t_full, 4, 'Remada TRX', 3, 12, 0, 'barbell'),
    (t_reab, 1, 'Ponte glútea', 3, 15, 0, 'heart'),
    (t_reab, 2, 'Bird dog', 3, 10, 0, 'heart'),
    (t_reab, 3, 'Alongamento gato-camelo', 2, 10, 0, 'heart');

  insert into public.aluno_treinos (aluno_id, treino_id) values
    (ana, t_emag), (lucas, t_emag), (carla, t_full),
    (bruno, t_hiper), (diego, t_hiper), (gabriel, t_hiper),
    (fernanda, t_reab);

  -- sessões de hoje
  insert into public.sessoes (trainer_id, aluno_id, treino_id, inicio, duracao_min, status) values
    (trainer, bruno, t_hiper, current_date + time '07:00', 60, 'realizada'),
    (trainer, fernanda, t_reab, current_date + time '09:00', 45, 'realizada'),
    (trainer, ana, t_emag, current_date + time '14:00', 50, 'agendada'),
    (trainer, carla, t_full, current_date + time '17:30', 60, 'agendada');
  -- semana
  insert into public.sessoes (trainer_id, aluno_id, treino_id, inicio, duracao_min, status) values
    (trainer, diego, t_hiper, current_date + 1 + time '08:00', 70, 'agendada'),
    (trainer, gabriel, t_hiper, current_date + 1 + time '10:00', 70, 'agendada'),
    (trainer, ana, t_emag, current_date + 2 + time '14:00', 50, 'agendada'),
    (trainer, bruno, t_hiper, current_date - 2 + time '07:00', 60, 'realizada'),
    (trainer, ana, t_emag, current_date - 2 + time '14:00', 50, 'realizada'),
    (trainer, ana, t_emag, current_date - 4 + time '14:00', 50, 'cancelada');

  -- pagamentos (Jan–Jun p/ gráfico do financeiro)
  insert into public.pagamentos (trainer_id, aluno_id, valor, vencimento, pago_em, metodo, status) values
    (trainer, ana, 799, '2026-01-05', '2026-01-05', 'Pix', 'pago'),
    (trainer, bruno, 499, '2026-01-10', '2026-01-11', 'Cartão', 'pago'),
    (trainer, ana, 799, '2026-02-05', '2026-02-05', 'Pix', 'pago'),
    (trainer, bruno, 499, '2026-02-10', '2026-02-10', 'Cartão', 'pago'),
    (trainer, ana, 799, '2026-03-05', '2026-03-06', 'Pix', 'pago'),
    (trainer, diego, 499, '2026-03-10', '2026-03-10', 'Pix', 'pago'),
    (trainer, ana, 799, '2026-04-05', '2026-04-05', 'Pix', 'pago'),
    (trainer, fernanda, 799, '2026-04-08', '2026-04-08', 'Boleto', 'pago'),
    (trainer, ana, 799, '2026-05-05', '2026-05-05', 'Pix', 'pago'),
    (trainer, bruno, 499, '2026-05-10', '2026-05-12', 'Cartão', 'pago'),
    (trainer, ana, 799, '2026-06-05', '2026-06-05', 'Pix', 'pago'),
    (trainer, bruno, 499, '2026-06-10', '2026-06-10', 'Cartão', 'pago'),
    (trainer, fernanda, 799, '2026-06-08', '2026-06-08', 'Pix', 'pago'),
    (trainer, diego, 499, '2026-06-09', '2026-06-09', 'Pix', 'pago'),
    (trainer, gabriel, 1099, current_date, null, null, 'pendente'),
    (trainer, lucas, 299, current_date - 10, null, null, 'atrasado'),
    (trainer, carla, 299, current_date + 5, null, null, 'pendente');

  -- mensagens
  insert into public.mensagens (trainer_id, aluno_id, autor, texto, lida, criado_em) values
    (trainer, ana, 'aluno', 'Oi Rafael! Tudo bem?', true, now() - interval '2 hours'),
    (trainer, ana, 'trainer', 'Oi Ana! Tudo ótimo, e você?', true, now() - interval '110 minutes'),
    (trainer, ana, 'aluno', 'Preciso remarcar a sessão de amanhã 😅', false, now() - interval '30 minutes'),
    (trainer, ana, 'aluno', 'Pode ser quinta no mesmo horário?', false, now() - interval '29 minutes'),
    (trainer, bruno, 'aluno', 'Fechado, até amanhã às 7h!', false, now() - interval '1 day');
end $$;
