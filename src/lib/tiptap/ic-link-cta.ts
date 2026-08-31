import { Node, mergeAttributes } from "@tiptap/core";

export type IcLinkCtaAttrs = {
  href: string;
  anchor: string;
  kicker: string;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    icLinkCta: {
      setIcLinkCta: (attrs: IcLinkCtaAttrs) => ReturnType;
    };
  }
}

/**
 * Gövde içi iç link kutusu. Atom node: metin akışının parçası değil,
 * tek parça taşınır/silinir. Yalnızca rehber ve hesaplama aracına bağlanır.
 */
export const IcLinkCta = Node.create({
  name: "icLinkCta",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      href: { default: "" },
      anchor: { default: "" },
      kicker: { default: "İlgili rehber" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-ic-cta]",
        getAttrs: (el) => {
          const node = el as HTMLElement;
          const link = node.querySelector("a");
          return {
            href: link?.getAttribute("href") ?? "",
            anchor: link?.textContent?.trim() ?? "",
            kicker: node.getAttribute("data-kicker") ?? "İlgili rehber",
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      "div",
      mergeAttributes({
        "data-ic-cta": "",
        "data-kicker": node.attrs.kicker || "İlgili rehber",
        class: "ic-link-cta",
      }),
      ["a", { href: node.attrs.href }, node.attrs.anchor],
    ];
  },

  addCommands() {
    return {
      setIcLinkCta:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
