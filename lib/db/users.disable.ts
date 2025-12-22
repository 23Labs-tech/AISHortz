import { createClient } from '@/lib/supabase/server'

export async function getUserProfile(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateUserProfile(userId: string, updates: any) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addCredits(userId: string, amount: number, description: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.rpc('add_credit_transaction', {
    p_user_id: userId,
    p_transaction_type: 'purchase',
    p_amount: amount,
    p_description: description,
  })

  if (error) throw error
  return data
}

export async function deductCredits(userId: string, amount: number, description: string, metadata?: any) {
  const supabase = createClient()
  
  const { data, error } = await supabase.rpc('add_credit_transaction', {
    p_user_id: userId,
    p_transaction_type: 'usage',
    p_amount: -amount, // Negative for deduction
    p_description: description,
    p_metadata: metadata,
  })

  if (error) throw error
  return data
}

export async function getCreditTransactions(userId: string, limit = 10) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getUserVideos(userId: string, limit = 20) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('generated_videos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function saveGeneratedVideo(videoData: any) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('generated_videos')
    .insert([videoData])
    .select()
    .single()

  if (error) throw error
  return data
}

