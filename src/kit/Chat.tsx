import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const chatMessageSchema = z.object({
  from: z.enum(["user", "assistant"]).describe("user sits on the right in a filled bubble, assistant on the left."),
  text: z.string().describe("What is said. Long text wraps inside the bubble; keep it to two or three lines."),
  typed: unitSchema
    .default(1)
    .describe("How much of the text is in: 0 hides the message, values in between show that share of its characters. Drive with ease()."),
  pending: z.boolean().default(false).describe("Three dots in place of the text, for an assistant that is still thinking."),
});

export const chatSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(4).describe("The conversation, oldest first. One to four messages."),
  side: z.enum(["left", "right"]).default("right").describe("Pair with the CameraRig shot's `shift` to move the 3D subject clear of it."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type ChatProps = z.input<typeof chatSchema>;

const WIDTH = 760;
const BUBBLE = 560;

const Dots = ({ color }: { color: string }) => (
  <span style={{ display: "flex", gap: 10, padding: "10px 4px" }}>
    {[0.35, 0.6, 0.85].map((opacity) => (
      <span key={opacity} style={{ width: 14, height: 14, borderRadius: 7, background: color, opacity }} />
    ))}
  </span>
);

/**
 * A conversation with an assistant as message bubbles that type themselves
 * out. Goes in World's `overlay`.
 */
export const Chat = (props: ChatProps) => {
  const { messages, side, appear } = chatSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  const slide = (1 - appear) * (side === "right" ? 60 : -60);

  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        [side]: 96,
        width: WIDTH,
        boxSizing: "border-box",
        padding: 26,
        borderRadius: 14,
        background: theme.panel,
        border: `2px solid ${theme.panelBorder}`,
        opacity: appear,
        transform: `translateX(${slide}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {messages.map((message, index) => {
        if (message.typed <= 0) {
          return null;
        }
        const user = message.from === "user";
        const typed = Math.round(message.typed * message.text.length);
        return (
          <div
            key={index}
            style={{
              alignSelf: user ? "flex-end" : "flex-start",
              maxWidth: BUBBLE,
              padding: "16px 22px",
              borderRadius: 18,
              [user ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 4,
              background: user ? theme.accent : theme.panel,
              border: `2px solid ${user ? theme.accent : theme.panelBorder}`,
              color: user ? theme.background : theme.text,
              fontFamily: theme.sans,
              fontWeight: 600,
              fontSize: 26,
              lineHeight: 1.35,
              overflowWrap: "break-word",
            }}
          >
            {message.pending ? (
              <Dots color={user ? theme.background : theme.textDim} />
            ) : (
              // The untyped rest is laid out but invisible, so the bubble keeps its size and words never jump lines while it types.
              <>
                {message.text.slice(0, typed)}
                <span style={{ opacity: 0 }}>{message.text.slice(typed)}</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
