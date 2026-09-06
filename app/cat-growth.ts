export function getCatGrowth(xp: number) {
  if (xp < 40) {
    return {
      stage: '幼猫期',
      image: '/cat-baby-3d.png',
      progress: (xp / 40) * 100,
      remaining: 40 - xp,
      scale: 0.82 + (xp / 40) * 0.12,
      nextStage: '少年猫',
    };
  }
  if (xp < 80) {
    return {
      stage: '少年猫期',
      image: '/cat-young-3d.png',
      progress: ((xp - 40) / 40) * 100,
      remaining: 80 - xp,
      scale: 0.9 + ((xp - 40) / 40) * 0.1,
      nextStage: '成年猫',
    };
  }
  return {
    stage: '成年猫期',
    image: '/cat-young-3d.png',
    progress: Math.min(100, ((xp - 80) / 40) * 100),
    remaining: Math.max(0, 120 - xp),
    scale: 1 + Math.min(1, (xp - 80) / 40) * 0.08,
    nextStage: '完整房间',
  };
}
