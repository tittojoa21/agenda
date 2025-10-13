import Swal, { SweetAlertIcon, SweetAlertOptions } from "sweetalert2";

const BASE_TOAST_CONFIG: SweetAlertOptions = {
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "#1a1a1a",
  color: "#ffffff",
  customClass: {
    popup: "custom-toast",
    timerProgressBar: "custom-progress-bar"
  },
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
    
    toast.style.transform = "translateX(100%)";
    toast.style.opacity = "0";
    
    setTimeout(() => {
      toast.style.transition = "all 0.3s ease-out";
      toast.style.transform = "translateX(0)";
      toast.style.opacity = "1";
    }, 10);
  },
  willClose: (toast) => {
    toast.style.transition = "all 0.2s ease-in";
    toast.style.transform = "translateX(100%)";
    toast.style.opacity = "0";
  }
};

const BASE_MODAL_CONFIG: SweetAlertOptions = {
  position: "center",
  showConfirmButton: true,
  showCancelButton: false,
  confirmButtonText: "Aceptar",
  cancelButtonText: "Cancelar",
  customClass: {
    popup: "custom-modal",
    confirmButton: "btn-modal-confirm",
    cancelButton: "btn-modal-cancel",
    actions: "modal-actions"
  },
  backdrop: true,
  allowOutsideClick: false,
  allowEscapeKey: true
};

const TOAST_TYPES = {
  success: {
    icon: "success" as SweetAlertIcon,
    iconColor: "#10b981",
    background: "#0f172a",
    color: "#f1f5f9"
  },
  error: {
    icon: "error" as SweetAlertIcon,
    iconColor: "#ef4444",
    background: "#450a0a",
    color: "#fecaca"
  },
  warning: {
    icon: "warning" as SweetAlertIcon,
    iconColor: "#f59e0b",
    background: "#451a03",
    color: "#fed7aa"
  },
  info: {
    icon: "info" as SweetAlertIcon,
    iconColor: "#3b82f6",
    background: "#172554",
    color: "#dbeafe"
  }
};

export class ToastManager {
  private static instance: ToastManager;
  private swalToastInstance: typeof Swal;
  private swalModalInstance: typeof Swal;

  private constructor() {
    this.swalToastInstance = Swal.mixin(BASE_TOAST_CONFIG);
    this.swalModalInstance = Swal.mixin(BASE_MODAL_CONFIG);
  }

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  private async showToast(
    title: string, 
    type: keyof typeof TOAST_TYPES = 'info', 
    customOptions: SweetAlertOptions = {}
  ) {
    const typeConfig = TOAST_TYPES[type];
    
    const options: SweetAlertOptions = {
      title,
      icon: typeConfig.icon,
      iconColor: typeConfig.iconColor,
      background: typeConfig.background,
      color: typeConfig.color,
      ...customOptions
    };

    return await this.swalToastInstance.fire(options);
  }

  async success(title: string, options?: SweetAlertOptions) {
    return this.showToast(title, 'success', options);
  }

  async error(title: string, options?: SweetAlertOptions) {
    return this.showToast(title, 'error', options);
  }

  async warning(title: string, options?: SweetAlertOptions) {
    return this.showToast(title, 'warning', options);
  }

  async info(title: string, options?: SweetAlertOptions) {
    return this.showToast(title, 'info', options);
  }

  async confirm(
    title: string, 
    text: string = '', 
    confirmButtonText: string = 'Sí, confirmar',
    cancelButtonText: string = 'Cancelar'
  ): Promise<boolean> {
    const result = await this.swalModalInstance.fire({
      title,
      text,
      icon: 'question' as SweetAlertIcon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      customClass: {
        ...BASE_MODAL_CONFIG.customClass,
        popup: 'custom-modal confirm-modal'
      }
    });
    
    return result.isConfirmed;
  }

  async confirmDelete(
    title: string = '¿Estás seguro?',
    text: string = 'Esta acción no se puede deshacer',
    confirmButtonText: string = 'Sí, eliminar'
  ): Promise<boolean> {
    const result = await this.swalModalInstance.fire({
      title,
      text,
      icon: 'warning' as SweetAlertIcon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      customClass: {
        ...BASE_MODAL_CONFIG.customClass,
        popup: 'custom-modal delete-modal',
        confirmButton: 'btn-modal-delete'
      }
    });
    
    return result.isConfirmed;
  }

  async alert(
    title: string, 
    text: string = '', 
    icon: SweetAlertIcon = 'info'
  ): Promise<void> {
    await this.swalModalInstance.fire({
      title,
      text,
      icon,
      customClass: {
        ...BASE_MODAL_CONFIG.customClass,
        popup: 'custom-modal alert-modal'
      }
    });
  }

  async infoModal(
    title: string,
    html: string
  ): Promise<void> {
    await this.swalModalInstance.fire({
      title,
      html,
      showConfirmButton: true,
      confirmButtonText: 'Cerrar',
      showCancelButton: false,
      customClass: {
        ...BASE_MODAL_CONFIG.customClass,
        popup: 'custom-modal info-modal'
      }
    });
  }

  close() {
    Swal.close();
  }

  isVisible(): boolean {
    return Swal.isVisible();
  }

  async showLoading(title: string = 'Cargando...'): Promise<void> {
    await Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'custom-modal loading-modal'
      }
    });
  }

  closeLoading() {
    Swal.close();
  }
}

export const Toast = ToastManager.getInstance();

export const ModalHelpers = {
  confirmDelete: (itemName: string = 'este elemento'): Promise<boolean> => 
    Toast.confirmDelete(
      '¿Estás seguro?', 
      `Estás a punto de eliminar ${itemName}. Esta acción no se puede deshacer.`,
      'Sí, eliminar'
    ),

  confirmAction: (title: string, actionDescription: string): Promise<boolean> =>
    Toast.confirm(
      title,
      actionDescription,
      'Sí, continuar'
    ),

  success: (title: string, message: string = ''): Promise<void> =>
    Toast.alert(title, message, 'success'),

  error: (title: string, message: string = ''): Promise<void> =>
    Toast.alert(title, message, 'error'),

  warning: (title: string, message: string = ''): Promise<void> =>
    Toast.alert(title, message, 'warning'),

  info: (title: string, message: string = ''): Promise<void> =>
    Toast.alert(title, message, 'info')
};