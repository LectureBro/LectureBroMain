import React, { useState } from 'react';
import { Switch } from './components/ui/switch';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';

const App: React.FC = () => {
  const [text, setText] = useState(''); // This will later hold speech detection text
  const [scrollHeight, setScrollHeight] = useState(0);

  const handleSwitchChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const target = event.target as HTMLInputElement;
    console.log('Switch toggled:', target.checked);
  };

  return (
    <div style={{ width: '500px', height: '700px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'flex-end' }}>
        <Switch onChange={handleSwitchChange} />
      </div>
      <ScrollArea 
        style={{ flex: 1, overflowY: 'auto' }} 
        onScroll={(e: React.UIEvent<HTMLDivElement>) => setScrollHeight(e.currentTarget.scrollHeight)}
      >
        <div style={{ padding: '10px' }}>
          {text || 'Speech detected text will appear here...'}
        </div>
      </ScrollArea>
      <Separator />
      <div style={{ padding: '10px' }}>
        {/* Bottom section content can go here */}
      </div>
    </div>
  );
};

export default App;
