export interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
}

export interface FormattedSegment {
  text: string;
  format: TextFormat;
}

export const textFormatService = {
  applyFormat(
    text: string,
    selection: { start: number; end: number },
    formatType: keyof TextFormat,
    value: boolean | string = true
  ): string {
    if (selection.start === selection.end) {
      return text;
    }

    const before = text.substring(0, selection.start);
    const selected = text.substring(selection.start, selection.end);
    const after = text.substring(selection.end);

    let formatted = selected;

    switch (formatType) {
      case 'bold':
        formatted = value ? `**${selected}**` : selected.replace(/\*\*/g, '');
        break;
      case 'italic':
        formatted = value ? `*${selected}*` : selected.replace(/\*/g, '');
        break;
      case 'underline':
        formatted = value ? `__${selected}__` : selected.replace(/__/g, '');
        break;
      case 'strikethrough':
        formatted = value ? `~~${selected}~~` : selected.replace(/~~/g, '');
        break;
      case 'color':
        formatted = `{${value}}${selected}{/${value}}`;
        break;
    }

    return before + formatted + after;
  },

  parseFormattedText(text: string): FormattedSegment[] {
    const segments: FormattedSegment[] = [];
    let currentText = '';
    let currentFormat: TextFormat = {};
    let i = 0;

    const pushSegment = () => {
      if (currentText) {
        segments.push({
          text: currentText,
          format: { ...currentFormat },
        });
        currentText = '';
      }
    };

    while (i < text.length) {
      // Bold: **text**
      if (text.substring(i, i + 2) === '**') {
        pushSegment();
        currentFormat.bold = !currentFormat.bold;
        i += 2;
        continue;
      }

      // Strikethrough: ~~text~~
      if (text.substring(i, i + 2) === '~~') {
        pushSegment();
        currentFormat.strikethrough = !currentFormat.strikethrough;
        i += 2;
        continue;
      }

      // Underline: __text__
      if (text.substring(i, i + 2) === '__') {
        pushSegment();
        currentFormat.underline = !currentFormat.underline;
        i += 2;
        continue;
      }

      // Color: {color}text{/color}
      const colorMatch = text.substring(i).match(/^\{([^}]+)\}/);
      if (colorMatch) {
        pushSegment();
        currentFormat.color = colorMatch[1];
        i += colorMatch[0].length;
        continue;
      }

      const colorEndMatch = text.substring(i).match(/^\{\/([^}]+)\}/);
      if (colorEndMatch) {
        pushSegment();
        currentFormat.color = undefined;
        i += colorEndMatch[0].length;
        continue;
      }

      // Italic: *text* (but not **)
      if (text[i] === '*' && text[i + 1] !== '*') {
        pushSegment();
        currentFormat.italic = !currentFormat.italic;
        i += 1;
        continue;
      }

      currentText += text[i];
      i++;
    }

    pushSegment();
    return segments;
  },

  removeAllFormatting(text: string): string {
    return text
      .replace(/\*\*/g, '')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\{[^}]+\}/g, '')
      .replace(/\{\/[^}]+\}/g, '')
      .replace(/\*/g, '');
  },

  getActiveFormats(text: string, cursorPosition: number): Set<string> {
    const formats = new Set<string>();
    
    // Check for formats around cursor
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);

    // Count markers before cursor
    const boldBefore = (beforeCursor.match(/\*\*/g) || []).length;
    const italicBefore = (beforeCursor.match(/(?<!\*)\*(?!\*)/g) || []).length;
    const underlineBefore = (beforeCursor.match(/__/g) || []).length;
    const strikethroughBefore = (beforeCursor.match(/~~/g) || []).length;

    if (boldBefore % 2 === 1) formats.add('bold');
    if (italicBefore % 2 === 1) formats.add('italic');
    if (underlineBefore % 2 === 1) formats.add('underline');
    if (strikethroughBefore % 2 === 1) formats.add('strikethrough');

    return formats;
  },
};
