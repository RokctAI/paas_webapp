export default function scrollToView(uuid?: string, yOffset: number = 0) {
  if (!uuid) {
    return;
  }
  const element = document.getElementById(uuid);
  if (element) {
    const y =
      element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  } else {
    window.location.hash = uuid;
    const element = document.getElementById("the-end")!;
    const y =
      element?.getBoundingClientRect?.()?.top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}
