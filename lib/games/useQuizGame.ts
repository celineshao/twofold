"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadQuizState,
  nextQuizRound,
  submitQuizAnswer,
} from "@/lib/games/client";
import type { QuizDefinition, QuizPlayState } from "@/lib/games/quiz";
import { useSessionRealtime } from "@/lib/games/useSessionRealtime";

export function useQuizGame(quiz: QuizDefinition, sessionId: string | null) {
  const [state, setState] = useState<QuizPlayState | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!sessionId) {
      setState(null);
      setLoading(false);
      return;
    }

    const result = await loadQuizState(quiz, sessionId);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setState(result.state);
    setError(null);
    setLoading(false);
  }, [quiz, sessionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useSessionRealtime(sessionId, () => {
    void reload();
  });

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!sessionId || busy || !state?.canChoose) {
        return;
      }
      setBusy(true);
      setActionError(null);
      const result = await submitQuizAnswer(quiz, sessionId, answer);
      if (!result.ok) {
        setActionError(result.error);
      } else {
        setState(result.state);
      }
      setBusy(false);
    },
    [busy, quiz, sessionId, state?.canChoose],
  );

  const nextRound = useCallback(async () => {
    if (!sessionId || busy) {
      return;
    }
    setBusy(true);
    setActionError(null);
    const result = await nextQuizRound(quiz, sessionId);
    if (!result.ok) {
      setActionError(result.error);
    } else {
      setState(result.state);
    }
    setBusy(false);
  }, [busy, quiz, sessionId]);

  return {
    state,
    loading,
    error,
    actionError,
    busy,
    submitAnswer,
    nextRound,
  };
}
