import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Anthropic from 'npm:@anthropic-ai/sdk@0.27.0';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image, mimeType = 'image/jpeg' } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: 'image is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType as any, data: image },
            },
            {
              type: 'text',
              text: `Analise esta imagem de comprovante fiscal / nota fiscal / recibo e extraia as informações em JSON.

Retorne APENAS um objeto JSON válido com estes campos:
{
  "store_name": "nome da loja ou estabelecimento",
  "date": "data no formato YYYY-MM-DD ou null se não encontrar",
  "total_amount": valor total em centavos (número inteiro) ou null,
  "category": "categoria principal (Alimentação, Farmácia, Combustível, Eletrônicos, Vestuário, Supermercado, Restaurante, Transporte, Saúde, Outros)",
  "items": [
    {"name": "nome do item", "quantity": 1, "unit_price": valor em centavos ou null, "total_price": valor em centavos ou null}
  ],
  "raw_text": "todo o texto visível no comprovante"
}

Se não conseguir identificar algum campo, use null. Não inclua explicações, apenas o JSON.`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Não foi possível extrair dados do comprovante');
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('scan-receipt error:', error);
    return new Response(
      JSON.stringify({ error: error.message ?? 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
