
import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const configuration = new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY')
});
const openai = new OpenAIApi(configuration);

Deno.serve(async (req) => {
  try {
    const { record } = await req.json();
    const { id, title, abstract } = record;

    if (!id || !title || !abstract) {
      throw new Error('Missing required patent data');
    }

    const textToEmbed = `Title: ${title}\nAbstract: ${abstract}`;
    
    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: textToEmbed,
    });
    
    const [{ embedding }] = embeddingResponse.data.data;

    const { error } = await supabaseClient
      .from('patents')
      .update({ embedding })
      .eq('id', id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing patent:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
