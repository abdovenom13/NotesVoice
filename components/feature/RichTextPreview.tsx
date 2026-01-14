import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { textFormatService, FormattedSegment } from '@/services/textFormatService';

interface RichTextPreviewProps {
  text: string;
}

export function RichTextPreview({ text }: RichTextPreviewProps) {
  const segments = textFormatService.parseFormattedText(text);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {segments.map((segment: FormattedSegment, index: number) => {
          const segmentStyle: any = [styles.segment];

          if (segment.format.bold) {
            segmentStyle.push(styles.bold);
          }
          if (segment.format.italic) {
            segmentStyle.push(styles.italic);
          }
          if (segment.format.underline) {
            segmentStyle.push(styles.underline);
          }
          if (segment.format.strikethrough) {
            segmentStyle.push(styles.strikethrough);
          }
          if (segment.format.color) {
            segmentStyle.push({ color: segment.format.color });
          }

          return (
            <Text key={index} style={segmentStyle}>
              {segment.text}
            </Text>
          );
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },

  text: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
  },

  segment: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },

  bold: {
    fontWeight: theme.fontWeight.bold,
  },

  italic: {
    fontStyle: 'italic',
  },

  underline: {
    textDecorationLine: 'underline',
  },

  strikethrough: {
    textDecorationLine: 'line-through',
  },
});
