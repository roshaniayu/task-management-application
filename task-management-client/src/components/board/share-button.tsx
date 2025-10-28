import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Send } from "lucide-react";
import { getBoardSummary, registerTelegramChat } from "@/lib/api";
import { toast } from "sonner";

export function ShareButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchBoardSummary = async () => {
    setIsLoading(true);
    try {
      const data = await getBoardSummary();
      setSummary(data.summary);
    } catch (error: any) {
      toast.error("Failed to load board summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTelegramRegistration = async () => {
    if (!telegramChatId) return;

    setIsRegistering(true);
    try {
      await registerTelegramChat(telegramChatId);
      toast.success("Successfully connected to Telegram! You'll now receive board summaries there.");
      setTelegramChatId("");
    } catch (error: any) {
      toast.error("Failed to connect Telegram. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="border-[#0088cc] text-[#0088cc] hover:bg-[#0088cc]/10 dark:border-[#0088cc] dark:text-[#ffffff] dark:hover:bg-[#0088cc]/20 ml-auto"
          onClick={() => {
            setIsOpen(true);
            fetchBoardSummary();
          }}
        >
          <Send className="mr-2 h-4 w-4" />
          Share to Telegram
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[500px]">
        <AlertDialogTitle>Share to Telegram</AlertDialogTitle>
        <div >
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : summary ? (
            <>
              <pre className="whitespace-pre-wrap font-sans text-sm">{summary}</pre>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Connect with Telegram Bot</h4>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li>1. Open Telegram and search for <strong>@ManadoTaskManagementBot</strong></li>
                  <li>2. Click "Start" or send /start to the bot</li>
                  <li>3. The bot will reply with your Chat ID</li>
                  <li>4. Copy that Chat ID and paste it below</li>
                  <li>5. After connecting, you'll receive task summaries on Telegram</li>
                </ol>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Paste your Telegram Chat ID..."
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                  />
                  <Button
                    variant="secondary"
                    onClick={handleTelegramRegistration}
                    disabled={!telegramChatId || isRegistering}
                  >
                    {isRegistering ? "Connecting..." : "Connect"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Empty summary. Create a new task first to use this feature.</p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}