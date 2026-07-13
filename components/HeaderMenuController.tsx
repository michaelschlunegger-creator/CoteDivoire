"use client";

import { useEffect } from "react";

export function HeaderMenuController() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!header) return;

    const desktopMenus = Array.from(header.querySelectorAll<HTMLDetailsElement>(".nav-dropdown"));
    const mobileRoot = header.querySelector<HTMLDetailsElement>(".mobile-menu");
    const mobileGroups = Array.from(header.querySelectorAll<HTMLDetailsElement>(".mobile-nav-group"));
    const allMenus = [...desktopMenus, ...(mobileRoot ? [mobileRoot] : []), ...mobileGroups];

    function closeMenus(except?: HTMLDetailsElement) {
      for (const menu of allMenus) {
        if (menu !== except) menu.open = false;
      }
    }

    function handleDesktopToggle(this: HTMLDetailsElement) {
      if (!this.open) return;
      for (const menu of desktopMenus) if (menu !== this) menu.open = false;
      if (mobileRoot) mobileRoot.open = false;
    }

    function handleMobileRootToggle(this: HTMLDetailsElement) {
      if (!this.open) return;
      for (const menu of desktopMenus) menu.open = false;
    }

    function handleMobileGroupToggle(this: HTMLDetailsElement) {
      if (!this.open) return;
      for (const group of mobileGroups) if (group !== this) group.open = false;
    }

    function handleDocumentPointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || !header.contains(target)) closeMenus();
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenus();
        (document.activeElement as HTMLElement | null)?.blur();
      }
    }

    function handleNavigation(event: Event) {
      if ((event.target as Element | null)?.closest("a")) {
        window.requestAnimationFrame(() => closeMenus());
      }
    }

    for (const menu of desktopMenus) menu.addEventListener("toggle", handleDesktopToggle);
    mobileRoot?.addEventListener("toggle", handleMobileRootToggle);
    for (const group of mobileGroups) group.addEventListener("toggle", handleMobileGroupToggle);
    document.addEventListener("pointerdown", handleDocumentPointer);
    document.addEventListener("keydown", handleKeydown);
    header.addEventListener("click", handleNavigation);

    return () => {
      for (const menu of desktopMenus) menu.removeEventListener("toggle", handleDesktopToggle);
      mobileRoot?.removeEventListener("toggle", handleMobileRootToggle);
      for (const group of mobileGroups) group.removeEventListener("toggle", handleMobileGroupToggle);
      document.removeEventListener("pointerdown", handleDocumentPointer);
      document.removeEventListener("keydown", handleKeydown);
      header.removeEventListener("click", handleNavigation);
    };
  }, []);

  return null;
}
