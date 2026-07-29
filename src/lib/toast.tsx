import Swal from "sweetalert2";

/**
 * Muestra un popup de error estilo SweetAlert.
 */
export function showError(message: string) {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    confirmButtonText: "Entendido",
    confirmButtonColor: "#2d5a2d",
    customClass: {
      popup: "rounded-2xl shadow-xl",
      confirmButton: "rounded-lg px-6 py-2.5 font-medium",
    },
  });
}

/**
 * Muestra un popup de éxito.
 */
export function showSuccess(message: string) {
  Swal.fire({
    icon: "success",
    title: "¡Listo!",
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#2d5a2d",
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: "rounded-2xl shadow-xl",
      confirmButton: "rounded-lg px-6 py-2.5 font-medium",
    },
  });
}

/**
 * Muestra un popup de confirmación. Retorna true si confirma.
 */
export async function showConfirm(message: string): Promise<boolean> {
  const result = await Swal.fire({
    icon: "warning",
    title: "¿Estás seguro?",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Sí, confirmar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#2d5a2d",
    cancelButtonColor: "#dc2626",
    customClass: {
      popup: "rounded-2xl shadow-xl",
      confirmButton: "rounded-lg px-6 py-2.5 font-medium",
      cancelButton: "rounded-lg px-6 py-2.5 font-medium",
    },
  });
  return result.isConfirmed;
}

// Listener de eventos custom para uso desde interceptores axios
if (typeof window !== "undefined") {
  window.addEventListener("toast", (e: Event) => {
    const detail = (e as CustomEvent<{ message: string; type: "error" | "success" }>).detail;
    if (detail?.message) {
      if (detail.type === "success") {
        showSuccess(detail.message);
      } else {
        showError(detail.message);
      }
    }
  });
}
