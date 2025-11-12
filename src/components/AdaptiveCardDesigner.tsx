import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { 
  Palette, 
  Eye, 
  Code, 
  Plus, 
  Trash2, 
  Send,
  Sparkles,
  Copy,
  CheckCircle2,
  Loader2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Type,
  Image as ImageIcon,
  Square,
  Calendar,
  Clock,
  Hash,
  List,
  Columns,
  Box,
  Table,
  Link,
  MousePointer,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { toast } from 'sonner';
import * as AdaptiveCards from 'adaptivecards';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface AdaptiveCardDesignerProps {
  botToken: string;
  selectedSpaceId: string;
  spaces: Array<{ id: string; title: string }>;
  onSelectSpace: (spaceId: string) => void;
}

interface CardElement {
  id: string;
  type: 'TextBlock' | 'Image' | 'Input.Text' | 'Input.Number' | 'Input.Date' | 'Input.Time' | 'Input.Toggle' | 'Input.ChoiceSet' | 'ColumnSet' | 'Container' | 'FactSet';
  text?: string;
  url?: string;
  placeholder?: string;
  label?: string;
  size?: string;
  weight?: string;
  color?: string;
  choices?: string;
  min?: string;
  max?: string;
  isMultiline?: boolean;
  spacing?: string;
  separator?: boolean;
  horizontalAlignment?: string;
  columns?: CardElement[];
  children?: CardElement[];
  facts?: Array<{ title: string; value: string }>;
  isMultiSelect?: boolean;
  style?: string;
  height?: string;
}

interface CardAction {
  id: string;
  type: 'Action.Submit' | 'Action.OpenUrl' | 'Action.ShowCard';
  title: string;
  url?: string;
  card?: any;
}

interface DragItem {
  type: string;
  elementType?: CardElement['type'];
  index?: number;
  id?: string;
}

const templates = {
  blank: {
    name: 'Blank Card',
    card: {
      type: 'AdaptiveCard',
      version: '1.3',
      body: []
    }
  },
  announcement: {
    name: 'Announcement',
    card: {
      type: 'AdaptiveCard',
      version: '1.3',
      body: [
        {
          type: 'Container',
          items: [
            {
              type: 'TextBlock',
              text: 'Important Announcement',
              size: 'Large',
              weight: 'Bolder',
              color: 'Accent'
            },
            {
              type: 'TextBlock',
              text: 'Your announcement message goes here. You can customize this text to share important information with your team.',
              wrap: true,
              spacing: 'Small'
            }
          ]
        }
      ]
    }
  },
  poll: {
    name: 'Quick Poll',
    card: {
      type: 'AdaptiveCard',
      version: '1.3',
      body: [
        {
          type: 'TextBlock',
          text: 'Quick Poll',
          size: 'Large',
          weight: 'Bolder'
        },
        {
          type: 'TextBlock',
          text: 'What is your preference?',
          wrap: true
        },
        {
          type: 'Input.ChoiceSet',
          id: 'poll',
          style: 'expanded',
          choices: [
            { title: 'Option 1', value: 'option1' },
            { title: 'Option 2', value: 'option2' },
            { title: 'Option 3', value: 'option3' }
          ]
        }
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: 'Submit'
        }
      ]
    }
  },
  feedback: {
    name: 'Feedback Form',
    card: {
      type: 'AdaptiveCard',
      version: '1.3',
      body: [
        {
          type: 'TextBlock',
          text: 'We value your feedback',
          size: 'Large',
          weight: 'Bolder'
        },
        {
          type: 'Input.Text',
          id: 'name',
          placeholder: 'Your name',
          label: 'Name'
        },
        {
          type: 'Input.Text',
          id: 'feedback',
          placeholder: 'Share your thoughts...',
          isMultiline: true,
          label: 'Feedback'
        }
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: 'Send Feedback'
        }
      ]
    }
  },
  twoColumn: {
    name: 'Two Column Layout',
    card: {
      type: 'AdaptiveCard',
      version: '1.3',
      body: [
        {
          type: 'TextBlock',
          text: 'Two Column Layout',
          size: 'Large',
          weight: 'Bolder'
        },
        {
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: 'Left Column',
                  weight: 'Bolder'
                },
                {
                  type: 'TextBlock',
                  text: 'Content for the left side',
                  wrap: true
                }
              ]
            },
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: 'Right Column',
                  weight: 'Bolder'
                },
                {
                  type: 'TextBlock',
                  text: 'Content for the right side',
                  wrap: true
                }
              ]
            }
          ]
        }
      ]
    }
  },
  contact: {
    name: 'Contact Card',
    card: {
      type: 'AdaptiveCard',
      version: '1.3',
      body: [
        {
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 'auto',
              items: [
                {
                  type: 'Image',
                  url: 'https://via.placeholder.com/80',
                  size: 'Medium',
                  style: 'Person'
                }
              ]
            },
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: 'John Doe',
                  size: 'Large',
                  weight: 'Bolder'
                },
                {
                  type: 'FactSet',
                  facts: [
                    { title: 'Email:', value: 'john@example.com' },
                    { title: 'Phone:', value: '+1 234 567 8900' },
                    { title: 'Location:', value: 'San Francisco, CA' }
                  ]
                }
              ]
            }
          ]
        }
      ],
      actions: [
        {
          type: 'Action.OpenUrl',
          title: 'Send Email',
          url: 'mailto:john@example.com'
        }
      ]
    }
  }
};

