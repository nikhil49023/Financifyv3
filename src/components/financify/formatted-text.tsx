
'use client';

import React from 'react';

type FormattedTextProps = {
  text: string;
};

export function FormattedText({ text }: FormattedTextProps) {
  if (typeof text !== 'string') {
    if (text) {
      console.warn('FormattedText component received a non-string prop:', text);
    }
    return null;
  }

  // Enhanced Regex to find **bold text**, [placeholders], and URLs.
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]|https?:\/\/[^\s]+)/g).filter(Boolean);

  const formattedParts = parts.map((part, index) => {
    // Check for bold format: **...**
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-foreground">
          {boldText}
        </strong>
      );
    }

    // Check for placeholder format: [...]
    if (part.startsWith('[') && part.endsWith(']')) {
      const varText = part.slice(1, -1);
      return (
        <span key={index} className="text-red-500 font-bold">
          [{varText}]
        </span>
      );
    }

    // Check if the part is a URL
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80 break-words"
        >
          {part}
        </a>
      );
    }

    // Handle newline characters and render them as <br>
    const lines = part.split('\n').map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {line}
        {lineIndex < part.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));

    return <React.Fragment key={index}>{lines}</React.Fragment>;
  });

  return (
    <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
      {formattedParts}
    </div>
  );
}
