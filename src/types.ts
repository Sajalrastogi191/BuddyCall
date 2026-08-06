export interface User {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  from: string;
  fromName: string;
  text: string;
  timestamp: number;
  mine: boolean;
}

export type Screen = 'setup' | 'people' | 'friends' | 'chat' | 'call';