// Draggable Element Button Component
function DraggableElementButton({ 
  elementType, 
  icon, 
  label 
}: { 
  elementType: CardElement['type']; 
  icon: React.ReactNode; 
  label: string;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'new-element',
    item: { elementType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} className={isDragging ? 'opacity-50' : ''}>
      <Button
        variant="outline"
        size="sm"
        className="border-slate-700 bg-slate-800/30 text-slate-200 hover:bg-slate-800/50 hover:text-white cursor-move w-full"
      >
        {icon}
        {label}
      </Button>
    </div>
  );
}

// Drop Zone Component for Preview
function PreviewDropZone({ 
  onDrop,
  children 
}: { 
  onDrop: (elementType: CardElement['type']) => void;
  children: React.ReactNode;
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'new-element',
    drop: (item: { elementType: CardElement['type'] }) => {
      onDrop(item.elementType);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  return (
    <div 
      ref={drop}
      className={`relative transition-all ${
        isActive ? 'ring-4 ring-pink-500 ring-opacity-50' : ''
      }`}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-slate-900/90 px-6 py-3 rounded-lg border-2 border-pink-500 shadow-lg">
            <p className="text-white flex items-center gap-2">
              <Plus className="size-5" />
              Drop to add element to card
            </p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

function DraggableElement({ 
  element, 
  index, 
  moveElement, 
  updateElement, 
  removeElement,
  isNested = false
}: { 
  element: CardElement; 
  index: number; 
  moveElement: (dragIndex: number, hoverIndex: number) => void;
  updateElement: (id: string, updates: Partial<CardElement>) => void;
  removeElement: (id: string) => void;
  isNested?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'element',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { index: number; type: string }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveElement(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'element',
    item: () => {
      return { id: element.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'TextBlock': return <Type className="size-4" />;
      case 'Image': return <ImageIcon className="size-4" />;
      case 'Input.Text': return <Type className="size-4" />;
      case 'Input.Number': return <Hash className="size-4" />;
      case 'Input.Date': return <Calendar className="size-4" />;
      case 'Input.Time': return <Clock className="size-4" />;
      case 'Input.Toggle': return <Square className="size-4" />;
      case 'Input.ChoiceSet': return <List className="size-4" />;
      case 'ColumnSet': return <Columns className="size-4" />;
      case 'Container': return <Box className="size-4" />;
      case 'FactSet': return <Table className="size-4" />;
      default: return <Type className="size-4" />;
    }
  };

  return (
    <div 
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`bg-slate-800/50 border border-slate-700 rounded-lg ${isNested ? 'ml-4' : ''}`}
      data-handler-id={handlerId}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="cursor-move text-slate-500 hover:text-slate-300">
              <GripVertical className="size-4" />
            </div>
            <div className="text-pink-400 flex items-center gap-2">
              {getElementIcon(element.type)}
              <span className="text-sm">{element.type}</span>
            </div>
            {(element.type === 'Container' || element.type === 'ColumnSet') && (
              <Button
                onClick={() => setCollapsed(!collapsed)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {collapsed ? <ChevronRight className="size-3" /> : <ChevronDown className="size-3" />}
              </Button>
            )}
          </div>
          <Button
            onClick={() => removeElement(element.id)}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-950/30 h-8 w-8 p-0"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {!collapsed && (
          <div className="space-y-3 mt-3">
            {/* Common properties */}
            {(element.type !== 'FactSet' && element.type !== 'ColumnSet') && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-slate-200 text-xs">Spacing</Label>
                  <Select 
                    value={element.spacing || 'Default'} 
                    onValueChange={(value) => updateElement(element.id, { spacing: value })}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Small">Small</SelectItem>
                      <SelectItem value="Default">Default</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={element.separator || false}
                      onCheckedChange={(checked) => updateElement(element.id, { separator: checked })}
                    />
                    <Label className="text-slate-200 text-xs">Separator</Label>
                  </div>
                </div>
              </div>
            )}

            {/* TextBlock specific */}
            {element.type === 'TextBlock' && (
              <>
                <div>
                  <Label className="text-slate-200 text-xs">Text</Label>
                  <Textarea
                    value={element.text}
                    onChange={(e) => updateElement(element.id, { text: e.target.value })}
                    className="bg-slate-900/50 border-slate-700 text-white text-xs min-h-[60px]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-slate-200 text-xs">Size</Label>
                    <Select value={element.size || 'Default'} onValueChange={(value) => updateElement(element.id, { size: value })}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small">Small</SelectItem>
                        <SelectItem value="Default">Default</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Large">Large</SelectItem>
                        <SelectItem value="ExtraLarge">X-Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-200 text-xs">Weight</Label>
                    <Select value={element.weight || 'Default'} onValueChange={(value) => updateElement(element.id, { weight: value })}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lighter">Lighter</SelectItem>
                        <SelectItem value="Default">Default</SelectItem>
                        <SelectItem value="Bolder">Bolder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-200 text-xs">Color</Label>
                    <Select value={element.color || 'Default'} onValueChange={(value) => updateElement(element.id, { color: value })}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Default">Default</SelectItem>
                        <SelectItem value="Accent">Accent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Warning">Warning</SelectItem>
                        <SelectItem value="Attention">Attention</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-200 text-xs">Alignment</Label>
                  <Select value={element.horizontalAlignment || 'Left'} onValueChange={(value) => updateElement(element.id, { horizontalAlignment: value })}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Left">Left</SelectItem>
                      <SelectItem value="Center">Center</SelectItem>
                      <SelectItem value="Right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Image specific */}
            {element.type === 'Image' && (
              <>
                <div>
                  <Label className="text-slate-200 text-xs">Image URL</Label>
                  <Input
                    value={element.url}
                    onChange={(e) => updateElement(element.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-200 text-xs">Size</Label>
                    <Select value={element.size || 'Auto'} onValueChange={(value) => updateElement(element.id, { size: value })}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Auto">Auto</SelectItem>
                        <SelectItem value="Stretch">Stretch</SelectItem>
                        <SelectItem value="Small">Small</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-200 text-xs">Style</Label>
                    <Select value={element.style || 'Default'} onValueChange={(value) => updateElement(element.id, { style: value })}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Default">Default</SelectItem>
                        <SelectItem value="Person">Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Input.Text specific */}
            {element.type === 'Input.Text' && (
              <>
                <div>
                  <Label className="text-slate-200 text-xs">Label</Label>
                  <Input
                    value={element.label}
                    onChange={(e) => updateElement(element.id, { label: e.target.value })}
                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-slate-200 text-xs">Placeholder</Label>
                  <Input
                    value={element.placeholder}
                    onChange={(e) => updateElement(element.id, { placeholder: e.target.value })}
                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={element.isMultiline || false}
                    onCheckedChange={(checked) => updateElement(element.id, { isMultiline: checked })}
                  />
                  <Label className="text-slate-200 text-xs">Multiline</Label>
                </div>
              </>
            )}

            {/* Input.Number specific */}
            {element.type === 'Input.Number' && (
              <>
                <div>
                  <Label className="text-slate-200 text-xs">Label</Label>
                  <Input
                    value={element.label}
                    onChange={(e) => updateElement(element.id, { label: e.target.value })}
                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-200 text-xs">Min</Label>
                    <Input
                      type="number"
                      value={element.min}
                      onChange={(e) => updateElement(element.id, { min: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200 text-xs">Max</Label>
                    <Input
                      type="number"
                      value={element.max}
                      onChange={(e) => updateElement(element.id, { max: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Input.Date and Input.Time */}
            {(element.type === 'Input.Date' || element.type === 'Input.Time') && (
              <div>
                <Label className="text-slate-200 text-xs">Label</Label>
                <Input
                  value={element.label}
                  onChange={(e) => updateElement(element.id, { label: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                />
              </div>
            )}

            {/* Input.Toggle specific */}
            {element.type === 'Input.Toggle' && (
              <>
                <div>
                  <Label className="text-slate-200 text-xs">Title</Label>
                  <Input
                    value={element.text}
                    onChange={(e) => updateElement(element.id, { text: e.target.value })}
                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                  />
                </div>
              </>
            )}

            {/* Input.ChoiceSet specific */}
            {element.type === 'Input.ChoiceSet' && (
              <>
                <div>
                  <Label className="text-slate-200 text-xs">Label</Label>
                  <Input
                    value={element.label}
                    onChange={(e) => updateElement(element.id, { label: e.target.value })}
                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-slate-200 text-xs">Choices (comma-separated)</Label>
                  <Input
                    value={element.choices}
                    onChange={(e) => updateElement(element.id, { choices: e.target.value })}
                    placeholder="Option 1, Option 2, Option 3"
                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-200 text-xs">Style</Label>
                    <Select value={element.style || 'compact'} onValueChange={(value) => updateElement(element.id, { style: value })}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="expanded">Expanded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={element.isMultiSelect || false}
                        onCheckedChange={(checked) => updateElement(element.id, { isMultiSelect: checked })}
                      />
                      <Label className="text-slate-200 text-xs">Multi-select</Label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* FactSet specific */}
            {element.type === 'FactSet' && (
              <div>
                <Label className="text-slate-200 text-xs">Facts (Title:Value pairs, one per line)</Label>
                <Textarea
                  value={element.facts?.map(f => `${f.title}:${f.value}`).join('\n') || ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    const facts = lines.map(line => {
                      const [title, ...valueParts] = line.split(':');
                      return { title: title || '', value: valueParts.join(':') || '' };
                    });
                    updateElement(element.id, { facts });
                  }}
                  placeholder="Email:john@example.com&#10;Phone:+1 234 567 8900"
                  className="bg-slate-900/50 border-slate-700 text-white text-xs min-h-[80px]"
                />
              </div>
            )}

            {/* ColumnSet specific */}
            {element.type === 'ColumnSet' && (
              <div>
                <Label className="text-slate-200 text-xs">Column Contents (one per line)</Label>
                <Textarea
                  value={element.columns?.map(col => col.text || '').join('\n') || ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim());
                    const columns = lines.map((text, i) => ({
                      id: element.columns?.[i]?.id || `${element.id}-col${i}`,
                      type: 'TextBlock' as const,
                      text: text.trim(),
                      children: []
                    }));
                    updateElement(element.id, { columns });
                  }}
                  placeholder="Column 1 text&#10;Column 2 text&#10;Column 3 text"
                  className="bg-slate-900/50 border-slate-700 text-white text-xs min-h-[80px]"
                />
                <p className="text-xs text-slate-400 mt-1">Each line creates a new column</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionEditor({ 
  actions, 
  setActions,
  onActionsChange
}: { 
  actions: CardAction[]; 
  setActions: (actions: CardAction[]) => void;
  onActionsChange: (actions: CardAction[]) => void;
}) {
  const addAction = (type: CardAction['type']) => {
    const newAction: CardAction = {
      id: Date.now().toString(),
      type,
      title: type === 'Action.Submit' ? 'Submit' : type === 'Action.OpenUrl' ? 'Open Link' : 'Show Card',
      url: type === 'Action.OpenUrl' ? 'https://example.com' : undefined
    };
    const newActions = [...actions, newAction];
    setActions(newActions);
    onActionsChange(newActions);
  };

  const updateAction = (id: string, updates: Partial<CardAction>) => {
    const updatedActions = actions.map(a => a.id === id ? { ...a, ...updates } : a);
    setActions(updatedActions);
    onActionsChange(updatedActions);
  };

  const removeAction = (id: string) => {
    const updatedActions = actions.filter(a => a.id !== id);
    setActions(updatedActions);
    onActionsChange(updatedActions);
  };

  return (
    <div className="bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-pink-950/50 rounded-lg p-4 border border-pink-500/20 shadow-lg shadow-blue-500/10">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-2 rounded-lg shadow-lg shadow-blue-500/30">
          <MousePointer className="size-5 text-white" />
        </div>
        <div>
          <h3 className="text-white">Actions</h3>
          <p className="text-sm text-slate-300">Add buttons to your card</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <Button 
          onClick={() => addAction('Action.Submit')}
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/30 text-slate-200 hover:bg-slate-800/50 hover:text-white"
        >
          Submit
        </Button>
        <Button 
          onClick={() => addAction('Action.OpenUrl')}
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/30 text-slate-200 hover:bg-slate-800/50 hover:text-white"
        >
          Open URL
        </Button>
        <Button 
          onClick={() => addAction('Action.ShowCard')}
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/30 text-slate-200 hover:bg-slate-800/50 hover:text-white"
        >
          Show Card
        </Button>
      </div>

      {actions.length > 0 && (
        <div className="space-y-2">
          {actions.map((action) => (
            <div key={action.id} className="bg-slate-800/50 border border-slate-700 rounded p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link className="size-4 text-pink-400" />
                  <span className="text-xs text-pink-400">{action.type}</span>
                </div>
                <Button
                  onClick={() => removeAction(action.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-950/30 h-6 w-6 p-0"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
              <div>
                <Label className="text-slate-200 text-xs">Button Title</Label>
                <Input
                  value={action.title}
                  onChange={(e) => updateAction(action.id, { title: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                />
              </div>
              {action.type === 'Action.OpenUrl' && (
                <div>
                  <Label className="text-slate-200 text-xs">URL</Label>
                  <Input
                    value={action.url}
                    onChange={(e) => updateAction(action.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdaptiveCardDesigner({ 
  botToken, 
  selectedSpaceId, 
  spaces,
  onSelectSpace 
}: AdaptiveCardDesignerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templates>('announcement');
  const [cardJson, setCardJson] = useState(JSON.stringify(templates.announcement.card, null, 2));
  const [elements, setElements] = useState<CardElement[]>([]);
  const [actions, setActions] = useState<CardAction[]>([]);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderPreview();
  }, [cardJson]);

  const renderPreview = () => {
    if (!previewRef.current) return;
    
    try {
      const adaptiveCard = new AdaptiveCards.AdaptiveCard();
      adaptiveCard.parse(JSON.parse(cardJson));
      
      const renderedCard = adaptiveCard.render();
      previewRef.current.innerHTML = '';
      
      if (renderedCard) {
        previewRef.current.appendChild(renderedCard);
      }
    } catch (error) {
      console.error('Error rendering card:', error);
      previewRef.current.innerHTML = '<div style="color: #ef4444; padding: 1rem;">Invalid card JSON</div>';
    }
  };

  const handleTemplateChange = (template: keyof typeof templates) => {
    setSelectedTemplate(template);
    setCardJson(JSON.stringify(templates[template].card, null, 2));
    setElements([]);
    setActions([]);
  };

  const addElement = (type: CardElement['type']) => {
    const newElement: CardElement = {
      id: Date.now().toString(),
      type,
      text: type === 'TextBlock' ? 'Your text here' : type === 'Input.Toggle' ? 'Toggle option' : undefined,
      url: type === 'Image' ? 'https://via.placeholder.com/400x200' : undefined,
      placeholder: type.startsWith('Input.') && type !== 'Input.Toggle' && type !== 'Input.ChoiceSet' ? 'Enter value...' : undefined,
      label: type.startsWith('Input.') && type !== 'Input.Toggle' ? 'Label' : undefined,
      size: type === 'TextBlock' ? 'Default' : type === 'Image' ? 'Auto' : undefined,
      weight: type === 'TextBlock' ? 'Default' : undefined,
      choices: type === 'Input.ChoiceSet' ? 'Option 1,Option 2,Option 3' : undefined,
      facts: type === 'FactSet' ? [{ title: 'Title', value: 'Value' }] : undefined,
      columns: type === 'ColumnSet' ? [
        { id: Date.now().toString() + '-col1', type: 'TextBlock', text: 'Column 1', children: [] },
        { id: Date.now().toString() + '-col2', type: 'TextBlock', text: 'Column 2', children: [] }
      ] : undefined,
      children: type === 'Container' ? [] : undefined,
      style: type === 'Input.ChoiceSet' ? 'compact' : undefined,
      spacing: 'Default'
    };
    
    setElements([...elements, newElement]);
    updateCardFromElements([...elements, newElement], actions);
  };

  const moveElement = (dragIndex: number, hoverIndex: number) => {
    const dragElement = elements[dragIndex];
    const newElements = [...elements];
    newElements.splice(dragIndex, 1);
    newElements.splice(hoverIndex, 0, dragElement);
    setElements(newElements);
    updateCardFromElements(newElements, actions);
  };

  const updateElement = (id: string, updates: Partial<CardElement>) => {
    const updated = elements.map(el => el.id === id ? { ...el, ...updates } : el);
    setElements(updated);
    updateCardFromElements(updated, actions);
  };

  const removeElement = (id: string) => {
    const updated = elements.filter(el => el.id !== id);
    setElements(updated);
    updateCardFromElements(updated, actions);
  };

  const handleActionsUpdate = (newActions: CardAction[]) => {
    updateCardFromElements(elements, newActions);
  };

  const updateCardFromElements = (els: CardElement[], acts: CardAction[]) => {
    try {
      const body = els.map(el => {
        const element: any = { type: el.type };
        
        // Common properties
        if (el.spacing && el.spacing !== 'Default') element.spacing = el.spacing;
        if (el.separator) element.separator = true;
        if (el.horizontalAlignment && el.horizontalAlignment !== 'Left') element.horizontalAlignment = el.horizontalAlignment;
        
        if (el.type === 'TextBlock') {
          element.text = el.text;
          element.wrap = true;
          if (el.size && el.size !== 'Default') element.size = el.size;
          if (el.weight && el.weight !== 'Default') element.weight = el.weight;
          if (el.color && el.color !== 'Default') element.color = el.color;
        } else if (el.type === 'Image') {
          element.url = el.url;
          if (el.size && el.size !== 'Auto') element.size = el.size;
          if (el.style && el.style !== 'Default') element.style = el.style;
        } else if (el.type === 'Input.Text') {
          element.id = el.id;
          if (el.placeholder) element.placeholder = el.placeholder;
          if (el.label) element.label = el.label;
          if (el.isMultiline) element.isMultiline = true;
        } else if (el.type === 'Input.Number') {
          element.id = el.id;
          if (el.label) element.label = el.label;
          if (el.min) element.min = parseFloat(el.min);
          if (el.max) element.max = parseFloat(el.max);
        } else if (el.type === 'Input.Date') {
          element.id = el.id;
          if (el.label) element.label = el.label;
        } else if (el.type === 'Input.Time') {
          element.id = el.id;
          if (el.label) element.label = el.label;
        } else if (el.type === 'Input.Toggle') {
          element.id = el.id;
          element.title = el.text || 'Toggle option';
        } else if (el.type === 'Input.ChoiceSet') {
          element.id = el.id;
          if (el.label) element.label = el.label;
          element.style = el.style || 'compact';
          if (el.isMultiSelect) element.isMultiSelect = true;
          const choiceTexts = el.choices?.split(',') || [];
          element.choices = choiceTexts.map((text, i) => ({
            title: text.trim(),
            value: `choice${i + 1}`
          }));
        } else if (el.type === 'Container') {
          element.items = el.children?.map(child => ({ type: 'TextBlock', text: 'Container item', wrap: true })) || [];
        } else if (el.type === 'FactSet') {
          element.facts = el.facts || [];
        } else if (el.type === 'ColumnSet') {
          // Create columns from the columns array
          element.columns = (el.columns || []).map(col => ({
            type: 'Column',
            width: 'stretch',
            items: [
              {
                type: 'TextBlock',
                text: col.text || 'Column content',
                wrap: true
              }
            ]
          }));
        }
        
        return element;
      });

      const cardActions = acts.map(act => {
        const action: any = { type: act.type, title: act.title };
        if (act.type === 'Action.OpenUrl') {
          action.url = act.url;
        }
        return action;
      });

      const card = {
        type: 'AdaptiveCard',
        version: '1.3',
        body,
        ...(cardActions.length > 0 && { actions: cardActions })
      };
      
      setCardJson(JSON.stringify(card, null, 2));
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleSendCard = async () => {
    if (!botToken) {
      toast.error('Please configure your bot token first');
      return;
    }

    if (!selectedSpaceId) {
      toast.error('Please select a space');
      return;
    }

    setSending(true);
    try {
      const cardObject = JSON.parse(cardJson);
      
      const response = await fetch('https://webexapis.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: selectedSpaceId,
          text: 'Adaptive Card',
          attachments: [
            {
              contentType: 'application/vnd.microsoft.card.adaptive',
              content: cardObject
            }
          ]
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send card');
      }

      toast.success('Adaptive card sent successfully!');
    } catch (error) {
      toast.error(`Failed to send card: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(cardJson);
    setCopied(true);
    toast.success('JSON copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedSpace = spaces.find(s => s.id === selectedSpaceId);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Designer Panel */}
          <div className="space-y-6">
            <Card className="border-pink-500/20 bg-slate-900/50 backdrop-blur shadow-lg shadow-pink-500/5">
              <CardHeader>
                <CardTitle className="text-white">Card Designer</CardTitle>
                <CardDescription className="text-slate-300">
                  Build your adaptive card with templates or custom elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="builder" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                    <TabsTrigger value="builder" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:via-purple-600 data-[state=active]:to-blue-600 text-slate-200 data-[state=active]:text-white">
                      <Palette className="size-4 mr-2" />
                      Builder
                    </TabsTrigger>
                    <TabsTrigger value="json" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:via-purple-600 data-[state=active]:to-blue-600 text-slate-200 data-[state=active]:text-white">
                      <Code className="size-4 mr-2" />
                      JSON
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="builder" className="space-y-4 mt-4">
                    {/* Templates */}
                    <div className="bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-pink-950/50 rounded-lg p-4 border border-pink-500/20 shadow-lg shadow-pink-500/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-2 rounded-lg shadow-lg shadow-pink-500/30">
                          <Sparkles className="size-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white">Start with Template</h3>
                          <p className="text-sm text-slate-300">Choose a pre-built card template</p>
                        </div>
                      </div>
                      <Select value={selectedTemplate} onValueChange={(value) => handleTemplateChange(value as keyof typeof templates)}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(templates).map(([key, template]) => (
                            <SelectItem key={key} value={key}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Add Elements */}
                    <div className="bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-pink-950/50 rounded-lg p-4 border border-pink-500/20 shadow-lg shadow-blue-500/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-2 rounded-lg shadow-lg shadow-blue-500/30">
                          <Plus className="size-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white">Add Elements</h3>
                          <p className="text-sm text-slate-300">Build your custom card</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <DraggableElementButton elementType="TextBlock" icon={<Type className="size-3 mr-1" />} label="Text" />
                          <DraggableElementButton elementType="Image" icon={<ImageIcon className="size-3 mr-1" />} label="Image" />
                          <DraggableElementButton elementType="FactSet" icon={<Table className="size-3 mr-1" />} label="Facts" />
                        </div>
                        <div className="text-xs text-slate-400 mt-2">Inputs</div>
                        <div className="grid grid-cols-3 gap-2">
                          <DraggableElementButton elementType="Input.Text" icon={<Type className="size-3 mr-1" />} label="Text" />
                          <DraggableElementButton elementType="Input.Number" icon={<Hash className="size-3 mr-1" />} label="Number" />
                          <DraggableElementButton elementType="Input.Date" icon={<Calendar className="size-3 mr-1" />} label="Date" />
                          <DraggableElementButton elementType="Input.Time" icon={<Clock className="size-3 mr-1" />} label="Time" />
                          <DraggableElementButton elementType="Input.Toggle" icon={<Square className="size-3 mr-1" />} label="Toggle" />
                          <DraggableElementButton elementType="Input.ChoiceSet" icon={<List className="size-3 mr-1" />} label="Choices" />
                        </div>
                        <div className="text-xs text-slate-400 mt-2">Layout</div>
                        <div className="grid grid-cols-3 gap-2">
                          <DraggableElementButton elementType="ColumnSet" icon={<Columns className="size-3 mr-1" />} label="Columns" />
                          <DraggableElementButton elementType="Container" icon={<Box className="size-3 mr-1" />} label="Container" />
                        </div>
                      </div>
                    </div>

                    {/* Element Editor */}
                    {elements.length > 0 && (
                      <div className="bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-pink-950/50 rounded-lg p-4 border border-pink-500/20 shadow-lg shadow-pink-500/10">
                        <h3 className="text-white mb-3">Card Elements (Drag to reorder)</h3>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-2 pr-4">
                            {elements.map((element, index) => (
                              <DraggableElement
                                key={element.id}
                                element={element}
                                index={index}
                                moveElement={moveElement}
                                updateElement={updateElement}
                                removeElement={removeElement}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Actions */}
                    <ActionEditor actions={actions} setActions={setActions} onActionsChange={handleActionsUpdate} />
                  </TabsContent>

                  <TabsContent value="json" className="mt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-slate-200">Card JSON</Label>
                        <Button
                          onClick={copyJson}
                          variant="outline"
                          size="sm"
                          className="border-slate-700 bg-slate-800/30 text-slate-200 hover:bg-slate-800/50"
                        >
                          {copied ? (
                            <>
                              <CheckCircle2 className="size-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="size-4 mr-2" />
                              Copy JSON
                            </>
                          )}
                        </Button>
                      </div>
                      <Textarea
                        value={cardJson}
                        onChange={(e) => setCardJson(e.target.value)}
                        rows={24}
                        className="font-mono text-sm bg-slate-900/50 border-slate-700 text-white"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Send Card */}
            <Card className="border-pink-500/20 bg-slate-900/50 backdrop-blur shadow-lg shadow-pink-500/5">
              <CardHeader>
                <CardTitle className="text-white">Send Card</CardTitle>
                <CardDescription className="text-slate-300">
                  Send your adaptive card to a Webex space
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-200">Select Space</Label>
                  <Select 
                    value={selectedSpaceId} 
                    onValueChange={onSelectSpace}
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

                {selectedSpaceId && (
                  <div className="flex items-center gap-2 text-green-400 bg-green-950/30 px-3 py-2 rounded border border-green-500/30">
                    <CheckCircle2 className="size-4" />
                    <span className="text-sm">
                      Sending to: <strong className="text-green-200">{selectedSpace?.title}</strong>
                    </span>
                  </div>
                )}

                <Button 
                  onClick={handleSendCard}
                  disabled={!botToken || !selectedSpaceId || sending}
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
                      Send Adaptive Card
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div>
            <Card className="border-pink-500/20 bg-slate-900/50 backdrop-blur shadow-lg shadow-pink-500/5 sticky top-6">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-2 rounded-lg shadow-lg shadow-pink-500/30">
                    <Eye className="size-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Live Preview</CardTitle>
                    <CardDescription className="text-slate-300">
                      See how your card will look in Webex
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  <PreviewDropZone onDrop={addElement}>
                    <div className="bg-white rounded-lg p-6 min-h-[400px]">
                      <div ref={previewRef} className="adaptive-card-preview" />
                    </div>
                  </PreviewDropZone>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}