import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { RefreshCw, Users, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface SpacesListProps {
  botToken: string;
  spaces: Array<{ id: string; title: string }>;
  setSpaces: (spaces: Array<{ id: string; title: string }>) => void;
  selectedSpaceId: string;
  onSelectSpace: (spaceId: string) => void;
}

export function SpacesList({ 
  botToken, 
  spaces, 
  setSpaces, 
  selectedSpaceId, 
  onSelectSpace 
}: SpacesListProps) {
  const [loading, setLoading] = useState(false);

  const fetchSpaces = async () => {
    if (!botToken) {
      toast.error('Please configure your bot token first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://webexapis.com/v1/rooms', {
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch spaces');
      }

      const data = await response.json();
      const spacesList = data.items.map((room: any) => ({
        id: room.id,
        title: room.title,
      }));
      
      setSpaces(spacesList);
      toast.success(`Loaded ${spacesList.length} spaces`);
    } catch (error) {
      toast.error('Failed to fetch spaces. Check your bot token.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-pink-500/20 bg-slate-900/50 backdrop-blur shadow-lg shadow-pink-500/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white">Webex Spaces</CardTitle>
              <CardDescription className="text-slate-300">
                Spaces where your bot is a member
              </CardDescription>
            </div>
            <Button 
              onClick={fetchSpaces} 
              disabled={loading || !botToken}
              size="sm"
              className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-700 hover:via-purple-700 hover:to-blue-700 shadow-lg shadow-pink-500/20"
            >
              <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
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

          {botToken && spaces.length === 0 && (
            <div className="bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-pink-950/50 rounded-lg p-6 border border-blue-500/30 shadow-lg shadow-blue-500/10">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-3 rounded-lg shadow-lg shadow-blue-500/30">
                  <Layers className="size-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white mb-1">Load Your Spaces</h3>
                  <p className="text-slate-300 text-sm">
                    Click "Refresh" to load the spaces where your bot is a member
                  </p>
                </div>
              </div>
            </div>
          )}

          {spaces.length > 0 && (
            <div className="bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-pink-950/50 rounded-lg p-6 border border-pink-500/20 shadow-lg shadow-pink-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-2 rounded-lg shadow-lg shadow-pink-500/30">
                    <Users className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white">Available Spaces</h3>
                    <p className="text-sm text-slate-300">
                      {spaces.length} space{spaces.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                </div>
                {selectedSpaceId && (
                  <Badge className="gap-1 bg-pink-900/50 text-pink-200 border-pink-500/30">
                    <CheckCircle2 className="size-3" />
                    1 selected
                  </Badge>
                )}
              </div>
              
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {spaces.map((space) => (
                    <button
                      key={space.id}
                      onClick={() => onSelectSpace(space.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedSpaceId === space.id
                          ? 'border-pink-400/60 bg-gradient-to-r from-pink-900/40 via-purple-900/40 to-blue-900/40 shadow-lg shadow-pink-500/20'
                          : 'border-slate-700/50 bg-slate-800/30 hover:border-pink-500/30 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded transition-all ${
                            selectedSpaceId === space.id
                              ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 shadow-md shadow-pink-500/30'
                              : 'bg-slate-700/50'
                          }`}>
                            <Users className={`size-4 ${
                              selectedSpaceId === space.id
                                ? 'text-white'
                                : 'text-slate-400'
                            }`} />
                          </div>
                          <span className={`${selectedSpaceId === space.id ? 'text-white' : 'text-slate-200'}`}>
                            {space.title}
                          </span>
                        </div>
                        {selectedSpaceId === space.id && (
                          <CheckCircle2 className="size-5 text-pink-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
