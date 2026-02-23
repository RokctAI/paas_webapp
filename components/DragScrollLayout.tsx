// DragScrollLayout.tsx
import React from "react";
import useDragScroll from "../hooks/useDragScroll";
import styles from "./DragScrollLayout.module.css";

interface DragScrollLayoutProps {
  children: React.ReactNode;
}

const DragScrollLayout: React.FC<DragScrollLayoutProps> = ({ children }) => {
  const scrollRef = useDragScroll();

  return (
    <div ref={scrollRef} className={styles.dragScrollContainer}>
      {children}
    </div>
  );
};

export default DragScrollLayout;
