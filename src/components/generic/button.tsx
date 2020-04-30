import { h, Component } from "preact";

export function Button({ text, disabled, onClick, background, className }) {
  const cn = ["dib pa2 br2 b f6 ", className || ""].join(" ");
  if (disabled) {
    return <a className={cn + " bg-dark-gray gray"}>{text}</a>;
  }
  return (
    <a
      className={cn + " pointer grow"}
      style={{ background }}
      onClick={onClick}
    >
      {text}
    </a>
  );
}
