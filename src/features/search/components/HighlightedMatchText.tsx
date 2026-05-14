import React from 'react';
import { AppText } from '../../../components/typography/AppText';
import { theme } from '../../../theme';

interface HighlightedMatchTextProps {
  text: string;
  query: string;
}

export const HighlightedMatchText: React.FC<HighlightedMatchTextProps> = ({ text, query }) => {
  if (!query) {
    return <AppText variant="bodyMd">{text}</AppText>;
  }

  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return (
    <AppText variant="bodyMd">
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === query.toLowerCase();
        return (
          <AppText
            key={index}
            variant="bodyMd"
            color={isMatch ? theme.colors.primaryFixed : theme.colors.onSurface}
            style={isMatch ? { backgroundColor: 'rgba(0, 240, 255, 0.2)' } : undefined}
          >
            {part}
          </AppText>
        );
      })}
    </AppText>
  );
};
