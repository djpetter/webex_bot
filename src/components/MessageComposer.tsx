import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Send, AlertCircle, CheckCircle2, Loader2, MessageSquare, MapPin } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

interface MessageComposerProps {
  botToken: string;
  selectedSpaceId: string;
  onSelectSpace: (spaceId: string) => void;
  spaces: Array<{ id: string; title: string }>;
}

export function MessageComposer({ 
  botToken, 
  selectedSpaceId, 
  onSelectSpace,
  spaces 
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [customSpaceId, setCustomSpaceId] = useState('');
  const [useCustomSpace, setUseCustomSpace] = useState(false);
  const [sending, setSending] = useState(false);

  const activeSpaceId = useCustomSpace ? customSpaceId : selectedSpaceId;

  const handleSend = async () => {
    if (!botToken) {
      toast.error('Please configure your bot token first');
      return;
    }

    if (!activeSpaceId) {
      toast.error('Please select a space or enter a space ID');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('https://webexapis.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: activeSpaceId,
          text: message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      toast.success('Message sent successfully!');
      setMessage('');
    } catch (error) {
      toast.error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const selectedSpace = spaces.find(s => s.id === selectedSpaceId);

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-pink-500/20 bg-slate-900/50 backdrop-blur shadow-lg shadow-pink-500/5">
        <CardHeader>
          <CardTitle className="text-white">Compose Message</CardTitle>
          <CardDescription className="text-slate-300">
            Write and send a message to a Webex space
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!botToken && (
            <div className="bg-gradient-to-br from-red-950/50 via-pink-950/50 to-purple-950/50 rounded-lg p-6 border border-red-500/30 shadow-lg shadow-red-500/10">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 p-3 rounded-lg shadow-lg shadow-red-500/30">
                  <AlertCircle className="size-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white mb-1">Bot Token Required</h3>
                  <p className="text-slate-300 text-sm">
                    Please configure your bot token in the Settings tab first
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-pink-950/50 rounded-lg p-6 border border-pink-500/20 shadow-lg shadow-pink-500/10 space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-3 rounded-lg shadow-lg shadow-pink-500/30">
                <MapPin className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white mb-1">Select Destination</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Choose a space from your list or enter a custom space ID
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-slate-200">Select Space</Label>
                <Select 
                  value={selectedSpaceId} 
                  onValueChange={(value) => {
                    onSelectSpace(value);
                    setUseCustomSpace(false);
                  }}
                  disabled={!botToken || spaces.length === 0}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder={
                      spaces.length === 0 
                        ? "Load spaces from the Spaces tab" 
                        : "Choose a space..."
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {spaces.map((space) => (
                      <SelectItem key={space.id} value={space.id}>
                        {space.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-700/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gradient-to-r from-blue-950/50 via-purple-950/50 to-pink-950/50 px-2 text-slate-400">
                    Or use custom space ID
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-space-id" className="text-slate-200">Custom Space ID</Label>
                <Input
                  id="custom-space-id"
                  placeholder="Enter space/room ID directly..."
                  value={customSpaceId}
                  onChange={(e) => {
                    setCustomSpaceId(e.target.value);
                    if (e.target.value) {
                      setUseCustomSpace(true);
                    }
                  }}
                  disabled={!botToken}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              {activeSpaceId && (
                <div className="flex items-center gap-2 text-green-400 bg-green-950/30 px-3 py-2 rounded border border-green-500/30">
                  <CheckCircle2 className="size-4" />
                  <span className="text-sm">
                    {useCustomSpace ? (
                      <>Posting to custom space: <code className="text-xs bg-green-900/50 px-1 py-0.5 rounded text-green-200">{customSpaceId}</code></>
                    ) : (
                      <>Posting to: <strong className="text-green-200">{selectedSpace?.title}</strong></>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-pink-950/50 rounded-lg p-6 border border-pink-500/20 shadow-lg shadow-blue-500/10 space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-3 rounded-lg shadow-lg shadow-blue-500/30">
                <MessageSquare className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white mb-1">Your Message</h3>
                <p className="text-slate-300 text-sm">
                  Write the message you want to send to the space
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                disabled={!botToken}
                className="resize-none bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
              <p className="text-sm text-slate-400">
                {message.length} characters
              </p>
            </div>
          </div>

          <Button 
            onClick={handleSend} 
            disabled={!botToken || !activeSpaceId || !message.trim() || sending}
            className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-700 hover:via-purple-700 hover:to-blue-700 shadow-lg shadow-pink-500/20"
            size="lg"
          >
            {sending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="size-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}