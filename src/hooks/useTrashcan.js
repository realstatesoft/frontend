import { useState, useEffect, useCallback, useRef } from "react";
import propertyApi from "../services/properties/propertyApi";
import Swal from "sweetalert2";

const getErrorMessage = (err) =>
  err.response?.data?.message ??
  err.response?.data?.errors?.[0] ??
  "No se pudo conectar con el servidor. Verificá que el backend esté activo.";

export default function useTrashcan({ page = 1, size = 10 } = {}) {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmData, setConfirmData] = useState({});

    async function fetchTrashcan() {
        try {
            setLoading(true);

            const res = await propertyApi.getTrashcan({
                page: 0,
                size: 20
            });

            const pageData = res.data.data;

            setProperties(pageData.content ?? []);

        } catch (err) {
            console.error("Error cargando papelera", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTrashcan();
    }, []);

    const hideConfirm = useCallback(() => {
        setShowConfirm(false);
        setConfirmData({});
    }, []);

    // RESTORE A PROPERTY IN TRASHCAN
     const handleConfirmRestore = useCallback(
        async (id) => {
            if (!id) return;
            setActionLoading(true);
            try {
                const { data } = await propertyApi.restore(id);
                if (data?.success && data?.data) {
                    hideConfirm();
                    await Swal.fire({
                        icon: "success",
                        title: "Propiedad restaurada",
                        text: `La propiedad fue restaurada con éxito.`,
                    });
                    fetchTrashcan();
                } else {
                    throw new Error(data?.message ?? "Error al restaurar la propiedad");
                }
            } catch (err) {
                await Swal.fire({
                icon: "error",
                title: "Error",
                text: getErrorMessage(err),
                });
            } finally {
                setActionLoading(false);
            }
        },
        [hideConfirm]
    );

    const openRestoreDialog = useCallback((option) => {
        setConfirmData({
            title: `Restaurar propiedad`,
            message: `¿Estás seguro que deseas restaurar la propiedad "${option.title}"?`,
            confirmText: "Restaurar",
            cancelText: "Cancelar",
            variant: "warning",
            onConfirm: () => handleConfirmRestore(option.id),
        });
        setShowConfirm(true);
    }, [handleConfirmRestore]);

   
    // DELETE A PROPERTY IN TRASHCAN
    const handleConfirmDelete = useCallback(
        async (id) => {
            if (!id) return;
            setActionLoading(true);
            try {
                const response = await propertyApi.delete(id);
                if (response.status === 204) {
                    hideConfirm();
                    await Swal.fire({
                        icon: "success",
                        title: "Propiedad eliminada",
                        text: `La propiedad fue eliminada de manera definitiva.`,
                    });
                    fetchTrashcan();
                } else {
                    throw new Error(response?.data?.message ?? "Error al eliminar la propiedad");
                }
            } catch (err) {
                await Swal.fire({
                icon: "error",
                title: "Error",
                text: getErrorMessage(err),
                });
            } finally {
                setActionLoading(false);
            }
        },
        [hideConfirm]
    );

    const openDeleteDialog = useCallback((option) => {
        setConfirmData({
            title: `Eliminar propiedad`,
            message: `¿Estás seguro que deseas eliminar la propiedad "${option.title}"? Esta acción no se puede deshacer`,
            confirmText: "Eliminar",
            cancelText: "Cancelar",
            variant: "warning",
            onConfirm: () => handleConfirmDelete(option.id),
        });
        setShowConfirm(true);
    }, [handleConfirmDelete]);


    // CLEAR ALL PROPERTIES IN TRASHCAN
    const handleConfirmClear = useCallback(
        async () => {
            setActionLoading(true);
            try {
                const { data } = await propertyApi.clearTrashcan();
                if (data?.success) {
                    hideConfirm();
                    await Swal.fire({
                        icon: "success",
                        title: "Papelera vaciada",
                        text: `${data?.message ?? "La papelera fue vaciada correctamente."}`,
                    });
                    fetchTrashcan();
                } else {
                    throw new Error(data?.message ?? "Error al vaciar la papelera");
                }
            } catch (err) {
                await Swal.fire({
                icon: "error",
                title: "Error",
                text: getErrorMessage(err),
                });
            } finally {
                setActionLoading(false);
            }
        },
        [hideConfirm]
    );

     const openClearDialog = useCallback(() => {
        setConfirmData({
            title: `Vaciar papelera`,
            message: `¿Estás seguro que deseas eliminar todas las propiedades de la papelera? Esta acción no se puede deshacer`,
            confirmText: "Vaciar",
            cancelText: "Cancelar",
            variant: "warning",
            onConfirm: () => handleConfirmClear(),
        });
        setShowConfirm(true);
    }, [handleConfirmClear]);



    
    return { properties, loading, actionLoading, refetch: fetchTrashcan, confirmData, showConfirm, hideConfirm, openClearDialog, openDeleteDialog, openRestoreDialog };
}