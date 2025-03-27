import React from 'react';
import { useDroppable } from '@dnd-kit/core';

type DroppableProps<T, E extends React.ElementType = 'div'> = {
  id: string;
  element?: E;
  children: React.ReactNode;
  data?: T;
} & React.ComponentPropsWithoutRef<E>;

function Droppable<T = unknown>({ id, element: Element = 'div', children, data, className, ...props }: DroppableProps<T>) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data,
  });

  return (
    <Element ref={setNodeRef} data-is-over={isOver} className={`${className} w-full h-full ${isOver ? "border-2 border-blue-500" : ""}`} {...props}>
      {children}
    </Element>
  );
}

export default Droppable