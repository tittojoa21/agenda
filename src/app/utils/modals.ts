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
  },
  question: {
    icon: "question" as SweetAlertIcon,
    iconColor: "#8b5cf6",
    background: "#2e1065",
    color: "#ede9fe"
  }
};


export class ToastManager {
  private static instance: ToastManager;
  private swalInstance: typeof Swal;

  private constructor() {
    this.swalInstance = Swal.mixin(BASE_TOAST_CONFIG);
  }

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }


  private async show(
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

    return await this.swalInstance.fire(options);
  }


  async success(title: string, options?: SweetAlertOptions) {
    return this.show(title, 'success', options);
  }

  async error(title: string, options?: SweetAlertOptions) {
    return this.show(title, 'error', options);
  }

  async warning(title: string, options?: SweetAlertOptions) {
    return this.show(title, 'warning', options);
  }

  async info(title: string, options?: SweetAlertOptions) {
    return this.show(title, 'info', options);
  }

  async question(title: string, options?: SweetAlertOptions) {
    return this.show(title, 'question', options);
  }


  async html(html: string, type: keyof typeof TOAST_TYPES = 'info', options?: SweetAlertOptions) {
    const typeConfig = TOAST_TYPES[type];
    
    const toastOptions: SweetAlertOptions = {
      html,
      icon: typeConfig.icon,
      iconColor: typeConfig.iconColor,
      background: typeConfig.background,
      color: typeConfig.color,
      ...options
    };

    return await this.swalInstance.fire(toastOptions);
  }

  async withAction(
    title: string, 
    actionText: string, 
    type: keyof typeof TOAST_TYPES = 'info',
    actionCallback: () => void
  ) {
    return this.show(title, type, {
      showConfirmButton: true,
      confirmButtonText: actionText,
      confirmButtonColor: TOAST_TYPES[type].iconColor,
      timer: undefined, 
      didOpen: (toast) => {
        const confirmButton = toast.querySelector('.swal2-confirm');
        if (confirmButton) {
          confirmButton.addEventListener('click', actionCallback);
        }
        
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
  }

  async progress(title: string, duration: number = 5000) {
    return this.show(title, 'info', {
      timer: duration,
      timerProgressBar: true,
      showConfirmButton: false,
      didOpen: (toast) => {
        const progressBar = toast.querySelector('.swal2-timer-progress-bar') as HTMLElement;
        if (progressBar) {
          progressBar.style.background = 'linear-gradient(90deg, #3b82f6, #8b5cf6)';
        }
      }
    });
  }


  close() {
    Swal.close();
  }

  isVisible(): boolean {
    return Swal.isVisible();
  }
}

export const Toast = ToastManager.getInstance();

export const ToastHelpers = {
  // Mensajes predefinidos comunes
  saved: () => Toast.success('Guardado correctamente'),
  deleted: () => Toast.success('Eliminado correctamente'),
  created: () => Toast.success('Creado correctamente'),
  updated: () => Toast.success('Actualizado correctamente'),
  

  networkError: () => Toast.error('Error de conexión'),
  serverError: () => Toast.error('Error del servidor'),
  validationError: () => Toast.error('Error de validación'),
  

  loading: (message: string = 'Cargando...') => {
    return Toast.info(message, {
      timer: undefined,
      showConfirmButton: false
    });
  },
  

  custom: (title: string, icon: SweetAlertIcon, color: string = '#3b82f6') => {
    return Toast.html(title, 'info', {
      icon,
      iconColor: color,
      background: '#1a1a1a',
      color: '#ffffff'
    });
  }
};