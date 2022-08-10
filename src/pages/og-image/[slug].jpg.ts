import { createCanvas, registerFont, CanvasRenderingContext2D } from "canvas";
//@ts-ignore
import TinySegmenter from "@/lib/tiny_segmenter";

const segmenter = new TinySegmenter();

export function getStaticPaths() {
  // Ref: https://github.com/withastro/astro/blob/c3f411a7f2d77739cc32e7b7fbceb3d02018238d/packages/astro/test/fixtures/static-build/src/pages/posts.json.js
  const posts = Object.keys(import.meta.glob("../posts/*.md"));

  return posts.map((filename) => ({
    params: { slug: filename.replace(/^.*\/(.*)\.md$/, "$1") },
  }));
}

export async function get({ slug }: any) {
  const {
    frontmatter: { title, og_title },
  } = await import(`../posts/${slug}.md`);

  return {
    body: drawOGImage(title, og_title),
  };
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;
const FONT_SIZE = 60;
const SPACING = 1.5;
const FONT_HEIGHT = FONT_SIZE * SPACING;
const BLOG_NAME = `Stoicism @euro_s`;

function drawOGImage(title: string, og_title: string): Buffer {
  registerFont("src/lib/NotoSansCJKjp-Regular.ttf", {
    family: "Noto Sans Japanese",
  });

  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d");

  fill(ctx);
  if (!og_title) {
    drawTitle(ctx, title);
    drawName(ctx, BLOG_NAME);
  } else {
    drawTitle(ctx, og_title);
    drawName(ctx, title + BLOG_NAME);
  }

  return canvas.toBuffer("image/jpeg", { quality: 0.8 });
}

function fill(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawTitle(ctx: CanvasRenderingContext2D, title: string) {
  ctx.font = `${FONT_SIZE}px Noto Sans Japanese`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  const lines = wrapText(ctx, title, CANVAS_WIDTH * 0.8);
  lines.forEach((line, i) => {
    const { width } = ctx.measureText(line);
    ctx.fillText(
      line,
      (CANVAS_WIDTH - width) / 2,
      (CANVAS_HEIGHT + (1 - lines.length) * FONT_HEIGHT) / 2 + i * FONT_HEIGHT
    );
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  return segmenter.segment(text).reduce(
    (lines: any, segment: any) => {
      const { width } = ctx.measureText(
        lines[lines.length - 1] + segment.trim()
      );
      if (width > maxWidth) {
        lines.push("");
      }

      lines[lines.length - 1] += segment;
      return lines;
    },
    [""]
  );
}

function drawName(ctx: CanvasRenderingContext2D, title: string) {
  ctx.font = `40px Noto Sans Japanese`;
  ctx.textBaseline = "bottom";
  const { width } = ctx.measureText(title);
  ctx.fillText(title, CANVAS_WIDTH - 80 - width, CANVAS_HEIGHT - 80);
}
