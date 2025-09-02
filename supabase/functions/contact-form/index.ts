import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting: track submissions by IP
const submissionTracker = new Map<string, number>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_SUBMISSIONS_PER_WINDOW = 3

// Validation schema
const validateContactMessage = (data: any) => {
  const errors: string[] = []
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long')
  }
  
  if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
    errors.push('Valid email is required')
  }
  
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long')
  }
  
  return errors
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for') || 
                     'unknown';
    
    const now = Date.now();
    const lastSubmission = submissionTracker.get(clientIP) || 0;
    
    if (now - lastSubmission < RATE_LIMIT_WINDOW) {
      const timeLeft = Math.ceil((RATE_LIMIT_WINDOW - (now - lastSubmission)) / 1000);
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. Please wait ${timeLeft} seconds before submitting again.` 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    submissionTracker.set(clientIP, now);
    
    // Clean up old entries
    for (const [ip, timestamp] of submissionTracker.entries()) {
      if (now - timestamp > RATE_LIMIT_WINDOW) {
        submissionTracker.delete(ip);
      }
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const body = await req.json()
    console.log('Contact form submission:', body)

    // Validate input
    const errors = validateContactMessage(body)
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert contact message
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        subject: body.subject?.trim() || null,
        message: body.message.trim()
      })
      .select()
      .single()

    if (error) {
      console.log('Insert error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to submit contact message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Contact message submitted successfully:', data.id)

    return new Response(
      JSON.stringify({ 
        message: 'Contact message submitted successfully',
        id: data.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})