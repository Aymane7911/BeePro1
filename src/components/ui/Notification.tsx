



interface NotificationProps {
  notification: {
    show: boolean;
    message: string;
    type?: "error" | "success" | "info";
  };
  setNotification: React.Dispatch<React.SetStateAction<{
    show: boolean;
    message: string;
    type?: "error" | "success" | "info";
  }>>;
}

const Notification = ({ notification, setNotification }: NotificationProps) => {
  if (!notification.show) return null;

  const getBackgroundColor = () => {
    switch (notification.type) {
      case "error":
        return "bg-red-100 border-red-500 text-red-700";
      case "success":
        return "bg-green-100 border-green-500 text-green-700";
      case "info":
        return "bg-blue-100 border-blue-500 text-blue-700";
      default:
        return "bg-green-100 border-green-500 text-green-700";
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 border-l-4 p-4 rounded shadow-lg max-w-md z-50 ${getBackgroundColor()}`}>
      <div className="flex justify-between items-center">
        <span>{notification.message}</span>
        <button
          onClick={() => setNotification({ show: false, message: "", type: undefined })}
          className="ml-4 text-xl font-bold cursor-pointer"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;