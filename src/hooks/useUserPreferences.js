import { useState, useEffect, useCallback, useContext } from "react";
import {
  getPreferenceOptions,
  getUserPreferences,
  saveUserPreferences,
} from "../services/preferencesService";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook para gestionar las preferencias del usuario.
 *
 * @param {number | null | undefined} userId
 * @returns {{
 *   preferences: import('../types/preferences').UserPreferenceResponse | null,
 *   isLoading: boolean,
 *   error: string | null,
 *   retryLoad: () => void,
 *   savePreferences: (data: import('../types/preferences').UserPreferenceRequest) => Promise<void>,
 *   isSaving: boolean,
 *   options: import('../types/preferences').PreferenceCategory[] | null,
 *   optionsLoading: boolean,
 * }}
 */
export function useUserPreferences(userId) {
  const authContext = useContext(AuthContext);
  const [options, setOptions] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(!!userId);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadAll = useCallback(async () => {
    if (!userId) {
      setOptionsLoading(false);
      setIsLoading(false);
      return;
    }
    setOptionsLoading(true);
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedOptions, fetchedPreferences] = await Promise.all([
        getPreferenceOptions(),
        getUserPreferences(userId),
      ]);
      setOptions(fetchedOptions);
      setPreferences(fetchedPreferences);
    } catch (err) {
      console.error("[useUserPreferences] Error al cargar datos:", err);
      const msg =
        err?.response?.status === 404
          ? null // El usuario aún no tiene preferencias → es válido
          : err?.response?.data?.message ??
            "Error de conexión. Verificá tu red e intentá de nuevo.";
      setError(msg);

      // Si el 404 es de preferences (no de options), guardamos las options igual
      if (err?.response?.status === 404) {
        try {
          const fetchedOptions = await getPreferenceOptions();
          setOptions(fetchedOptions);
        } catch {
          setError("No se pudieron cargar las opciones de preferencias.");
        }
      }
    } finally {
      setOptionsLoading(false);
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /**
   * Guarda las preferencias y actualiza el estado global.
   * @param {import('../types/preferences').UserPreferenceRequest} data
   */
  const savePreferences = useCallback(
    async (data) => {
      if (!userId) {
        throw new Error("No se pudo identificar al usuario para guardar preferencias.");
      }
      setIsSaving(true);
      try {
        const saved = await saveUserPreferences(data);
        setPreferences(saved);
        // Actualizar estado global de onboarding
        if (authContext?.updatePreferencesCompleted) {
          authContext.updatePreferencesCompleted(true);
        }
        return saved;
      } catch (err) {
        console.error("[useUserPreferences] Error al guardar:", err);
        let msg = "No se pudieron guardar las preferencias. Intentá de nuevo.";
        if (err?.response?.data) {
          const { message, errors } = err.response.data;
          if (Array.isArray(errors) && errors.length > 0) {
            // Si hay errores de validación específicos (ej: Spring Validator)
            msg = errors.map(e => e.defaultMessage || e.message).join(". ");
          } else if (message) {
            msg = message;
          }
        }
        throw new Error(msg);
      } finally {
        setIsSaving(false);
      }
    },
    [userId, authContext]
  );

  return {
    preferences,
    isLoading,
    error,
    retryLoad: loadAll,
    savePreferences,
    isSaving,
    options,
    optionsLoading,
  };
}

export default useUserPreferences;
