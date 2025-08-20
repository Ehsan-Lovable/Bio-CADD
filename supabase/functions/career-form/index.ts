import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schema
const validateCareerApplication = (data: any) => {
  const errors: string[] = []
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long')
  }
  
  if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
    errors.push('Valid email is required')
  }
  
  if (!data.position || typeof data.position !== 'string' || data.position.trim().length < 2) {
    errors.push('Position is required')
  }
  
  if (data.phone && (typeof data.phone !== 'string' || data.phone.trim().length < 10)) {
    errors.push('Phone number must be at least 10 characters if provided')
  }
  
  return errors
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const body = await req.json()
    console.log('Career application submission:', body)

    // Validate input
    const errors = validateCareerApplication(body)
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert career application
    const { data, error } = await supabase
      .from('career_applications')
      .insert({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        position: body.position.trim(),
        experience: body.experience?.trim() || null,
        resume_url: body.resume_url?.trim() || null,
        cover_letter: body.cover_letter?.trim() || null
      })
      .select()
      .single()

    if (error) {
      console.log('Insert error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to submit career application' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Career application submitted successfully:', data.id)

    return new Response(
      JSON.stringify({ 
        message: 'Career application submitted successfully',
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