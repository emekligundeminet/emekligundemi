import { redirect } from "next/navigation";

export default function AdminBlogCreateRedirect() {
  redirect("/admin/articles/create");
}
