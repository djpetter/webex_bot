import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Save, Eye, EyeOff, CheckCircle2, InfoIcon, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BotSettingsProps {
  botToken: string;
  onTokenChange: (token: string) => void;
}

export function BotSettings({ botToken, onTokenChange }: BotSettingsProps) {
  const [tokenInput, setTokenInput] = useState(botToken);
  const [showToken, setShowToken] = useState(false);

  const handleSave = () => {
    if (!tokenInput.trim()) {
      toast.error('Please enter a bot token');
      return;
    }
    
    localStorage.setItem('webex_bot_token', tokenInput);
    onTokenChange(tokenInput);
    toast.success('Bot token saved successfully');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-pink-500/20 bg-slate-900/50 backdrop-blur shadow-lg shadow-pink-500/5">
        <CardHeader>
          <CardTitle className="text-white">Bot Configuration</CardTitle>
          <CardDescription className="text-slate-300">
            Configure your Webex bot access token to start posting messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-pink-950/50 rounded-lg p-6 border border-pink-500/20 shadow-lg shadow-pink-500/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-3 rounded-lg shadow-lg shadow-pink-500/30">
                <Settings className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white mb-1">Bot Access Token</h3>
                <p className="text-slate-300 text-sm">
                  Enter your Webex bot token to authenticate API requests
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="bot-token"
                    type={showToken ? 'text' : 'password'}
                    placeholder="Enter your Webex bot token..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-slate-700"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? (
                      <EyeOff className="size-4 text-slate-400" />
                    ) : (
                      <Eye className="size-4 text-slate-400" />
                    )}
                  </Button>
                </div>
                <Button 
                  onClick={handleSave}
                  className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-700 hover:via-purple-700 hover:to-blue-700 shadow-lg shadow-pink-500/20"
                >
                  <Save className="size-4 mr-2" />
                  Save
                </Button>
              </div>

              {botToken && (
                <div className="flex items-center gap-2 text-green-400 bg-green-950/30 px-3 py-2 rounded border border-green-500/30">
                  <CheckCircle2 className="size-4" />
                  <span className="text-sm">Token configured and ready to use</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-pink-950/50 rounded-lg p-6 border border-pink-500/20 shadow-lg shadow-blue-500/10">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-3 rounded-lg shadow-lg shadow-blue-500/30">
                <InfoIcon className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white mb-2">How to Get Your Bot Token</h3>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm">
                  <li>Go to <a href="https://developer.webex.com/my-apps" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 hover:underline transition-colors">developer.webex.com/my-apps</a></li>
                  <li>Create a new bot or select an existing one</li>
                  <li>Copy the bot's access token</li>
                  <li>Paste it in the field above and click Save</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}