export const BACKDROP = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm";

export function ModalContainer({
  children,
  borderColor = "border-red-500/50 dark:border-red-500/70",
  maxWidth = "max-w-md",
  onClose,
}: {
  children: React.ReactNode;
  borderColor?: string;
  maxWidth?: string;
  onClose?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-slate-900 border-2 ${borderColor} rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 ease-out`}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
