export function hasParentId(elem, id) {
  let parentEl = elem;
  while (parentEl !== document.body) {
    if (parentEl.id === id) {
      return true;
    } else {
      parentEl = parentEl.parentElement;
    }
  }
  return false;
}
