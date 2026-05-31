"use client";

interface Props {
  spec: string;
  isStreaming?: boolean;
  isTruncated?: boolean;
}

export default function SpecViewer({ spec, isTruncated = false }: Props) {
  const sections = spec.split(/^(#{1,3} .+)/m).filter(Boolean);

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white overflow-hidden"
      aria-label="Especificación técnica generada"
    >
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs font-medium text-gray-500">spec.md</span>
        {isTruncated && (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            ⚠ Spec incompleta
          </span>
        )}
      </div>

      <div className="prose prose-sm max-w-none p-6 overflow-y-auto max-h-[60vh]">
        {sections.map((section, i) => {
          if (section.startsWith("# ")) {
            return (
              <h1 key={i} className="text-xl font-bold text-gray-900 mb-4">
                {section.replace(/^# /, "")}
              </h1>
            );
          }
          if (section.startsWith("## ")) {
            return (
              <h2
                key={i}
                className="text-base font-semibold text-gray-800 mt-6 mb-2 border-b border-gray-100 pb-1"
              >
                {section.replace(/^## /, "")}
              </h2>
            );
          }
          if (section.startsWith("### ")) {
            return (
              <h3
                key={i}
                className="text-sm font-semibold text-gray-700 mt-4 mb-1"
              >
                {section.replace(/^### /, "")}
              </h3>
            );
          }

          return (
            <div key={i} className="text-sm text-gray-700 leading-relaxed">
              {renderMarkdownBlock(section)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderMarkdownBlock(text: string) {
  const lines = text.split("\n");

  return lines.map((line, i) => {
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <li key={i} className="ml-4 list-disc text-gray-700">
          {line.slice(2)}
        </li>
      );
    }
    if (line.match(/^\d+\. /)) {
      return (
        <li key={i} className="ml-4 list-decimal text-gray-700">
          {line.replace(/^\d+\. /, "")}
        </li>
      );
    }
    if (line.startsWith("```")) {
      return null;
    }
    if (line.startsWith("|")) {
      return (
        <p key={i} className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-0.5">
          {line}
        </p>
      );
    }
    if (line.trim() === "") {
      return <br key={i} />;
    }
    return (
      <p key={i} className="mb-1">
        {line}
      </p>
    );
  });
}
