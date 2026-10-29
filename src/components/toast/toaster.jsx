import NotificationToasts from "./notification-toasts.jsx";
import Toast from "./toast.jsx";
import "./toast.scss";
import "./toaster.scss";

// Zone commune des toasts : notifications (nouvelles arrivées) + toast de retour d'action (showToast).
// Jusqu'à 1280px, une seule colonne en bas : les notifications s'empilent au-dessus du toast d'action,
// jamais l'un sur l'autre. Au-delà, notifications en bas à droite, toast d'action à sa place (bas, centré).
export default function Toaster() {
    return (
        <div className="toaster">
            <NotificationToasts />
            <Toast />
        </div>
    );
}
