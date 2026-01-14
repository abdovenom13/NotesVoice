import { corsHeaders } from '../_shared/cors.ts';

const ONSPACE_AI_BASE_URL = Deno.env.get('ONSPACE_AI_BASE_URL');
const ONSPACE_AI_API_KEY = Deno.env.get('ONSPACE_AI_API_KEY');

interface AIRequest {
  action: 'improve' | 'summarize' | 'generateTitle' | 'extractPoints' | 'toList' | 'translate';
  text: string;
  targetLanguage?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, text, targetLanguage }: AIRequest = await req.json();

    if (!text || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action and text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let prompt = '';
    
    switch (action) {
      case 'improve':
        prompt = `حسّن النص التالي وصحح أي أخطاء إملائية أو نحوية. احتفظ بنفس اللغة والمعنى، فقط حسّن الصياغة:\n\n${text}`;
        break;
      case 'summarize':
        prompt = `لخّص النص التالي بشكل موجز ومفيد:\n\n${text}`;
        break;
      case 'generateTitle':
        prompt = `اقترح عنواناً قصيراً ومناسباً (5-10 كلمات) للنص التالي. أعطني العنوان فقط بدون أي إضافات:\n\n${text}`;
        break;
      case 'extractPoints':
        prompt = `استخرج النقاط الرئيسية من النص التالي وقدمها كقائمة مرقمة:\n\n${text}`;
        break;
      case 'toList':
        prompt = `حوّل النص التالي إلى قائمة منظمة ومنطقية:\n\n${text}`;
        break;
      case 'translate':
        const lang = targetLanguage === 'ar' ? 'العربية' : 'الإنجليزية';
        prompt = `ترجم النص التالي إلى ${lang}:\n\n${text}`;
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('AI Request:', { action, textLength: text.length });

    const response = await fetch(`${ONSPACE_AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ONSPACE_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', errorText);
      return new Response(
        JSON.stringify({ error: `AI API Error: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';

    console.log('AI Response success:', { resultLength: result.length });

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
