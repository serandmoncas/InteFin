"use server"

import { createClient } from "@/lib/supabase/server"
import type { QuizAnswer } from "@/lib/quiz/score"

export interface SubmitQuizInput {
  organizationId: string
  score:          number
  answers:        QuizAnswer[]
  visitorName?:   string
  visitorEmail?:  string
  visitorWhatsapp?: string
}

export async function submitQuizResult(input: SubmitQuizInput) {
  const supabase = await createClient()

  // anon insert is allowed via RLS policy — we just need to insert
  // Cast answers to a plain JSON shape — Supabase expects Json, not QuizAnswer[]
  const answersJson = input.answers.map((a) => ({
    questionId: a.questionId,
    value:      a.value,
    points:     a.points,
  }))

  const { data, error } = await supabase
    .from("public_test_results")
    .insert({
      organization_id:  input.organizationId,
      score:            input.score,
      answers:          answersJson,
      visitor_name:     input.visitorName     || null,
      visitor_email:    input.visitorEmail    || null,
      visitor_whatsapp: input.visitorWhatsapp || null,
    })
    .select("id")
    .single()

  if (error) return { error: `Error guardando: ${error.message}` }
  return { success: true, leadId: data.id }
}
