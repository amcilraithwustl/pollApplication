export function setOutOfPlace<T>(
  oldArray: T[],
  newElement: T,
  elementIndex: number
): T[] {
  const newArray = [...oldArray];
  newArray[elementIndex] = newElement;
  return newArray;
}

export function deleteOutOfPlace<T>(oldArray: T[], elementIndex: number): T[] {
  return [
    ...oldArray.slice(0, elementIndex),
    ...oldArray.slice(elementIndex + 1),
  ];
}
