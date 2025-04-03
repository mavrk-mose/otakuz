import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "firebase-messaging-sw.js");
    const fileContent = await fs.readFile(filePath, "utf8");

    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "application/javascript",
      },
    });
  } catch (error) {
    return new NextResponse("Service Worker not found", { status: 404 });
  }
}
