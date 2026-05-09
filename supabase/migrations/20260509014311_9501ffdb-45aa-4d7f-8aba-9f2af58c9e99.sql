-- Enum status entregador
DO $$ BEGIN
  CREATE TYPE public.entregador_status AS ENUM ('disponivel', 'em_entrega', 'inativo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tabela entregadores
CREATE TABLE IF NOT EXISTS public.entregadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  veiculo TEXT NOT NULL,
  placa TEXT,
  status public.entregador_status NOT NULL DEFAULT 'disponivel',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.entregadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage entregadores" ON public.entregadores;
CREATE POLICY "Admins can manage entregadores"
ON public.entregadores
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_entregadores_updated_at ON public.entregadores;
CREATE TRIGGER update_entregadores_updated_at
BEFORE UPDATE ON public.entregadores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Relação com pedidos
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS entregador_id UUID REFERENCES public.entregadores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_entregador_id ON public.orders(entregador_id);