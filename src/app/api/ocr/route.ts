import { NextResponse } from "next/server";
import ktpData from "../../../data/ktp_mock.json";

export async function GET() {
  // Simulate delay for network request
  await new Promise((resolve) => setTimeout(resolve, 800));
  return NextResponse.json(ktpData);
}
