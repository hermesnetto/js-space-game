export const lerp = (position, targetPosition) => (targetPosition - position) * 0.2;

export const getMousePos = (canvas, e) => {
  var rect = canvas.getBoundingClientRect();
  
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

export const hit = (obj1, obj2) => (
  (obj1.x >= obj2.x && obj1.x <= obj2.x + obj2.width) && 
  (obj1.y >= obj2.y && obj1.y <= obj2.y + obj2.height)
);