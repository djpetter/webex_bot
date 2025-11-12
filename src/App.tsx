import { useState } from 'react';
import { MessageComposer } from './components/MessageComposer';
import { SpacesList } from './components/SpacesList';
import { BotSettings } from './components/BotSettings';
import { AdaptiveCardDesigner } from './components/AdaptiveCardDesigner';
import { MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [botToken, setBotToken] = useState(localStorage.getItem('webex_bot_token') || '');
  const [spaces, setSpaces] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState('');

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-[#0a1929] via-[#1a1a2e] to-[#0f1419]">
      <Toaster />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0a1929] via-[#2d1b4e] to-[#1e3a5f] border-b border-pink-500/20 shadow-xl backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-2 rounded-lg shadow-lg shadow-pink-500/30">
              <MessageSquare className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-white">Webex Bot Message Poster</h1>
              <p className="text-blue-300/80 text-sm">Post messages to Webex spaces with your bot</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8 bg-slate-900/50 border border-pink-500/20">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="spaces">Spaces</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="cards">Card Designer</TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <MessageComposer 
              botToken={botToken}
              selectedSpaceId={selectedSpaceId}
              onSelectSpace={setSelectedSpaceId}
              spaces={spaces}
            />
          </TabsContent>

          <TabsContent value="spaces">
            <SpacesList 
              botToken={botToken}
              spaces={spaces}
              setSpaces={setSpaces}
              selectedSpaceId={selectedSpaceId}
              onSelectSpace={setSelectedSpaceId}
            />
          </TabsContent>

          <TabsContent value="settings">
            <BotSettings 
              botToken={botToken}
              onTokenChange={setBotToken}
            />
          </TabsContent>

          <TabsContent value="cards">
            <AdaptiveCardDesigner 
              botToken={botToken}
              selectedSpaceId={selectedSpaceId}
              spaces={spaces}
              onSelectSpace={setSelectedSpaceId}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}