
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

  // Improved regex to handle nested structures better and avoid splitting by mistake
  const parts = text.split(/(\*\*.*?\*\*|VAR\{.*?\})/g).filter(Boolean);

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

    // Check for variable/placeholder format: VAR{...}
    if (part.startsWith('VAR{') && part.endsWith('}')) {
      const varText = part.slice('VAR{'.length, -1);
      return (
        <span key={index} className="text-red-500 font-bold">
          {varText}
        </span>
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
