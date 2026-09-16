import { useCallback, useEffect, useRef, useState } from 'react';

export interface RemoteResource<T> {
  data: T | null;
  /** Fallo sin datos previos: la pantalla muestra el error en lugar del contenido. */
  error: unknown;
  /** Fallo de un refresco con datos previos: se conservan los datos y se muestra un aviso. */
  refreshError: unknown;
  /** Solo es true mientras no hay datos (carga inicial o reintento desde el error). */
  isLoading: boolean;
  isRefreshing: boolean;
  reload: () => void;
  refresh: () => void;
}

interface ResourceState<T> {
  data: T | null;
  error: unknown;
  refreshError: unknown;
  isLoading: boolean;
  isRefreshing: boolean;
}

export interface RemoteResourceOptions {
  /** Con false no se carga al montar: la primera petición llega con reload o refresh. */
  loadOnMount?: boolean;
}

/**
 * Estado de una petición remota (design D4). Cada petición nueva aborta la anterior y el
 * desmontaje aborta la que esté en curso; las respuestas de peticiones abortadas se ignoran.
 * `load` debe ser estable (función de módulo o useCallback) para no repetir la carga.
 */
export function useRemoteResource<T>(
  load: (signal: AbortSignal) => Promise<T>,
  { loadOnMount = true }: RemoteResourceOptions = {}
): RemoteResource<T> {
  const [state, setState] = useState<ResourceState<T>>({
    data: null,
    error: null,
    refreshError: null,
    isLoading: loadOnMount,
    isRefreshing: false,
  });
  const controllerRef = useRef<AbortController | null>(null);

  const start = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) {
          setState({
            data,
            error: null,
            refreshError: null,
            isLoading: false,
            isRefreshing: false,
          });
        }
      },
      (error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setState((previous) =>
          previous.data === null
            ? { data: null, error, refreshError: null, isLoading: false, isRefreshing: false }
            : { ...previous, refreshError: error, isLoading: false, isRefreshing: false }
        );
      }
    );
  }, [load]);

  useEffect(() => {
    if (loadOnMount) {
      start();
    }
    return () => {
      controllerRef.current?.abort();
    };
  }, [start, loadOnMount]);

  const reload = useCallback(() => {
    setState((previous) => ({
      ...previous,
      error: null,
      refreshError: null,
      isLoading: previous.data === null,
      isRefreshing: previous.data !== null,
    }));
    start();
  }, [start]);

  const refresh = useCallback(() => {
    setState((previous) => ({ ...previous, refreshError: null, isRefreshing: true }));
    start();
  }, [start]);

  return { ...state, reload, refresh };
}
