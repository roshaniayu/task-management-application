import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { MessageCircle, Send } from "lucide-react";
import { sendBoardSummary, getTelegramKey } from "@/lib/api";
import { toast } from "sonner";

export function TelegramButton() {
  const [_, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [uniqueId, setUniqueId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTelegramKey = async () => {
      try {
        const response = await getTelegramKey();
        setUniqueId(response.key);
        setIsConnected(!response.key);
      } catch (error: any) {
        toast.error(`Error: ${error?.message || String(error)}. Please try again later.`);
        setUniqueId(null);
        setIsConnected(false);
      }
    };

    fetchTelegramKey();
  }, []);

  const sendSummary = async () => {
    setIsLoading(true);
    try {
      await sendBoardSummary();
    } catch (error: any) {
      toast.error(`Error: ${error?.message || String(error)}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    if (!uniqueId) return;

    const botUsername = "@ManadoTaskManagementBot";
    const connectUrl = `https://t.me/${botUsername.replace("@", "")}?text=Send this token to connect your account.%0A%0A${uniqueId}`;
    window.open(connectUrl, '_blank');
    setIsConnected(true);
  };

  if (!isConnected && uniqueId) {
    return (
      <Button
        variant="outline"
        className="border-[#0088cc] text-[#0088cc] hover:bg-[#0088cc]/10 dark:border-[#0088cc] dark:text-[#ffffff] dark:hover:bg-[#0088cc]/20 ml-auto"
        onClick={handleConnect}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Connect to Telegram
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className="border-[#0088cc] text-[#0088cc] hover:bg-[#0088cc]/10 dark:border-[#0088cc] dark:text-[#ffffff] dark:hover:bg-[#0088cc]/20 ml-auto"
      onClick={() => {
        sendSummary();
      }}
    >
      <Send className="mr-2 h-4 w-4" />
      Share to Telegram
    </Button>
  );
}