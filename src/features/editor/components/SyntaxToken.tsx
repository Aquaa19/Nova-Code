import React from 'react';
import { CodeText } from '../../../components/typography/CodeText';

interface SyntaxTokenProps {
  text: string;
  type: 'keyword' | 'string' | 'number' | 'function' | 'comment' | 'operator' | 'default';
}

export const SyntaxToken: React.FC<SyntaxTokenProps> = ({ text, type }) => {
  // Simple static placeholder colors for syntax tokens
  const getColor = () => {
    switch (type) {
      case 'keyword': return '#cf5cff'; // secondaryContainer
      case 'string': return '#52ffac'; // tertiaryFixed
      case 'number': return '#f8d8ff'; // secondaryFixed
      case 'function': return '#00dbe9'; // primaryFixedDim
      case 'comment': return '#849495'; // outline
      case 'operator': return '#7df4ff'; // primaryFixed
      case 'default':
      default:
        return '#e1e1ef'; // onSurface
    }
  };

  return <CodeText color={getColor()}>{text}</CodeText>;
};
