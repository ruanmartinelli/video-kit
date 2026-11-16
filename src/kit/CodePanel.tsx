import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import json from "shiki/langs/json.mjs";
import python from "shiki/langs/python.mjs";
import sql from "shiki/langs/sql.mjs";
import typescript from "shiki/langs/typescript.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import vesper from "shiki/themes/vesper.mjs";
import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

const highlighter = createHighlighterCoreSync({
  themes: [vesper, githubLight],
  langs: [typescript, python, bash, json, sql],
  engine: createJavaScriptRegexEngine(),
});

export const codePanelSchema = z.object({
  code: z.string().describe("Keep it under ~10 short lines; it has to be read in seconds."),
  lang: z.enum(["typescript", "python", "bash", "json", "sql"]).default("typescript"),
  title: z.string().optional(),
  highlight: z.array(z.number().int()).default([]).describe("1-based lines to spotlight. The rest dim."),
  side: z.enum(["left", "right"]).default("right").describe("Pair with the CameraRig shot's `shift` to move the 3D subject to the other side."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type CodePanelProps = z.input<typeof codePanelSchema>;

/** Highlighted code on a flat card over the scene. Goes in World's `overlay`. */
export const CodePanel = (props: CodePanelProps) => {
  const { code, lang, title, highlight, side, appear } = codePanelSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  const lines = highlighter.codeToTokensBase(code.trim(), { lang, theme: theme.code });
  const slide = (1 - appear) * (side === "right" ? 60 : -60);

  return (
    <div
      style={{
        position: "absolute",
        top: "44%",
        [side]: 96,
        transform: `translate(${slide}px, -50%)`,
        opacity: appear,
        padding: "30px 0",
        borderRadius: 14,
        background: theme.panel,
        border: `2px solid ${theme.panelBorder}`,
        fontFamily: theme.mono,
        fontWeight: 500,
        fontSize: 29,
        lineHeight: 1.65,
      }}
    >
      {title ? (
        <div style={{ padding: "0 38px 16px", fontFamily: theme.sans, fontSize: 24, color: theme.textDim }}>{title}</div>
      ) : null}
      {lines.map((tokens, index) => {
        const lit = highlight.includes(index + 1);
        return (
          <div
            key={index}
            style={{
              padding: "0 38px",
              whiteSpace: "pre",
              minHeight: "1.65em",
              opacity: highlight.length === 0 || lit ? 1 : 0.32,
              background: lit ? `color-mix(in srgb, ${theme.accent} 12%, transparent)` : "transparent",
              boxShadow: lit ? `inset 4px 0 0 ${theme.accent}` : "none",
            }}
          >
            {tokens.map((token) => (
              <span key={token.offset} style={{ color: token.color }}>
                {token.content}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
};
