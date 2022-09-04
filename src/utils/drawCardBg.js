export function drawCardBg({
  container,
  fillStyle = '#003477',
  titleWidth = 0.4,
  margin = 10,
  radiu = 5,
  title = 'card',
  showborder = false,
}) {
  let containerNode = null;

  if (typeof container === 'object') {
    containerNode = container;
  } else {
    containerNode = document.querySelector(container);
  }

  if (!containerNode) return;

  const { clientWidth, clientHeight } = containerNode;

  // 获取设备dpi
  const dpr =
    window.devicePixelRatio ||
    window.webkitDevicePixelRatio ||
    window.mozDevicePixelRatio ||
    1;

  // 创建高分辨率画布
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // 设置canvas样式属性
  canvas.width = (clientWidth + 2 * margin) * dpr;
  canvas.height = (clientHeight + 2 * margin) * dpr;
  canvas.style.width = clientWidth + 2 * margin + 'px';
  canvas.style.height = clientHeight + 2 * margin + 'px';
  canvas.style.position = 'absolute';
  canvas.style.top = -margin + 'px';
  canvas.style.left = -margin + 'px';
  canvas.style.zIndex = -1;
  ctx.scale(dpr, dpr);

  // 插入到指定位置
  containerNode.appendChild(canvas);

  const [width, height] = [clientWidth + margin, clientHeight + margin];

  /**
   * 计算标题的宽度
   * 这里标题的宽度有两种状态，一种直接指定确定的宽度，另一种指定宽度百分比，
   * 在这里计算百分比所占大小
   * canvas中只能使用int类型的宽度，最终以px为单位显示
   */
  if (titleWidth < 1) titleWidth = width * titleWidth;
  const sideWidth = (width - titleWidth) / 2 - 15;

  /**
   * 绘制整体的背景
   */
  ctx.beginPath();
  ctx.moveTo(margin + radiu, margin);

  // 绘制顶部线条
  ctx.lineTo(width - radiu, margin);
  // 绘制右上角的圆角
  ctx.arc(
    width - radiu,
    margin + radiu,
    radiu,
    (Math.PI / 180) * 270,
    0,
    false,
  );

  // 绘制右边线条
  ctx.lineTo(width, height - 2 * radiu);
  // 绘制右下角的圆角
  ctx.arc(
    width - radiu,
    height - radiu,
    radiu,
    0,
    (Math.PI / 180) * 90,
    0,
    false,
  );

  /**绘制标题的不规则凹陷区域和下边线条 */
  ctx.lineTo(width - sideWidth, height);
  ctx.lineTo(width - sideWidth - 15, height - 17);
  ctx.lineTo(width - sideWidth - 15 - titleWidth, height - 17);
  ctx.lineTo(width - sideWidth - 30 - titleWidth, height);

  // 绘制左下角的圆角
  ctx.arc(
    margin + radiu,
    height - radiu,
    radiu,
    (Math.PI / 180) * 90,
    (Math.PI / 180) * 180,
    false,
  );
  // 绘制左边线条
  ctx.lineTo(margin, height - radiu);
  // 绘制左上角的圆角
  ctx.arc(
    margin + radiu,
    margin + radiu,
    radiu,
    (Math.PI / 180) * 180,
    (Math.PI / 180) * 270,
    false,
  );

  // 设置边框颜色和宽度
  if (showborder) {
    ctx.strokeStyle = '#00B4CB';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 给闭合区域设置边框阴影颜色
  ctx.shadowColor = 'rgba(0,255,255,0.8)';
  // 阴影的模糊半径
  ctx.shadowBlur = margin;

  // 闭合路径（以上所绘制的闭合区域）
  ctx.closePath();

  // 设置闭合区域的填充色，并填充
  ctx.fillStyle = fillStyle;
  ctx.fill();

  ctx.shadowBlur = 0;

  const titleIconLOrigin = sideWidth + 20;
  /**
   * 绘制标题部分左边ICON
   */
  ctx.beginPath();
  ctx.moveTo(sideWidth + 20, height - 13);
  ctx.lineTo(titleIconLOrigin + 20, height - 13);
  ctx.lineTo(titleIconLOrigin + 15, height - 6);
  ctx.lineTo(titleIconLOrigin + -5, height - 6);
  ctx.closePath();
  ctx.fillStyle = '#2E90FF';
  ctx.fill();

  /**
   * 绘制标题部分右边ICON
   */
  ctx.beginPath();
  ctx.moveTo(-30 + titleWidth + titleIconLOrigin, height - 13);
  ctx.lineTo(-10 + titleWidth + titleIconLOrigin, height - 13);
  ctx.lineTo(-5 + titleWidth + titleIconLOrigin, height - 6);
  ctx.lineTo(-25 + titleWidth + titleIconLOrigin, height - 6);
  ctx.closePath();
  ctx.fillStyle = '#2E90FF';
  ctx.fill();

  /**
   * 绘制标题背景
   */
  ctx.beginPath();
  ctx.moveTo(titleIconLOrigin + 25, height - 13);
  ctx.lineTo(titleWidth + titleIconLOrigin - 35, height - 13);
  ctx.lineTo(titleWidth + titleIconLOrigin - 30, height - 6);
  ctx.lineTo(titleWidth + titleIconLOrigin - 30, height + 2);
  ctx.lineTo(titleIconLOrigin + 20, height + 2);
  ctx.lineTo(titleIconLOrigin + 20, height - 6);
  ctx.closePath();
  ctx.fillStyle = '#2E90FF';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '8pt Calibri';
  const textSize = ctx.measureText(title);
  ctx.fillText(title, width / 2 - textSize.width / 2, height - 1);

  return canvas;
}
