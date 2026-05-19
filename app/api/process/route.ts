import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin to bypass RLS for inserting history safely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { text, type, user_id, tool_id } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Since we don't have an OpenAI key yet, we'll return a high-quality mock response
    let result = '';
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (type === 'rewrite') {
      result = `(Mock AI Rewritten) ${text} ... and this sounds much more professional and polished.`;
    } else if (type === 'explain') {
      result = `(Mock AI Explanation) The concept of "${text.substring(0, 30)}..." means exactly what it sounds like. It is a fundamental principle in its respective field.`;
    } else if (type === 'formalize') {
      result = `(Mock AI Formalized) Dear Sir/Madam,\n\nI am writing to address the following: ${text}\n\nSincerely,\nBluebottlecap User`;
    } else if (type === 'expand') {
      result = `(Mock AI Expansion) The provided text "${text}" is a great starting point. Expanding on this, we can see that it has deep implications for the future of the industry...`;
    } else {
      result = `(Mock AI Default) Processed your request: ${text}`;
    }

    // Log this generation to the tool_history table if a user is logged in
    if (user_id) {
      await supabaseAdmin
        .from('tool_history')
        .insert([{ 
          user_id: user_id, 
          tool_id: tool_id || 'unknown',
          input_text: text.substring(0, 500), 
          output_text: result.substring(0, 1000) 
        }]);
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Process API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
