import { useEffect, useRef, useState } from "react";

const useDragScroll = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setStartY(e.pageY - element.offsetTop);
      setScrollTop(element.scrollTop);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const y = e.pageY - element.offsetTop;
      const walk = (y - startY) * 2; // Scroll speed multiplier
      element.scrollTop = scrollTop - walk;
    };

    const handleTouchStart = (e: TouchEvent) => {
      setIsDragging(true);
      setStartY(e.touches[0].pageY - element.offsetTop);
      setScrollTop(element.scrollTop);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const y = e.touches[0].pageY - element.offsetTop;
      const walk = (y - startY) * 2; // Scroll speed multiplier
      element.scrollTop = scrollTop - walk;
    };

    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("mouseup", handleMouseUp);
    element.addEventListener("mouseleave", handleMouseUp);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchmove", handleTouchMove);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("mouseup", handleMouseUp);
      element.removeEventListener("mouseleave", handleMouseUp);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isDragging, startY, scrollTop]);

  return ref;
};

export default useDragScroll;
