## Módulo de Gestão de Entregadores

### 1. Banco de Dados (Supabase)
Criar tabela `entregadores` e adicionar relação com `orders`:

```sql
CREATE TYPE entregador_status AS ENUM ('disponivel', 'em_entrega', 'inativo');

CREATE TABLE public.entregadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  veiculo TEXT NOT NULL,
  placa TEXT,
  status entregador_status NOT NULL DEFAULT 'disponivel',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders
  ADD COLUMN entregador_id UUID REFERENCES public.entregadores(id),
  ADD COLUMN delivered_at TIMESTAMPTZ;
```

RLS: apenas admins podem gerenciar/visualizar entregadores.

### 2. Nova Página: `/admin/entregadores`
- Header com botão voltar
- Botão "Novo Entregador" → abre modal com form (nome, telefone, veículo, placa) com validação Zod
- Dashboard em grid de cards mostrando todos entregadores com badge de status colorido (verde=disponível, amarelo=em entrega, cinza=inativo)
- Ações por card: Editar, Ativar/Inativar, Excluir
- Contadores no topo: Disponíveis / Em entrega / Inativos

Adicionar card "Entregadores" na home do `/admin`.

### 3. Atribuição de Entrega (em `/admin/pedidos`)
Para pedidos com `order_source='delivery'` e status pendente/preparo:
- Botão **"Atribuir Entregador"** → modal lista entregadores `disponivel`
- Ao confirmar: atualiza `orders.entregador_id`, `orders.status='out_for_delivery'`, `entregadores.status='em_entrega'`
- Mostrar entregador atribuído no card do pedido

### 4. Envio para WhatsApp
Botão **"Enviar para Entregador"** (visível quando há entregador atribuído):
- Gera link `https://wa.me/55<telefone>?text=...`
- Mensagem formatada:
  ```
  🛵 NOVO PEDIDO PARA ENTREGA
  Pedido: Point-XXXX
  Cliente: Nome (telefone)
  📍 Endereço: rua...
  🗺️ Maps: https://www.google.com/maps/search/?api=1&query=<endereço encoded>
  📦 Itens: ...
  💰 Total: R$ XX,XX
  💳 Pagamento: ...
  ```

### 5. Finalizar Entrega
Botão **"Marcar como Entregue"**:
- `orders.status='delivered'`, `delivered_at=now()`
- `entregadores.status='disponivel'`

### 6. Design
- Reutilizar componentes Shadcn (Card, Dialog, Button, Badge, Input)
- Cores semânticas existentes (vermelho primary, etc.)
- Mobile-first, grid responsivo

### Arquivos
- Migration Supabase (tabela + RLS + coluna em orders)
- `src/pages/AdminEntregadores.tsx` (nova rota)
- `src/components/admin/EntregadorFormModal.tsx`
- `src/components/admin/AtribuirEntregadorModal.tsx`
- Editar `src/pages/AdminPedidos.tsx` (botões atribuir/whatsapp/entregue)
- Editar `src/pages/Admin.tsx` (card de acesso)
- Editar `src/App.tsx` (rota `/admin/entregadores`)
- `src/lib/whatsappEntregador.ts` (helper de mensagem)

Confirma para eu seguir?