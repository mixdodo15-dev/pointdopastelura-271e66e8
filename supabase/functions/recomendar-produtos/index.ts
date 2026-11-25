import { createResponsesCall } from "../_shared/responses.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

type Item = { id: string; name: string; description?: string; price: number; category: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { desejo, produtos } = await req.json();
    const text = String(desejo ?? "").trim().slice(0, 500);
    const items: Item[] = Array.isArray(produtos) ? produtos.slice(0, 300) : [];
    if (!text) return json({ error: "Conte o que você está com vontade de comer." }, 400);
    if (!items.length) return json({ error: "Cardápio indisponível no momento." }, 400);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "IA não configurada." }, 500);

    const menu = items
      .map((p) => `${p.id} | ${p.name} | ${p.category} | R$ ${Number(p.price).toFixed(2)} | ${(p.description ?? "").slice(0, 160)}`)
      .join("\n");
    const instructions =
      "Você é o atendente simpático da pastelaria Point do Pastel. Recomende de 1 a 4 produtos do cardápio abaixo que combinem com o desejo do cliente. Use SOMENTE IDs do cardápio. Responda apenas com linhas no formato: ID|motivo curto em português (máx 15 palavras). Sem texto extra.\n\nCARDÁPIO (id | nome | categoria | preço | descrição):\n" + menu;

    const call = createResponsesCall(req, { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6.1-sol" },
      [{ role: "system", content: instructions }, { role: "user", content: text }]);
    let out = "";
    try {
      out = await call.result.text;
    } catch (e) {
      const status = (e as any)?.statusCode ?? (e as any)?.cause?.statusCode;
      if (status === 429) return json({ error: "Muitos pedidos agora. Tente de novo em instantes." }, 429);
      if (status === 402) return json({ error: "Créditos de IA esgotados. Avise a loja." }, 402);
      if (status === 403) return json({ error: "Recomendação por IA indisponível no momento." }, 403);
      throw e;
    }
    const byId = new Map(items.map((p) => [String(p.id), p]));
    const seen = new Set<string>();
    const recomendacoes = out.split("\n").map((l) => l.trim()).filter(Boolean).flatMap((l) => {
      const [id, ...rest] = l.split("|");
      const key = id?.trim();
      if (!key || !byId.has(key) || seen.has(key)) return [];
      seen.add(key);
      return [{ id: key, motivo: rest.join("|").trim() }];
    }).slice(0, 4);
    return json({ recomendacoes });
  } catch (e) {
    console.error(e);
    return json({ error: "Não foi possível gerar recomendações agora." }, 500);
  }
});
