import { redirect } from "next/navigation";

/** "Explore Live Demo" entry point — loads Royal Massage & Spa immediately. */
export default function DemoPage() {
  redirect("/app");
}
