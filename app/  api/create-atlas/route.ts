import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const files = formData.getAll("frames") as File[];
    const cellsX = Number(formData.get("cellsX"));
    const cellsY = Number(formData.get("cellsY"));
    const cellWidth = Number(formData.get("cellWidth"));
    const cellHeight = Number(formData.get("cellHeight"));

    if (files.length === 0) {
      return new Response(JSON.stringify({ error: "No files uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const atlasWidth = cellsX * cellWidth;
    const atlasHeight = cellsY * cellHeight;

    let atlas = sharp({
      create: {
        width: atlasWidth,
        height: atlasHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    }).png();

    const layers: sharp.OverlayOptions[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = Buffer.from(await file.arrayBuffer());

      const x = (i % cellsX) * cellWidth;
      const y = Math.floor(i / cellsX) * cellHeight;

      layers.push({
        input: buffer,
        top: y,
        left: x,
      });
    }

    atlas = atlas.composite(layers);

    const output = await atlas.toBuffer();

    // ВАЖЛИВО: Next.js 16 приймає тільки Uint8Array
    return new Response(new Uint8Array(output), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=atlas.png",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
