"use client";

interface Props {
text?: string;
}

export default function AnnouncementBar({ text }: Props) {
const messages = text
  ? [text, text] // usa el texto del admin
  : [
      "ENVÍOS GRATIS DESDE $250.000",
      "UNIQUE VIBES BLACK COLLECTIONS",
    ];

return (
  <div className="bg-noir-black text-white py-2 overflow-hidden">
    <div className="marquee-wrapper">
      <div className="marquee-content">
        {[...messages, ...messages].map((msg, i) => (
          <span key={i} className="text-xs font-medium tracking-widest uppercase mx-8">
            {msg}
            <span className="mx-4 opacity-40">·</span>
          </span>
        ))}
      </div>
    </div>
  </div>
);
}