import { revalidatePath, revalidateTag } from "next/cache";
import { CALC_PATHS, HESAP_PARAMS_TAG } from "@/lib/hesap-params";

export function revalidateHesapPaths() {
  revalidateTag(HESAP_PARAMS_TAG, "max");
  for (const path of CALC_PATHS) {
    revalidatePath(path);
    revalidatePath(`/t/[tenantId]${path}`, "page");
  }
}
