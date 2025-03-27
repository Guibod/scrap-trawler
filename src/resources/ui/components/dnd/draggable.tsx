import React from 'react';
import {useDraggable} from '@dnd-kit/core';

type DraggableProps<T, E extends React.ElementType = 'div'> = {
  element?: E,
  id: string,
  children: React.ReactNode,
  data: T
} & React.ComponentPropsWithoutRef<E>

export function Draggable<T>({ id, data, ...props }: DraggableProps<T>) {
  const Element = props.element || 'div';

  const {attributes, listeners, setNodeRef} = useDraggable({
    id,
    data
  });

  return (
    <Element ref={setNodeRef} {...listeners} {...attributes} {...props}>
      {props.children}
    </Element>
  );
}